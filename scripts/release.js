#!/usr/bin/env node
/**
 * Cut a release.
 *
 *   npm run release -- v0.1.0
 *   npm run release -- v0.1.0 --dry-run
 *
 * Checks the tree, builds, tests, packages the plugin, tags the commit,
 * pushes the tag and publishes the zip as a GitHub release. The release
 * notes are the matching section of CHANGELOG.md.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const pkg = require(path.join(REPO, 'package.json'));

function git(args, options = {}) {
  return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', ...options }).trim();
}

function run(command, args) {
  execFileSync(command, args, { cwd: REPO, stdio: 'inherit' });
}

function fail(message) {
  console.error(`\nrelease: ${message}`);
  process.exit(1);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The section of CHANGELOG.md that belongs to a version. */
function changelogNotes(version) {
  const changelogPath = path.join(REPO, 'CHANGELOG.md');
  if (!fs.existsSync(changelogPath)) return null;

  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const heading = new RegExp(`^##\\s+\\[?${escapeRegExp(version)}\\]?.*$`, 'm');
  const match = changelog.match(heading);
  if (!match) return null;

  const rest = changelog.slice(match.index + match[0].length);
  const next = rest.search(/^##\s+/m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const version = (args.find((a) => !a.startsWith('--')) || '').replace(/^v/, '');
  const tag = `v${version}`;

  if (!version) {
    fail('no version given. Try: npm run release -- v0.1.0');
  }

  if (version !== pkg.version) {
    fail(`package.json says ${pkg.version}, but the release is ${tag}.`);
  }

  // ---------------------------------------------------------- preflight
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch !== 'master') {
    fail(`on branch ${branch}, not master.`);
  }

  if (git(['status', '--porcelain'])) {
    fail('the working tree is not clean.');
  }

  if (git(['tag', '--list', tag])) {
    fail(`the tag ${tag} already exists.`);
  }

  const notes = changelogNotes(version);
  if (!notes) {
    fail(`CHANGELOG.md has no section for ${tag}.`);
  }

  console.log(`release: ${tag} (dry run)`);

  // -------------------------------------------------------------- build
  // A release needs the stylesheet to compile: Mailspring ships an empty
  // stylesheet when it does not, and nobody would notice until a user
  // opened an unstyled popover.
  run('npm', ['run', 'build:release']);
  run('npm', ['test']);

  // The compiled plugin is committed, so it has to be in step with the
  // sources - otherwise the release ships something else than the tag.
  if (git(['status', '--porcelain', 'lib'])) {
    fail('lib/ is out of step with src/. Commit the build output and try again.');
  }

  // ----------------------------------------------------------- package
  run('npm', ['run', 'package']);

  const asset = path.join(REPO, 'dist', `${pkg.name}-${tag}.zip`);
  if (!fs.existsSync(asset)) {
    fail(`the package ${path.relative(REPO, asset)} was not written.`);
  }

  if (dryRun) {
    console.log('\nrelease: everything checks out. Nothing was tagged or pushed.');
    return;
  }

  // ------------------------------------------------------------ publish
  git(['tag', '-a', tag, '-m', tag]);
  git(['push', 'origin', 'master']);
  git(['push', 'origin', tag]);

  const notesFile = path.join(os.tmpdir(), `mailspring-todoist-${tag}-notes.md`);
  fs.writeFileSync(notesFile, `${notes}\n`);

  try {
    run('gh', [
      'release',
      'create',
      tag,
      path.relative(REPO, asset),
      '--title',
      `${pkg.name} ${tag}`,
      '--notes-file',
      notesFile,
    ]);
  } finally {
    fs.rmSync(notesFile, { force: true });
  }

  console.log(`\nrelease: ${tag} is published.`);
}

main();

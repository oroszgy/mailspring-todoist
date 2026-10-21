#!/usr/bin/env node
/**
 * Package the plugin into the zip a user installs.
 *
 *   npm run package
 *
 * Writes dist/mailspring-todoist-v<version>.zip. The archive holds a single
 * top-level folder - the plugin itself - so unzipping it gives a folder that
 * can be picked in Mailspring's Developer > Install a Plugin.
 *
 * Only what Mailspring loads at runtime goes in: the compiled lib/, the
 * stylesheet, and the manifest. The sources stay in the repository.
 */

const fs = require('fs');
const path = require('path');
const { writeZip } = require('./zip');

const REPO = path.join(__dirname, '..');
const pkg = require(path.join(REPO, 'package.json'));

/** Files and folders that make up the plugin, in the order they are added. */
const CONTENTS = [
  { name: 'package.json' },
  { name: 'lib', dir: true },
  { name: 'styles', dir: true },
  { name: 'README.md' },
  { name: 'LICENSE' },
  { name: 'CHANGELOG.md' },
];

function collect(folder, prefix, entries) {
  for (const item of fs.readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const from = path.join(folder, item.name);
    const to = `${prefix}/${item.name}`;

    if (item.isDirectory()) {
      entries.push({ name: `${to}/`, data: '' });
      collect(from, to, entries);
    } else if (item.isFile()) {
      entries.push({ name: to, data: fs.readFileSync(from) });
    }
  }
}

function main() {
  if (!fs.existsSync(path.join(REPO, 'lib'))) {
    console.error('No `lib/` directory found. Run `npm run build` first.');
    process.exit(1);
  }

  const entries = [];
  const missing = [];

  for (const item of CONTENTS) {
    const from = path.join(REPO, item.name);
    if (!fs.existsSync(from)) {
      missing.push(item.name);
      continue;
    }
    if (item.dir) {
      collect(from, `${pkg.name}/${item.name}`, entries);
    } else {
      entries.push({ name: `${pkg.name}/${item.name}`, data: fs.readFileSync(from) });
    }
  }

  if (missing.length > 0) {
    console.error(`Missing from the package: ${missing.join(', ')}.`);
    process.exit(1);
  }

  const out = path.join(REPO, 'dist', `${pkg.name}-v${pkg.version}.zip`);
  writeZip(entries, out);

  const size = fs.statSync(out).size;
  console.log(`Packaged ${entries.length} entries into ${path.relative(REPO, out)} (${size} bytes).`);
  console.log('Unzip it, then pick the folder in Mailspring: Developer > Install a Plugin.');
}

main();

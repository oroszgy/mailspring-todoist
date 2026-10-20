/**
 * Compile the plugin's stylesheets against the installed Mailspring.
 *
 * Mailspring keeps its stylesheets inside `app.asar`, so they are read out
 * of the archive (no asar dependency needed) and compiled with the same
 * include paths Mailspring itself uses:
 *
 *   <app>/static/style
 *   <app>/static/style/base
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const less = require('less');

// The stylesheets our `@import`s reach: ui-mixins pulls in ../mixins/*.
const WANTED = [
  'static/style/base/ui-variables.less',
  'static/style/base/ui-mixins.less',
  'static/style/mixins/common-ui-elements.less',
  'static/style/mixins/text-emphasis.less',
  'static/style/mixins/background-variant.less',
  'static/style/mixins/windows.less',
];

function findMailspringAsar() {
  const home = os.homedir();
  const candidates = [
    // Linux
    '/usr/share/mailspring/resources/app.asar',
    '/opt/Mailspring/resources/app.asar',
    path.join(home, '.local', 'share', 'Mailspring', 'resources', 'app.asar'),
    // macOS
    '/Applications/Mailspring.app/Contents/Resources/app.asar',
    // Windows
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Programs', 'Mailspring', 'resources', 'app.asar')
      : null,
  ].filter(Boolean);

  return candidates.find((p) => fs.existsSync(p)) || null;
}

/** Read an asar archive's file table. */
function readAsarIndex(asarPath) {
  const fd = fs.openSync(asarPath, 'r');
  try {
    const head = Buffer.alloc(16);
    fs.readSync(fd, head, 0, 16, 0);
    const headerSize = head.readUInt32LE(4);
    const jsonLength = head.readUInt32LE(12);
    const json = Buffer.alloc(jsonLength);
    fs.readSync(fd, json, 0, jsonLength, 16);
    const text = json.toString('utf8');
    const end = text.lastIndexOf('}');
    return { header: JSON.parse(text.slice(0, end + 1)), base: 8 + headerSize };
  } finally {
    fs.closeSync(fd);
  }
}

function readAsarFile(asarPath, index, entryPath) {
  let node = index.header.files;
  for (const part of entryPath.split('/')) {
    node = node.files ? node.files[part] : node[part];
    if (!node) throw new Error(`not in the archive: ${entryPath}`);
  }
  const fd = fs.openSync(asarPath, 'r');
  try {
    const buf = Buffer.alloc(node.size);
    fs.readSync(fd, buf, 0, node.size, index.base + Number(node.offset));
    return buf.toString('utf8');
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Lay Mailspring's stylesheets out on disk the way Mailspring does:
 * `static/style` and `static/style/base` are both on the include path.
 */
function extractMailspringStyles(asarPath, workDir) {
  const index = readAsarIndex(asarPath);
  for (const wanted of WANTED) {
    const relative = wanted.replace(/^static\/style\//, '');
    const target = path.join(workDir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, readAsarFile(asarPath, index, wanted));
  }
  return workDir;
}

/** Compile a LESS file against the installed Mailspring. */
async function compileStylesheet(stylesheetPath) {
  const asarPath = findMailspringAsar();
  if (!asarPath) {
    throw new Error('Mailspring not found - cannot compile the stylesheet against it.');
  }

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mailspring-styles-'));
  try {
    extractMailspringStyles(asarPath, workDir);
    const source = fs.readFileSync(stylesheetPath, 'utf8');
    const result = await less.render(source, {
      filename: stylesheetPath,
      paths: [workDir, path.join(workDir, 'base')],
      javascriptEnabled: true,
    });
    return result.css;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

module.exports = { findMailspringAsar, readAsarIndex, readAsarFile, compileStylesheet };

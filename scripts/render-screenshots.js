#!/usr/bin/env node
/**
 * Render the plugin's popover and preferences pane with Mailspring's real
 * CSS, so the README can show what the plugin looks like.
 *
 *   npm run screenshots
 *
 * Writes docs/screenshots/popover.png. The CSS on both sides is the real
 * thing:
 *
 *  - Mailspring's own compiled stylesheets, read out of its LESS compile
 *    cache (~/.config/Mailspring/compile-cache/less).
 *  - the plugin's stylesheet, compiled against the installed Mailspring by
 *    scripts/mailspring-styles.js - the same code path `npm run
 *    check:styles` uses.
 *
 * So it needs a Mailspring on this machine, and Chrome to take the picture.
 * Set CHROME_BIN to point at a different browser.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const WORK = path.join(REPO, 'node_modules', '.screenshots');
const OUT = path.join(REPO, 'docs', 'screenshots');
const CACHE = path.join(os.homedir(), '.config/Mailspring/compile-cache/less');
const CHROME = process.env.CHROME_BIN || 'google-chrome';

/** React is needed for the rendering only: this repository, or a global one. */
function requireFrom(mod, subpath) {
  const bases = [path.join(REPO, 'node_modules')];
  for (const base of bases) {
    try {
      return require(path.join(base, mod, ...subpath));
    } catch (e) {
      /* try the next one */
    }
  }
  return require(path.join(mod, ...subpath));
}

const React = requireFrom('react', []);
const ReactDOMServer = requireFrom('react-dom', ['server']);

// ---------------------------------------------------------------- stubs
/** The modules Mailspring hands the plugin at runtime. */
function writeStubs() {
  const stubDir = path.join(WORK, 'node_modules');
  fs.mkdirSync(path.join(stubDir, 'mailspring-exports'), { recursive: true });
  fs.mkdirSync(path.join(stubDir, 'mailspring-component-kit'), { recursive: true });

  fs.writeFileSync(
    path.join(stubDir, 'mailspring-exports', 'index.js'),
    `const React = require(${JSON.stringify(require.resolve('react', { paths: [REPO] }))});
module.exports = {
  React,
  Actions: { openPopover() {}, closePopover() {} },
  localized: (s) => s,
  ComponentRegistry: { register() {}, unregister() {} },
  PreferencesUIStore: { registerPreferencesTab() {}, unregisterPreferencesTab() {} },
};`
  );

  fs.writeFileSync(
    path.join(stubDir, 'mailspring-component-kit', 'index.js'),
    `const React = require(${JSON.stringify(require.resolve('react', { paths: [REPO] }))});
const RetinaImg = (props) => React.createElement('img', {
  className: props.className || '',
  src: props.url || '',
  style: { width: props.style && props.style.width, height: props.style && props.style.height },
});
RetinaImg.Mode = { ContentPreserve: 'original', ContentIsMask: 'mask', ContentDark: 'dark', ContentLight: 'light' };
RetinaImg.displayName = 'RetinaImg';
module.exports = { RetinaImg };`
  );
}

// --------------------------------------------------------------- CSS
/** Mailspring's own compiled stylesheets, from its LESS compile cache. */
function mailspringCss() {
  const sheets = [];

  for (const theme of fs.readdirSync(CACHE)) {
    const contentDir = path.join(CACHE, theme, 'content');
    if (!fs.existsSync(contentDir)) continue;

    for (const hash of fs.readdirSync(contentDir)) {
      const dir = path.join(contentDir, hash);
      if (!fs.statSync(dir).isDirectory()) continue;

      for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.json')) continue;

        let parsed;
        try {
          parsed = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        } catch (e) {
          continue;
        }
        // The plugin's own sheet is compiled fresh below.
        if (parsed && typeof parsed.css === 'string' && parsed.css.trim() && !/todoist/i.test(parsed.css)) {
          sheets.push(parsed.css);
        }
      }
    }
  }

  return sheets.join('\n');
}

// ------------------------------------------------------------- render
function copyBuild() {
  const libDir = path.join(WORK, 'lib');
  fs.rmSync(libDir, { recursive: true, force: true });
  fs.mkdirSync(libDir, { recursive: true });

  for (const file of fs.readdirSync(path.join(REPO, 'lib'))) {
    fs.copyFileSync(path.join(REPO, 'lib', file), path.join(libDir, file));
  }

  return libDir;
}

function render() {
  const libDir = copyBuild();

  // The plugin reads its settings off the global Mailspring config store.
  global.AppEnv = { config: { get: () => '' } };

  const CreateTaskPopover = require(path.join(libDir, 'create-popover.js')).default;
  const PreferencesTab = require(path.join(libDir, 'preferences-tab.js')).default;
  const { draftFromThread } = require(path.join(libDir, 'task-builder.js'));
  const ICON = require(path.join(libDir, 'todoist-icon.js')).TODOIST_ICON;

  // The draft is built by the plugin itself, so the screenshot shows what a
  // task's notes really look like.
  const draft = draftFromThread(
    {
      subject: 'Re: invoice for October',
      snippet:
        'Hi,\n\nthe invoice for October is attached - could you have a look before Friday?',
      lastMessageReceivedTimestamp: new Date('2026-10-21T09:12:00Z'),
    },
    'Alice Example <alice@example.com>'
  );

  const popover = ReactDOMServer.renderToStaticMarkup(
    React.createElement(CreateTaskPopover, { draft, needsToken: false })
  );
  const warning = ReactDOMServer.renderToStaticMarkup(
    React.createElement(CreateTaskPopover, { draft, needsToken: true })
  );
  const preferences = ReactDOMServer.renderToStaticMarkup(React.createElement(PreferencesTab, {}));

  const done = ReactDOMServer.renderToStaticMarkup(
    React.createElement(
      'div',
      { className: 'todoist-create-popover' },
      React.createElement(
        'div',
        { className: 'todoist-popover-header' },
        React.createElement('img', { className: 'todoist-popover-icon', src: ICON }),
        React.createElement('span', { className: 'todoist-popover-title' }, 'Create Todoist task')
      ),
      React.createElement(
        'div',
        { className: 'todoist-popover-done' },
        React.createElement('span', { 'aria-hidden': 'true' }, '✓'),
        React.createElement('span', null, 'Task created.')
      )
    )
  );

  return { popover, warning, done, preferences };
}

async function build() {
  const { compileStylesheet } = require(path.join(REPO, 'scripts', 'mailspring-styles.js'));

  writeStubs();
  const { popover, warning, done, preferences } = render();
  const plugin = await compileStylesheet(path.join(REPO, 'styles', 'index.less'));

  const html = `<!doctype html>
<html><head><meta charset="utf-8">
<style>${mailspringCss()}</style>
<style>${plugin}</style>
<style>
  * { animation: none !important; transition: none !important; }
  body { margin: 0; padding: 24px; background: #eceff1; }
  .fixed-popover-container,
  .fixed-popover-container.popout { position: static; visibility: visible; opacity: 1; }
  .fixed-popover-container .fixed-popover { position: static; }
  .stage { display: flex; align-items: flex-start; gap: 24px; }
  .preferences-host { background: #fff; border: 1px solid #dfe1e5; width: 560px; }
</style>
</head>
<body>
  <div class="stage">
    <div class="fixed-popover-container popout">
      <div class="fixed-popover">${popover}</div>
    </div>
    <div class="fixed-popover-container popout">
      <div class="fixed-popover">${warning}</div>
    </div>
    <div class="fixed-popover-container popout">
      <div class="fixed-popover">${done}</div>
    </div>
    <div class="preferences-host">
      <div class="todoist-preferences">${preferences}</div>
    </div>
  </div>
</body></html>`;

  const htmlPath = path.join(WORK, 'preview.html');
  fs.writeFileSync(htmlPath, html);

  fs.mkdirSync(OUT, { recursive: true });
  const png = path.join(OUT, 'popover.png');

  try {
    execFileSync(
      CHROME,
      [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--hide-scrollbars',
        '--force-device-scale-factor=2',
        '--window-size=1500,700',
        `--screenshot=${png}`,
        `file://${htmlPath}`,
      ],
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error(`Could not run ${CHROME}. Set CHROME_BIN to a Chrome or Chromium binary.`);
    process.exit(1);
  }

  console.log(`wrote ${path.relative(REPO, png)}`);
}

build();

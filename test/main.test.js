const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

/**
 * The plugin's entry point talks to the modules Mailspring hands it at
 * runtime. They are not there outside Mailspring, so they are stubbed here -
 * which also lets the test see what the plugin registers.
 */
const registered = { components: [], preferencesTabs: [] };

const RetinaImg = (props) => require('react').createElement('img', {
  className: props.className || '',
  src: props.url || '',
});
RetinaImg.Mode = { ContentPreserve: 'original' };

const stubs = {
  'mailspring-exports': {
    React: require('react'),
    Actions: { openPopover() {}, closePopover() {} },
    localized: (message) => message,
    ComponentRegistry: {
      register: (component, options) => registered.components.push({ component, options }),
      unregister: (component) => {
        registered.components = registered.components.filter((c) => c.component !== component);
      },
    },
    PreferencesUIStore: {
      TabItem: class TabItem {
        constructor(options) {
          Object.assign(this, options);
        }
      },
      registerPreferencesTab: (tab) => registered.preferencesTabs.push(tab),
      unregisterPreferencesTab: (tabId) => {
        registered.preferencesTabs = registered.preferencesTabs.filter((t) => t.tabId !== tabId);
      },
    },
  },
  'mailspring-component-kit': { RetinaImg },
};

const load = Module._load;
Module._load = function (request, ...rest) {
  if (stubs[request]) return stubs[request];
  return load.call(this, request, ...rest);
};

const main = require('../lib/main');
const TodoistThreadButton = require('../lib/thread-toolbar-button').default;

test('activate registers the thread toolbar button', () => {
  main.activate();

  assert.equal(registered.components.length, 1);
  assert.equal(registered.components[0].component, TodoistThreadButton);
  assert.equal(registered.components[0].options.role, 'ThreadActionsToolbarButton');
});

test('activate registers the preferences tab', () => {
  assert.equal(registered.preferencesTabs.length, 1);
  assert.equal(registered.preferencesTabs[0].tabId, 'Todoist');
  assert.equal(registered.preferencesTabs[0].displayName, 'Todoist');
});

test('deactivate unregisters both', () => {
  main.deactivate();

  assert.equal(registered.components.length, 0);
  assert.equal(registered.preferencesTabs.length, 0);
});

test('the button renders with the Todoist mark', () => {
  const React = require('react');
  const ReactDOMServer = require('react-dom/server');

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TodoistThreadButton, { items: [] })
  );

  assert.ok(html.includes('todoist-thread-toolbar-button'));
  assert.ok(html.includes('Create Todoist task'));
  assert.ok(html.includes('data:image/png;base64'));
});

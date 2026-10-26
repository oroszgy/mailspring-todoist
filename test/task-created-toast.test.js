const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

/**
 * The toast reads `localized` from Mailspring's runtime module, which does
 * not exist outside Mailspring - so it is stubbed before the component is
 * loaded.
 */
const stubs = {
  'mailspring-exports': {
    React: require('react'),
    localized: (message) => message,
  },
};

const load = Module._load;
Module._load = function (request, ...rest) {
  if (stubs[request]) return stubs[request];
  return load.call(this, request, ...rest);
};

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const TaskCreatedToast = require('../lib/task-created-toast').default;
const { notifyTaskCreated, dismissNotice } = require('../lib/task-notice');

function render() {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(TaskCreatedToast));
}

test('without a notice the live region stays empty', () => {
  dismissNotice();

  const html = render();
  assert.ok(html.includes('todoist-task-toast-region'));
  assert.ok(!html.includes('todoist-task-toast-action'));
});

test('a notice shows the task title and a link to it', () => {
  dismissNotice();
  notifyTaskCreated('Invoice #42', 'https://app.todoist.com/app/task/123');

  const html = render();
  assert.ok(html.includes('Task created'));
  assert.ok(html.includes('Invoice #42'));
  assert.ok(html.includes('href="https://app.todoist.com/app/task/123"'));
  assert.ok(html.includes('Open in Todoist'));
  assert.ok(html.includes('Dismiss'));

  dismissNotice();
});

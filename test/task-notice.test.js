const test = require('node:test');
const assert = require('node:assert/strict');

const {
  notifyTaskCreated,
  dismissNotice,
  getNotice,
  subscribeToNotice,
} = require('../lib/task-notice');
const { taskUrl } = require('../lib/todoist-client');

test('the task URL points at the Todoist web app', () => {
  assert.equal(taskUrl('6X7rM'), 'https://app.todoist.com/app/task/6X7rM');
  assert.equal(taskUrl('a/b'), 'https://app.todoist.com/app/task/a%2Fb');
});

test('a notice is announced, and a second one replaces it', () => {
  dismissNotice();

  const seen = [];
  const unsubscribe = subscribeToNotice((notice) => seen.push(notice));

  const first = notifyTaskCreated('  First task  ', 'https://example.com/1');
  const second = notifyTaskCreated('Second task', 'https://example.com/2');

  assert.equal(first.title, 'First task');
  assert.equal(second.title, 'Second task');
  assert.deepEqual(
    seen.map((notice) => notice && notice.title),
    ['First task', 'Second task']
  );
  assert.equal(getNotice().id, second.id);

  unsubscribe();
  dismissNotice();
});

test('dismissing an older notice leaves the newer one up', () => {
  dismissNotice();

  const first = notifyTaskCreated('First task', 'https://example.com/1');
  const second = notifyTaskCreated('Second task', 'https://example.com/2');

  dismissNotice(first.id);
  assert.equal(getNotice().id, second.id);

  dismissNotice(second.id);
  assert.equal(getNotice(), null);
});

test('a notice without a title keeps an empty one', () => {
  dismissNotice();

  const notice = notifyTaskCreated('', 'https://example.com/1');
  assert.equal(notice.title, '');

  dismissNotice();
});

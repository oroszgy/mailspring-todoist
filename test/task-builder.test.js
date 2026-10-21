const test = require('node:test');
const assert = require('node:assert/strict');

/**
 * The settings live in Mailspring's global config store, which is not there
 * outside Mailspring - so it is stubbed before the module under test is
 * loaded.
 */
const settings = {};
global.AppEnv = {
  config: {
    get: (key) => settings[key],
  },
};

const { draftFromThread, formatSender, threadDeepLink } = require('../lib/task-builder');

function withSettings(overrides = {}) {
  for (const key of Object.keys(settings)) delete settings[key];
  Object.assign(settings, {
    'mailspring-todoist.includeSnippet': true,
    'mailspring-todoist.includeLink': true,
  }, overrides);
}

const thread = {
  subject: 'Invoice #42',
  snippet: 'Please find the invoice attached.',
  lastMessageReceivedTimestamp: new Date('2026-10-21T10:00:00Z'),
};

test('the subject becomes the task title', () => {
  withSettings();
  assert.equal(draftFromThread(thread).content, 'Invoice #42');
});

test('a thread without a subject still gets a title', () => {
  withSettings();
  assert.equal(draftFromThread({}).content, '(no subject)');
});

test('the notes hold the sender, the preview and the link', () => {
  withSettings();
  const { description } = draftFromThread(thread, 'Alice <alice@example.com>');

  assert.equal(
    description,
    [
      'Alice <alice@example.com>',
      'Please find the invoice attached.',
      threadDeepLink('Invoice #42', thread.lastMessageReceivedTimestamp),
    ].join('\n\n')
  );
});

test('the preview is left out when the setting is off', () => {
  withSettings({ 'mailspring-todoist.includeSnippet': false });
  const { description } = draftFromThread(thread, 'Alice <alice@example.com>');

  assert.ok(!description.includes('Please find the invoice attached.'));
  assert.ok(description.includes('Alice <alice@example.com>'));
});

test('the link is left out when the setting is off', () => {
  withSettings({ 'mailspring-todoist.includeLink': false });
  const { description } = draftFromThread(thread);

  assert.ok(!description.includes('mailspring://'));
});

test('without a sender the notes start with the preview', () => {
  withSettings();
  const { description } = draftFromThread(thread);

  assert.ok(description.startsWith('Please find the invoice attached.'));
});

test('the deep link carries the subject and the last message timestamp', () => {
  const link = threadDeepLink('Invoice #42', new Date('2026-10-21T10:00:00Z'));

  assert.equal(
    link,
    'mailspring://open-thread?subject=Invoice%20%2342&lastDate=1792576800'
  );
});

test('the deep link survives a subject with characters to escape', () => {
  const link = threadDeepLink('Re: a & b', new Date(0));

  assert.ok(link.includes('subject=Re%3A%20a%20%26%20b'));
});

test('a sender is formatted from the name and the address', () => {
  assert.equal(formatSender({ name: 'Alice', email: 'alice@example.com' }), 'Alice <alice@example.com>');
  assert.equal(formatSender({ name: 'Alice', email: '' }), 'Alice');
  assert.equal(formatSender({ name: '', email: 'alice@example.com' }), 'alice@example.com');
  assert.equal(formatSender(null), null);
  assert.equal(formatSender({ name: '', email: '' }), null);
});

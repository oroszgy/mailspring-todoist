const test = require('node:test');
const assert = require('node:assert/strict');

const { senderForThread } = require('../lib/sender');

function threadWith(messages) {
  return { messages: async () => messages };
}

test('the sender of the newest message is used', async () => {
  const thread = threadWith([
    { date: new Date('2026-10-20T09:00:00Z'), from: [{ name: 'Bob', email: 'bob@example.com' }] },
    { date: new Date('2026-10-21T09:00:00Z'), from: [{ name: 'Alice', email: 'alice@example.com' }] },
  ]);

  assert.equal(await senderForThread(thread), 'Alice <alice@example.com>');
});

test('a thread without messages has no sender', async () => {
  assert.equal(await senderForThread(threadWith([])), null);
});

test('a thread that is not a Mailspring model has no sender', async () => {
  assert.equal(await senderForThread({}), null);
  assert.equal(await senderForThread(null), null);
});

test('a failing lookup does not break the button', async () => {
  const thread = {
    messages: async () => {
      throw new Error('no database');
    },
  };

  assert.equal(await senderForThread(thread), null);
});

test('a slow lookup is given up on', async () => {
  const thread = {
    messages: () => new Promise(() => {}),
  };

  assert.equal(await senderForThread(thread, 10), null);
});

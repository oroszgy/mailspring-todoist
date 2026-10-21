const test = require('node:test');
const assert = require('node:assert/strict');

const { dueFields, isIsoDate } = require('../lib/due-date');

test('a plain date is recognised', () => {
  assert.ok(isIsoDate('2026-12-31'));
  assert.ok(!isIsoDate('tomorrow'));
  assert.ok(!isIsoDate(''));
  assert.ok(!isIsoDate(undefined));
});

test('the picked date wins over the default', () => {
  assert.deepEqual(dueFields('2026-12-31', 'tomorrow'), { due_date: '2026-12-31' });
});

test('a natural-language default is sent as a string', () => {
  assert.deepEqual(dueFields('', 'tomorrow'), { due_string: 'tomorrow' });
});

test('a date default is prefilled instead of sent as a string', () => {
  assert.deepEqual(dueFields('', '2026-12-31'), {});
});

test('no date at all sends no due date', () => {
  assert.deepEqual(dueFields('', ''), {});
  assert.deepEqual(dueFields(null, null), {});
});

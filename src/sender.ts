import { formatSender } from './task-builder';

/**
 * Who wrote the last message in a thread.
 *
 * A thread's `participants` hold everybody involved - sender and recipients
 * alike - so the sender is read from the newest message instead. It is a
 * local database query, but it is capped: a task is better created late than
 * the button appearing to hang.
 */

const TIMEOUT_MS = 500;

/** The newest message of a thread, by date. */
function latest(messages: any[]): any | null {
  if (!messages || messages.length === 0) return null;

  return messages.reduce((newest: any, message: any) => {
    if (!newest) return message;
    const newestAt = new Date(newest.date || 0).getTime();
    const messageAt = new Date(message.date || 0).getTime();
    return messageAt >= newestAt ? message : newest;
  }, null);
}

function timeout(ms: number): Promise<null> {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

export async function senderForThread(
  thread: any,
  timeoutMs: number = TIMEOUT_MS
): Promise<string | null> {
  if (!thread || typeof thread.messages !== 'function') {
    return null;
  }

  const lookup = thread.messages().then(
    (messages: any[]) => {
      const last = latest(messages);
      const contact = last && last.from && last.from[0];
      return formatSender(contact);
    },
    () => null
  );

  return Promise.race([lookup, timeout(timeoutMs)]);
}

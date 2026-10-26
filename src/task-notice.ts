/**
 * The "task created" notice.
 *
 * A task is created asynchronously, and the popover that started it may be
 * gone by the time Todoist answers. Keeping the notice outside React means
 * the toast can pick it up whenever it arrives - and quick-add and
 * multi-select can raise the same notice later.
 *
 * This module is intentionally free of React and Mailspring imports, so it is
 * easy to unit test.
 */

export interface TaskNotice {
  /** Distinguishes two notices that carry the same task. */
  id: string;
  title: string;
  url: string;
}

type Listener = (notice: TaskNotice | null) => void;

let current: TaskNotice | null = null;
let sequence = 0;
const listeners = new Set<Listener>();

function announce(notice: TaskNotice | null): void {
  current = notice;
  listeners.forEach((listener) => listener(notice));
}

/**
 * Raise a notice for a task that was just created.
 *
 * A second notice replaces the first: only the newest task is worth a toast.
 */
export function notifyTaskCreated(title: string, url: string): TaskNotice {
  sequence += 1;
  const notice: TaskNotice = {
    id: `${Date.now()}-${sequence}`,
    title: (title || '').trim(),
    url,
  };

  announce(notice);
  return notice;
}

/**
 * Dismiss the current notice.
 *
 * With an id, the notice is only dismissed when it is still the one the
 * caller raised - so a stale timer cannot hide a newer task's toast.
 */
export function dismissNotice(id?: string): void {
  if (!current) return;
  if (id && current.id !== id) return;
  announce(null);
}

export function getNotice(): TaskNotice | null {
  return current;
}

export function subscribeToNotice(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Due-date helpers.
 *
 * The preferences pane offers a "default due date" that may be a plain date
 * (2026-12-31) or natural language ("tomorrow"). Todoist takes one or the
 * other, never both, so the choice is made here - in one place.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string | undefined | null): boolean {
  return typeof value === 'string' && ISO_DATE.test(value.trim());
}

/** Today's date plus `offsetDays`, as YYYY-MM-DD in the local timezone. */
export function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);

  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * The due-date fields to send to Todoist.
 *
 * The date picked in the popover wins. If there is none, the default due
 * date is used - as a date when it is an ISO date, otherwise as natural
 * language. An ISO default is prefilled in the date field instead, so it
 * never has to be sent as a string.
 */
export function dueFields(
  dueDate: string | undefined | null,
  defaultDueString: string | undefined | null
): { due_date?: string; due_string?: string } {
  const picked = (dueDate || '').trim();
  if (picked) {
    return { due_date: picked };
  }

  const fallback = (defaultDueString || '').trim();
  if (!fallback || isIsoDate(fallback)) {
    return {};
  }

  return { due_string: fallback };
}

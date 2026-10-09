import { getSettings } from './store';

/**
 * Turn a Mailspring thread / message into a Todoist task draft.
 *
 * This module is intentionally pure (no React, no network) so it is easy to
 * unit test and tweak.
 */

export interface TaskDraft {
  content: string;
  description: string;
}

function unixSeconds(date: any): number {
  const d = date instanceof Date ? date : new Date(date);
  return Math.floor((isNaN(d.getTime()) ? Date.now() : d.getTime()) / 1000);
}

/**
 * Best-effort deep link back into Mailspring. Handled by the core
 * `thread-permalink-handler`, which matches on subject + timestamp.
 *
 * TODO: verify this actually reopens the thread on all platforms. If it is
 * unreliable, fall back to plain text (sender / date / subject).
 */
export function threadDeepLink(subject: string, date: any): string {
  const params = `subject=${encodeURIComponent(subject || '')}&lastDate=${unixSeconds(date)}`;
  return `mailspring://open-thread?${params}`;
}

function joinSections(sections: Array<string | undefined | null>): string {
  return sections.filter((s) => !!s && s.length > 0).join('\n\n');
}

export function draftFromThread(thread: any): TaskDraft {
  const settings = getSettings();
  const subject = (thread && thread.subject) || '(no subject)';

  // TODO: include sender/participants once we confirm the Thread shape.
  const link = settings.includeLink
    ? threadDeepLink(subject, thread && thread.lastMessageReceivedTimestamp)
    : null;

  return {
    content: subject,
    description: joinSections([thread && thread.snippet, link]),
  };
}

export function draftFromMessage(message: any): TaskDraft {
  const settings = getSettings();
  const subject = (message && message.subject) || '(no subject)';

  const from = message && message.from ? message.from.email || message.from.name : null;
  const link = settings.includeLink ? threadDeepLink(subject, message && message.date) : null;

  return {
    content: subject,
    description: joinSections([
      from ? `From: ${from}` : null,
      settings.includeSnippet ? message && message.snippet : null,
      link,
    ]),
  };
}

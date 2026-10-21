import { getSettings } from './store';

/**
 * Turn a Mailspring thread into a Todoist task draft.
 *
 * This module is intentionally pure (no React, no network) so it is easy to
 * unit test and tweak.
 */

export interface TaskDraft {
  content: string;
  description: string;
}

/** A sender, as Mailspring models it: `Message.from` is a `Contact[]`. */
export interface Contact {
  name?: string;
  email?: string;
}

function unixSeconds(date: any): number {
  const d = date instanceof Date ? date : new Date(date);
  return Math.floor((isNaN(d.getTime()) ? Date.now() : d.getTime()) / 1000);
}

/**
 * Deep link back into the thread in Mailspring.
 *
 * Handled by the core `thread-permalink-handler`: it matches the subject
 * exactly and the timestamp within 60 seconds, so the link opens the thread
 * it was made from.
 */
export function threadDeepLink(subject: string, date: any): string {
  const params = `subject=${encodeURIComponent(subject || '')}&lastDate=${unixSeconds(date)}`;
  return `mailspring://open-thread?${params}`;
}

/** "Alice <alice@example.com>" - whichever of the two we have. */
export function formatSender(contact: Contact | null | undefined): string | null {
  if (!contact) return null;

  const name = (contact.name || '').trim();
  const email = (contact.email || '').trim();

  if (name && email) return `${name} <${email}>`;
  return name || email || null;
}

function joinSections(sections: Array<string | undefined | null>): string {
  return sections.filter((s) => !!s && s.length > 0).join('\n\n');
}

/**
 * The draft for a thread.
 *
 * The title is the subject. The notes hold the sender, a preview of the
 * thread and a link back into Mailspring - the preview and the link can be
 * switched off in the preferences.
 */
export function draftFromThread(thread: any, sender?: string | null): TaskDraft {
  const settings = getSettings();
  const subject = (thread && thread.subject) || '(no subject)';

  const link = settings.includeLink
    ? threadDeepLink(subject, thread && thread.lastMessageReceivedTimestamp)
    : null;

  const preview = settings.includeSnippet ? thread && thread.snippet : null;

  return {
    content: subject,
    description: joinSections([sender, preview, link]),
  };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threadDeepLink = threadDeepLink;
exports.formatSender = formatSender;
exports.draftFromThread = draftFromThread;
const store_1 = require("./store");
function unixSeconds(date) {
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
function threadDeepLink(subject, date) {
    const params = `subject=${encodeURIComponent(subject || '')}&lastDate=${unixSeconds(date)}`;
    return `mailspring://open-thread?${params}`;
}
/** "Alice <alice@example.com>" - whichever of the two we have. */
function formatSender(contact) {
    if (!contact)
        return null;
    const name = (contact.name || '').trim();
    const email = (contact.email || '').trim();
    if (name && email)
        return `${name} <${email}>`;
    return name || email || null;
}
function joinSections(sections) {
    return sections.filter((s) => !!s && s.length > 0).join('\n\n');
}
/**
 * The draft for a thread.
 *
 * The title is the subject. The notes hold the sender, a preview of the
 * thread and a link back into Mailspring - the preview and the link can be
 * switched off in the preferences.
 */
function draftFromThread(thread, sender) {
    const settings = (0, store_1.getSettings)();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Rhc2stYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWdDQSx3Q0FHQztBQUdELG9DQVFDO0FBYUQsMENBY0M7QUF6RUQsbUNBQXNDO0FBb0J0QyxTQUFTLFdBQVcsQ0FBQyxJQUFTO0lBQzVCLE1BQU0sQ0FBQyxHQUFHLElBQUksWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixjQUFjLENBQUMsT0FBZSxFQUFFLElBQVM7SUFDdkQsTUFBTSxNQUFNLEdBQUcsV0FBVyxrQkFBa0IsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLGFBQWEsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDNUYsT0FBTyw0QkFBNEIsTUFBTSxFQUFFLENBQUM7QUFDOUMsQ0FBQztBQUVELGtFQUFrRTtBQUNsRSxTQUFnQixZQUFZLENBQUMsT0FBbUM7SUFDOUQsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPLElBQUksQ0FBQztJQUUxQixNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDekMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRTNDLElBQUksSUFBSSxJQUFJLEtBQUs7UUFBRSxPQUFPLEdBQUcsSUFBSSxLQUFLLEtBQUssR0FBRyxDQUFDO0lBQy9DLE9BQU8sSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUM7QUFDL0IsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLFFBQTBDO0lBQzlELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsZUFBZSxDQUFDLE1BQVcsRUFBRSxNQUFzQjtJQUNqRSxNQUFNLFFBQVEsR0FBRyxJQUFBLG1CQUFXLEdBQUUsQ0FBQztJQUMvQixNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksY0FBYyxDQUFDO0lBRTdELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxXQUFXO1FBQy9CLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE1BQU0sSUFBSSxNQUFNLENBQUMsNEJBQTRCLENBQUM7UUFDeEUsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUVULE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFFMUUsT0FBTztRQUNMLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ25ELENBQUM7QUFDSixDQUFDIn0=
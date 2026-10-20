"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threadDeepLink = threadDeepLink;
exports.draftFromThread = draftFromThread;
const store_1 = require("./store");
function unixSeconds(date) {
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
function threadDeepLink(subject, date) {
    const params = `subject=${encodeURIComponent(subject || '')}&lastDate=${unixSeconds(date)}`;
    return `mailspring://open-thread?${params}`;
}
function joinSections(sections) {
    return sections.filter((s) => !!s && s.length > 0).join('\n\n');
}
function draftFromThread(thread) {
    const settings = (0, store_1.getSettings)();
    const subject = (thread && thread.subject) || '(no subject)';
    // TODO: the sender line is still an open question - see the ticket "How
    // does a task link back to its email?".
    const link = settings.includeLink
        ? threadDeepLink(subject, thread && thread.lastMessageReceivedTimestamp)
        : null;
    return {
        content: subject,
        description: joinSections([thread && thread.snippet, link]),
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Rhc2stYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTBCQSx3Q0FHQztBQU1ELDBDQWNDO0FBakRELG1DQUFzQztBQWN0QyxTQUFTLFdBQVcsQ0FBQyxJQUFTO0lBQzVCLE1BQU0sQ0FBQyxHQUFHLElBQUksWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQzVFLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQixjQUFjLENBQUMsT0FBZSxFQUFFLElBQVM7SUFDdkQsTUFBTSxNQUFNLEdBQUcsV0FBVyxrQkFBa0IsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLGFBQWEsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDNUYsT0FBTyw0QkFBNEIsTUFBTSxFQUFFLENBQUM7QUFDOUMsQ0FBQztBQUVELFNBQVMsWUFBWSxDQUFDLFFBQTBDO0lBQzlELE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRSxDQUFDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLE1BQVc7SUFDekMsTUFBTSxRQUFRLEdBQUcsSUFBQSxtQkFBVyxHQUFFLENBQUM7SUFDL0IsTUFBTSxPQUFPLEdBQUcsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLGNBQWMsQ0FBQztJQUU3RCx3RUFBd0U7SUFDeEUsd0NBQXdDO0lBQ3hDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxXQUFXO1FBQy9CLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE1BQU0sSUFBSSxNQUFNLENBQUMsNEJBQTRCLENBQUM7UUFDeEUsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUVULE9BQU87UUFDTCxPQUFPLEVBQUUsT0FBTztRQUNoQixXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDNUQsQ0FBQztBQUNKLENBQUMifQ==
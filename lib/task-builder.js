"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.threadDeepLink = threadDeepLink;
exports.draftFromThread = draftFromThread;
exports.draftFromMessage = draftFromMessage;
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
    // TODO: include sender/participants once we confirm the Thread shape.
    const link = settings.includeLink
        ? threadDeepLink(subject, thread && thread.lastMessageReceivedTimestamp)
        : null;
    return {
        content: subject,
        description: joinSections([thread && thread.snippet, link]),
    };
}
function draftFromMessage(message) {
    const settings = (0, store_1.getSettings)();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Rhc2stYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTBCQSx3Q0FHQztBQU1ELDBDQWFDO0FBRUQsNENBZUM7QUFqRUQsbUNBQXNDO0FBY3RDLFNBQVMsV0FBVyxDQUFDLElBQVM7SUFDNUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUUsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxPQUFlLEVBQUUsSUFBUztJQUN2RCxNQUFNLE1BQU0sR0FBRyxXQUFXLGtCQUFrQixDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsYUFBYSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUM1RixPQUFPLDRCQUE0QixNQUFNLEVBQUUsQ0FBQztBQUM5QyxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsUUFBMEM7SUFDOUQsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xFLENBQUM7QUFFRCxTQUFnQixlQUFlLENBQUMsTUFBVztJQUN6QyxNQUFNLFFBQVEsR0FBRyxJQUFBLG1CQUFXLEdBQUUsQ0FBQztJQUMvQixNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksY0FBYyxDQUFDO0lBRTdELHNFQUFzRTtJQUN0RSxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsV0FBVztRQUMvQixDQUFDLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFNLElBQUksTUFBTSxDQUFDLDRCQUE0QixDQUFDO1FBQ3hFLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFFVCxPQUFPO1FBQ0wsT0FBTyxFQUFFLE9BQU87UUFDaEIsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzVELENBQUM7QUFDSixDQUFDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBWTtJQUMzQyxNQUFNLFFBQVEsR0FBRyxJQUFBLG1CQUFXLEdBQUUsQ0FBQztJQUMvQixNQUFNLE9BQU8sR0FBRyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksY0FBYyxDQUFDO0lBRS9ELE1BQU0sSUFBSSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3RGLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRTVGLE9BQU87UUFDTCxPQUFPLEVBQUUsT0FBTztRQUNoQixXQUFXLEVBQUUsWUFBWSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUM3QixRQUFRLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUMzRCxJQUFJO1NBQ0wsQ0FBQztLQUNILENBQUM7QUFDSixDQUFDIn0=
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.senderForThread = senderForThread;
const task_builder_1 = require("./task-builder");
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
function latest(messages) {
    if (!messages || messages.length === 0)
        return null;
    return messages.reduce((newest, message) => {
        if (!newest)
            return message;
        const newestAt = new Date(newest.date || 0).getTime();
        const messageAt = new Date(message.date || 0).getTime();
        return messageAt >= newestAt ? message : newest;
    }, null);
}
function timeout(ms) {
    return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}
async function senderForThread(thread, timeoutMs = TIMEOUT_MS) {
    if (!thread || typeof thread.messages !== 'function') {
        return null;
    }
    const lookup = thread.messages().then((messages) => {
        const last = latest(messages);
        const contact = last && last.from && last.from[0];
        return (0, task_builder_1.formatSender)(contact);
    }, () => null);
    return Promise.race([lookup, timeout(timeoutMs)]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTZCQSwwQ0FrQkM7QUEvQ0QsaURBQThDO0FBRTlDOzs7Ozs7O0dBT0c7QUFFSCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFFdkIsK0NBQStDO0FBQy9DLFNBQVMsTUFBTSxDQUFDLFFBQWU7SUFDN0IsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUVwRCxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFXLEVBQUUsT0FBWSxFQUFFLEVBQUU7UUFDbkQsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLE9BQU8sQ0FBQztRQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDeEQsT0FBTyxTQUFTLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNsRCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUMsRUFBVTtJQUN6QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkUsQ0FBQztBQUVNLEtBQUssVUFBVSxlQUFlLENBQ25DLE1BQVcsRUFDWCxZQUFvQixVQUFVO0lBRTlCLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLENBQUMsUUFBUSxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQ3JELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQ25DLENBQUMsUUFBZSxFQUFFLEVBQUU7UUFDbEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEQsT0FBTyxJQUFBLDJCQUFZLEVBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0IsQ0FBQyxFQUNELEdBQUcsRUFBRSxDQUFDLElBQUksQ0FDWCxDQUFDO0lBRUYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEQsQ0FBQyJ9
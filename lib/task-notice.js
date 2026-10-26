"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyTaskCreated = notifyTaskCreated;
exports.dismissNotice = dismissNotice;
exports.getNotice = getNotice;
exports.subscribeToNotice = subscribeToNotice;
let current = null;
let sequence = 0;
const listeners = new Set();
function announce(notice) {
    current = notice;
    listeners.forEach((listener) => listener(notice));
}
/**
 * Raise a notice for a task that was just created.
 *
 * A second notice replaces the first: only the newest task is worth a toast.
 */
function notifyTaskCreated(title, url) {
    sequence += 1;
    const notice = {
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
function dismissNotice(id) {
    if (!current)
        return;
    if (id && current.id !== id)
        return;
    announce(null);
}
function getNotice() {
    return current;
}
function subscribeToNotice(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1ub3RpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFzay1ub3RpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7O0dBVUc7O0FBeUJILDhDQVVDO0FBUUQsc0NBSUM7QUFFRCw4QkFFQztBQUVELDhDQUtDO0FBL0NELElBQUksT0FBTyxHQUFzQixJQUFJLENBQUM7QUFDdEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFZLENBQUM7QUFFdEMsU0FBUyxRQUFRLENBQUMsTUFBeUI7SUFDekMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUNqQixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLGlCQUFpQixDQUFDLEtBQWEsRUFBRSxHQUFXO0lBQzFELFFBQVEsSUFBSSxDQUFDLENBQUM7SUFDZCxNQUFNLE1BQU0sR0FBZTtRQUN6QixFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksUUFBUSxFQUFFO1FBQy9CLEtBQUssRUFBRSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFDM0IsR0FBRztLQUNKLENBQUM7SUFFRixRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakIsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLEVBQVc7SUFDdkMsSUFBSSxDQUFDLE9BQU87UUFBRSxPQUFPO0lBQ3JCLElBQUksRUFBRSxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRTtRQUFFLE9BQU87SUFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFnQixTQUFTO0lBQ3ZCLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxRQUFrQjtJQUNsRCxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3hCLE9BQU8sR0FBRyxFQUFFO1FBQ1YsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDLENBQUM7QUFDSixDQUFDIn0=
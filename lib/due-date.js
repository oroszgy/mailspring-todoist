"use strict";
/**
 * Due-date helpers.
 *
 * The preferences pane offers a "default due date" that may be a plain date
 * (2026-12-31) or natural language ("tomorrow"). Todoist takes one or the
 * other, never both, so the choice is made here - in one place.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIsoDate = isIsoDate;
exports.isoDate = isoDate;
exports.dueFields = dueFields;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
function isIsoDate(value) {
    return typeof value === 'string' && ISO_DATE.test(value.trim());
}
/** Today's date plus `offsetDays`, as YYYY-MM-DD in the local timezone. */
function isoDate(offsetDays) {
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
function dueFields(dueDate, defaultDueString) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVlLWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZHVlLWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7QUFJSCw4QkFFQztBQUdELDBCQU9DO0FBVUQsOEJBZUM7QUF2Q0QsTUFBTSxRQUFRLEdBQUcscUJBQXFCLENBQUM7QUFFdkMsU0FBZ0IsU0FBUyxDQUFDLEtBQWdDO0lBQ3hELE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVELDJFQUEyRTtBQUMzRSxTQUFnQixPQUFPLENBQUMsVUFBa0I7SUFDeEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsQ0FBQztJQUVwQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3JELE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLEtBQUssSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM5QyxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLFNBQVMsQ0FDdkIsT0FBa0MsRUFDbEMsZ0JBQTJDO0lBRTNDLE1BQU0sTUFBTSxHQUFHLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3RDLElBQUksTUFBTSxFQUFFLENBQUM7UUFDWCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRCxNQUFNLFFBQVEsR0FBRyxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2pELElBQUksQ0FBQyxRQUFRLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7UUFDckMsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsQ0FBQztBQUNsQyxDQUFDIn0=
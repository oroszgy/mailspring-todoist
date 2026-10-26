"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const task_notice_1 = require("./task-notice");
/** How long the confirmation stays without the pointer on it. */
const DISPLAY_MS = 8000;
/**
 * The confirmation shown at the bottom of the main window after a task is
 * created.
 *
 * It is registered on `WorkspaceStore.Sheet.Global.Footer`, the same place
 * Mailspring mounts its own undo toast, so it survives the create-popover
 * closing and can carry a link to the new task.
 */
class TaskCreatedToast extends mailspring_exports_1.React.Component {
    constructor() {
        super(...arguments);
        this.state = { notice: (0, task_notice_1.getNotice)() };
        this._unsubscribe = null;
        this._timeout = null;
        this._hovered = false;
        /** (Re)start the auto-dismiss timer for the notice on screen. */
        this._scheduleDismiss = () => {
            this._clearTimeout();
            const { notice } = this.state;
            if (!notice || this._hovered)
                return;
            // The id guards against a timer from an older notice hiding a newer one.
            const id = notice.id;
            this._timeout = window.setTimeout(() => (0, task_notice_1.dismissNotice)(id), DISPLAY_MS);
        };
        this._onMouseEnter = () => {
            this._hovered = true;
            this._clearTimeout();
        };
        this._onMouseLeave = () => {
            this._hovered = false;
            this._scheduleDismiss();
        };
        this._onDismiss = () => {
            const { notice } = this.state;
            if (notice)
                (0, task_notice_1.dismissNotice)(notice.id);
        };
    }
    componentDidMount() {
        this._unsubscribe = (0, task_notice_1.subscribeToNotice)((notice) => {
            this.setState({ notice }, this._scheduleDismiss);
        });
        this._scheduleDismiss();
    }
    componentWillUnmount() {
        this._clearTimeout();
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    }
    _clearTimeout() {
        if (this._timeout !== null) {
            window.clearTimeout(this._timeout);
            this._timeout = null;
        }
    }
    render() {
        const { notice } = this.state;
        return (mailspring_exports_1.React.createElement("div", { className: "todoist-task-toast-region", role: "status", "aria-live": "polite" }, notice ? (mailspring_exports_1.React.createElement("div", { className: "todoist-task-toast", onMouseEnter: this._onMouseEnter, onMouseLeave: this._onMouseLeave },
            mailspring_exports_1.React.createElement("span", { className: "todoist-task-toast-check", "aria-hidden": "true" }, "\u2713"),
            mailspring_exports_1.React.createElement("span", { className: "todoist-task-toast-message" },
                (0, mailspring_exports_1.localized)('Task created'),
                notice.title ? (mailspring_exports_1.React.createElement("span", { className: "todoist-task-toast-title" },
                    " \u2014 ",
                    notice.title)) : null),
            mailspring_exports_1.React.createElement("a", { className: "todoist-task-toast-action", href: notice.url, onClick: this._onDismiss }, (0, mailspring_exports_1.localized)('Open in Todoist')),
            mailspring_exports_1.React.createElement("button", { className: "todoist-task-toast-close", type: "button", title: (0, mailspring_exports_1.localized)('Dismiss'), "aria-label": (0, mailspring_exports_1.localized)('Dismiss'), onClick: this._onDismiss }, "\u00D7"))) : null));
    }
}
TaskCreatedToast.displayName = 'TodoistTaskCreatedToast';
TaskCreatedToast.containerRequired = false;
exports.default = TaskCreatedToast;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1jcmVhdGVkLXRvYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Rhc2stY3JlYXRlZC10b2FzdC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyREFBc0Q7QUFFdEQsK0NBQXdGO0FBRXhGLGlFQUFpRTtBQUNqRSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFNeEI7Ozs7Ozs7R0FPRztBQUNILE1BQXFCLGdCQUFpQixTQUFRLDBCQUFLLENBQUMsU0FBcUM7SUFBekY7O1FBSUUsVUFBSyxHQUEwQixFQUFFLE1BQU0sRUFBRSxJQUFBLHVCQUFTLEdBQUUsRUFBRSxDQUFDO1FBRXZELGlCQUFZLEdBQXdCLElBQUksQ0FBQztRQUN6QyxhQUFRLEdBQWtCLElBQUksQ0FBQztRQUMvQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBd0JqQixpRUFBaUU7UUFDakUscUJBQWdCLEdBQUcsR0FBRyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUVyQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM5QixJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRO2dCQUFFLE9BQU87WUFFckMseUVBQXlFO1lBQ3pFLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUEsMkJBQWEsRUFBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUM7UUFFRixrQkFBYSxHQUFHLEdBQUcsRUFBRTtZQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUNyQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDdkIsQ0FBQyxDQUFDO1FBRUYsa0JBQWEsR0FBRyxHQUFHLEVBQUU7WUFDbkIsSUFBSSxD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
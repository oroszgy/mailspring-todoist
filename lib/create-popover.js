"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
const store_1 = require("./store");
const Todoist = __importStar(require("./todoist-client"));
const task_notice_1 = require("./task-notice");
const due_date_1 = require("./due-date");
const todoist_icon_1 = require("./todoist-icon");
/**
 * The shared "create a task" form, opened from the thread toolbar button.
 *
 * TODO:
 *  - sections and labels pickers
 *  - remember the last-used project
 */
class CreateTaskPopover extends mailspring_exports_1.React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            content: this.props.draft.content,
            description: this.props.draft.description,
            projectId: (0, store_1.getSettings)().defaultProjectId,
            // A default due date that is a plain date prefills the date field; a
            // natural-language one is sent to Todoist as it is.
            dueDate: (0, due_date_1.isIsoDate)((0, store_1.getSettings)().defaultDueString)
                ? (0, store_1.getSettings)().defaultDueString.trim()
                : '',
            projects: [],
            loadingProjects: false,
            saving: false,
            error: null,
            done: false,
        };
        this._unmounted = false;
        this._closeTimeout = null;
        this._onCreate = () => {
            const { apiToken } = (0, store_1.getSettings)();
            if (!apiToken) {
                this.setState({ error: (0, mailspring_exports_1.localized)('Add your Todoist API token under Preferences first.') });
                return;
            }
            this.setState({ saving: true, error: null });
            Todoist.createTask(apiToken, Object.assign({ content: this.state.content || '(no subject)', description: this.state.description || undefined, project_id: this.state.projectId || undefined }, (0, due_date_1.dueFields)(this.state.dueDate, (0, store_1.getSettings)().defaultDueString)))
                .then((task) => {
                // The popover can be dismissed while the request is in flight (a
                // click outside closes it), but the task still exists. Raise the
                // notice even then, so the user learns that it succeeded.
                (0, task_notice_1.notifyTaskCreated)(task.content, Todoist.taskUrl(task.id));
                if (this._unmounted)
                    return;
                this.setState({ saving: false, done: true });
                this._closeTimeout = window.setTimeout(() => {
                    this._closeTimeout = null;
                    mailspring_exports_1.Actions.closePopover();
                }, 800);
            })
                .catch((err) => {
                if (this._unmounted)
                    return;
                this.setState({ saving: false, error: err.message });
            });
        };
    }
    componentWillUnmount() {
        this._unmounted = true;
        if (this._closeTimeout !== null) {
            window.clearTimeout(this._closeTimeout);
            this._closeTimeout = null;
        }
    }
    componentDidMount() {
        const { apiToken } = (0, store_1.getSettings)();
        if (!apiToken)
            return;
        this.setState({ loadingProjects: true });
        Todoist.getProjects(apiToken)
            .then((projects) => {
            // The Inbox is a project like any other - it is what a task lands in
            // when no project is chosen, so it is selected by default rather than
            // being offered as a separate "no project" option.
            const inbox = projects.find((p) => p.inbox_project);
            const projectId = this.state.projectId || (inbox && inbox.id) || '';
            this.setState({ projects, projectId, loadingProjects: false, error: null });
        })
            .catch((err) => this.setState({ loadingProjects: false, error: err.message }));
    }
    render() {
        const s = this.state;
        return (mailspring_exports_1.React.createElement("div", { className: "todoist-create-popover" },
            mailspring_exports_1.React.createElement("div", { className: "todoist-popover-header" },
                mailspring_exports_1.React.createElement(mailspring_component_kit_1.RetinaImg, { url: todoist_icon_1.TODOIST_ICON, mode: mailspring_component_kit_1.RetinaImg.Mode.ContentPreserve, className: "todoist-popover-icon" }),
                mailspring_exports_1.React.createElement("span", { className: "todoist-popover-title" }, (0, mailspring_exports_1.localized)('Create Todoist task'))),
            this.props.needsToken ? (mailspring_exports_1.React.createElement("div", { className: "todoist-popover-warning" }, (0, mailspring_exports_1.localized)('Add your Todoist API token under Preferences -> Todoist first.'))) : null,
            s.done ? (mailspring_exports_1.React.createElement("div", { className: "todoist-popover-done" },
                mailspring_exports_1.React.createElement("span", { "aria-hidden": "true" }, "\u2713"),
                mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Task created.')))) : (mailspring_exports_1.React.createElement("div", { className: "todoist-popover-form" },
                mailspring_exports_1.React.createElement("div", { className: "todoist-field" },
                    mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-task-title" }, (0, mailspring_exports_1.localized)('Title')),
                    mailspring_exports_1.React.createElement("input", { id: "todoist-task-title", type: "text", value: s.content, onChange: (e) => this.setState({ content: e.target.value }) })),
                mailspring_exports_1.React.createElement("div", { className: "todoist-field" },
                    mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-task-project" }, (0, mailspring_exports_1.localized)('Project')),
                    mailspring_exports_1.React.createElement("select", { id: "todoist-task-project", value: s.projectId, disabled: s.loadingProjects, onChange: (e) => this.setState({ projectId: e.target.value }) }, s.projects.map((p) => (mailspring_exports_1.React.createElement("option", { key: p.id, value: p.id }, p.name))))),
                mailspring_exports_1.React.createElement("div", { className: "todoist-field" },
                    mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-task-due" }, (0, mailspring_exports_1.localized)('Due date')),
                    mailspring_exports_1.React.createElement("input", { id: "todoist-task-due", type: "date", value: s.dueDate, onChange: (e) => this.setState({ dueDate: e.target.value }) }),
                    mailspring_exports_1.React.createElement("div", { className: "todoist-due-presets" },
                        mailspring_exports_1.React.createElement("button", { className: "btn btn-small", onClick: () => this.setState({ dueDate: (0, due_date_1.isoDate)(0) }) }, (0, mailspring_exports_1.localized)('Today')),
                        mailspring_exports_1.React.createElement("button", { className: "btn btn-small", onClick: () => this.setState({ dueDate: (0, due_date_1.isoDate)(1) }) }, (0, mailspring_exports_1.localized)('Tomorrow')),
                        mailspring_exports_1.React.createElement("button", { className: "btn btn-small", onClick: () => this.setState({ dueDate: (0, due_date_1.isoDate)(7) }) }, (0, mailspring_exports_1.localized)('Next week')))),
                mailspring_exports_1.React.createElement("div", { className: "todoist-field" },
                    mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-task-notes" }, (0, mailspring_exports_1.localized)('Notes')),
                    mailspring_exports_1.React.createElement("textarea", { id: "todoist-task-notes", rows: 2, value: s.description, onChange: (e) => this.setState({ description: e.target.value }) })),
                s.error ? mailspring_exports_1.React.createElement("div", { className: "todoist-popover-error" }, s.error) : null,
                mailspring_exports_1.React.createElement("div", { className: "todoist-popover-actions" },
                    mailspring_exports_1.React.createElement("button", { className: "btn", onClick: () => mailspring_exports_1.Actions.closePopover() }, (0, mailspring_exports_1.localized)('Cancel')),
                    mailspring_exports_1.React.createElement("button", { className: "btn btn-emphasis", disabled: s.saving, onClick: this._onCreate }, s.saving ? (0, mailspring_exports_1.localized)('Creating...') : (0, mailspring_exports_1.localized)('Create task')))))));
    }
}
CreateTaskPopover.displayName = 'CreateTaskPopover';
CreateTaskPopover.containerRequired = false;
exports.default = CreateTaskPopover;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXBvcG92ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3JlYXRlLXBvcG92ZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQStEO0FBQy9ELHVFQUFxRDtBQUVyRCxtQ0FBc0M7QUFDdEMsMERBQTRDO0FBQzVDLCtDQUFrRDtBQUVsRCx5Q0FBMkQ7QUFDM0QsaURBQThDO0FBbUI5Qzs7Ozs7O0dBTUc7QUFDSCxNQUFxQixpQkFBa0IsU0FBUSwwQkFBSyxDQUFDLFNBR3BEO0lBSEQ7O1FBT0UsVUFBSyxHQUEyQjtZQUM5QixPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTztZQUNqQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVztZQUN6QyxTQUFTLEVBQUUsSUFBQSxtQkFBVyxHQUFFLENBQUMsZ0JBQWdCO1lBQ3pDLHFFQUFxRTtZQUNyRSxvREFBb0Q7WUFDcEQsT0FBTyxFQUFFLElBQUEsb0JBQVMsRUFBQyxJQUFBLG1CQUFXLEdBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLElBQUEsbUJBQVcsR0FBRSxDQUFDLGdCQUFpQixDQUFDLElBQUksRUFBRTtnQkFDeEMsQ0FBQyxDQUFDLEVBQUU7WUFDTixRQUFRLEVBQUUsRUFBRTtZQUNaLGVBQWUsRUFBRSxLQUFLO1lBQ3RCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsS0FBSztTQUNaLENBQUM7UUFFRixlQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ25CLGtCQUFhLEdBQWtCLElBQUksQ0FBQztRQTJCcEMsY0FBUyxHQUFHLEdBQUcsRUFBRTtZQUNmLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFBLG1CQUFXLEdBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMs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
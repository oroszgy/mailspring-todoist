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
        this._onCreate = () => {
            const { apiToken } = (0, store_1.getSettings)();
            if (!apiToken) {
                this.setState({ error: (0, mailspring_exports_1.localized)('Add your Todoist API token under Preferences first.') });
                return;
            }
            this.setState({ saving: true, error: null });
            Todoist.createTask(apiToken, Object.assign({ content: this.state.content || '(no subject)', description: this.state.description || undefined, project_id: this.state.projectId || undefined }, (0, due_date_1.dueFields)(this.state.dueDate, (0, store_1.getSettings)().defaultDueString)))
                .then(() => {
                this.setState({ saving: false, done: true });
                window.setTimeout(() => mailspring_exports_1.Actions.closePopover(), 800);
            })
                .catch((err) => this.setState({ saving: false, error: err.message }));
        };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXBvcG92ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3JlYXRlLXBvcG92ZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQStEO0FBQy9ELHVFQUFxRDtBQUVyRCxtQ0FBc0M7QUFDdEMsMERBQTRDO0FBRTVDLHlDQUEyRDtBQUMzRCxpREFBOEM7QUFtQjlDOzs7Ozs7R0FNRztBQUNILE1BQXFCLGlCQUFrQixTQUFRLDBCQUFLLENBQUMsU0FHcEQ7SUFIRDs7UUFPRSxVQUFLLEdBQTJCO1lBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPO1lBQ2pDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXO1lBQ3pDLFNBQVMsRUFBRSxJQUFBLG1CQUFXLEdBQUUsQ0FBQyxnQkFBZ0I7WUFDekMscUVBQXFFO1lBQ3JFLG9EQUFvRDtZQUNwRCxPQUFPLEVBQUUsSUFBQSxvQkFBUyxFQUFDLElBQUEsbUJBQVcsR0FBRSxDQUFDLGdCQUFnQixDQUFDO2dCQUNoRCxDQUFDLENBQUMsSUFBQSxtQkFBVyxHQUFFLENBQUMsZ0JBQWlCLENBQUMsSUFBSSxFQUFFO2dCQUN4QyxDQUFDLENBQUMsRUFBRTtZQUNOLFFBQVEsRUFBRSxFQUFFO1lBQ1osZUFBZSxFQUFFLEtBQUs7WUFDdEIsTUFBTSxFQUFFLEtBQUs7WUFDYixLQUFLLEVBQUUsSUFBSTtZQUNYLElBQUksRUFBRSxLQUFLO1NBQ1osQ0FBQztRQW1CRixjQUFTLEdBQUcsR0FBRyxFQUFFO1lBQ2YsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUEsbUJBQVcsR0FBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUEsOEJBQVMs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
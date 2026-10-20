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
const todoist_icon_1 = require("./todoist-icon");
function isoDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
}
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
            dueDate: '',
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
            Todoist.createTask(apiToken, {
                content: this.state.content || '(no subject)',
                description: this.state.description || undefined,
                project_id: this.state.projectId || undefined,
                due_date: this.state.dueDate || undefined,
            })
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
                        mailspring_exports_1.React.createElement("button", { className: "btn btn-small", onClick: () => this.setState({ dueDate: isoDate(0) }) }, (0, mailspring_exports_1.localized)('Today')),
                        mailspring_exports_1.React.createElement("button", { className: "btn btn-small", onClick: () => this.setState({ dueDate: isoDate(1) }) }, (0, mailspring_exports_1.localized)('Tomorrow')),
                        mailspring_exports_1.React.createElement("button", { className: "btn btn-small", onClick: () => this.setState({ dueDate: isoDate(7) }) }, (0, mailspring_exports_1.localized)('Next week')))),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXBvcG92ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3JlYXRlLXBvcG92ZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQStEO0FBQy9ELHVFQUFxRDtBQUVyRCxtQ0FBc0M7QUFDdEMsMERBQTRDO0FBRTVDLGlEQUE4QztBQW1COUMsU0FBUyxPQUFPLENBQUMsVUFBa0I7SUFDakMsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyQixDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsQ0FBQztJQUNwQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFxQixpQkFBa0IsU0FBUSwwQkFBSyxDQUFDLFNBR3BEO0lBSEQ7O1FBT0UsVUFBSyxHQUEyQjtZQUM5QixPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTztZQUNqQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVztZQUN6QyxTQUFTLEVBQUUsSUFBQSxtQkFBVyxHQUFFLENBQUMsZ0JBQWdCO1lBQ3pDLE9BQU8sRUFBRSxFQUFFO1lBQ1gsUUFBUSxFQUFFLEVBQUU7WUFDWixlQUFlLEVBQUUsS0FBSztZQUN0QixNQUFNLEVBQUUsS0FBSztZQUNiLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLEtBQUs7U0FDWixDQUFDO1FBbUJGLGNBQVMsR0FBRyxHQUFHLEVBQUU7WUFDZixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBQSxtQkFBVyxHQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dC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
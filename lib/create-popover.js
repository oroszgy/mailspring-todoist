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
const store_1 = require("./store");
const Todoist = __importStar(require("./todoist-client"));
function isoDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
}
/**
 * The shared "create a task" form, opened from either toolbar button.
 *
 * TODO:
 *  - multi-select: create one task per selected thread
 *  - section / label pickers
 *  - remember the last-used project + due date
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
            .then((projects) => this.setState({ projects, loadingProjects: false, error: null }))
            .catch((err) => this.setState({ loadingProjects: false, error: err.message }));
    }
    render() {
        const s = this.state;
        return (mailspring_exports_1.React.createElement("div", { className: "todoist-create-popover" },
            mailspring_exports_1.React.createElement("div", { className: "todoist-popover-title" }, (0, mailspring_exports_1.localized)('Create Todoist task')),
            this.props.needsToken ? (mailspring_exports_1.React.createElement("div", { className: "todoist-popover-warning" }, (0, mailspring_exports_1.localized)('Add your Todoist API token under Preferences -> Todoist first.'))) : null,
            s.done ? (mailspring_exports_1.React.createElement("div", { className: "todoist-popover-done" }, (0, mailspring_exports_1.localized)('Task created.'))) : (mailspring_exports_1.React.createElement("div", { className: "todoist-popover-form" },
                mailspring_exports_1.React.createElement("label", { className: "todoist-field" },
                    mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Title')),
                    mailspring_exports_1.React.createElement("input", { type: "text", value: s.content, onChange: (e) => this.setState({ content: e.target.value }) })),
                mailspring_exports_1.React.createElement("label", { className: "todoist-field" },
                    mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Notes')),
                    mailspring_exports_1.React.createElement("textarea", { rows: 3, value: s.description, onChange: (e) => this.setState({ description: e.target.value }) })),
                mailspring_exports_1.React.createElement("label", { className: "todoist-field" },
                    mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Project')),
                    mailspring_exports_1.React.createElement("select", { value: s.projectId, onChange: (e) => this.setState({ projectId: e.target.value }) },
                        mailspring_exports_1.React.createElement("option", { value: "" }, (0, mailspring_exports_1.localized)('Inbox')),
                        s.projects.map((p) => (mailspring_exports_1.React.createElement("option", { key: p.id, value: p.id }, p.name))))),
                mailspring_exports_1.React.createElement("label", { className: "todoist-field" },
                    mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Due date')),
                    mailspring_exports_1.React.createElement("input", { type: "date", value: s.dueDate, onChange: (e) => this.setState({ dueDate: e.target.value }) })),
                mailspring_exports_1.React.createElement("div", { className: "todoist-due-presets" },
                    mailspring_exports_1.React.createElement("button", { onClick: () => this.setState({ dueDate: isoDate(0) }) }, (0, mailspring_exports_1.localized)('Today')),
                    mailspring_exports_1.React.createElement("button", { onClick: () => this.setState({ dueDate: isoDate(1) }) }, (0, mailspring_exports_1.localized)('Tomorrow')),
                    mailspring_exports_1.React.createElement("button", { onClick: () => this.setState({ dueDate: isoDate(7) }) }, (0, mailspring_exports_1.localized)('Next week'))),
                s.error ? mailspring_exports_1.React.createElement("div", { className: "todoist-popover-error" }, s.error) : null,
                mailspring_exports_1.React.createElement("div", { className: "todoist-popover-actions" },
                    mailspring_exports_1.React.createElement("button", { className: "btn", onClick: () => mailspring_exports_1.Actions.closePopover() }, (0, mailspring_exports_1.localized)('Cancel')),
                    mailspring_exports_1.React.createElement("button", { className: "btn btn-emphasis", disabled: s.saving, onClick: this._onCreate }, s.saving ? (0, mailspring_exports_1.localized)('Creating...') : (0, mailspring_exports_1.localized)('Create task')))))));
    }
}
CreateTaskPopover.displayName = 'CreateTaskPopover';
CreateTaskPopover.containerRequired = false;
exports.default = CreateTaskPopover;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXBvcG92ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY3JlYXRlLXBvcG92ZXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkRBQStEO0FBRS9ELG1DQUFzQztBQUN0QywwREFBNEM7QUFvQjVDLFNBQVMsT0FBTyxDQUFDLFVBQWtCO0lBQ2pDLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsVUFBVSxDQUFDLENBQUM7SUFDcEMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILE1BQXFCLGlCQUFrQixTQUFRLDBCQUFLLENBQUMsU0FHcEQ7SUFIRDs7UUFPRSxVQUFLLEdBQTJCO1lBQzlCLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPO1lBQ2pDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXO1lBQ3pDLFNBQVMsRUFBRSxJQUFBLG1CQUFXLEdBQUUsQ0FBQyxnQkFBZ0I7WUFDekMsT0FBTyxFQUFFLEVBQUU7WUFDWCxRQUFRLEVBQUUsRUFBRTtZQUNaLGVBQWUsRUFBRSxLQUFLO1lBQ3RCLE1BQU0sRUFBRSxLQUFLO1lBQ2IsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsS0FBSztTQUNaLENBQUM7UUFZRixjQUFTLEdBQUcsR0FBRyxFQUFFO1lBQ2YsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUEsbUJBQVcsR0FBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLEVB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
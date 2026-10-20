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
/**
 * Preferences pane: token, defaults and a connection test.
 */
class TodoistPreferences extends mailspring_exports_1.React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            settings: (0, store_1.getSettings)(),
            projects: [],
            testing: false,
            status: '',
            error: '',
        };
        this._loadProjects = (apiToken) => {
            this.setState({ testing: true, status: '', error: '' });
            Todoist.getProjects(apiToken)
                .then((projects) => this.setState({
                projects,
                testing: false,
                status: (0, mailspring_exports_1.localized)('Connected - %@ project(s) available.', projects.length),
            }))
                .catch((err) => this.setState({ testing: false, error: err.message }));
        };
        this._update = (key, value) => {
            (0, store_1.setSetting)(key, value);
            this.setState({ settings: (0, store_1.getSettings)() });
        };
        this._onTest = () => {
            const { apiToken } = this.state.settings;
            if (!apiToken) {
                this.setState({ error: (0, mailspring_exports_1.localized)('Add a Todoist API token first.') });
                return;
            }
            this._loadProjects(apiToken);
        };
    }
    componentDidMount() {
        const { apiToken } = (0, store_1.getSettings)();
        if (!apiToken)
            return;
        // A token is already configured, so the projects can be fetched straight
        // away rather than waiting for the connection test.
        this._loadProjects(apiToken);
    }
    render() {
        const { settings, projects, testing, status, error } = this.state;
        return (mailspring_exports_1.React.createElement("div", { className: "todoist-preferences" },
            mailspring_exports_1.React.createElement("p", { className: "todoist-preferences-intro" }, (0, mailspring_exports_1.localized)('Create Todoist tasks straight from Mailspring. Get a personal API token from Todoist -> Settings -> Integrations -> Developer.')),
            mailspring_exports_1.React.createElement("div", { className: "todoist-field" },
                mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-prefs-token" }, (0, mailspring_exports_1.localized)('API token')),
                mailspring_exports_1.React.createElement("input", { id: "todoist-prefs-token", type: "password", value: settings.apiToken, placeholder: "0123456789abcdef...", onChange: (e) => this._update('apiToken', e.target.value) })),
            mailspring_exports_1.React.createElement("div", { className: "todoist-field" },
                mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-prefs-project" }, (0, mailspring_exports_1.localized)('Default project')),
                mailspring_exports_1.React.createElement("select", { id: "todoist-prefs-project", value: settings.defaultProjectId, onChange: (e) => this._update('defaultProjectId', e.target.value) }, projects.map((p) => (mailspring_exports_1.React.createElement("option", { key: p.id, value: p.id }, p.name))))),
            mailspring_exports_1.React.createElement("div", { className: "todoist-field" },
                mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-prefs-due" }, (0, mailspring_exports_1.localized)('Default due date')),
                mailspring_exports_1.React.createElement("input", { id: "todoist-prefs-due", type: "text", value: settings.defaultDueString, placeholder: "tomorrow / 2026-12-31 (optional)", onChange: (e) => this._update('defaultDueString', e.target.value) })),
            mailspring_exports_1.React.createElement("div", { className: "todoist-field todoist-field-checkbox" },
                mailspring_exports_1.React.createElement("input", { id: "todoist-prefs-snippet", type: "checkbox", checked: settings.includeSnippet, onChange: (e) => this._update('includeSnippet', e.target.checked) }),
                mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-prefs-snippet" }, (0, mailspring_exports_1.localized)('Include an email preview in the task notes'))),
            mailspring_exports_1.React.createElement("div", { className: "todoist-field todoist-field-checkbox" },
                mailspring_exports_1.React.createElement("input", { id: "todoist-prefs-link", type: "checkbox", checked: settings.includeLink, onChange: (e) => this._update('includeLink', e.target.checked) }),
                mailspring_exports_1.React.createElement("label", { htmlFor: "todoist-prefs-link" }, (0, mailspring_exports_1.localized)('Include a Mailspring link in the task notes'))),
            mailspring_exports_1.React.createElement("div", { className: "todoist-preferences-actions" },
                mailspring_exports_1.React.createElement("button", { className: "btn", disabled: testing, onClick: this._onTest }, testing ? (0, mailspring_exports_1.localized)('Testing...') : (0, mailspring_exports_1.localized)('Test connection')),
                status ? mailspring_exports_1.React.createElement("span", { className: "todoist-preferences-status" }, status) : null,
                error ? mailspring_exports_1.React.createElement("span", { className: "todoist-preferences-error" }, error) : null)));
    }
}
TodoistPreferences.displayName = 'TodoistPreferences';
TodoistPreferences.containerRequired = false;
exports.default = TodoistPreferences;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXMtdGFiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ByZWZlcmVuY2VzLXRhYi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyREFBc0Q7QUFFdEQsbUNBQTREO0FBQzVELDBEQUE0QztBQVU1Qzs7R0FFRztBQUNILE1BQXFCLGtCQUFtQixTQUFRLDBCQUFLLENBQUMsU0FBdUM7SUFBN0Y7O1FBSUUsVUFBSyxHQUE0QjtZQUMvQixRQUFRLEVBQUUsSUFBQSxtQkFBVyxHQUFFO1lBQ3ZCLFFBQVEsRUFBRSxFQUFFO1lBQ1osT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNLEVBQUUsRUFBRTtZQUNWLEtBQUssRUFBRSxFQUFFO1NBQ1YsQ0FBQztRQVdGLGtCQUFhLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV4RCxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztpQkFDMUIsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDWixRQUFRO2dCQUNSLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE1BQU0sRUFBRSxJQUFBLDhCQUFTLEVBQUMsc0NBQXNDLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUMzRSxDQUFDLENBQ0g7aUJBQ0EsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDLENBQUM7UUFFRixZQUFPLEdB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
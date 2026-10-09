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
        this._update = (key, value) => {
            (0, store_1.setSetting)(key, value);
            this.setState({ settings: (0, store_1.getSettings)() });
        };
        this._onTest = () => {
            const { apiToken } = this.state.settings;
            this.setState({ testing: true, status: '', error: '' });
            Todoist.getProjects(apiToken)
                .then((projects) => this.setState({
                projects,
                testing: false,
                status: `Connected - ${projects.length} project(s) available.`,
            }))
                .catch((err) => this.setState({ testing: false, error: err.message }));
        };
    }
    render() {
        const { settings, projects, testing, status, error } = this.state;
        return (mailspring_exports_1.React.createElement("div", { className: "todoist-preferences" },
            mailspring_exports_1.React.createElement("p", { className: "todoist-preferences-intro" }, (0, mailspring_exports_1.localized)('Create Todoist tasks straight from Mailspring. Get a personal API token from Todoist -> Settings -> Integrations -> Developer.')),
            mailspring_exports_1.React.createElement("label", { className: "todoist-field" },
                mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('API token')),
                mailspring_exports_1.React.createElement("input", { type: "password", value: settings.apiToken, placeholder: "0123456789abcdef...", onChange: (e) => this._update('apiToken', e.target.value) })),
            mailspring_exports_1.React.createElement("label", { className: "todoist-field" },
                mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Default project')),
                mailspring_exports_1.React.createElement("select", { value: settings.defaultProjectId, onChange: (e) => this._update('defaultProjectId', e.target.value) },
                    mailspring_exports_1.React.createElement("option", { value: "" }, (0, mailspring_exports_1.localized)('Inbox (no project)')),
                    projects.map((p) => (mailspring_exports_1.React.createElement("option", { key: p.id, value: p.id }, p.name))))),
            mailspring_exports_1.React.createElement("label", { className: "todoist-field" },
                mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Default due date')),
                mailspring_exports_1.React.createElement("input", { type: "text", value: settings.defaultDueString, placeholder: "tomorrow / 2026-12-31 (optional)", onChange: (e) => this._update('defaultDueString', e.target.value) })),
            mailspring_exports_1.React.createElement("label", { className: "todoist-field todoist-field-checkbox" },
                mailspring_exports_1.React.createElement("input", { type: "checkbox", checked: settings.includeSnippet, onChange: (e) => this._update('includeSnippet', e.target.checked) }),
                mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Include an email preview in the task notes'))),
            mailspring_exports_1.React.createElement("label", { className: "todoist-field todoist-field-checkbox" },
                mailspring_exports_1.React.createElement("input", { type: "checkbox", checked: settings.includeLink, onChange: (e) => this._update('includeLink', e.target.checked) }),
                mailspring_exports_1.React.createElement("span", null, (0, mailspring_exports_1.localized)('Include a Mailspring link in the task notes'))),
            mailspring_exports_1.React.createElement("div", { className: "todoist-preferences-actions" },
                mailspring_exports_1.React.createElement("button", { className: "btn", disabled: testing, onClick: this._onTest }, testing ? (0, mailspring_exports_1.localized)('Testing...') : (0, mailspring_exports_1.localized)('Test connection')),
                status ? mailspring_exports_1.React.createElement("span", { className: "todoist-preferences-status" }, status) : null,
                error ? mailspring_exports_1.React.createElement("span", { className: "todoist-preferences-error" }, error) : null)));
    }
}
TodoistPreferences.displayName = 'TodoistPreferences';
TodoistPreferences.containerRequired = false;
exports.default = TodoistPreferences;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmVyZW5jZXMtdGFiLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ByZWZlcmVuY2VzLXRhYi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwyREFBc0Q7QUFFdEQsbUNBQTREO0FBQzVELDBEQUE0QztBQVU1Qzs7R0FFRztBQUNILE1BQXFCLGtCQUFtQixTQUFRLDBCQUFLLENBQUMsU0FBdUM7SUFBN0Y7O1FBSUUsVUFBSyxHQUE0QjtZQUMvQixRQUFRLEVBQUUsSUFBQSxtQkFBVyxHQUFFO1lBQ3ZCLFFBQVEsRUFBRSxFQUFFO1lBQ1osT0FBTyxFQUFFLEtBQUs7WUFDZCxNQUFNLEVBQUUsRUFBRTtZQUNWLEtBQUssRUFBRSxFQUFFO1NBQ1YsQ0FBQztRQUVGLFlBQU8sR0FBRyxDQUFDLEdBQW1CLEVBQUUsS0FBVSxFQUFFLEVBQUU7WUFDNUMsSUFBQSxrQkFBVSxFQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUEsbUJBQVcsR0FBRSxFQUFFLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUM7UUFFRixZQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ2IsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFeEQsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7aUJBQzFCLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQ2pCLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ1osUUFBUTtnQkFDUixPQUFPLEVBQUUsS0FBSztnQkFDZCxNQUFN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
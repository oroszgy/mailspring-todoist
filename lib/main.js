"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const mailspring_exports_1 = require("mailspring-exports");
const thread_toolbar_button_1 = __importDefault(require("./thread-toolbar-button"));
/**
 * Config schema for the plugin.
 *
 * Mailspring namespaces every key with the package name, so `apiToken` below is
 * read/written as `mailspring-todoist.apiToken` via `AppEnv.config` (see store.ts).
 */
exports.config = {
    apiToken: {
        type: 'string',
        default: '',
        title: 'Todoist API token',
        description: 'Create a personal token at Todoist -> Settings -> Integrations -> Developer.',
    },
    defaultProjectId: {
        type: 'string',
        default: '',
        title: 'Default project',
        description: 'Todoist project id used when creating a task. Empty means Inbox.',
    },
    defaultDueString: {
        type: 'string',
        default: '',
        title: 'Default due date',
        description: 'Optional. Natural language such as "tomorrow" or an ISO date (YYYY-MM-DD).',
    },
    includeSnippet: {
        type: 'boolean',
        default: true,
        title: 'Include an email preview in the task notes',
    },
    includeLink: {
        type: 'boolean',
        default: true,
        title: 'Include a Mailspring link in the task notes',
    },
};
let preferencesTab = null;
function activate() {
    // Button in the thread list toolbar (works with the selected thread(s)).
    mailspring_exports_1.ComponentRegistry.register(thread_toolbar_button_1.default, {
        role: 'ThreadActionsToolbarButton',
    });
    preferencesTab = new mailspring_exports_1.PreferencesUIStore.TabItem({
        tabId: 'Todoist',
        displayName: (0, mailspring_exports_1.localized)('Todoist'),
        componentClassFn: () => require('./preferences-tab').default,
    });
    mailspring_exports_1.PreferencesUIStore.registerPreferencesTab(preferencesTab);
}
function deactivate() {
    mailspring_exports_1.ComponentRegistry.unregister(thread_toolbar_button_1.default);
    if (preferencesTab) {
        mailspring_exports_1.PreferencesUIStore.unregisterPreferencesTab(preferencesTab.tabId);
        preferencesTab = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQWdEQSw0QkFZQztBQUVELGdDQU9DO0FBckVELDJEQUk0QjtBQUU1QixvRkFBMEQ7QUFFMUQ7Ozs7O0dBS0c7QUFDVSxRQUFBLE1BQU0sR0FBRztJQUNwQixRQUFRLEVBQUU7UUFDUixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLG1CQUFtQjtRQUMxQixXQUFXLEVBQ1QsOEVBQThFO0tBQ2pGO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDaEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsRUFBRTtRQUNYLEtBQUssRUFBRSxpQkFBaUI7UUFDeEIsV0FBVyxFQUFFLGtFQUFrRTtLQUNoRjtJQUNELGdCQUFnQixFQUFFO1FBQ2hCLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxLQUFLLEVBQUUsa0JBQWtCO1FBQ3pCLFdBQVcsRUFBRSw0RUFBNEU7S0FDMUY7SUFDRCxjQUFjLEVBQUU7UUFDZCxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLDRDQUE0QztLQUNwRDtJQUNELFdBQVcsRUFBRTtRQUNYLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsNkNBQTZDO0tBQ3JEO0NBQ0YsQ0FBQztBQUVGLElBQUksY0FBYyxHQUFRLElBQUksQ0FBQztBQUUvQixTQUFnQixRQUFRO0lBQ3RCLHlFQUF5RTtJQUN6RSxzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsK0JBQW1CLEVBQUU7UUFDOUMsSUFBSSxFQUFFLDRCQUE0QjtLQUNuQyxDQUFDLENBQUM7SUFFSCxjQUFjLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxPQUFPLENBQUM7UUFDOUMsS0FBSyxFQUFFLFNBQVM7UUFDaEIsV0FBVyxFQUFFLElBQUEsOEJBQVMsRUFBQyxTQUFTLENBQUM7UUFDakMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTztLQUM3RCxDQUFDLENBQUM7SUFDSCx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQsU0FBZ0IsVUFBVTtJQUN4QixzQ0FBaUIsQ0FBQyxVQUFVLENBQUMsK0JBQW1CLENBQUMsQ0FBQztJQUVsRCxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ25CLHVDQUFrQixDQUFDLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRSxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQ3hCLENBQUM7QUFDSCxDQUFDIn0=
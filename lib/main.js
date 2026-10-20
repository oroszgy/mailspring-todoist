"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
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
function serialize() {
    return {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQWdEQSw0QkFZQztBQUVELGdDQU9DO0FBRUQsOEJBRUM7QUF6RUQsMkRBSTRCO0FBRTVCLG9GQUEwRDtBQUUxRDs7Ozs7R0FLRztBQUNVLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLFFBQVEsRUFBRTtRQUNSLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxLQUFLLEVBQUUsbUJBQW1CO1FBQzFCLFdBQVcsRUFDVCw4RUFBOEU7S0FDakY7SUFDRCxnQkFBZ0IsRUFBRTtRQUNoQixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLGlCQUFpQjtRQUN4QixXQUFXLEVBQUUsa0VBQWtFO0tBQ2hGO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDaEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsRUFBRTtRQUNYLEtBQUssRUFBRSxrQkFBa0I7UUFDekIsV0FBVyxFQUFFLDRFQUE0RTtLQUMxRjtJQUNELGNBQWMsRUFBRTtRQUNkLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsNENBQTRDO0tBQ3BEO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSw2Q0FBNkM7S0FDckQ7Q0FDRixDQUFDO0FBRUYsSUFBSSxjQUFjLEdBQVEsSUFBSSxDQUFDO0FBRS9CLFNBQWdCLFFBQVE7SUFDdEIseUVBQXlFO0lBQ3pFLHNDQUFpQixDQUFDLFFBQVEsQ0FBQywrQkFBbUIsRUFBRTtRQUM5QyxJQUFJLEVBQUUsNEJBQTRCO0tBQ25DLENBQUMsQ0FBQztJQUVILGNBQWMsR0FBRyxJQUFJLHVDQUFrQixDQUFDLE9BQU8sQ0FBQztRQUM5QyxLQUFLLEVBQUUsU0FBUztRQUNoQixXQUFXLEVBQUUsSUFBQSw4QkFBUyxFQUFDLFNBQVMsQ0FBQztRQUNqQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPO0tBQzdELENBQUMsQ0FBQztJQUNILHVDQUFrQixDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRCxTQUFnQixVQUFVO0lBQ3hCLHNDQUFpQixDQUFDLFVBQVUsQ0FBQywrQkFBbUIsQ0FBQyxDQUFDO0lBRWxELElBQUksY0FBYyxFQUFFLENBQUM7UUFDbkIsdUNBQWtCLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFnQixTQUFTO0lBQ3ZCLE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQyJ9
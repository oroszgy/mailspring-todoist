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
const task_created_toast_1 = __importDefault(require("./task-created-toast"));
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
let toastRegistered = false;
function activate() {
    // Button in the thread list toolbar (works with the selected thread(s)).
    mailspring_exports_1.ComponentRegistry.register(thread_toolbar_button_1.default, {
        role: 'ThreadActionsToolbarButton',
    });
    // Confirmation in the bottom of the main window, on the same footer as
    // Mailspring's own undo toast. Other window types have no thread list.
    if (AppEnv.isMainWindow()) {
        mailspring_exports_1.ComponentRegistry.register(task_created_toast_1.default, {
            location: mailspring_exports_1.WorkspaceStore.Sheet.Global.Footer,
        });
        toastRegistered = true;
    }
    preferencesTab = new mailspring_exports_1.PreferencesUIStore.TabItem({
        tabId: 'Todoist',
        displayName: (0, mailspring_exports_1.localized)('Todoist'),
        componentClassFn: () => require('./preferences-tab').default,
    });
    mailspring_exports_1.PreferencesUIStore.registerPreferencesTab(preferencesTab);
}
function deactivate() {
    mailspring_exports_1.ComponentRegistry.unregister(thread_toolbar_button_1.default);
    if (toastRegistered) {
        mailspring_exports_1.ComponentRegistry.unregister(task_created_toast_1.default);
        toastRegistered = false;
    }
    if (preferencesTab) {
        mailspring_exports_1.PreferencesUIStore.unregisterPreferencesTab(preferencesTab.tabId);
        preferencesTab = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQW1EQSw0QkFxQkM7QUFFRCxnQ0FZQztBQXRGRCwyREFLNEI7QUFFNUIsb0ZBQTBEO0FBQzFELDhFQUFvRDtBQUVwRDs7Ozs7R0FLRztBQUNVLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLFFBQVEsRUFBRTtRQUNSLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxLQUFLLEVBQUUsbUJBQW1CO1FBQzFCLFdBQVcsRUFDVCw4RUFBOEU7S0FDakY7SUFDRCxnQkFBZ0IsRUFBRTtRQUNoQixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLGlCQUFpQjtRQUN4QixXQUFXLEVBQUUsa0VBQWtFO0tBQ2hGO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDaEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsRUFBRTtRQUNYLEtBQUssRUFBRSxrQkFBa0I7UUFDekIsV0FBVyxFQUFFLDRFQUE0RTtLQUMxRjtJQUNELGNBQWMsRUFBRTtRQUNkLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsNENBQTRDO0tBQ3BEO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSw2Q0FBNkM7S0FDckQ7Q0FDRixDQUFDO0FBRUYsSUFBSSxjQUFjLEdBQVEsSUFBSSxDQUFDO0FBQy9CLElBQUksZUFBZSxHQUFHLEtBQUssQ0FBQztBQUU1QixTQUFnQixRQUFRO0lBQ3RCLHlFQUF5RTtJQUN6RSxzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsK0JBQW1CLEVBQUU7UUFDOUMsSUFBSSxFQUFFLDRCQUE0QjtLQUNuQyxDQUFDLENBQUM7SUFFSCx1RUFBdUU7SUFDdkUsdUVBQXVFO0lBQ3ZFLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7UUFDMUIsc0NBQWlCLENBQUMsUUFBUSxDQUFDLDRCQUFnQixFQUFFO1lBQzNDLFFBQVEsRUFBRSxtQ0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTTtTQUM3QyxDQUFDLENBQUM7UUFDSCxlQUFlLEdBQUcsSUFBSSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxjQUFjLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxPQUFPLENBQUM7UUFDOUMsS0FBSyxFQUFFLFNBQVM7UUFDaEIsV0FBVyxFQUFFLElBQUEsOEJBQVMsRUFBQyxTQUFTLENBQUM7UUFDakMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsT0FBTztLQUM3RCxDQUFDLENBQUM7SUFDSCx1Q0FBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQsU0FBZ0IsVUFBVTtJQUN4QixzQ0FBaUIsQ0FBQyxVQUFVLENBQUMsK0JBQW1CLENBQUMsQ0FBQztJQUVsRCxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQ3BCLHNDQUFpQixDQUFDLFVBQVUsQ0FBQyw0QkFBZ0IsQ0FBQyxDQUFDO1FBQy9DLGVBQWUsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksY0FBYyxFQUFFLENBQUM7UUFDbkIsdUNBQWtCLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztBQUNILENBQUMifQ==
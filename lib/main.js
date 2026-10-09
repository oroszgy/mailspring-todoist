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
const message_header_button_1 = __importDefault(require("./message-header-button"));
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
    // Button in the header of an open message.
    mailspring_exports_1.ComponentRegistry.register(message_header_button_1.default, {
        role: 'message:BodyHeader',
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
    mailspring_exports_1.ComponentRegistry.unregister(message_header_button_1.default);
    if (preferencesTab) {
        mailspring_exports_1.PreferencesUIStore.unregisterPreferencesTab(preferencesTab.sectionId);
        preferencesTab = null;
    }
}
function serialize() {
    return {};
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQWlEQSw0QkFpQkM7QUFFRCxnQ0FRQztBQUVELDhCQUVDO0FBaEZELDJEQUk0QjtBQUU1QixvRkFBMEQ7QUFDMUQsb0ZBQTJEO0FBRTNEOzs7OztHQUtHO0FBQ1UsUUFBQSxNQUFNLEdBQUc7SUFDcEIsUUFBUSxFQUFFO1FBQ1IsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsRUFBRTtRQUNYLEtBQUssRUFBRSxtQkFBbUI7UUFDMUIsV0FBVyxFQUNULDhFQUE4RTtLQUNqRjtJQUNELGdCQUFnQixFQUFFO1FBQ2hCLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLEVBQUU7UUFDWCxLQUFLLEVBQUUsaUJBQWlCO1FBQ3hCLFdBQVcsRUFBRSxrRUFBa0U7S0FDaEY7SUFDRCxnQkFBZ0IsRUFBRTtRQUNoQixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO1FBQ1gsS0FBSyxFQUFFLGtCQUFrQjtRQUN6QixXQUFXLEVBQUUsNEVBQTRFO0tBQzFGO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSw0Q0FBNEM7S0FDcEQ7SUFDRCxXQUFXLEVBQUU7UUFDWCxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLDZDQUE2QztLQUNyRDtDQUNGLENBQUM7QUFFRixJQUFJLGNBQWMsR0FBUSxJQUFJLENBQUM7QUFFL0IsU0FBZ0IsUUFBUTtJQUN0Qix5RUFBeUU7SUFDekUsc0NBQWlCLENBQUMsUUFBUSxDQUFDLCtCQUFtQixFQUFFO1FBQzlDLElBQUksRUFBRSw0QkFBNEI7S0FDbkMsQ0FBQyxDQUFDO0lBRUgsMkNBQTJDO0lBQzNDLHNDQUFpQixDQUFDLFFBQVEsQ0FBQywrQkFBb0IsRUFBRTtRQUMvQyxJQUFJLEVBQUUsb0JBQW9CO0tBQzNCLENBQUMsQ0FBQztJQUVILGNBQWMsR0FBRyxJQUFJLHVDQUFrQixDQUFDLE9BQU8sQ0FBQztRQUM5QyxLQUFLLEVBQUUsU0FBUztRQUNoQixXQUFXLEVBQUUsSUFBQSw4QkFBUyxFQUFDLFNBQVMsQ0FBQztRQUNqQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPO0tBQzdELENBQUMsQ0FBQztJQUNILHVDQUFrQixDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFFRCxTQUFnQixVQUFVO0lBQ3hCLHNDQUFpQixDQUFDLFVBQVUsQ0FBQywrQkFBbUIsQ0FBQyxDQUFDO0lBQ2xELHNDQUFpQixDQUFDLFVBQVUsQ0FBQywrQkFBb0IsQ0FBQyxDQUFDO0lBRW5ELElBQUksY0FBYyxFQUFFLENBQUM7UUFDbkIsdUNBQWtCLENBQUMsd0JBQXdCLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RFLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFnQixTQUFTO0lBQ3ZCLE9BQU8sRUFBRSxDQUFDO0FBQ1osQ0FBQyJ9
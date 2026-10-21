import {
  ComponentRegistry,
  PreferencesUIStore,
  localized,
} from 'mailspring-exports';

import TodoistThreadButton from './thread-toolbar-button';

/**
 * Config schema for the plugin.
 *
 * Mailspring namespaces every key with the package name, so `apiToken` below is
 * read/written as `mailspring-todoist.apiToken` via `AppEnv.config` (see store.ts).
 */
export const config = {
  apiToken: {
    type: 'string',
    default: '',
    title: 'Todoist API token',
    description:
      'Create a personal token at Todoist -> Settings -> Integrations -> Developer.',
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

let preferencesTab: any = null;

export function activate() {
  // Button in the thread list toolbar (works with the selected thread(s)).
  ComponentRegistry.register(TodoistThreadButton, {
    role: 'ThreadActionsToolbarButton',
  });

  preferencesTab = new PreferencesUIStore.TabItem({
    tabId: 'Todoist',
    displayName: localized('Todoist'),
    componentClassFn: () => require('./preferences-tab').default,
  });
  PreferencesUIStore.registerPreferencesTab(preferencesTab);
}

export function deactivate() {
  ComponentRegistry.unregister(TodoistThreadButton);

  if (preferencesTab) {
    PreferencesUIStore.unregisterPreferencesTab(preferencesTab.tabId);
    preferencesTab = null;
  }
}

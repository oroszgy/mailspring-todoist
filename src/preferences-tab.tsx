import { React, localized } from 'mailspring-exports';

import { getSettings, setSetting, Settings } from './store';
import * as Todoist from './todoist-client';

interface TodoistPreferencesState {
  settings: Settings;
  projects: Todoist.TodoistProject[];
  testing: boolean;
  status: string;
  error: string;
}

/**
 * Preferences pane: token, defaults and a connection test.
 */
export default class TodoistPreferences extends React.Component<any, TodoistPreferencesState> {
  static displayName = 'TodoistPreferences';
  static containerRequired = false;

  state: TodoistPreferencesState = {
    settings: getSettings(),
    projects: [],
    testing: false,
    status: '',
    error: '',
  };

  _update = (key: keyof Settings, value: any) => {
    setSetting(key, value);
    this.setState({ settings: getSettings() });
  };

  _onTest = () => {
    const { apiToken } = this.state.settings;
    this.setState({ testing: true, status: '', error: '' });

    Todoist.getProjects(apiToken)
      .then((projects) =>
        this.setState({
          projects,
          testing: false,
          status: `Connected - ${projects.length} project(s) available.`,
        })
      )
      .catch((err) => this.setState({ testing: false, error: err.message }));
  };

  render() {
    const { settings, projects, testing, status, error } = this.state;

    return (
      <div className="todoist-preferences">
        <p className="todoist-preferences-intro">
          {localized(
            'Create Todoist tasks straight from Mailspring. Get a personal API token from Todoist -> Settings -> Integrations -> Developer.'
          )}
        </p>

        <label className="todoist-field">
          <span>{localized('API token')}</span>
          <input
            type="password"
            value={settings.apiToken}
            placeholder="0123456789abcdef..."
            onChange={(e: any) => this._update('apiToken', e.target.value)}
          />
        </label>

        <label className="todoist-field">
          <span>{localized('Default project')}</span>
          <select
            value={settings.defaultProjectId}
            onChange={(e: any) => this._update('defaultProjectId', e.target.value)}
          >
            <option value="">{localized('Inbox (no project)')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="todoist-field">
          <span>{localized('Default due date')}</span>
          <input
            type="text"
            value={settings.defaultDueString}
            placeholder="tomorrow / 2026-12-31 (optional)"
            onChange={(e: any) => this._update('defaultDueString', e.target.value)}
          />
        </label>

        <label className="todoist-field todoist-field-checkbox">
          <input
            type="checkbox"
            checked={settings.includeSnippet}
            onChange={(e: any) => this._update('includeSnippet', e.target.checked)}
          />
          <span>{localized('Include an email preview in the task notes')}</span>
        </label>

        <label className="todoist-field todoist-field-checkbox">
          <input
            type="checkbox"
            checked={settings.includeLink}
            onChange={(e: any) => this._update('includeLink', e.target.checked)}
          />
          <span>{localized('Include a Mailspring link in the task notes')}</span>
        </label>

        <div className="todoist-preferences-actions">
          <button className="btn" disabled={testing} onClick={this._onTest}>
            {testing ? localized('Testing...') : localized('Test connection')}
          </button>
          {status ? <span className="todoist-preferences-status">{status}</span> : null}
          {error ? <span className="todoist-preferences-error">{error}</span> : null}
        </div>
      </div>
    );
  }
}

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

  componentDidMount() {
    const { apiToken } = getSettings();
    if (!apiToken) return;

    // A token is already configured, so the projects can be fetched straight
    // away rather than waiting for the connection test.
    this._loadProjects(apiToken);
  }

  _loadProjects = (apiToken: string) => {
    this.setState({ testing: true, status: '', error: '' });

    Todoist.getProjects(apiToken)
      .then((projects) =>
        this.setState({
          projects,
          testing: false,
          status: localized('Connected - %@ project(s) available.', projects.length),
        })
      )
      .catch((err) => this.setState({ testing: false, error: err.message }));
  };

  _update = (key: keyof Settings, value: any) => {
    setSetting(key, value);
    this.setState({ settings: getSettings() });
  };

  _onTest = () => {
    const { apiToken } = this.state.settings;
    if (!apiToken) {
      this.setState({ error: localized('Add a Todoist API token first.') });
      return;
    }
    this._loadProjects(apiToken);
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

        <div className="todoist-field">
          <label htmlFor="todoist-prefs-token">{localized('API token')}</label>
          <input
            id="todoist-prefs-token"
            type="password"
            value={settings.apiToken}
            placeholder="0123456789abcdef..."
            onChange={(e: any) => this._update('apiToken', e.target.value)}
          />
        </div>

        <div className="todoist-field">
          <label htmlFor="todoist-prefs-project">{localized('Default project')}</label>
          <select
            id="todoist-prefs-project"
            value={settings.defaultProjectId}
            onChange={(e: any) => this._update('defaultProjectId', e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="todoist-field">
          <label htmlFor="todoist-prefs-due">{localized('Default due date')}</label>
          <input
            id="todoist-prefs-due"
            type="text"
            value={settings.defaultDueString}
            placeholder="tomorrow / 2026-12-31 (optional)"
            onChange={(e: any) => this._update('defaultDueString', e.target.value)}
          />
        </div>

        <div className="todoist-field todoist-field-checkbox">
          <input
            id="todoist-prefs-snippet"
            type="checkbox"
            checked={settings.includeSnippet}
            onChange={(e: any) => this._update('includeSnippet', e.target.checked)}
          />
          <label htmlFor="todoist-prefs-snippet">
            {localized('Include an email preview in the task notes')}
          </label>
        </div>

        <div className="todoist-field todoist-field-checkbox">
          <input
            id="todoist-prefs-link"
            type="checkbox"
            checked={settings.includeLink}
            onChange={(e: any) => this._update('includeLink', e.target.checked)}
          />
          <label htmlFor="todoist-prefs-link">
            {localized('Include a Mailspring link in the task notes')}
          </label>
        </div>

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

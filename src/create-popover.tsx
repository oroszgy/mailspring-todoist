import { React, Actions, localized } from 'mailspring-exports';

import { getSettings } from './store';
import * as Todoist from './todoist-client';
import { TaskDraft } from './task-builder';

interface CreateTaskPopoverProps {
  draft: TaskDraft;
  needsToken?: boolean;
}

interface CreateTaskPopoverState {
  content: string;
  description: string;
  projectId: string;
  dueDate: string;
  projects: Todoist.TodoistProject[];
  loadingProjects: boolean;
  saving: boolean;
  error: string | null;
  done: boolean;
}

function isoDate(offsetDays: number): string {
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
export default class CreateTaskPopover extends React.Component<
  CreateTaskPopoverProps,
  CreateTaskPopoverState
> {
  static displayName = 'CreateTaskPopover';
  static containerRequired = false;

  state: CreateTaskPopoverState = {
    content: this.props.draft.content,
    description: this.props.draft.description,
    projectId: getSettings().defaultProjectId,
    dueDate: '',
    projects: [],
    loadingProjects: false,
    saving: false,
    error: null,
    done: false,
  };

  componentDidMount() {
    const { apiToken } = getSettings();
    if (!apiToken) return;

    this.setState({ loadingProjects: true });
    Todoist.getProjects(apiToken)
      .then((projects) => this.setState({ projects, loadingProjects: false, error: null }))
      .catch((err) => this.setState({ loadingProjects: false, error: err.message }));
  }

  _onCreate = () => {
    const { apiToken } = getSettings();
    if (!apiToken) {
      this.setState({ error: localized('Add your Todoist API token under Preferences first.') });
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
        window.setTimeout(() => Actions.closePopover(), 800);
      })
      .catch((err) => this.setState({ saving: false, error: err.message }));
  };

  render() {
    const s = this.state;

    return (
      <div className="todoist-create-popover">
        <div className="todoist-popover-title">{localized('Create Todoist task')}</div>

        {this.props.needsToken ? (
          <div className="todoist-popover-warning">
            {localized('Add your Todoist API token under Preferences -> Todoist first.')}
          </div>
        ) : null}

        {s.done ? (
          <div className="todoist-popover-done">{localized('Task created.')}</div>
        ) : (
          <div className="todoist-popover-form">
            <label className="todoist-field">
              <span>{localized('Title')}</span>
              <input
                type="text"
                value={s.content}
                onChange={(e: any) => this.setState({ content: e.target.value })}
              />
            </label>

            <label className="todoist-field">
              <span>{localized('Notes')}</span>
              <textarea
                rows={3}
                value={s.description}
                onChange={(e: any) => this.setState({ description: e.target.value })}
              />
            </label>

            <label className="todoist-field">
              <span>{localized('Project')}</span>
              <select
                value={s.projectId}
                onChange={(e: any) => this.setState({ projectId: e.target.value })}
              >
                <option value="">{localized('Inbox')}</option>
                {s.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="todoist-field">
              <span>{localized('Due date')}</span>
              <input
                type="date"
                value={s.dueDate}
                onChange={(e: any) => this.setState({ dueDate: e.target.value })}
              />
            </label>

            <div className="todoist-due-presets">
              <button onClick={() => this.setState({ dueDate: isoDate(0) })}>
                {localized('Today')}
              </button>
              <button onClick={() => this.setState({ dueDate: isoDate(1) })}>
                {localized('Tomorrow')}
              </button>
              <button onClick={() => this.setState({ dueDate: isoDate(7) })}>
                {localized('Next week')}
              </button>
            </div>

            {s.error ? <div className="todoist-popover-error">{s.error}</div> : null}

            <div className="todoist-popover-actions">
              <button className="btn" onClick={() => Actions.closePopover()}>
                {localized('Cancel')}
              </button>
              <button className="btn btn-emphasis" disabled={s.saving} onClick={this._onCreate}>
                {s.saving ? localized('Creating...') : localized('Create task')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

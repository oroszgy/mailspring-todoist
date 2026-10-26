import { React, Actions, localized } from 'mailspring-exports';
import { RetinaImg } from 'mailspring-component-kit';

import { getSettings } from './store';
import * as Todoist from './todoist-client';
import { notifyTaskCreated } from './task-notice';
import { TaskDraft } from './task-builder';
import { dueFields, isIsoDate, isoDate } from './due-date';
import { TODOIST_ICON } from './todoist-icon';

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

/**
 * The shared "create a task" form, opened from the thread toolbar button.
 *
 * TODO:
 *  - sections and labels pickers
 *  - remember the last-used project
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
    // A default due date that is a plain date prefills the date field; a
    // natural-language one is sent to Todoist as it is.
    dueDate: isIsoDate(getSettings().defaultDueString)
      ? getSettings().defaultDueString!.trim()
      : '',
    projects: [],
    loadingProjects: false,
    saving: false,
    error: null,
    done: false,
  };

  _unmounted = false;
  _closeTimeout: number | null = null;

  componentWillUnmount() {
    this._unmounted = true;
    if (this._closeTimeout !== null) {
      window.clearTimeout(this._closeTimeout);
      this._closeTimeout = null;
    }
  }

  componentDidMount() {
    const { apiToken } = getSettings();
    if (!apiToken) return;

    this.setState({ loadingProjects: true });
    Todoist.getProjects(apiToken)
      .then((projects) => {
        // The Inbox is a project like any other - it is what a task lands in
        // when no project is chosen, so it is selected by default rather than
        // being offered as a separate "no project" option.
        const inbox = projects.find((p) => p.inbox_project);
        const projectId = this.state.projectId || (inbox && inbox.id) || '';
        this.setState({ projects, projectId, loadingProjects: false, error: null });
      })
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
      // Exactly one of due_date / due_string - Todoist rejects both.
      ...dueFields(this.state.dueDate, getSettings().defaultDueString),
    })
      .then((task) => {
        // The popover can be dismissed while the request is in flight (a
        // click outside closes it), but the task still exists. Raise the
        // notice even then, so the user learns that it succeeded.
        notifyTaskCreated(task.content, Todoist.taskUrl(task.id));

        if (this._unmounted) return;
        this.setState({ saving: false, done: true });
        this._closeTimeout = window.setTimeout(() => {
          this._closeTimeout = null;
          Actions.closePopover();
        }, 800);
      })
      .catch((err) => {
        if (this._unmounted) return;
        this.setState({ saving: false, error: err.message });
      });
  };

  render() {
    const s = this.state;

    return (
      <div className="todoist-create-popover">
        <div className="todoist-popover-header">
          <RetinaImg
            url={TODOIST_ICON}
            mode={RetinaImg.Mode.ContentPreserve}
            className="todoist-popover-icon"
          />
          <span className="todoist-popover-title">{localized('Create Todoist task')}</span>
        </div>

        {this.props.needsToken ? (
          <div className="todoist-popover-warning">
            {localized('Add your Todoist API token under Preferences -> Todoist first.')}
          </div>
        ) : null}

        {s.done ? (
          <div className="todoist-popover-done">
            <span aria-hidden="true">✓</span>
            <span>{localized('Task created.')}</span>
          </div>
        ) : (
          <div className="todoist-popover-form">
            <div className="todoist-field">
              <label htmlFor="todoist-task-title">{localized('Title')}</label>
              <input
                id="todoist-task-title"
                type="text"
                value={s.content}
                onChange={(e: any) => this.setState({ content: e.target.value })}
              />
            </div>

            <div className="todoist-field">
              <label htmlFor="todoist-task-project">{localized('Project')}</label>
              <select
                id="todoist-task-project"
                value={s.projectId}
                disabled={s.loadingProjects}
                onChange={(e: any) => this.setState({ projectId: e.target.value })}
              >
                {s.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="todoist-field">
              <label htmlFor="todoist-task-due">{localized('Due date')}</label>
              <input
                id="todoist-task-due"
                type="date"
                value={s.dueDate}
                onChange={(e: any) => this.setState({ dueDate: e.target.value })}
              />
              <div className="todoist-due-presets">
                <button className="btn btn-small" onClick={() => this.setState({ dueDate: isoDate(0) })}>
                  {localized('Today')}
                </button>
                <button className="btn btn-small" onClick={() => this.setState({ dueDate: isoDate(1) })}>
                  {localized('Tomorrow')}
                </button>
                <button className="btn btn-small" onClick={() => this.setState({ dueDate: isoDate(7) })}>
                  {localized('Next week')}
                </button>
              </div>
            </div>

            <div className="todoist-field">
              <label htmlFor="todoist-task-notes">{localized('Notes')}</label>
              <textarea
                id="todoist-task-notes"
                rows={2}
                value={s.description}
                onChange={(e: any) => this.setState({ description: e.target.value })}
              />
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

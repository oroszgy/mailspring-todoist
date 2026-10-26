import { React, localized } from 'mailspring-exports';

import { TaskNotice, dismissNotice, getNotice, subscribeToNotice } from './task-notice';

/** How long the confirmation stays without the pointer on it. */
const DISPLAY_MS = 8000;

interface TaskCreatedToastState {
  notice: TaskNotice | null;
}

/**
 * The confirmation shown at the bottom of the main window after a task is
 * created.
 *
 * It is registered on `WorkspaceStore.Sheet.Global.Footer`, the same place
 * Mailspring mounts its own undo toast, so it survives the create-popover
 * closing and can carry a link to the new task.
 */
export default class TaskCreatedToast extends React.Component<any, TaskCreatedToastState> {
  static displayName = 'TodoistTaskCreatedToast';
  static containerRequired = false;

  state: TaskCreatedToastState = { notice: getNotice() };

  _unsubscribe: (() => void) | null = null;
  _timeout: number | null = null;
  _hovered = false;

  componentDidMount() {
    this._unsubscribe = subscribeToNotice((notice) => {
      this.setState({ notice }, this._scheduleDismiss);
    });
    this._scheduleDismiss();
  }

  componentWillUnmount() {
    this._clearTimeout();
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  _clearTimeout() {
    if (this._timeout !== null) {
      window.clearTimeout(this._timeout);
      this._timeout = null;
    }
  }

  /** (Re)start the auto-dismiss timer for the notice on screen. */
  _scheduleDismiss = () => {
    this._clearTimeout();

    const { notice } = this.state;
    if (!notice || this._hovered) return;

    // The id guards against a timer from an older notice hiding a newer one.
    const id = notice.id;
    this._timeout = window.setTimeout(() => dismissNotice(id), DISPLAY_MS);
  };

  _onMouseEnter = () => {
    this._hovered = true;
    this._clearTimeout();
  };

  _onMouseLeave = () => {
    this._hovered = false;
    this._scheduleDismiss();
  };

  _onDismiss = () => {
    const { notice } = this.state;
    if (notice) dismissNotice(notice.id);
  };

  render() {
    const { notice } = this.state;

    return (
      <div className="todoist-task-toast-region" role="status" aria-live="polite">
        {notice ? (
          <div
            className="todoist-task-toast"
            onMouseEnter={this._onMouseEnter}
            onMouseLeave={this._onMouseLeave}
          >
            <span className="todoist-task-toast-check" aria-hidden="true">
              ✓
            </span>
            <span className="todoist-task-toast-message">
              {localized('Task created')}
              {notice.title ? (
                <span className="todoist-task-toast-title"> — {notice.title}</span>
              ) : null}
            </span>
            <a className="todoist-task-toast-action" href={notice.url} onClick={this._onDismiss}>
              {localized('Open in Todoist')}
            </a>
            <button
              className="todoist-task-toast-close"
              type="button"
              title={localized('Dismiss')}
              aria-label={localized('Dismiss')}
              onClick={this._onDismiss}
            >
              ×
            </button>
          </div>
        ) : null}
      </div>
    );
  }
}

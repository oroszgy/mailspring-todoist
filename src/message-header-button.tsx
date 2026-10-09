import { React, Actions } from 'mailspring-exports';

import CreateTaskPopover from './create-popover';
import { draftFromMessage } from './task-builder';
import { hasToken } from './store';

/**
 * Button injected into the header of an open message.
 *
 * Receives the focused message as `props.message`.
 */
export default class TodoistMessageButton extends React.Component<any, any> {
  static displayName = 'TodoistMessageButton';
  static containerRequired = false;

  _onClick = (event: any) => {
    event.stopPropagation();

    const { message } = this.props;
    if (!message) return;

    const originRect = event.currentTarget.getBoundingClientRect();
    const draft = draftFromMessage(message);

    Actions.openPopover(
      React.createElement(CreateTaskPopover, { draft, needsToken: !hasToken() }),
      { originRect, direction: 'down' }
    );
  };

  render() {
    return (
      <button
        className="btn todoist-message-header-button"
        title="Create Todoist task"
        aria-label="Create Todoist task"
        onClick={this._onClick}
      >
        + Todoist
      </button>
    );
  }
}

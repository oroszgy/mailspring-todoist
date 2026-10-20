import { React, Actions } from 'mailspring-exports';
import { RetinaImg } from 'mailspring-component-kit';

import CreateTaskPopover from './create-popover';
import { draftFromThread } from './task-builder';
import { hasToken } from './store';
import { TODOIST_ICON } from './todoist-icon';

/**
 * Button in the thread list toolbar.
 *
 * Receives the selected threads as `props.items` (and the raw selection as
 * `props.selection`).
 */
export default class TodoistThreadButton extends React.Component<any, any> {
  static displayName = 'TodoistThreadButton';
  static containerRequired = false;

  _onClick = (event: any) => {
    event.stopPropagation();

    const items = this.props.items || [];
    if (items.length === 0) return;

    const originRect = event.currentTarget.getBoundingClientRect();

    // TODO: multi-select. For now the popover is built from the first thread;
    // when `items.length > 1`, create one task per thread.
    const draft = draftFromThread(items[0]);

    Actions.openPopover(
      React.createElement(CreateTaskPopover, { draft, needsToken: !hasToken() }),
      { originRect, direction: 'down' }
    );
  };

  render() {
    return React.createElement(
      'button',
      {
        tabIndex: -1,
        className: 'btn btn-toolbar todoist-thread-toolbar-button',
        title: 'Create Todoist task',
        'aria-label': 'Create Todoist task',
        onClick: this._onClick,
      },
      React.createElement(RetinaImg, {
        url: TODOIST_ICON,
        mode: RetinaImg.Mode.ContentPreserve,
        'aria-hidden': 'true',
      })
    );
  }
}

import { React, Actions } from 'mailspring-exports';
import { RetinaImg } from 'mailspring-component-kit';

import CreateTaskPopover from './create-popover';
import { draftFromThread } from './task-builder';
import { hasToken } from './store';

// Mask-mode SVG tinted with the toolbar's icon colour. 16x16 matches the
// built-in thread toolbar icons.
const CHECK_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">' +
      '<path d="M2 2h12v12H2V2zm1.5 1.5v9h9v-9h-9z"/>' +
      '<path d="M7 10.6 4.2 7.8l1.06-1.06L7 8.48l3.74-3.74L11.8 5.8z"/>' +
      '</svg>'
  );

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
        className: 'btn btn-toolbar',
        title: 'Create Todoist task',
        'aria-label': 'Create Todoist task',
        onClick: this._onClick,
      },
      React.createElement(RetinaImg, {
        url: CHECK_ICON,
        mode: RetinaImg.Mode.ContentIsMask,
        'aria-hidden': 'true',
      })
    );
  }
}

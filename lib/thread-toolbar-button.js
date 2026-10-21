"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
const create_popover_1 = __importDefault(require("./create-popover"));
const task_builder_1 = require("./task-builder");
const sender_1 = require("./sender");
const store_1 = require("./store");
const todoist_icon_1 = require("./todoist-icon");
/**
 * Button in the thread list toolbar.
 *
 * Receives the selected threads as `props.items` (and the raw selection as
 * `props.selection`).
 */
class TodoistThreadButton extends mailspring_exports_1.React.Component {
    constructor() {
        super(...arguments);
        this._onClick = async (event) => {
            event.stopPropagation();
            const items = this.props.items || [];
            if (items.length === 0)
                return;
            // Read the rect before awaiting anything: React pools the event, so
            // `event.currentTarget` is gone once the handler returns.
            const originRect = event.currentTarget.getBoundingClientRect();
            // TODO: multi-select. For now the popover is built from the first thread;
            // when `items.length > 1`, create one task per thread.
            const thread = items[0];
            // Who wrote last - a local lookup, capped so it cannot delay the popover.
            const sender = await (0, sender_1.senderForThread)(thread);
            const draft = (0, task_builder_1.draftFromThread)(thread, sender);
            mailspring_exports_1.Actions.openPopover(mailspring_exports_1.React.createElement(create_popover_1.default, { draft, needsToken: !(0, store_1.hasToken)() }), { originRect, direction: 'down' });
        };
    }
    render() {
        return mailspring_exports_1.React.createElement('button', {
            tabIndex: -1,
            className: 'btn btn-toolbar todoist-thread-toolbar-button',
            title: 'Create Todoist task',
            'aria-label': 'Create Todoist task',
            onClick: this._onClick,
        }, mailspring_exports_1.React.createElement(mailspring_component_kit_1.RetinaImg, {
            url: todoist_icon_1.TODOIST_ICON,
            mode: mailspring_component_kit_1.RetinaImg.Mode.ContentPreserve,
            'aria-hidden': 'true',
        }));
    }
}
TodoistThreadButton.displayName = 'TodoistThreadButton';
TodoistThreadButton.containerRequired = false;
exports.default = TodoistThreadButton;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkLXRvb2xiYXItYnV0dG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RocmVhZC10b29sYmFyLWJ1dHRvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBb0Q7QUFDcEQsdUVBQXFEO0FBRXJELHNFQUFpRDtBQUNqRCxpREFBaUQ7QUFDakQscUNBQTJDO0FBQzNDLG1DQUFtQztBQUNuQyxpREFBOEM7QUFFOUM7Ozs7O0dBS0c7QUFDSCxNQUFxQixtQkFBb0IsU0FBUSwwQkFBSyxDQUFDLFNBQW1CO0lBQTFFOztRQUlFLGFBQVEsR0FBRyxLQUFLLEVBQUUsS0FBVSxFQUFFLEVBQUU7WUFDOUIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXhCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBRS9CLG9FQUFvRTtZQUNwRSwwREFBMEQ7WUFDMUQsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRS9ELDBFQUEwRTtZQUMxRSx1REFBdUQ7WUFDdkQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhCLDBFQUEwRTtZQUMxRSxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsd0JBQWUsRUFBQyxNQUFNLENBQUMsQ0FBQztZQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFBLDhCQUFlLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRTlDLDRCQUFPLENBQUMsV0FBVyxDQUNqQiwwQkFBSyxDQUFDLGFBQWEsQ0FBQyx3QkFBaUIsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxJQUFBLGdCQUFRLEdBQUUsRUFBRSxDQUFDLEVBQzFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FDbEMsQ0FBQztRQUNKLENBQUMsQ0FBQztJQW1CSixDQUFDO0lBakJDLE1BQU07UUFDSixPQUFPLDBCQUFLLENBQUMsYUFBYSxDQUN4QixRQUFRLEVBQ1I7WUFDRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ1osU0FBUyxFQUFFLCtDQUErQztZQUMxRCxLQUFLLEVBQUUscUJBQXFCO1lBQzVCLFlBQVksRUFBRSxxQkFBcUI7WUFDbkMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3ZCLEVBQ0QsMEJBQUssQ0FBQyxhQUFhLENBQUMsb0NBQVMsRUFBRTtZQUM3QixHQUFHLEVBQUUsMkJBQVk7WUFDakIsSUFBSSxFQUFFLG9DQUFTLENBQUMsSUFBSSxDQUFDLGVBQWU7WUFDcEMsYUFBYSxFQUFFLE1BQU07U0FDdEIsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDOztBQTNDTSwrQkFBVyxHQUFHLHFCQUFxQixBQUF4QixDQUF5QjtBQUNwQyxxQ0FBaUIsR0FBRyxLQUFLLEFBQVIsQ0FBUztrQkFGZCxtQkFBbUIifQ==
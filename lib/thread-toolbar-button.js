"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
const create_popover_1 = __importDefault(require("./create-popover"));
const task_builder_1 = require("./task-builder");
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
        this._onClick = (event) => {
            event.stopPropagation();
            const items = this.props.items || [];
            if (items.length === 0)
                return;
            const originRect = event.currentTarget.getBoundingClientRect();
            // TODO: multi-select. For now the popover is built from the first thread;
            // when `items.length > 1`, create one task per thread.
            const draft = (0, task_builder_1.draftFromThread)(items[0]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkLXRvb2xiYXItYnV0dG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RocmVhZC10b29sYmFyLWJ1dHRvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBb0Q7QUFDcEQsdUVBQXFEO0FBRXJELHNFQUFpRDtBQUNqRCxpREFBaUQ7QUFDakQsbUNBQW1DO0FBQ25DLGlEQUE4QztBQUU5Qzs7Ozs7R0FLRztBQUNILE1BQXFCLG1CQUFvQixTQUFRLDBCQUFLLENBQUMsU0FBbUI7SUFBMUU7O1FBSUUsYUFBUSxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7WUFDeEIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXhCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNyQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRSxPQUFPO1lBRS9CLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUUvRCwwRUFBMEU7WUFDMUUsdURBQXVEO1lBQ3ZELE1BQU0sS0FBSyxHQUFHLElBQUEsOEJBQWUsRUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4Qyw0QkFBTyxDQUFDLFdBQVcsQ0FDakIsMEJBQUssQ0FBQyxhQUFhLENBQUMsd0JBQWlCLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUMsSUFBQSxnQkFBUSxHQUFFLEVBQUUsQ0FBQyxFQUMxRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQ2xDLENBQUM7UUFDSixDQUFDLENBQUM7SUFtQkosQ0FBQztJQWpCQyxNQUFNO1FBQ0osT0FBTywwQkFBSyxDQUFDLGFBQWEsQ0FDeEIsUUFBUSxFQUNSO1lBQ0UsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNaLFNBQVMsRUFBRSwrQ0FBK0M7WUFDMUQsS0FBSyxFQUFFLHFCQUFxQjtZQUM1QixZQUFZLEVBQUUscUJBQXFCO1lBQ25DLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUTtTQUN2QixFQUNELDBCQUFLLENBQUMsYUFBYSxDQUFDLG9DQUFTLEVBQUU7WUFDN0IsR0FBRyxFQUFFLDJCQUFZO1lBQ2pCLElBQUksRUFBRSxvQ0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlO1lBQ3BDLGFBQWEsRUFBRSxNQUFNO1NBQ3RCLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQzs7QUFyQ00sK0JBQVcsR0FBRyxxQkFBcUIsQUFBeEIsQ0FBeUI7QUFDcEMscUNBQWlCLEdBQUcsS0FBSyxBQUFSLENBQVM7a0JBRmQsbUJBQW1CIn0=
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
// Mask-mode SVG tinted with the toolbar's icon colour. 16x16 matches the
// built-in thread toolbar icons.
const CHECK_ICON = 'data:image/svg+xml,' +
    encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">' +
        '<path d="M2 2h12v12H2V2zm1.5 1.5v9h9v-9h-9z"/>' +
        '<path d="M7 10.6 4.2 7.8l1.06-1.06L7 8.48l3.74-3.74L11.8 5.8z"/>' +
        '</svg>');
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
            className: 'btn btn-toolbar',
            title: 'Create Todoist task',
            'aria-label': 'Create Todoist task',
            onClick: this._onClick,
        }, mailspring_exports_1.React.createElement(mailspring_component_kit_1.RetinaImg, {
            url: CHECK_ICON,
            mode: mailspring_component_kit_1.RetinaImg.Mode.ContentIsMask,
            'aria-hidden': 'true',
        }));
    }
}
TodoistThreadButton.displayName = 'TodoistThreadButton';
TodoistThreadButton.containerRequired = false;
exports.default = TodoistThreadButton;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWFkLXRvb2xiYXItYnV0dG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RocmVhZC10b29sYmFyLWJ1dHRvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBb0Q7QUFDcEQsdUVBQXFEO0FBRXJELHNFQUFpRDtBQUNqRCxpREFBaUQ7QUFDakQsbUNBQW1DO0FBRW5DLHlFQUF5RTtBQUN6RSxpQ0FBaUM7QUFDakMsTUFBTSxVQUFVLEdBQ2QscUJBQXFCO0lBQ3JCLGtCQUFrQixDQUNoQixxRkFBcUY7UUFDbkYsZ0RBQWdEO1FBQ2hELGtFQUFrRTtRQUNsRSxRQUFRLENBQ1gsQ0FBQztBQUVKOzs7OztHQUtHO0FBQ0gsTUFBcUIsbUJBQW9CLFNBQVEsMEJBQUssQ0FBQyxTQUFtQjtJQUExRTs7UUFJRSxhQUFRLEdBQUcsQ0FBQyxLQUFVLEVBQUUsRUFBRTtZQUN4QixLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFeEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ3JDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLE9BQU87WUFFL0IsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRS9ELDBFQUEwRTtZQUMxRSx1REFBdUQ7WUFDdkQsTUFBTSxLQUFLLEdBQUcsSUFBQSw4QkFBZSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhDLDRCQUFPLENBQUMsV0FBVyxDQUNqQiwwQkFBSyxDQUFDLGFBQWEsQ0FBQyx3QkFBaUIsRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQyxJQUFBLGdCQUFRLEdBQUUsRUFBRSxDQUFDLEVBQzFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FDbEMsQ0FBQztRQUNKLENBQUMsQ0FBQztJQW1CSixDQUFDO0lBakJDLE1BQU07UUFDSixPQUFPLDBCQUFLLENBQUMsYUFBYSxDQUN4QixRQUFRLEVBQ1I7WUFDRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ1osU0FBUyxFQUFFLGlCQUFpQjtZQUM1QixLQUFLLEVBQUUscUJBQXFCO1lBQzVCLFlBQVksRUFBRSxxQkFBcUI7WUFDbkMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3ZCLEVBQ0QsMEJBQUssQ0FBQyxhQUFhLENBQUMsb0NBQVMsRUFBRTtZQUM3QixHQUFHLEVBQUUsVUFBVTtZQUNmLElBQUksRUFBRSxvQ0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhO1lBQ2xDLGFBQWEsRUFBRSxNQUFNO1NBQ3RCLENBQUMsQ0FDSCxDQUFDO0lBQ0osQ0FBQzs7QUFyQ00sK0JBQVcsR0FBRyxxQkFBcUIsQUFBeEIsQ0FBeUI7QUFDcEMscUNBQWlCLEdBQUcsS0FBSyxBQUFSLENBQVM7a0JBRmQsbUJBQW1CIn0=
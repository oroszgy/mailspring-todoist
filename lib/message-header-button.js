"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const create_popover_1 = __importDefault(require("./create-popover"));
const task_builder_1 = require("./task-builder");
const store_1 = require("./store");
/**
 * Button injected into the header of an open message.
 *
 * Receives the focused message as `props.message`.
 */
class TodoistMessageButton extends mailspring_exports_1.React.Component {
    constructor() {
        super(...arguments);
        this._onClick = (event) => {
            event.stopPropagation();
            const { message } = this.props;
            if (!message)
                return;
            const originRect = event.currentTarget.getBoundingClientRect();
            const draft = (0, task_builder_1.draftFromMessage)(message);
            mailspring_exports_1.Actions.openPopover(mailspring_exports_1.React.createElement(create_popover_1.default, { draft, needsToken: !(0, store_1.hasToken)() }), { originRect, direction: 'down' });
        };
    }
    render() {
        return (mailspring_exports_1.React.createElement("button", { className: "btn todoist-message-header-button", title: "Create Todoist task", "aria-label": "Create Todoist task", onClick: this._onClick }, "+ Todoist"));
    }
}
TodoistMessageButton.displayName = 'TodoistMessageButton';
TodoistMessageButton.containerRequired = false;
exports.default = TodoistMessageButton;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS1oZWFkZXItYnV0dG9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21lc3NhZ2UtaGVhZGVyLWJ1dHRvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBb0Q7QUFFcEQsc0VBQWlEO0FBQ2pELGlEQUFrRDtBQUNsRCxtQ0FBbUM7QUFFbkM7Ozs7R0FJRztBQUNILE1BQXFCLG9CQUFxQixTQUFRLDBCQUFLLENBQUMsU0FBbUI7SUFBM0U7O1FBSUUsYUFBUSxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUU7WUFDeEIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXhCLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPO2dCQUFFLE9BQU87WUFFckIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQy9ELE1BQU0sS0FBSyxHQUFHLElBQUEsK0JBQWdCLEVBQUMsT0FBTyxDQUFDLENBQUM7WUFFeEMsNEJBQU8sQ0FBQyxXQUFXLENBQ2pCLDBCQUFLLENBQUMsYUFBYSxDQUFDLHdCQUFpQixFQUFFLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDLElBQUEsZ0JBQVEsR0FBRSxFQUFFLENBQUMsRUFDMUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUNsQyxDQUFDO1FBQ0osQ0FBQyxDQUFDO0lBY0osQ0FBQztJQVpDLE1BQU07UUFDSixPQUFPLENBQ0wscURBQ0UsU0FBUyxFQUFDLG1DQUFtQyxFQUM3QyxLQUFLLEVBQUMscUJBQXFCLGdCQUNoQixxQkFBcUIsRUFDaEMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLGdCQUdmLENBQ1YsQ0FBQztJQUNKLENBQUM7O0FBN0JNLGdDQUFXLEdBQUcsc0JBQXNCLEFBQXpCLENBQTBCO0FBQ3JDLHNDQUFpQixHQUFHLEtBQUssQUFBUixDQUFTO2tCQUZkLG9CQUFvQiJ9
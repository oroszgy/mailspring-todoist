"use strict";
/**
 * Thin settings layer over Mailspring's Config store.
 *
 * Keys are namespaced with the package name (`mailspring-todoist`) and declared
 * as a schema in `main.ts`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettings = getSettings;
exports.setSetting = setSetting;
exports.hasToken = hasToken;
const PREFIX = 'mailspring-todoist';
function getSettings() {
    return {
        apiToken: AppEnv.config.get(`${PREFIX}.apiToken`) || '',
        defaultProjectId: AppEnv.config.get(`${PREFIX}.defaultProjectId`) || '',
        defaultDueString: AppEnv.config.get(`${PREFIX}.defaultDueString`) || '',
        includeSnippet: AppEnv.config.get(`${PREFIX}.includeSnippet`) !== false,
        includeLink: AppEnv.config.get(`${PREFIX}.includeLink`) !== false,
    };
}
function setSetting(key, value) {
    AppEnv.config.set(`${PREFIX}.${key}`, value);
}
function hasToken() {
    return getSettings().apiToken.length > 0;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOztBQVlILGtDQVFDO0FBRUQsZ0NBRUM7QUFFRCw0QkFFQztBQTFCRCxNQUFNLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQztBQVVwQyxTQUFnQixXQUFXO0lBQ3pCLE9BQU87UUFDTCxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLFdBQVcsQ0FBQyxJQUFJLEVBQUU7UUFDdkQsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLG1CQUFtQixDQUFDLElBQUksRUFBRTtRQUN2RSxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sbUJBQW1CLENBQUMsSUFBSSxFQUFFO1FBQ3ZFLGNBQWMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0saUJBQWlCLENBQUMsS0FBSyxLQUFLO1FBQ3ZFLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sY0FBYyxDQUFDLEtBQUssS0FBSztLQUNsRSxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxHQUFtQixFQUFFLEtBQVU7SUFDeEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLElBQUksR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVELFNBQWdCLFFBQVE7SUFDdEIsT0FBTyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMzQyxDQUFDIn0=
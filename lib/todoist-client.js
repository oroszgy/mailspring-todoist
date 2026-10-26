"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoistError = void 0;
exports.getProjects = getProjects;
exports.createTask = createTask;
exports.taskUrl = taskUrl;
exports.testConnection = testConnection;
const https = __importStar(require("https"));
/**
 * Minimal Todoist API v1 client.
 *
 * The plugin talks to Todoist directly with Node's `https` module so there are
 * no runtime dependencies to bundle and no CORS concerns.
 *
 * Docs: https://developer.todoist.com/api/v1/
 * Note: the older REST v2 and Sync v9 APIs are decommissioned (HTTP 410).
 */
const API_HOST = 'api.todoist.com';
const API_BASE = '/api/v1';
class TodoistError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'TodoistError';
        this.status = status;
    }
}
exports.TodoistError = TodoistError;
function extractError(body) {
    try {
        const parsed = JSON.parse(body);
        return parsed.error || parsed.message || null;
    }
    catch (err) {
        return null;
    }
}
function request(token, method, path, body) {
    return new Promise((resolve, reject) => {
        if (!token) {
            reject(new TodoistError('No Todoist API token configured.', 401));
            return;
        }
        const payload = body ? JSON.stringify(body) : null;
        const headers = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        };
        if (payload) {
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(payload);
        }
        const req = https.request({ host: API_HOST, path: `${API_BASE}${path}`, method, headers }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                const status = res.statusCode || 0;
                if (status >= 200 && status < 300) {
                    try {
                        resolve(data ? JSON.parse(data) : {});
                    }
                    catch (err) {
                        reject(new TodoistError('Todoist returned invalid JSON.', status));
                    }
                }
                else {
                    reject(new TodoistError(extractError(data) || `Todoist request failed (${status})`, status));
                }
            });
        });
        req.on('error', (err) => reject(err));
        if (payload)
            req.write(payload);
        req.end();
    });
}
/**
 * Fetch every project. The v1 API is cursor-paginated:
 * `{ results: [...], next_cursor: string | null }`.
 */
async function getProjects(token) {
    const projects = [];
    let cursor = null;
    do {
        const query = `/projects?limit=200${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
        const page = await request(token, 'GET', query);
        projects.push(...(page.results || []));
        cursor = page.next_cursor || null;
    } while (cursor);
    return projects;
}
function createTask(token, input) {
    return request(token, 'POST', '/tasks', input);
}
/**
 * The web address of a task.
 *
 * API v1 dropped the `url` field from the task object, so the link is built
 * from the id instead: https://app.todoist.com/app/task/<id>.
 */
function taskUrl(id) {
    return `https://app.todoist.com/app/task/${encodeURIComponent(id)}`;
}
async function testConnection(token) {
    await request(token, 'GET', '/projects?limit=1');
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kb2lzdC1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdG9kb2lzdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0hBLGtDQWdCQztBQUVELGdDQUVDO0FBUUQsMEJBRUM7QUFFRCx3Q0FHQztBQXJKRCw2Q0FBK0I7QUFFL0I7Ozs7Ozs7O0dBUUc7QUFFSCxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQztBQUNuQyxNQUFNLFFBQVEsR0FBRyxTQUFTLENBQUM7QUErQjNCLE1BQWEsWUFBYSxTQUFRLEtBQUs7SUFHckMsWUFBWSxPQUFlLEVBQUUsTUFBYztRQUN6QyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLGNBQWMsQ0FBQztRQUMzQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0NBQ0Y7QUFSRCxvQ0FRQztBQUVELFNBQVMsWUFBWSxDQUFDLElBQVk7SUFDaEMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoQyxPQUFPLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7SUFDaEQsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxPQUFPLENBQUksS0FBYSxFQUFFLE1BQWMsRUFBRSxJQUFZLEVBQUUsSUFBYTtJQUM1RSxPQUFPLElBQUksT0FBTyxDQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3hDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNYLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbkQsTUFBTSxPQUFPLEdBQW9DO1lBQy9DLGFBQWEsRUFBRSxVQUFVLEtBQUssRUFBRTtZQUNoQyxNQUFNLEVBQUUsa0JBQWtCO1NBQzNCLENBQUM7UUFDRixJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1osT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLGtCQUFrQixDQUFDO1lBQzdDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUVELE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQ3ZCLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxRQUFRLEdBQUcsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUMvRCxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ04sSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1lBQ2QsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDdkIsSUFBSSxJQUFJLEtBQUssQ0FBQztZQUNoQixDQUFDLENBQUMsQ0FBQztZQUNILEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDakIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLElBQUksTUFBTSxJQUFJLEdBQUcsSUFBSSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7b0JBQ2xDLElBQUksQ0FBQzt3QkFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBTyxDQUFDLENBQUMsQ0FBRSxFQUFRLENBQUMsQ0FBQztvQkFDdEQsQ0FBQztvQkFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO3dCQUNiLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxnQ0FBZ0MsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNyRSxDQUFDO2dCQUNILENBQUM7cUJBQU0sQ0FBQztvQkFDTixNQUFNLENBQ0osSUFBSSxZQUFZLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLDJCQUEyQixNQUFNLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FDckYsQ0FBQztnQkFDSixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQ0YsQ0FBQztRQUVGLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QyxJQUFJLE9BQU87WUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNaLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7R0FHRztBQUNJLEtBQUssVUFBVSxXQUFXLENBQUMsS0FBYTtJQUM3QyxNQUFNLFFBQVEsR0FBcUIsRUFBRSxDQUFDO0lBQ3RDLElBQUksTUFBTSxHQUFrQixJQUFJLENBQUM7SUFFakMsR0FBRyxDQUFDO1FBQ0YsTUFBTSxLQUFLLEdBQUcsc0JBQXNCLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUM1RixNQUFNLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FDeEIsS0FBSyxFQUNMLEtBQUssRUFDTCxLQUFLLENBQ04sQ0FBQztRQUNGLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2QyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUM7SUFDcEMsQ0FBQyxRQUFRLE1BQU0sRUFBRTtJQUVqQixPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLEtBQWEsRUFBRSxLQUFzQjtJQUM5RCxPQUFPLE9BQU8sQ0FBYyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM5RCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixPQUFPLENBQUMsRUFBVTtJQUNoQyxPQUFPLG9DQUFvQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3RFLENBQUM7QUFFTSxLQUFLLFVBQVUsY0FBYyxDQUFDLEtBQWE7SUFDaEQsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2pELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyJ9
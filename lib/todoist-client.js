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
async function testConnection(token) {
    await request(token, 'GET', '/projects?limit=1');
    return true;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kb2lzdC1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdG9kb2lzdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUhBLGtDQWdCQztBQUVELGdDQUVDO0FBRUQsd0NBR0M7QUE1SUQsNkNBQStCO0FBRS9COzs7Ozs7OztHQVFHO0FBRUgsTUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUM7QUFDbkMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDO0FBZ0MzQixNQUFhLFlBQWEsU0FBUSxLQUFLO0lBR3JDLFlBQVksT0FBZSxFQUFFLE1BQWM7UUFDekMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxjQUFjLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztDQUNGO0FBUkQsb0NBUUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFZO0lBQ2hDLElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsT0FBTyxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDO0lBQ2hELENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFJLEtBQWEsRUFBRSxNQUFjLEVBQUUsSUFBWSxFQUFFLElBQWE7SUFDNUUsT0FBTyxJQUFJLE9BQU8sQ0FBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN4QyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDWCxNQUFNLENBQUMsSUFBSSxZQUFZLENBQUMsa0NBQWtDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FB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
import * as https from 'https';

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

export interface TodoistProject {
  id: string;
  name: string;
  /** v1 spells it `inbox_project`; the old `is_inbox_project` is a v2 name. */
  inbox_project?: boolean;
  parent_id?: string | null;
}

export interface TodoistTask {
  id: string;
  content: string;
  description: string;
  project_id: string;
  due?: any;
  url?: string;
}

export interface CreateTaskInput {
  content: string;
  description?: string;
  project_id?: string;
  section_id?: string;
  labels?: string[];
  priority?: number;
  /** ISO date, e.g. 2026-10-09 */
  due_date?: string;
  /** Natural language, e.g. "tomorrow at 9am" */
  due_string?: string;
}

export class TodoistError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'TodoistError';
    this.status = status;
  }
}

function extractError(body: string): string | null {
  try {
    const parsed = JSON.parse(body);
    return parsed.error || parsed.message || null;
  } catch (err) {
    return null;
  }
}

function request<T>(token: string, method: string, path: string, body?: object): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (!token) {
      reject(new TodoistError('No Todoist API token configured.', 401));
      return;
    }

    const payload = body ? JSON.stringify(body) : null;
    const headers: Record<string, string | number> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    };
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(
      { host: API_HOST, path: `${API_BASE}${path}`, method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          const status = res.statusCode || 0;
          if (status >= 200 && status < 300) {
            try {
              resolve(data ? (JSON.parse(data) as T) : ({} as T));
            } catch (err) {
              reject(new TodoistError('Todoist returned invalid JSON.', status));
            }
          } else {
            reject(
              new TodoistError(extractError(data) || `Todoist request failed (${status})`, status)
            );
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

/**
 * Fetch every project. The v1 API is cursor-paginated:
 * `{ results: [...], next_cursor: string | null }`.
 */
export async function getProjects(token: string): Promise<TodoistProject[]> {
  const projects: TodoistProject[] = [];
  let cursor: string | null = null;

  do {
    const query = `/projects?limit=200${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const page = await request<{ results: TodoistProject[]; next_cursor: string | null }>(
      token,
      'GET',
      query
    );
    projects.push(...(page.results || []));
    cursor = page.next_cursor || null;
  } while (cursor);

  return projects;
}

export function createTask(token: string, input: CreateTaskInput): Promise<TodoistTask> {
  return request<TodoistTask>(token, 'POST', '/tasks', input);
}

export async function testConnection(token: string): Promise<boolean> {
  await request(token, 'GET', '/projects?limit=1');
  return true;
}

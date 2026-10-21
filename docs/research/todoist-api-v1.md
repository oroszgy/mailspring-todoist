# What the Todoist API v1 actually offers

Verified against Todoist's own primary sources on **2026-10-20**.

The authoritative source used throughout is Todoist's published OpenAPI
specification, served from Todoist's own developer domain:

- `https://developer.todoist.com/openapi.json` — the live spec (OpenAPI 3.1.0,
  `info.version: "1"`, `servers: [{ url: "https://api.todoist.com/" }]`),
  78 paths, 175 schemas. This is the same document that renders the docs at
  `https://developer.todoist.com/api/v1/`.
- `https://developer.todoist.com/` — developer home (auth + first-call example).
- `https://groups.google.com/a/doist.com/g/todoist-api` — Todoist's official API
  mailing list (launch + shutdown announcements).
- `https://github.com/Doist/todoist-api-python`,
  `https://github.com/Doist/todoist-sdk-typescript`,
  `https://github.com/Doist/todoist-cli` — Todoist's own first-party SDKs/CLI.

Everything below is written as a contract to implement against. Claims are
sourced inline as `source → path`. "Live probe" means a `curl` issued from this
machine on 2026-10-20; the exact command is quoted.

---

## 1. The contract

### 1.1 Base URL and auth

| Fact | Value | Source |
| --- | --- | --- |
| Base URL | `https://api.todoist.com/api/v1` | `developer.todoist.com` → "Make your first call" → `curl "https://api.todoist.com/api/v1/tasks"`; spec `servers[0].url = "https://api.todoist.com/"` + all paths prefixed `/api/v1/...` |
| Auth header | `Authorization: Bearer <token>` | spec → tag `Authorization`: "you must provide an authorization header with the appropriate `Bearer $token`" |
| Personal token | `Settings → Integrations → Developer` in the Todoist app | `developer.todoist.com` → "Grab your API token from Todoist under Settings → Integrations → Developer"; spec → tag `Authorization`: "you can obtain your personal API token from the [integrations settings](https://app.todoist.com/app/settings/integrations)" |
| Official first-call example | `curl "https://api.todoist.com/api/v1/tasks" -H "Authorization: Bearer $TODOIST_API_TOKEN" -H "Content-Type: application/json" -d '{"content": "Ship the integration", "due_string": "tomorrow"}'` | `developer.todoist.com` (home page, verbatim) |
| Recommendation | "Building for other people? Use OAuth authorization instead of a personal token." | `developer.todoist.com` (home page, verbatim) |
| OAuth scopes | `task:add`, `data:read`, `data:read_write` (includes the other two), `data:delete`, `project:delete`, `backups:read` | spec → tag `Authorization` → "Permission scopes" table |
| OAuth flow | `GET https://app.todoist.com/oauth/authorize?client_id=…&scope=…&state=…&response_type=code` → `POST https://api.todoist.com/oauth/access_token` | spec → tag `Authorization` → "Step 1/Step 3" |
| Token response | `{ access_token, token_type: "Bearer", expires_in, refresh_token?, scope }` | spec → tag `Authorization` → "Step 3: Token exchange" |
| Refresh tokens | On by default for apps created after they shipped; access tokens then live 1 h. Legacy apps keep long-lived tokens (`expires_in: 315360000`) and get no `refresh_token`. | spec → tag `Authorization` → "Refreshing access tokens" |
| CORS | All non-OAuth endpoints send `Access-Control-Allow-Origin` echoing `Origin`, on errors too | spec → tag `Authorization` → "Cross Origin Resource Sharing" |
| OAuth discovery | `GET https://api.todoist.com/.well-known/oauth-protected-resource` → `{"authorization_servers":["https://api.todoist.com"],"bearer_methods_supported":["header"],"resource":"https://api.todoist.com","scopes_supported":["task:add","data:read","data:read_write","data:delete","project:delete","dev:app_console","backups:read","billing:read","billing:read_write","user:read","user:write","workspaces:read","workspaces:write"]}` | live probe, 2026-10-20 (RFC 9728 protected-resource metadata; also referenced by the `WWW-Authenticate` challenge) |
| Personal token → OAuth | `POST /api/v1/access_tokens/migrate_personal_token` — "Migrating your users' personal tokens will allow users to see your app in their Todoist Settings page and give them the ability to manage their app authorization." | spec → `paths./api/v1/access_tokens/migrate_personal_token.post` |

`bearer_methods_supported: ["header"]` is the machine-readable confirmation that
`Authorization: Bearer <token>` is the only supported way to present a token.

**Plugin implication:** `API_HOST = 'api.todoist.com'` + `API_BASE = '/api/v1'` +
`Authorization: Bearer ${token}` is **correct as written**. No change needed.

### 1.2 Which APIs exist today

| Surface | URL | Status (probed 2026-10-20) | Source |
| --- | --- | --- | --- |
| Todoist API v1 (unified REST + Sync) | `https://api.todoist.com/api/v1/...` | **Live.** `GET /api/v1/projects` → `HTTP/2 401` with a JSON body (auth required) | live probe; spec |
| Sync endpoint (still part of v1) | `POST https://api.todoist.com/api/v1/sync` | Live; `form-urlencoded`, returns JSON. Still uses legacy `items`/`notes`/`notifications` naming. Not one of the 78 paths in the spec — it is only described in prose. | spec → tag `Sync`; tag `Migrating from v9` → "`/sync` endpoint changes" |
| REST API v2 | `https://api.todoist.com/rest/v2/...` | **Dead: `HTTP/2 410 Gone`**, `content-type: text/plain` | live probe (see §3) |
| Sync API v9 | `https://api.todoist.com/sync/v9/sync` and `https://api.todoist.com/api/v9/sync` | **Dead: `HTTP/2 410 Gone`** | live probe (see §3) |
| Old v2/v9 **documentation** URLs | `developer.todoist.com/sync/v9`, `developer.todoist.com/rest/v2` | **Now redirect to `developer.todoist.com/api/v1/`** (2 hops) — the v1 spec's claim that "The documentation for the Sync API v9 and REST API v2 are still available for reference" is **stale**. | live probe, 2026-10-20 (`curl -L` → final URL `https://developer.todoist.com/api/v1/`) |

Timeline, from Todoist's own announcements:

- **2025-04-05 — API v1.0 launch.** "After many months of development and
  incorporating your feedback, we've just launched Todoist API v1.0. This is a
  major milestone for our platform, as we've merged the Sync and REST APIs…"
  — <https://groups.google.com/a/doist.com/g/todoist-api/c/LKz0K5TRQ9Q>
- **2025-08-13 — "Deprecated URLs / old IDs".** "we have recently unified our
  APIs into the new Todoist API v1. The previous APIs will continue to function
  throughout the remainder of this year, 2025… …this is scheduled to be switched
  off in early 2026."
  — <https://groups.google.com/a/doist.com/g/todoist-api/c/AoABOb6sV8Y>
- **2025-12-04 — final shutdown notice.** "…we will be shutting down the
  previous APIs on **February 10, 2026**. If you have not yet migrated to the
  latest API version, we urge you to do so as soon as possible…". Brownouts:
  10:00 and 18:00 UTC on 2026-01-07 (1 h), 2026-01-21 (2 h), 2026-02-04 (4 h).
  — <https://groups.google.com/a/doist.com/g/todoist-api/c/brwENjfT_tk>
- **2026-01-05 — status page.** "Brief scheduled maintance for legacy API
  endpoints … please use the api.todoist.com API endpoints going forward."
  — <https://status.todoist.net/history/4>
- The v1 spec itself: "The Todoist API v1 is a new API that unifies the Sync
  API v9 and the REST API v2." — spec → tag `Migrating from v9`.

Note on "410": **no Todoist document states the HTTP status code.** The only
first-party statement of the shutdown is the 2025-12-04 mailing-list post
(shutdown date 2026-02-10). The `410` + "This endpoint is deprecated." body is
observed runtime behaviour, not a documented contract. The README's "HTTP 410"
claim is nonetheless accurate against today's API.

**Plugin implication:** the README's claim that "REST v2 and Sync v9 APIs are
decommissioned (HTTP 410)" is **correct and now verifiable** — see §3.

### 1.3 `POST /api/v1/tasks` — create a task

Request: `POST https://api.todoist.com/api/v1/tasks`
Content-Type: `application/json`, body = object, **only `content` is required**
(spec → `paths./api/v1/tasks.post.requestBody` → `Body_37565102.required = ["content"]`).

| Field | Writable | Type | Required | Notes (verbatim from spec) |
| --- | --- | --- | --- | --- |
| `content` | yes | `string`, `minLength: 1` | **yes** | "Task content." |
| `description` | yes | `string \| null` | no | "Task description." |
| `project_id` | yes | `string \| null` | no | "ID of the project to add the task to. If omitted or null, the task will be added to the user's Inbox." |
| `section_id` | yes | `string \| null` | no | "ID of the section to add the task to" |
| `parent_id` | yes | `string \| null` | no | "ID of the parent task" |
| `order` | yes | `integer` (`-2147483648 … 2147483647`) | no | "Position of the task in the project or section" |
| `labels` | yes | `string[] \| null` | no | "**List of label names.**" (example `["errands","shopping"]`) — **names, not IDs** |
| `priority` | yes | `integer`, **1–4** | no | spec: "Task priority (1-4, where 1 is highest)" — **but see the contradiction in §1.4** |
| `assignee_id` | yes | `integer \| null` | no | "ID of the user to assign the task to." |
| `due_string` | yes | `string \| null` | no | "Human-readable representation of the due date." (example `"tomorrow at 12:00"`) |
| `due_date` | yes | `string \| null` | no | "Due date in RFC 3339 format or similar." (example `"2025-02-12"`) |
| `due_datetime` | yes | `string \| null` | no | "Due date and time." (example `"2025-02-12T12:00:00Z"`) |
| `due_lang` | yes | `string \| null` | no | "Due date language code." (example `"en"`) |
| `duration` | yes | `integer \| null` | no | "Task duration, as a positive whole number of minutes or days… **Only used if `duration_unit` is also provided.**" |
| `duration_unit` | yes | `"minute" \| "day" \| null` | no | "Unit of time for duration." |
| `deadline_date` | yes | `string \| null`, `format: date` | no | "Deadline date in YYYY-MM-DD format" |

Field-by-field verdicts for the ticket's list:

- `content` — **writable, required, string.**
- `description` — **writable, optional, string.**
- `project_id` — **writable, optional, string ID** (opaque, not numeric).
- `section_id` — **writable, optional, string ID.**
- `labels` — **writable, optional, array of label *names*.**
- `due_date` — **writable, optional, string**, e.g. `2025-02-12` (spec example) or a full RFC 3339 date-time.
- `due_string` — **writable, optional, string**, natural language.
- `due_datetime` — **writable, optional, string**, e.g. `2025-02-12T12:00:00Z`.
- `priority` — **writable, optional, integer 1–4.** Direction is ambiguous in the spec (§1.4).
- `parent_id` — **writable, optional, string ID.**
- `duration` — **writable but only effective with `duration_unit`**; integer minutes or days.

**Not writable on create (not present in the request body):** `due` (object
form), `deadline` (object form — only `deadline_date` is accepted), `id`,
`user_id`, `is_collapsed`, `checked`, `is_deleted`, `added_at`, `completed_at`,
`updated_at`, `child_order`, `order_key`, `note_count`, `day_order`,
`completed_count`, `postponed_count`, `added_by_uid`, `assigned_by_uid`,
`responsible_uid`. The request body schema defines **exactly 16 properties**
and does not set `additionalProperties: false` — so unknown fields are not
*explicitly* forbidden by the schema, but they are certainly not applied. Send
only the fields above.

**`section_id` alone is enough.** `project_id` is *not* required alongside it.
Evidence:

- The spec documents `section_id` and `project_id` as independent optional
  fields, with `project_id`'s "Inbox" fallback applying only "If omitted or
  null" — i.e. to the *project*, not to the section. The body schema has no
  `dependentRequired` / `allOf` / `oneOf` constraint tying them together.
- Three first-party clients send `section_id` without `project_id`:
  - Todoist's own **MCP server** (`Doist/todoist-mcp` → `src/tools/add-tasks.ts`)
    resolves the section→project mapping *for its own validation* and then
    sends `sectionId` with `projectId` left undefined ("Strip `inbox` — the
    API defaults to inbox when no projectId is provided").
  - Todoist's own **CLI** (`src/commands/task/add.ts`) →
    `if (isIdRef(options.section)) { args.sectionId = extractId(options.section) }`
    — the `--project` requirement there is a *name-resolution* rule, not an API
    rule ("Use `id:xxx` format to specify section by ID without a project.").
  - Todoist's own **TypeScript SDK** (`src/clients/task-client.ts` →
    `moveTask`) sends `{ section_id }` with no `project_id`.
- `POST /api/v1/tasks/{task_id}/move` accepts `project_id`, `section_id`,
  `parent_id` as independent, all-optional fields.
  (spec → `paths./api/v1/tasks/{task_id}/move.post`)

**Sending both is also fine** — Todoist's CLI sends `projectId` *and*
`sectionId` when the user names a section within a project.

**Response:** `HTTP 200` (not 201) with `application/json`, body = the full task
object (schema `ItemSyncView`). No envelope, no `id`-wrapper.

**`due_date` vs `due_datetime`:** send at most one. The first-party TypeScript
SDK models the create-task body as
`RequireOneOrNone<{ dueDate?: string; dueDatetime?: string }>` — i.e. exactly
one of the two may be present.
(source: <https://github.com/Doist/todoist-sdk-typescript> → `src/types/tasks/requests.ts`)

**`duration` needs `duration_unit`:** the same SDK models it as
`RequireAllOrNone<{ duration?: number; durationUnit?: 'minute'|'day' }>`, and
the spec text says "Only used if `duration_unit` is also provided."

**Note on `due` vs `due_date`/`due_string`:** the `POST /tasks` body takes the
*flat* fields (`due_string` / `due_date` / `due_datetime` / `due_lang`). The
nested `due` object form (`{"date": "...", "timezone": "..."}`) is the shape
documented in the "Due dates" guide and used by `/sync`, not by `POST /tasks` —
the body schema has no `due` property.

**Due-date formats** (spec → tag `Due dates`; the tag documents the `due`
*object*, the flat fields map onto it like this):

| Field | Format | Example |
| --- | --- | --- |
| `due_date` | `YYYY-MM-DD` (full-day, user's timezone) — "RFC 3339 format or similar" | `2025-02-12` |
| `due_datetime` | `YYYY-MM-DDTHH:MM:SS` (floating, no `Z`) or `YYYY-MM-DDTHH:MM:SSZ` (UTC / fixed) | `2025-02-12T12:00:00Z` |
| `due_string` | natural language, ≤ 150 characters | `tomorrow at 12:00` |
| `due_lang` | one of `en, da, pl, zh, ko, de, pt, ja, it, fr, sv, ru, es, nl, fi, nb, tw` | `en` |

The 150-character limit is enforced by Todoist's Python SDK
(`due_string: Annotated[str, MaxLen(150)]`) and matches the help centre
("Dates can go up to 150 characters long." —
<https://www.todoist.com/help/articles/introduction-to-due-dates-and-due-times-q7VobO>).
Label names are likewise capped at 100 characters each
(`labels: list[Annotated[str, MaxLen(100)]]`).

**Spec-vs-SDK mismatches worth coding defensively around** (both SDKs are
first-party, so the server probably accepts both, but the spec does not say so):

| Field | Spec | Python SDK | TypeScript SDK |
| --- | --- | --- | --- |
| `assignee_id` | `integer` | `str \| None` | `assigneeId?: string` |
| `deadline_lang` | absent | sent | absent |
| `auto_reminder`, `auto_parse_labels` | absent (they exist on the Quick Add body) | sent on `POST /tasks` | absent |

### 1.4 `priority`: which end is "highest"? (the spec contradicts itself)

The v1 spec contains two different statements:

- Request body: `"Task priority (1-4, where 1 is highest)"`, with
  `minimum: 1, maximum: 4`. (spec → `Body_37565102.properties.priority`)
- Response object `ItemSyncView.priority`: **"Task priority from 1 (normal) to
  4 (urgent)."** (spec → `components.schemas.ItemSyncView.properties.priority`)

The response wording matches every other Todoist first-party source, so the
request wording is a documentation bug:

- Todoist's own CLI: `/** CLI value → Todoist API priority (p1=urgent maps to
  API 4, p4=low maps to API 1) */ const PRIORITY_MAP = { p1: 4, p2: 3, p3: 2, p4: 1 }`
  — <https://github.com/Doist/todoist-cli> → `src/lib/task-list.ts`
- Todoist's own MCP server: `// Todoist API uses inverse mapping: p1=4
  (highest), p2=3, p3=2, p4=1 (lowest)` —
  <https://github.com/Doist/todoist-mcp> → `src/utils/priorities.ts`
- Todoist's Python SDK types the field as
  `priority: Annotated[int, Ge(1), Le(4)] | None` and documents it as
  "The priority of the task (4 for very urgent)." —
  <https://github.com/Doist/todoist-api-python> → `todoist_api_python/api.py`
- Todoist's URL-scheme guide: "The priority of the task (a number between `1`
  and `4`, `4` for very urgent and `1` for natural). **Note:** Keep in mind
  that `very urgent` is the priority 1 on clients. So, `p1` will return `4` in
  the API." — spec → tag `Url schemes`
- Todoist Help Center: "Priority levels are p1 through p4, with p1 being the
  highest priority" and the level table "🔴 1 Most important … ⚪ 4 Least
  important, not urgent" —
  <https://www.todoist.com/help/articles/set-a-priority-in-todoist-Wy82Jp>
- Todoist's own URL-scheme example uses `priority=4` for the urgent case:
  `todoist://addtask?content=mytask&date=tomorrow&priority=4` (spec → tag
  `Url schemes`).

**Working contract: API `priority` is 1–4 where `4` = most urgent (= app `p1`)
and `1` = no priority (= app `p4`).** A user-facing "p1" must be sent as
`priority: 4`. The valid range is 1–4 inclusive — `0` is not a valid value.
The plugin's `CreateTaskInput.priority?: number` carries no such convention
today and must add one before a priority picker ships.

### 1.5 `GET /api/v1/tasks` and the task object

`GET https://api.todoist.com/api/v1/tasks` — query params: `project_id`,
`section_id`, `parent_id`, `label` (by **name**), `ids` (comma-separated),
`cursor`, `limit`. Response: `{ "results": [Task], "next_cursor": string|null }`.
The v2-style `filter` and `lang` query parameters were **removed** — use
`GET /api/v1/tasks/filter?query=…` instead.

Task object (`ItemSyncView`), all fields and their types:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | yes | opaque string ID |
| `user_id` | `string` | yes | owner |
| `project_id` | `string` | yes | containing project |
| `section_id` | `string \| null` | yes | `null` when not in a section |
| `parent_id` | `string \| null` | yes | `null` for a top-level task |
| `added_by_uid` | `string \| null` | yes | creator |
| `assigned_by_uid` | `string \| null` | yes | `null` if unassigned |
| `responsible_uid` | `string \| null` | yes | `null` if unassigned |
| `labels` | `string[]` | yes | label **names** |
| `deadline` | `object \| null` | yes | `{ date, lang }` |
| `duration` | `object \| null` | yes | `{ amount, unit }` |
| `is_collapsed` | `boolean` | yes | |
| `checked` | `boolean` | yes | "Whether the task is completed." |
| `is_deleted` | `boolean` | yes | |
| `added_at` | `string(date-time) \| null` | yes | created |
| `completed_at` | `string(date-time) \| null` | yes | `null` if active |
| `completed_by_uid` | `string \| null` | yes | |
| `updated_at` | `string(date-time) \| null` | yes | |
| `due` | `object \| null` | yes | see below |
| `priority` | `integer` | yes | 1 = normal … 4 = urgent |
| `child_order` | `integer` | yes | position among siblings |
| `order_key` | `string \| null` | yes | fractional-indexing key |
| `content` | `string` | yes | |
| `description` | `string` | yes | |
| `note_count` | `integer` | yes | **deprecated**, always 0 |
| `day_order` | `integer` | yes | |
| `completed_count` | `integer` | yes | |
| `postponed_count` | `integer` | yes | |

`due` object fields (spec → tag `Due dates`): `date` (string), `timezone`
(string, `null` unless a fixed timezone was set), `string` (human-readable),
`lang`, `is_recurring` (boolean). Example from the spec:
`{"date":"2025-02-12","is_recurring":false,"lang":"en","string":"tomorrow"}`.

A **complete worked example** straight out of the spec
(`components.schemas.TasksCompletedDateResponse` → `properties.items.examples[0][0]`):

```json
{
  "added_at": "2025-01-15T10:30:00Z",
  "added_by_uid": "1234567",
  "assigned_by_uid": "1234567",
  "checked": false,
  "child_order": 1,
  "completed_at": "2025-01-16T10:30:00Z",
  "completed_by_uid": "1234567",
  "completed_count": 3,
  "content": "Buy milk",
  "day_order": 1,
  "deadline": { "date": "2025-02-12", "lang": "en" },
  "description": "Pick up organic milk",
  "due": { "date": "2025-02-12", "is_recurring": false, "lang": "en", "string": "tomorrow" },
  "duration": { "amount": 30, "unit": "minute" },
  "id": "6XGgmFVcrG5RRjVr",
  "is_collapsed": false,
  "is_deleted": false,
  "labels": ["priority"],
  "note_count": 0,
  "order_key": "a1V",
  "parent_id": "6XGgmFVcrG5RRjVr",
  "postponed_count": 1,
  "priority": 1,
  "project_id": "6XGgm6PHrGgMpCFX",
  "responsible_uid": "1234567",
  "section_id": "6fFPHV272WWh3gpW",
  "updated_at": "2025-01-17T10:30:00Z",
  "user_id": "1234567"
}
```

Note the shape of the IDs: opaque base32-ish strings (`6XGgm6PHrGgMpCFX`), and
the example in the spec for `section_id` is `6fFPHV272WWh3gpW` — the same
value the create-task body schema uses as its example.

**Renames vs REST v2 / Sync v9 that affect the plugin's types:**
`url` → **removed** (build it as `https://app.todoist.com/app/task/<id>`);
`is_completed` → `checked`; `created_at` → `added_at`; `creator_id` →
`added_by_uid`; `assignee_id` → `responsible_uid`; `assigner_id` →
`assigned_by_uid`; `order` → `child_order`; `comment_count` → `note_count`
(deprecated, always 0). Source: spec → tag `Migrating from v9` → "Task URLs",
"Object renames", "Other endpoints → `/tasks`".

### 1.6 `GET /api/v1/projects`

Query params: `folder_id`, `workspace_id`, `cursor`, `limit`
(`limit`: `integer`, `minimum 1` exclusive, **`maximum 200`**, `default 50`).

Response: `{ "results": [Project], "next_cursor": string|null }`
(schema `PaginatedList_AnyProjectSyncViewResponse_`).

Project object — `PersonalProjectSyncView` (a project is either a personal or a
workspace project; `AnyProjectSyncViewResponse = PersonalProjectSyncView |
WorkspaceProjectSyncView`):

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | yes | opaque string |
| `name` | `string` | yes | |
| `parent_id` | `string \| null` | yes | `null` for a root project |
| `inbox_project` | `boolean` | yes | **"Whether this project is the user's Inbox project."** |
| `is_favorite` | `boolean` | yes | |
| `is_archived` | `boolean` | yes | |
| `is_deleted` | `boolean` | yes | |
| `is_shared` | `boolean` | yes | |
| `is_frozen` | `boolean` | yes | |
| `is_collapsed` | `boolean` | yes | |
| `color` | `string` | yes | colour name |
| `icon` | `string \| null` | no | may be omitted |
| `description` | `string` | yes | |
| `view_style` | `string` | yes | `list` / `board` / `calendar` |
| `can_assign_tasks` | `boolean` | yes | |
| `can_comment` | `boolean` | yes | |
| `child_order` | `integer` | yes | |
| `order_key` | `string \| null` | yes | |
| `default_order` | `integer` | yes | |
| `default_order_key` | `string \| null` | yes | |
| `creator_uid` | `string \| null` | yes | |
| `created_at` | `string(date-time) \| null` | yes | |
| `updated_at` | `string(date-time) \| null` | yes | |
| `public_key` | `string` | yes | `""` when public access is off |
| `access` | `object \| null` | yes | `{ visibility, configuration }` |
| `role` | `string \| null` | yes | current user's role |

Workspace projects additionally carry `workspace_id`, `folder_id`,
`collaborator_role_default`, `is_invite_only`, `is_link_sharing_enabled`,
`status`.

**`is_team_project` does not exist in v1** (0 hits in the spec). A "team
project" in v1 is simply the `WorkspaceProjectSyncView` variant of the union.
Similarly, a project's v2 `order` field is now split into `child_order`
(integer) and `order_key` (fractional-indexing string).

**`is_inbox_project` does not exist in v1.** The field is `inbox_project`
(REST v2 called it `is_inbox_project`). The string `is_inbox_project` appears
**zero** times in the v1 spec. Todoist's own TypeScript SDK maps it as
`inboxProject` → `inbox_project`
(<https://github.com/Doist/todoist-sdk-typescript> → `src/types/projects/types.ts`).

The Inbox project appears in the project list — the v2 reference showed the
same ("An example projects response: [ { "id" : "220474322", "name" : "Inbox",
… "is_inbox_project" : true … } ]", <https://developer.todoist.com/rest/v2/>)
and v1 describes the endpoint as "Get all active user projects"; identify it
with `inbox_project === true`. `GET /api/v1/user` also exposes
`inbox_project_id`. (Not verifiable without a live token — see §5.)

`comment_count` was **removed** from project responses in v1. (spec → tag
`Migrating from v9` → "Other endpoints → `/projects`")

### 1.7 `GET /api/v1/sections`

**There is no `/api/v1/projects/{project_id}/sections` endpoint.** The spec's
78 paths contain exactly one sections collection: `/api/v1/sections`. A live
probe of `/api/v1/projects/{id}/sections` returns **404 `NOT_FOUND`** while
`/api/v1/projects/{id}` and `/api/v1/projects/{id}/collaborators` return 401 —
so the router distinguishes "no such route" from "auth required" on that
prefix, and the absence is conclusive.

Query params: `project_id` (string, optional), `workspace_id` (integer,
optional), `cursor`, `limit` (max 200, default 50), `public_key`.

- `project_id` — "String ID of the project to get sections from. **If omitted
  or null, get sections from all projects.**"
- `workspace_id` — "…If omitted or null, get sections from all projects. Ignored
  if `project_id` is also provided."

So the endpoint is **global**, with an optional client-side/server-side filter
by project. Each section carries its own `project_id`, so one call can populate
a section picker for every project.

Response: `{ "results": [Section], "next_cursor": string|null }`
(schema `PaginatedList_SectionSyncView_`).

Section object (`SectionSyncView`):

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | yes | |
| `user_id` | `string` | yes | owner |
| `project_id` | `string` | yes | containing project |
| `name` | `string` | yes | |
| `description` | `string \| null` | yes | |
| `section_order` | `integer` | yes | "Position of the section in the project." |
| `order_key` | `string \| null` | yes | fractional-indexing key |
| `is_collapsed` | `boolean` | yes | (renamed from `collapsed`) |
| `is_archived` | `boolean` | yes | |
| `is_deleted` | `boolean` | yes | |
| `added_at` | `string(date-time)` | yes | |
| `updated_at` | `string(date-time) \| null` | yes | |
| `archived_at` | `string(date-time) \| null` | yes | `null` if active |

The v1 section shape is the old **Sync** shape, not the REST v2 shape. (spec →
tag `Migrating from v9` → "Other endpoints → `/sections`": "The Todoist API v1
uses the format previously used by the Sync API everywhere.")

Todoist's own CLI calls `api.getSections({ projectId })` and destructures
`{ results: sections }` — confirming both the global-with-filter shape and the
`{ results }` envelope.
(<https://github.com/Doist/todoist-cli> → `src/lib/refs.ts`)

### 1.8 `GET /api/v1/labels`

Query params: `cursor`, `limit` (max 200, default 50). **No `project_id`** —
the label list is **global / personal** ("Get all user labels").

Related: `GET /api/v1/labels/search?query=` (paginated),
`GET /api/v1/labels/shared` (paginated).

Response: `{ "results": [Label], "next_cursor": string|null }`
(schema `PaginatedList_LabelRestView_`).

Label object (`LabelRestView`):

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | `string` | yes | |
| `name` | `string` | yes | |
| `color` | `string` | yes | colour name |
| `order` | `integer \| null` | yes | Position of the label in the label list, or `null` when no explicit order is set. (REST v2 called this `item_order`; note `item_order` and `is_deleted` exist **only** in webhook payloads, never in the REST label object.) |
| `is_favorite` | `boolean` | yes | |

Creating a task with labels takes **names**, so a label picker should offer
`label.name` values and send `labels: ["name1","name2"]`.

### 1.9 Pagination

- Response envelope: `{"results": [...], "next_cursor": string | null}`.
  `next_cursor` is `null` on the last page. (spec → tag `Pagination`; schema
  `PaginatedList_*` has `required: ["results","next_cursor"]`)
- Request params: `cursor` (opaque string, pattern
  `^[0-9a-zA-Z_-]+\.[0-9a-zA-Z_-]+$`) and `limit`.
- **`limit`: default 50, maximum 200.** "If you specify a limit greater than
  200, the API will return a validation error." (spec → tag `Pagination`;
  per-endpoint schema `{"type":"integer","maximum":200,"default":50}`)
- Cursors are user- and parameter-specific; pass them back verbatim, never
  decode or persist them. Always use the same filter parameters across pages.
- Invalid cursor → `400` `INVALID_ARGUMENT_VALUE` with
  `error_extra.argument = "cursor"`.
- Paginated v1 endpoints: `/api/v1/tasks`, `/api/v1/tasks/filter`,
  `/api/v1/labels`, `/api/v1/labels/shared`, `/api/v1/comments`,
  `/api/v1/sections`, `/api/v1/projects`, `/api/v1/projects/archived`,
  `/api/v1/projects/<project_id>/collaborators`, `/api/v1/activities`.
  (spec → tag `Migrating from v9` → "Pagination")
- **One exception to the envelope:** the completed-task endpoints
  (`/api/v1/tasks/completed/by_completion_date`, `/by_due_date`) return
  `{ "items": [...], "next_cursor": ... }` — `items`, not `results`
  (schema `TasksCompletedDateResponse`).

**Plugin implication:** `GET /projects?limit=200` + `cursor` loop is exactly
right. `limit=200` is the maximum and is accepted.

### 1.10 Errors

**Shape.** All v1 errors are `application/json` with this object
(spec → tag `Sync` → "The error object may contain the following fields"):

```json
{
  "error": "Task not found",
  "error_code": 478,
  "error_extra": { "event_id": "<hash>", "retry_after": 3 },
  "error_tag": "NOT_FOUND",
  "http_code": 404
}
```

| Field | Type | Meaning (spec wording) |
| --- | --- | --- |
| `error_tag` | `string` | "A machine-readable error identifier (e.g., `INVALID_ARGUMENT_VALUE`)." |
| `error_code` | `integer` | "A numeric error code." |
| `error` | `string` | "A human-readable error message." |
| `http_code` | `integer` | "The HTTP status code associated with this error. **This code may differ from the REST HTTP status for the same `error_tag`.**" |
| `error_extra` | `object` | "Additional context about the error. Contents vary by error type." |

Common `error_extra` fields: `argument` (string), `explanation` (string),
`retry_after` (integer, seconds to wait before retrying — "May be returned on
rate-limited requests **and other API errors, not just `429` responses**"),
`workspace_id` (integer), `max_count` (integer — "The limit that was exceeded"),
`event_id` (string — "An event ID for error tracking/support purposes"),
`project_id` (string), `section_id` (string), `bad_item` (object).

**Status codes** (spec → tag `Sync` → "Response status codes"):

| Code | Meaning |
| --- | --- |
| 200 | success |
| 400 | "The request was incorrect." |
| 401 | "Authentication is required, and has failed, or has not yet been provided." |
| 403 | "The request was valid, but for something that was forbidden." |
| 404 | "The requested resource could not be found." |
| 429 | "The user has sent too many requests in a given amount of time." |
| 500 | "The request failed due to a server error." |
| 503 | "The server is currently unable to handle the request." |

**Per-case catalogue (what to expect):**

| Case | HTTP | `error_tag` | `error_code` | Body |
| --- | --- | --- | --- | --- |
| Missing/invalid/expired token | **401** | `UNAUTHORIZED` | `477` | `{"error":"Unauthorized","error_code":477,"error_extra":{"event_id":"…","retry_after":1280},"error_tag":"UNAUTHORIZED","http_code":401}` — **live probe, 2026-10-20** |
| Invalid token on some auth-protected paths | 403 | `AUTH_INVALID_TOKEN` | `401` | `{"error":"Invalid token","error_code":401,"error_extra":{"access_type":"none","event_id":"…","retry_after":3},"error_tag":"AUTH_INVALID_TOKEN","http_code":403}` — **live probe** (`GET /api/v1/openapi.json`) |
| Expired OAuth token | 401 | `UNAUTHORIZED` | `477` | + headers `Retry-After: 3` and `WWW-Authenticate: Bearer error="invalid_token", error_description="Unauthorized", resource_metadata="https://api.todoist.com/.well-known/oauth-protected-resource"` (spec → tag `Authorization` → "Detecting an expired access token") |
| Missing required field | 400 | `ARGUMENT_MISSING` | `19` | `{"error":"Required argument is missing","error_code":19,"error_extra":{"argument":"content","event_id":"…","retry_after":3},"error_tag":"ARGUMENT_MISSING","http_code":400}` — **live probe**: `POST /api/v1/tasks` with body `{}` |
| Malformed request body | 400 | `BAD_REQUEST` | `42` | `{"error":"Bad Request","error_code":42,"error_extra":{"event_id":"…","retry_after":3},"error_tag":"BAD_REQUEST","http_code":400}` — **live probe**: `POST /api/v1/tasks` with body `{not json` |
| Validation error (bad limit, bad cursor) | 400 | `INVALID_ARGUMENT_VALUE` | `20` | `{"error":"Invalid argument value","error_code":20,"error_extra":{"argument":"limit","expected":"Input should be less than or equal to 200"},"error_tag":"INVALID_ARGUMENT_VALUE","http_code":400}` (spec → tag `Pagination`) |
| Missing query argument | 400 | `ARGUMENT_MISSING` | `19` | `{"error":"Required argument is missing","error_code":19,"error_extra":{"argument":"project_id","event_id":"…","retry_after":1280},"error_tag":"ARGUMENT_MISSING","http_code":400}` — **live probe** (`GET /api/v1/sections/archived`) |
| Not found | 404 | `NOT_FOUND` | `478` | `{"error":"Not found","error_code":478,"error_extra":{"event_id":"…","retry_after":1280},"error_tag":"NOT_FOUND","http_code":404}` — **live probe**; the docs' example is the same shape with `"error":"Task not found"` (spec → tag `Migrating from v9`) |
| Rate limit | 429 | (rate-limit tag) | (varies) | Same envelope; `error_extra.retry_after` gives the backoff seconds; `error_extra.max_count` "The limit that was exceeded". |
| Server error | 500 / 503 | (varies) | (varies) | Same envelope. |

**Order of validation (verified live):** the *required-field* check for
`POST /api/v1/tasks` runs **before** authentication — a bogus token plus `{}`
still yields `400 ARGUMENT_MISSING`, not 401. Every *other* field-level check
(`priority` out of range, `labels` sent as a string) runs **after** auth and
could not be exercised without a real token, so those constraints rest on the
spec alone.

**Do not expect a FastAPI-style body.** The spec defines `HTTPValidationError`
/ `ValidationError` (`detail` / `loc` / `msg` / `type`) in
`components.schemas`, but **no operation references them** — `/api/v1/*` uses
the five-field envelope above, never `{"detail": [...]}`.

**Declared status codes.** The spec's operations declare only `200` (107×),
`204` (1×), `400`, `401`, `403`, `404` (108× each) — **every one of the error
responses has no `content` block**, so the OpenAPI file contains no error body
model at all. `429`/`500`/`503` are documented only in the "Response status
codes" table, never declared on an operation.

**Rate-limit headers.** `Retry-After` is present on error responses (and
`error_extra.retry_after` carries the same value). **No `X-Rate-Limit-*`
headers were observed** — the first-party CLI logs those names defensively, but
the server does not send them. `Retry-After` **escalates with repeated
invalid-token attempts** from one IP (observed 3 → 9 → 64 → 130 → 257 → … →
1280 s) — treat it as server-supplied backoff, not as a rate-limit signal.

**Before v1**, the `/tasks`, `/comments`, `/sections`, `/projects`, `/labels`
endpoints returned `plain/text` errors (`Content-type: plain/text` /
`Task not found`). v1 unified all of them to the JSON envelope above. (spec →
tag `Migrating from v9` → "Previous REST API endpoints error responses")

**Retry semantics:** "Clients should treat this response as a signal to refresh
the access token and retry the original request with the new token. When
present, `retry_after` and the `Retry-After` header are backoff metadata; do
not wait and retry the same invalid or expired token." (spec → tag
`Authorization` → "Detecting an expired access token")

**Caveat for the plugin:** `http_code` in the body can differ from the HTTP
status line, and `error_code` is a *domain* code, not the HTTP code (the
plugin's `TodoistError.status` currently holds the HTTP status, which is fine
— but `error_code`/`error_tag` are currently thrown away).

### 1.11 Limits, rate limiting, idempotency

| Limit | Value | Source |
| --- | --- | --- |
| HTTP request body | 1 MiB | spec → tag `Request limits` |
| HTTP headers | 65 KiB total | spec → tag `Request limits` |
| Processing timeout | 15 s standard, 5 min uploads | spec → tag `Request limits` |
| Sync: partial sync requests | max **1000 per user per 15 min** | spec → tag `Request limits` |
| Sync: full sync requests | max **100 per user per 15 min** | spec → tag `Request limits` |
| Sync: commands per request | max **100** (batching counts as one request) | spec → tag `Request limits` |
| **REST v1 rate limit** | **Not published.** The spec's "Request limits" tag documents only payload/header/timeout and the two Sync quotas. The only rate-limit numbers stated anywhere are the Sync ones. No `X-Rate-Limit-*` header was ever observed — only `Retry-After`. | spec → tag `Request limits`; live probe |
| 429 | "The user has sent too many requests in a given amount of time." | spec → tag `Sync` → "Response status codes" |

**Idempotency:**

- **The v1 spec documents no REST idempotency key.** There is no
  `Idempotency-Key` header or parameter anywhere in `openapi.json` (the only
  "idempot" hits are the Sync command-UUID text). The v1 spec mentions
  `X-Request-Id` exactly once, inside a `curl` sample for
  `POST /api/v1/comments` — not as a documented feature.
- The header did exist in REST v2 ("POST requests may provide an additional
  `X-Request-Id` HTTP header containing a unique string to ensure modifications
  apply only once" — <https://developer.todoist.com/rest/v2/>, now redirected).
- Todoist's own Python SDK is ambiguous about it, in a way worth recording:
  - `3.0.0` (2025-04-11) changelog: "**Remove support for `X-Request-Id`
    header, unused on the API level**"
  - `3.1.0` (2025-05-07) changelog: "**Re-add support for `X-Request-ID`** —
    Configurable via `request_id_fn` API constructor argument — Defaults to
    random UUID v4"
  - Current source sends it on **every** request, GETs included:
    `todoist_api_python/_core/http_headers.py` → `X_REQUEST_ID = ("X-Request-Id", "%s")`.
- Todoist's TypeScript SDK is more careful: it sends `X-Request-Id` **only when
  the caller passes one**, and auto-generates a UUID for POSTs whose base URI
  is *not* the API base — with the comment "Sync api don't allow a request id
  in the CORS".
  (<https://github.com/Doist/todoist-sdk-typescript> → `src/transport/http-client.ts`)
- **Conclusion for the plugin: treat `POST /api/v1/tasks` as non-idempotent.**
  Do not blind-retry a failed create; disable the button while the request is in
  flight (the popover already does this via `saving`).
- The **Sync** endpoint *does* give you idempotency: "Command idempotency:
  Todoist will not execute a command that has same UUID as a previously executed
  command." (spec → tag `Sync` → "Batching commands") — i.e. a per-command
  `uuid` field, not a header.

**Retries:** the first-party TypeScript SDK retries **3 times on network
errors only** (`retryCondition: isNetworkError`) — it does *not* retry on HTTP
5xx or 429, and it never re-sends a POST whose response was an HTTP error.
Follow that model: retry on a socket-level failure, never on an HTTP error
response, and read `Retry-After` / `error_extra.retry_after` before retrying a
429.

**Timeouts:** the spec's "Request limits" tab says a standard request has a
15-second processing timeout. The first-party SDKs are more generous: the
Python SDK uses a 60 s read timeout ("aligns with Todoist's own internal
timeout") and the TypeScript SDK uses `timeout: 30000` (30 s). The plugin's
`request()` currently sets **no socket timeout at all** — a hung request would
wedge the popover indefinitely. Use 30–60 s.

### 1.12 Other things the v1 feature set touches

- **Quick add:** `POST /api/v1/tasks/quick` — body `{ text: string (required),
  note?, reminder?, auto_reminder?, meta? }`; `meta: true` returns a `meta`
  object with the parsed breakdown. The response schema is untyped in the spec
  (`additionalProperties: true`); Todoist's TypeScript SDK runs it through its
  task validator, so it is a Task. Syntax: `today`/`tomorrow at 5pm`,
  `#Project`, `/Section` (requires a project), `@label`, `p1`–`p4`/`!!1`–`!!4`,
  `+Assignee`, `{deadline}`, `!30m` reminders, `// description` (must be last).
  "If parsing fails for any element, the task is still created." (spec →
  `paths./api/v1/tasks/quick.post`)
  **There is no `POST /api/v1/tasks/parse`** — absent from the 78-path list and
  from both first-party SDKs.
- **Filter tasks:** `GET /api/v1/tasks/filter?query=…` (`query` required, plus
  `lang`, `cursor`, `limit`). The v2-style `filter`/`lang` query parameters
  were **removed** from `GET /api/v1/tasks` in favour of this endpoint.
  (spec → tag `Migrating from v9` → "Other endpoints → `/tasks`")
- **Completed tasks:** `GET /api/v1/tasks/completed/by_completion_date` and
  `/by_due_date`. These use an **`items`** array instead of `results` — the
  one place the pagination envelope differs.
- **Reminder:** `POST /api/v1/reminders` (separate endpoint; a task body has no
  reminder field).
- **Move task:** `POST /api/v1/tasks/{task_id}/move` with `project_id` /
  `section_id` / `parent_id` (all optional, independent).
- **Close / reopen:** `POST /api/v1/tasks/{task_id}/close` and `/reopen`.
- **Update task:** `POST /api/v1/tasks/{task_id}` — same field names as create,
  but every field optional ("Omit this field to keep it unchanged."), plus
  `due_string: "no date"` to clear a due date.
- **ID migration:** `GET /api/v1/id_mappings/{obj_name}/{obj_ids}` where
  `obj_name` ∈ `sections|tasks|comments|reminders|location_reminders|projects`;
  up to 100 comma-separated IDs; translates v1 IDs ↔ v2 IDs. Use this if the
  plugin caches IDs from before the v1 migration. (spec →
  `paths./api/v1/id_mappings/{obj_name}/{obj_ids}.get`)
- **Folders:** `GET /api/v1/folders?workspace_id=` — a v1 concept (workspace
  project ordering). Not needed for a personal-token plugin.
- **User:** `GET /api/v1/user` — OIDC userinfo; includes `inbox_project_id`,
  `tz_info`, `lang`, `is_premium`.
- **Task URL:** `https://app.todoist.com/app/task/<id>` (the `url` field was
  removed from the task object in v1). (spec → tag `Migrating from v9` →
  "Task URLs")
- **`todoist://addtask?content=…&date=…&priority=…`** — opens Todoist's add-task
  view; does **not** create the task.
- **Search endpoints** (all paginated, all take a required `query`):
  `GET /api/v1/projects/search?query=`, `GET /api/v1/sections/search?query=`
  (also accepts `project_id` / `workspace_id`), `GET /api/v1/labels/search?query=`.
  Handy for a type-ahead project/section/label picker instead of pulling the
  whole list.
- **Undocumented-but-live endpoints** (not in the spec's 78 paths, confirmed by
  live probe on 2026-10-20 — they route and return a structured error rather
  than 404):
  - `GET /api/v1/projects/{project_id}/full` → 401 `AUTH_INVALID_TOKEN`
  - `GET /api/v1/projects/archived/count` → 401 `AUTH_INVALID_TOKEN`
  - `GET /api/v1/sections/archived` → 400 `ARGUMENT_MISSING`
    (`error_extra.argument: "project_id"`)
  The v2 migration table mentions `/api/v1/projects/<project_id>/full` as the
  replacement for Sync v9's `projects/get_data`; the other two are not
  documented anywhere. **Do not build on undocumented endpoints.**

---

## 2. The plugin's four calls, exactly

Everything the current plugin needs, spelled out. All four are
`Authorization: Bearer <token>` + `application/json`.

| # | Call | Request | Response | Notes |
| --- | --- | --- | --- | --- |
| 1 | List projects | `GET /api/v1/projects?limit=200` (then `&cursor=<next_cursor>` while `next_cursor !== null`) | `{ results: Project[], next_cursor: string \| null }` | `Project.inbox_project` (not `is_inbox_project`) flags the Inbox. |
| 2 | List sections | `GET /api/v1/sections?limit=200` — **or** `GET /api/v1/sections?project_id=<id>&limit=200` for one project | `{ results: Section[], next_cursor: string \| null }` | Global endpoint; filter by `project_id` in the request or client-side. `Section.project_id` says which project it belongs to. There is **no** `/projects/{id}/sections`. |
| 3 | List labels | `GET /api/v1/labels?limit=200` | `{ results: Label[], next_cursor: string \| null }` | Global, personal labels. `Label.name` is what you send back in `labels`. |
| 4 | Create task | `POST /api/v1/tasks` with a JSON body | `200` + the task object (`ItemSyncView`) — no envelope | Only `content` is required. |

Minimal create body for the current popover:

```json
{
  "content": "Subject line",
  "description": "From: …\n\nPreview…",
  "project_id": "6XGgm6PHrGgMpCFX",
  "due_date": "2026-10-09"
}
```

With sections and labels (note: label **names**, and `section_id` is enough on
its own — you may send `project_id` too):

```json
{
  "content": "Subject line",
  "description": "…",
  "project_id": "6XGgm6PHrGgMpCFX",
  "section_id": "6fFPHV272WWh3gpW",
  "labels": ["errands", "shopping"],
  "priority": 4,
  "due_string": "tomorrow at 9am"
}
```

Caveats to encode in the client:
- `due_date` **or** `due_string` **or** `due_datetime` — pick one; don't send
  `due_date` and `due_datetime` together.
- `duration` without `duration_unit` is silently ignored.
- `priority` 4 = most urgent (app `p1`), 1 = none (app `p4`).
- `POST /tasks` is not idempotent — no blind retries.
- A 401 body is JSON: `{"error":"Unauthorized","error_code":477,…}`. Surface
  `error` (and `error_extra.argument` / `error_extra.retry_after` where
  present) in the popover.

---

## 3. Verification log (live probes, 2026-10-20)

All probes used `Authorization: Bearer 0000000000000000000000000000000000000000`
(an invalid token) or no auth header. No real credential was used.

```
$ curl -sS -i https://api.todoist.com/rest/v2/projects
HTTP/2 410
content-type: text/plain; charset=utf-8
content-length: 369

This endpoint is deprecated.

If you're reading this on a browser, there's a good chance you can change
the v9 part on the URL to v1 and get away with it. ;)

If you're using the API directly, please update your use case to rely
on the new API endpoints, available under /api/v1/ prefixes.

For more details, please see documentation at https://developer.todoist.com/
```

```
$ curl -sS -i https://api.todoist.com/rest/v2/tasks          -> HTTP/2 410, same body
$ curl -sS -i https://api.todoist.com/sync/v9/sync           -> HTTP/2 410, same body
$ curl -sS -i https://api.todoist.com/api/v9/sync            -> HTTP/2 410, same body
$ curl -sS -i https://api.todoist.com/rest/v2/projects/       -> HTTP/2 410, same body
```

```
$ curl -sS https://api.todoist.com/api/v1/projects -H "Authorization: Bearer 000…0"
{"error":"Unauthorized","error_code":477,"error_extra":{"event_id":"1f51907d46ed4176bbef49e5662ea15a","retry_after":1280},"error_tag":"UNAUTHORIZED","http_code":401}
```
(headers included `retry-after: 1280` and
`www-authenticate: Bearer error="invalid_token", error_description="Unauthorized", resource_metadata="https://api.todoist.com/.well-known/oauth-protected-resource"`)

```
$ curl -sS https://api.todoist.com/api/v1/projects                        # no auth header
{"error":"Unauthorized","error_code":477,"error_extra":{"event_id":"40631d0b30c24eba8c38c5c7bc2dfd14","retry_after":1280},"error_tag":"UNAUTHORIZED","http_code":401}

$ curl -sS -X POST https://api.todoist.com/api/v1/tasks -H "Content-Type: application/json" -d '{"content":"x"}'
{"error":"Unauthorized","error_code":477,"error_extra":{"event_id":"36b7a8c0d8494295a32dc97dd5d2eba0","retry_after":1280},"error_tag":"UNAUTHORIZED","http_code":401}
```

```
$ curl -sS -i https://api.todoist.com/api/v1/openapi.json
HTTP/2 403
content-type: application/json
{"error":"Invalid token","error_code":401,"error_extra":{"access_type":"none","event_id":"fd834800103c4daab5a939d39b600537","retry_after":3},"error_tag":"AUTH_INVALID_TOKEN","http_code":403}
```

```
$ curl -sS -o /dev/null -w "%{http_code}\n" https://developer.todoist.com/openapi.json
200   (application/json, 1 244 462 bytes — the spec this document is based on)

$ curl -sS -o /dev/null -w "%{http_code}\n" https://developer.todoist.com/api/v1/openapi.json
404   (the spec is not published under the API path — only at /openapi.json)
```

Version-prefix sweep (GET, no auth header, 2026-10-20T07:07:08Z) — for these
collection paths auth is checked before routing, so `401` means "path exists but
unauthenticated" and `404` means "no such path":

```
/api/v1/projects  401    /api/v8/projects   410    /sync/v8/sync      410
/api/v2/projects  401    /api/v9/projects   410    /sync/v9/sync      410
/api/v3/projects  401    /api/v10/projects  401    /rest/v1/projects  410
/rest/v2/projects 410    /rest/v3/projects  404    /v1/projects       404
```

Documentation redirects (2026-10-20):

```
$ curl -sS -o /dev/null -w "%{http_code} %{num_redirects} -> %{url_effective}\n" -L https://developer.todoist.com/sync/v9
200 2 -> https://developer.todoist.com/api/v1/
$ curl … -L https://developer.todoist.com/rest/v2
200 2 -> https://developer.todoist.com/api/v1/
$ curl … -L https://developer.todoist.com/guides/
200 1 -> https://developer.todoist.com/api/v1/
$ curl … https://developer.todoist.com/guides/authorization/
404
```

OAuth endpoints (2026-10-20):

```
GET https://app.todoist.com/oauth/authorize?client_id=x&scope=data:read&state=y&response_type=code  -> 400 (bad client_id)
GET https://todoist.com/oauth/authorize?...                                                              -> 400 (same)
GET https://api.todoist.com/oauth/access_token  -> 405 Method Not Allowed (POST only)
GET https://todoist.com/oauth/access_token      -> 405 Method Not Allowed (POST only)

GET https://api.todoist.com/.well-known/oauth-protected-resource -> 200
{"authorization_servers":["https://api.todoist.com"],
 "bearer_methods_supported":["header"],
 "resource":"https://api.todoist.com",
 "scopes_supported":["task:add","data:read","data:read_write","data:delete",
   "project:delete","dev:app_console","backups:read","billing:read",
   "billing:read_write","user:read","user:write","workspaces:read","workspaces:write"]}
```

`POST /api/v1/sync` with an invalid token returns a slightly different auth
error from the REST endpoints:

```
{"error":"Invalid token","error_code":401,
 "error_extra":{"access_type":"access_token","event_id":"…","retry_after":512},
 "error_tag":"AUTH_INVALID_TOKEN","http_code":401}
```

Route-existence sweep under `/api/v1/projects/…` (invalid token, 2026-10-20).
On this prefix the router answers **404 before** checking auth, so a 404 is
conclusive proof that the route does not exist:

```
GET /api/v1/projects/6XGgm6PHrGgMpCFX/sections      -> 404 {"error":"Not found","error_code":478,
                                                     "error_extra":{"event_id":"…","retry_after":1280},
                                                     "error_tag":"NOT_FOUND","http_code":404}
GET /api/v1/projects/6XGgm6PHrGgMpCFX/comments      -> 404 (same body)
GET /api/v1/projects/6XGgm6PHrGgMpCFX                -> 401 UNAUTHORIZED (route exists)
GET /api/v1/projects/6XGgm6PHrGgMpCFX/collaborators  -> 401 UNAUTHORIZED (route exists)
GET /api/v1/projects/6XGgm6PHrGgMpCFX/full           -> 401 AUTH_INVALID_TOKEN (route exists, undocumented)
GET /api/v1/projects/archived/count                  -> 401 AUTH_INVALID_TOKEN (route exists, undocumented)
GET /api/v1/sections/archived                        -> 400 {"error":"Required argument is missing",
                                                     "error_code":19,
                                                     "error_extra":{"argument":"project_id","event_id":"…","retry_after":1280},
                                                     "error_tag":"ARGUMENT_MISSING","http_code":400}
GET /api/v1/tasks/parse                              -> 401 UNAUTHORIZED (auth precedes routing here,
                                                     so absence of /tasks/parse is NOT live-provable)
GET /api/v1/tasks/quick                              -> 401 UNAUTHORIZED (route exists)
```

Request-body validation probes (invalid token, 2026-10-20):

```
POST /api/v1/tasks  body {}            -> 400 {"error":"Required argument is missing","error_code":19,
                                         "error_extra":{"argument":"content","event_id":"…","retry_after":3},
                                         "error_tag":"ARGUMENT_MISSING","http_code":400}
POST /api/v1/tasks  body '{not json'   -> 400 {"error":"Bad Request","error_code":42,
                                         "error_extra":{"event_id":"…","retry_after":3},
                                         "error_tag":"BAD_REQUEST","http_code":400}
GET  /api/v1/definitely_not_a_real_endpoint
                                   -> 404 {"error":"Not found","error_code":478,
                                         "error_extra":{"event_id":"…","retry_after":4},
                                         "error_tag":"NOT_FOUND","http_code":404}
```

The `content` check fires **before** authentication (a bogus token still gets
400, not 401). Every other field-level check fires **after** auth, so it could
not be exercised without a real token.

`Retry-After` on the 401 responses escalated with repeated invalid-token
attempts from one IP during the session: 3 → 9 → 64 → 130 → 257 → … → 1280 s.
No `X-Rate-Limit-*` header was ever present.

---

## 4. Contradictions with the current code and README

### `src/todoist-client.ts`

| # | Current code | Problem | Fix |
| --- | --- | --- | --- |
| 1 | `TodoistProject.is_inbox_project?: boolean` | **Field does not exist in v1.** It is `inbox_project`. REST v2's name. `is_inbox_project` appears 0× in the v1 spec. | Rename to `inbox_project`. |
| 2 | `TodoistTask` has `url?: string` | **`url` was removed from the task object in v1.** | Drop `url`; build `https://app.todoist.com/app/task/${id}` if a link is needed. |
| 3 | `TodoistTask` has `due?: any` | OK, but untyped; the shape is `{ date, timezone, string, lang, is_recurring }`. | Type it. |
| 4 | `TodoistTask` is missing `section_id`, `parent_id`, `labels`, `priority`, `checked`, `child_order`, `added_at`, `updated_at`, `responsible_uid`, `assigned_by_uid`, `added_by_uid`, `user_id` | The v1 task object has a different field set and different names for several of them (`is_completed`→`checked`, `created_at`→`added_at`, `creator_id`→`added_by_uid`, `assignee_id`→`responsible_uid`, `assigner_id`→`assigned_by_uid`, `order`→`child_order`, `comment_count`→`note_count`). | Re-model `TodoistTask` against `ItemSyncView`. |
| 5 | `CreateTaskInput.priority?: number` | No convention attached. The API's `4` = most urgent (app `p1`). | Document the mapping (`p1 → 4`) before shipping a priority picker. |
| 6 | `CreateTaskInput.due_date` documented as "ISO date, e.g. 2026-10-09" | **Correct.** `due_date` accepts `YYYY-MM-DD` (spec example `2025-02-12`) or RFC 3339. | Keep. |
| 7 | `CreateTaskInput.due_string` — "Natural language, e.g. 'tomorrow at 9am'" | **Correct.** | Keep. |
| 8 | `CreateTaskInput.labels?: string[]` | Ambiguous: the API wants label **names**, not IDs. | Rename to `labelNames?: string[]` / document it. |
| 9 | `CreateTaskInput` has no `duration` | `duration` alone is ignored by the API — it needs `duration_unit` too. | If added, add `duration_unit` alongside. |
| 10 | `CreateTaskInput` has no `due_datetime` | Available and distinct from `due_date`; only one of the two may be sent. | Add if a time-of-day picker ships. |
| 11 | `extractError()` reads `parsed.error \|\| parsed.message` | Works (v1 always sets `error`), but discards `error_tag`, `error_code`, `error_extra`. `error_extra.retry_after` is the backoff hint and `error_extra.argument` explains a 400. | Capture all five fields. |
| 12 | `TodoistError.status` = HTTP status only | `http_code` in the body can differ from the HTTP status, and `error_code` is a separate domain code. | Keep HTTP status, also expose `errorTag` / `errorCode` / `errorExtra`. |
| 13 | `getProjects()` — `GET /projects?limit=200` + cursor loop | **Correct.** `limit` max is 200, envelope is `{ results, next_cursor }`. | Keep. |
| 14 | `getProjects()` has no `getSections()` / `getLabels()` | Section picker needs `GET /api/v1/sections` (**global**, optional `?project_id=`); label picker needs `GET /api/v1/labels` (**global**). | Add both, same cursor loop. |
| 15 | `createTask()` expects the task object at the top level | **Correct** — `POST /tasks` returns `200` with the task object directly, no envelope. | Keep. |
| 16 | `request()` has no timeout | The API's standard processing timeout is 15 s. | Add a socket timeout so a hung request can't wedge the popover. |
| 17 | No idempotency protection on `POST /tasks` | v1 does not document `X-Request-Id` for REST. A blind retry double-creates. | Disable the button while in flight (already done via `saving`) and don't auto-retry POSTs. |
| 18 | `testConnection()` uses `GET /projects?limit=1` | Works — an invalid token yields 401 with a JSON body the plugin can surface. | Keep; make sure the 401 body is shown verbatim. |

### `README.md` — "Todoist API notes"

| README claim | Verdict |
| --- | --- |
| "Base URL: `https://api.todoist.com/api/v1` with `Authorization: Bearer <personal-token>`" | **Correct.** |
| "The older REST v2 and Sync v9 APIs are decommissioned (HTTP 410) — do not copy examples that use them." | **Correct and now verifiable.** Both return HTTP 410 with a `text/plain` body telling you to move to `/api/v1/`. Worth adding the shutdown date (2026-02-10). |
| "List endpoints are cursor-paginated: `{ results: [...], next_cursor }`." | **Correct.** Add that `limit` defaults to 50 and caps at 200. |
| "Create a task with `POST /tasks` (`content`, `description`, `project_id`, `due_date`, `section_id`, `labels`, `priority`)." | **Correct but incomplete.** All seven fields are writable. Missing from the list: `parent_id`, `due_string`, `due_datetime`, `due_lang`, `duration` + `duration_unit`, `order`, `assignee_id`, `deadline_date`. Also worth adding: `content` is the only required field; `labels` are names; `priority` 4 = most urgent; `section_id` alone is enough. |
| TODO: "Section and label pickers in the popover." | Requires `GET /api/v1/sections` and `GET /api/v1/labels` — both exist and are global. |
| TODO: "Remember the last-used project / due date." | No API needed; `GET /api/v1/projects` returns everything. |
| TODO: "Optional quick-add without the popover." | `POST /api/v1/tasks/quick` exists for natural-language capture. |
| TODO: "If publishing: OAuth instead of a personal token (`data:read_write` scope)" | **Correct** — `data:read_write` is the right scope; Todoist's own guidance is "Building for other people? Use OAuth authorization instead of a personal token." Certification itself is optional ("Submitting your app for certification is optional… Certification isn't required to develop with the Todoist APIs and share the resulting integration with users" — <https://www.todoist.com/help/todoist/integrations/market-your-todoist-integration-B6C5sCKkn>), but **webhooks only activate for users who complete the OAuth flow**, so OAuth is required for that feature. |

### Not wrong, but worth knowing

- The plugin's doc comment cites `https://developer.todoist.com/api/v1/` — that
  page exists and is the rendered v1 reference. The machine-readable contract
  lives at `https://developer.todoist.com/openapi.json`.
- `src/create-popover.tsx` renders a hard-coded "Inbox" option and then lists
  all projects — but `GET /api/v1/projects` **already includes the Inbox
  project**, so the Inbox will appear twice unless the list is filtered by
  `inbox_project === true`.
- The plugin's `due_date` picker produces `YYYY-MM-DD` — that is a *full-day*
  due date in the user's timezone. Fine, but note the API's floating/fixed
  timezone rules if a time is ever added.

---

## 5. Sources

Primary, first-party:

1. Todoist API v1 OpenAPI specification — <https://developer.todoist.com/openapi.json>
   (fetched 2026-10-20; 1 244 462 bytes; `info.version: "1"`; `servers: ["https://api.todoist.com/"]`;
   78 paths; 175 schemas). Rendered at <https://developer.todoist.com/api/v1/>.
2. Todoist developer home — <https://developer.todoist.com/>
   (first-call `curl` example; personal-token location; "Use OAuth authorization
   instead of a personal token").
3. Todoist API mailing list — launch announcement (2025-04-05) —
   <https://groups.google.com/a/doist.com/g/todoist-api/c/LKz0K5TRQ9Q>
4. Todoist API mailing list — "Deprecated URLs / old IDs" (2025-08-13) —
   <https://groups.google.com/a/doist.com/g/todoist-api/c/AoABOb6sV8Y>
5. Todoist API mailing list — "🚨 Final Shutdown of Sync API v9 and REST API v2"
   (2025-12-04; shutdown 2026-02-10) —
   <https://groups.google.com/a/doist.com/g/todoist-api/c/brwENjfT_tk>
6. Todoist Python SDK — <https://github.com/Doist/todoist-api-python>
   (`todoist_api_python/models.py`, `tests/test_api_tasks.py`)
7. Todoist TypeScript SDK — <https://github.com/Doist/todoist-sdk-typescript>
   (`src/types/tasks/requests.ts`, `src/types/tasks/types.ts`,
   `src/types/projects/types.ts`, `src/types/sections/types.ts`,
   `src/types/labels/types.ts`, `src/clients/task-client.ts`)
8. Todoist CLI — <https://github.com/Doist/todoist-cli>
   (`src/lib/task-list.ts` → `PRIORITY_MAP`, `src/commands/task/add.ts`,
   `src/commands/task/move.ts`, `src/lib/refs.ts` → `resolveSectionId`)
9. Todoist MCP server — <https://github.com/Doist/todoist-mcp>
   (`src/utils/priorities.ts` → `convertPriorityToNumber`; `src/tools/add-tasks.ts`
   → create with `sectionId` and no `projectId`)
10. Todoist Help Center — "Set a priority in Todoist" —
    <https://www.todoist.com/help/articles/set-a-priority-in-todoist-Wy82Jp>
    (p1 = highest in the app; "Priority 4 is selected by default")
11. Todoist Help Center — "Find your API token" —
    <https://www.todoist.com/help/todoist/integrations/find-your-api-token-Jpzx9IIlB>
    (Settings → Integrations tab → Developer tab → "Copy API token")
12. Todoist Help Center — "Introduction to due dates and due times" —
    <https://www.todoist.com/help/articles/introduction-to-due-dates-and-due-times-q7VobO>
    (natural-language due formats; 150-character limit)

13. Deprecated REST v2 reference (kept online for comparison) —
   <https://developer.todoist.com/rest/v2/>
   (marked "**DEPRECATED:** This is the documentation for the deprecated REST API
   (v2)"; documents the v2-only `is_inbox_project` field and the v2-only
   `X-Request-Id` idempotency header). *As of 2026-10-20 this URL 301-redirects
   to `/api/v1/`, so the text is no longer served.*
14. Deprecated Sync v9 reference — <https://developer.todoist.com/sync/v9/>
    (same redirect situation)
15. Todoist status page — legacy endpoint maintenance notice (2026-01-05) —
    <https://status.todoist.net/history/4>
16. Todoist Python SDK `CHANGELOG.md` —
    <https://github.com/Doist/todoist-api-python/blob/main/CHANGELOG.md>
    (3.0.0 "Remove support for `X-Request-Id` header, unused on the API level";
    3.1.0 "Re-add support for `X-Request-ID`")
17. Todoist Python SDK `todoist_api_python/_core/endpoints.py` —
    `API_VERSION = "v1"`,
    `API_URL = f"https://api.todoist.com/api/{API_VERSION}"`,
    `TASK_URL = "https://app.todoist.com/app/task"`
18. Todoist Python SDK `todoist_api_python/_core/http_headers.py` —
    `X_REQUEST_ID = ("X-Request-Id", "%s")`, sent on every request
19. Todoist TypeScript SDK `src/transport/http-client.ts` — `timeout: 30000`;
    retry only on network errors; `X-Request-Id` sent only when supplied
20. Todoist TypeScript SDK `src/consts/endpoints.ts` — `BASE_URI =
    "https://api.todoist.com"`, `API_VERSION = "v1"`, `TODOIST_WEB_URI =
    "https://app.todoist.com/app"`
21. RFC 9728 protected-resource metadata —
    <https://api.todoist.com/.well-known/oauth-protected-resource>

Live probes (2026-10-20, invalid token only): the `curl` transcripts in §3.

### Claims that could **not** be verified from a primary source

- **REST v1 rate-limit numbers.** Not published anywhere in the v1 spec; only
  the Sync quotas (1000 partial / 100 full per 15 min) are documented. The old
  REST v2 docs, which may have carried a per-minute figure, now 301-redirect to
  `/api/v1/` and no longer serve that text. **Treat any "X requests/minute"
  figure found online as unverified.**
- **Whether `X-Request-Id` still deduplicates on v1 REST endpoints.** Not
  documented in v1. Todoist's own Python SDK contradicts itself on this
  (removed in 3.0.0 as "unused on the API level", re-added in 3.1.0 and sent
  on every request). Treat `POST /tasks` as non-idempotent.
- **The `410` contract itself.** Todoist documents the *shutdown date*
  (2026-02-10) but never documents the status code. The `410` +
  "This endpoint is deprecated." body is observed runtime behaviour only.
- **The 400 bodies for `limit=201` and a malformed `cursor`.** Both are
  quoted from the docs; live probes hit 401 first because auth precedes
  validation.
- **The server's rejection of `priority` outside 1–4 and of `labels` sent as
  a string.** Field-level validation runs after authentication, so only the
  spec asserts these.
- **Whether `assignee_id` is accepted as a string** (the spec says integer;
  both first-party SDKs send a string).
- **Whether `POST /api/v1/tasks` accepts a `due` object.** It is not in the
  body schema; the flat fields are the documented way.
- **The exact `429` body and `error_code`.** No 429 example exists in the
  docs and 429 was never observed.
- **The `200` response body in practice.** The task shape above comes from
  the spec's `ItemSyncView` plus the first-party SDK fixtures; no live `200`
  was ever observed (no real token was used).
- **Whether `POST /api/v1/tasks` with `section_id` and no `project_id` puts the
  task in the section's project or in the Inbox.** No document states this
  outright. The evidence for "section_id alone is sufficient" is that (a) the
  spec treats the two fields as independent and (b) three first-party clients
  (CLI, MCP server, TypeScript SDK) send a section id with no project id. A
  live test against a real token would settle it.
- **Whether `section_id` + `project_id` both sent must agree.** No source says.
- **Exact `error_tag` / `error_code` values for 403 / 429 / 500 / 503.** The
  spec documents the envelope and the status-code table, but only gives
  concrete tags for `UNAUTHORIZED` (477), `NOT_FOUND` (478),
  `INVALID_ARGUMENT_VALUE` (20), `ARGUMENT_MISSING` (19), `BAD_REQUEST` (42)
  and `AUTH_INVALID_TOKEN` (401).
- **Whether the Inbox project is always present in `GET /api/v1/projects`** for
  every account (e.g. shared/team accounts). The endpoint says "Get all active
  user projects" and the project object has an `inbox_project` flag.

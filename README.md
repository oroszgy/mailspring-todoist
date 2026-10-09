# Mailspring Todoist

Create [Todoist](https://todoist.com) tasks straight from [Mailspring](https://getmailspring.com):

- A **thread toolbar button** — select one or more emails, click once.
- A **message header button** — a `+ Todoist` button when reading an email.
- A small **create-task popover** with an editable title, notes, project picker
  and due date.

Defaults: the email **subject** becomes the task title; the **notes** get the
sender, a short preview and a Mailspring link — all of which you can edit before
creating.

> Status: **skeleton.** The plumbing (registration, API client, settings, UI) is
> in place; the `TODO`s below are where the real behaviour still needs work.

## Requirements

- Mailspring 1.6.3+
- Node.js (for building)

## Develop

```bash
npm install          # install the TypeScript toolchain
npm run build        # compile src/ -> lib/  (or: npm run watch)
npm run install-local # copy the plugin into Mailspring's packages folder
```

Then restart Mailspring. For live feedback, turn on Developer Mode
(`Developer > Run with debug flags...`) and reload the main window after a build.

On Linux the plugin is installed to `~/.config/Mailspring/packages/mailspring-todoist`
(macOS: `~/Library/Application Support/Mailspring/packages`,
Windows: `%APPDATA%\Mailspring\packages`).

## Configure

1. Get a personal API token from Todoist: **Settings -> Integrations -> Developer**.
2. In Mailspring, open **Preferences -> Todoist** and paste the token.
3. Click **Test connection**; your projects load into the project picker.

## How it works

| File | Responsibility |
| --- | --- |
| `src/main.ts` | `activate` / `deactivate`, config schema, extension-point registration |
| `src/store.ts` | Settings stored via Mailspring's `AppEnv.config` |
| `src/todoist-client.ts` | Todoist API v1 client (Node `https`, zero runtime deps) |
| `src/task-builder.ts` | Thread/message -> task draft (pure, testable) |
| `src/create-popover.tsx` | Shared create-task form |
| `src/thread-toolbar-button.tsx` | `ThreadActionsToolbarButton` |
| `src/message-header-button.tsx` | `message:BodyHeader` |
| `src/preferences-tab.tsx` | Preferences pane |

### Extension points used

- `ComponentRegistry.register(..., { role: 'ThreadActionsToolbarButton' })`
  (thread list toolbar; component receives `props.items` = selected threads)
- `ComponentRegistry.register(..., { role: 'message:BodyHeader' })`
  (open message header; component receives `props.message`)
- `PreferencesUIStore.registerPreferencesTab(...)`
- `Actions.openPopover(...)` / `Actions.closePopover()`

## Todoist API notes

- Base URL: `https://api.todoist.com/api/v1` with
  `Authorization: Bearer <personal-token>`.
- The older **REST v2** and **Sync v9** APIs are decommissioned (HTTP 410) — do
  not copy examples that use them.
- List endpoints are cursor-paginated: `{ results: [...], next_cursor }`.
- Create a task with `POST /tasks` (`content`, `description`, `project_id`,
  `due_date`, `section_id`, `labels`, `priority`).

## TODO

- [ ] **Multi-select** — create one task per selected thread
      (`props.items` in `thread-toolbar-button.tsx`).
- [ ] **Verify the Mailspring deep link** (`mailspring://open-thread?...` in
      `task-builder.ts`); fall back to plain text if it is unreliable.
- [ ] Section and label pickers in the popover.
- [ ] Remember the last-used project / due date.
- [ ] Optional quick-add without the popover (modifier-click).
- [ ] Tests for `task-builder` and the API client.
- [ ] Real Todoist icon asset instead of the inline SVG.
- [ ] If publishing: OAuth instead of a personal token
      (`data:read_write` scope), plus Todoist brand guidelines compliance.

## License

MIT

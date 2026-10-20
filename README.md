# Mailspring Todoist

Create [Todoist](https://todoist.com) tasks straight from [Mailspring](https://getmailspring.com):

- A **thread toolbar button** — select a thread, click once.
- A small **create-task popover** with an editable title, notes, project picker
  and due date, styled to look like the rest of Mailspring.

Defaults: the email **subject** becomes the task title; the **notes** get the
sender, a short preview and a Mailspring link — all of which you can edit before
creating.

> Status: **working, still rough.** The plugin creates real tasks; the popover
> is styled, but the feature set is not settled yet — see the TODO below.

## Requirements

- Mailspring 1.6.3+
- Node.js (for building)

## Develop

```bash
npm install          # install the TypeScript toolchain
npm run build        # compile src/ -> lib/ and check the stylesheet (or: npm run watch)
npm run install-local # copy the plugin into Mailspring's packages folder
```

Then restart Mailspring. For live feedback, turn on Developer Mode
(`Developer > Run with debug flags...`) and reload the main window after a build.

On Linux the plugin is installed to `~/.config/Mailspring/packages/mailspring-todoist`
(macOS: `~/Library/Application Support/Mailspring/packages`,
Windows: `%APPDATA%\Mailspring\packages`).

**Mailspring must be running with a window.** It activates plugins when a
window opens, so a Mailspring started with `--background` — the mode it uses
for mail notifications — never loads the plugin at all.

### The stylesheet

`npm run build` compiles the TypeScript and then compiles `styles/index.less`
against the Mailspring installed on this machine (`npm run check:styles` does
the second half on its own). The check exists because Mailspring swallows a
LESS compile error and ships an **empty stylesheet**: a typo in a variable
name would otherwise stay invisible until someone opened the popover and found
it unstyled. It needs Mailspring to be installed; without it the check is
skipped with a warning.

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
| `src/task-builder.ts` | Thread -> task draft (pure, testable) |
| `src/create-popover.tsx` | Shared create-task form |
| `src/thread-toolbar-button.tsx` | `ThreadActionsToolbarButton` |
| `src/todoist-icon.ts` | Todoist's mark, inlined from the official favicon |
| `src/preferences-tab.tsx` | Preferences pane |
| `scripts/check-styles.js` | Compiles the stylesheet against the installed Mailspring |

### Extension points used

- `ComponentRegistry.register(..., { role: 'ThreadActionsToolbarButton' })`
  (thread list toolbar; component receives `props.items` = selected threads,
  `props.selection`, `props.thread` = `items[0]`)
- `PreferencesUIStore.registerPreferencesTab(...)`
- `Actions.openPopover(...)` / `Actions.closePopover()`

### Styling

The plugin borrows Mailspring's own vocabulary: `.fixed-popover` supplies the
popover's chrome, and `input`, `select` and `.btn` are styled globally by
Mailspring. `styles/index.less` only lays the content out and fills the gaps
Mailspring leaves (labels, the textarea's border, spacing).

## Todoist API notes

- Base URL: `https://api.todoist.com/api/v1` with
  `Authorization: Bearer <personal-token>`.
- The older **REST v2** and **Sync v9** APIs are decommissioned (HTTP 410) — do
  not copy examples that use them.
- List endpoints are cursor-paginated: `{ results: [...], next_cursor }`.
- Create a task with `POST /tasks` (`content`, `description`, `project_id`,
  `section_id`, `labels`, `due_date`). `content` is the only required field,
  `labels` are names rather than ids, and `section_id` alone places the task.
- Errors arrive as `{ error, error_code, error_tag, http_code, error_extra }`.

## TODO

- [ ] **Multi-select** — create one task per selected thread
      (`props.items` in `thread-toolbar-button.tsx`).
- [ ] **Verify the Mailspring deep link** (`mailspring://open-thread?...` in
      `task-builder.ts`); the canonical form is
      `thread.getMailboxPermalink()`.
- [ ] Section and label pickers in the popover.
- [ ] Remember the last-used project / due date.
- [ ] A socket timeout in the API client, and error messages that say what to
      do about it.
- [ ] Tests for `task-builder` and the API client.
- [ ] If publishing: OAuth instead of a personal token
      (`data:read_write` scope), plus Todoist brand guidelines compliance.

## License

MIT

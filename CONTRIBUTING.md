# Contributing

Thanks for looking at this. The plugin is small, and every part of it is
readable in one sitting.

## Getting set up

You need node (18 or newer) and a copy of Mailspring (1.6.3 or newer) - the
stylesheet is compiled against the installed Mailspring, so the check has
something to compile against.

```bash
git clone https://github.com/oroszgy/mailspring-todoist.git
cd mailspring-todoist
npm install
npm run build
npm run install-local
```

`npm run install-local` copies the plugin into Mailspring's packages folder.
Restart Mailspring afterwards, or turn on Developer Mode (**Developer > Run
with debug flags...**) and reload the main window.

## The commands

| Command | What it does |
| --- | --- |
| `npm run build` | Compile `src/` to `lib/` and check the stylesheet |
| `npm run watch` | Compile on every change |
| `npm test` | Compile and run the tests |
| `npm run check:styles` | The stylesheet check on its own |
| `npm run install-local` | Copy the plugin into Mailspring's packages folder |
| `npm run package` | Write `dist/mailspring-todoist-vX.Y.Z.zip` |
| `npm run release -- vX.Y.Z` | Tag, push and publish a release |
| `npm run screenshots` | Redraw `docs/screenshots/popover.png` |

## How the code is put together

- `src/` is TypeScript; `lib/` is the compiled JavaScript that Mailspring
  loads. **`lib/` is committed** - it is what the plugin is made of, and it
  lets someone install the plugin straight from a checkout. If you change
  `src/`, run `npm run build` and commit the result with it.
- The modules that can be pure are pure: `task-builder.ts` and `due-date.ts`
  have no React and no network, which is what makes them easy to test.
- `todoist-client.ts` is the only place that talks to Todoist.

## Tests

```bash
npm test
```

The tests run on the compiled `lib/`, with node's own test runner - there is
no test framework to install. They cover the parts that can be checked
without a running Mailspring: the task draft, the due-date fields and the
sender lookup.

## Pull requests

- One change per pull request, with a commit message that says what changed
  (`feat:`, `fix:`, `docs:`, `build:`, `chore:`).
- Run `npm test` and `npm run build` before you push.
- If your change touches the stylesheet, run `npm run screenshots` and commit
  the new picture.

## Reporting a problem

Open an issue. Say what you did, what you expected and what happened instead.
If the plugin misbehaves, the Mailspring console has the details: **Developer
> Show Mailspring Logs**, or the developer tools of the main window.

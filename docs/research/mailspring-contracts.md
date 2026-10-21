# Mailspring plugin contracts — what Mailspring actually hands the plugin

**Ticket:** "What does Mailspring actually hand the plugin?"
**Status:** verified against the Mailspring source (not docs, not blog posts).

## Source baseline

Everything below was verified against the Mailspring repository at commit
[`29711c3953565a7374af7fd11b36bea6def6a53d`](https://github.com/Foundry376/Mailspring/commit/29711c3953565a7374af7fd11b36bea6def6a53d)
(`master`, 2026-10-19). Permalink base used in every citation:

```
https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/<path>#L<lines>
```

The public docs site (<https://getmailspring.com/docs/>) contains **end-user
documentation only** — there is no public plugin-API reference there. The
in-repo `PLUGIN_SYSTEM_ARCHITECTURE.md` is a prose overview, not an API
contract, so it is cited only where it agrees with the code. The code is the
contract.

---

# PART A — The contract (read this part)

## A1. `ComponentRegistry.register(component, options)`

```
ComponentRegistry.register(component: React.ComponentType, options: {
  role?: string;      // singular
  roles?: string[];   // plural
  location?: {...};   // WorkspaceStore.Location.*
  modes?: string[];   // e.g. ['list', 'split']
}): ComponentRegistry
```

- `component.displayName` is **required** (throws otherwise).
- `role` **or** `location` is required (throws otherwise).
- `ComponentRegistry.unregister(component)` takes the **component**, not a name.

Source: [`app/src/registries/component-registry.ts#L60-L104`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/registries/component-registry.ts#L60-L104),
[`#L106-L113`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/registries/component-registry.ts#L106-L113).

Registered components are rendered as `<Component {...exposedProps} />` — the
component receives **exactly** the `exposedProps` object and nothing else
(no implicit `className`/`style` unless the role's host passes them).

Source: [`app/src/components/injected-component-set.tsx#L145-L161`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/injected-component-set.tsx#L145-L161).

`static containerRequired = false` on the component removes the error-boundary
wrapper Mailspring otherwise puts around third-party components.

Source: [`app/src/components/injected-component-set.tsx#L152-L155`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/injected-component-set.tsx#L152-L155).

---

## A2. Role `ThreadActionsToolbarButton`

**Props received (exactly three):**

| prop | type | meaning |
| --- | --- | --- |
| `items` | `Thread[]` | the **selected** threads, in selection order |
| `selection` | `ListSelection` | the raw selection object (not an array) |
| `thread` | `Thread` | `items[0]` — the first selected thread |

```tsx
const exposedProps = {
  items,                 // Thread[]  — selected threads
  selection,             // ListSelection instance
  thread: items[0],      // Thread — "the" thread
};
```

Source: [`app/internal_packages/thread-list/lib/injects-toolbar-buttons.tsx#L26-L42`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-list/lib/injects-toolbar-buttons.tsx#L26-L42).
Role name constant: [`#L6`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-list/lib/injects-toolbar-buttons.tsx#L6).

**Where `items` comes from:** `ThreadListStore.selectionObservable()` →
`Rx.Observable.fromListSelection(store)` → `dataSource.selection.items()`, i.e.
the list's multi-selection. It is *not* the focused thread.

Source: [`app/internal_packages/thread-list/lib/thread-list-store.ts#L51-L53`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-list/lib/thread-list-store.ts#L51-L53),
[`app/src/global/mailspring-observables.ts#L107-L135`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/global/mailspring-observables.ts#L107-L135).

**`props.selection` is a `ListSelection`**, not an array. Useful members:
`count()`, `ids(): string[]`, `items(): Model[]`, `top(): Model`,
`set(items)`, `toggle(item)`, `add(item)`, `remove(itemOrItems)`,
`expandTo(item)`, `walk({current,next})`, `clear()`.

Source: [`app/src/components/list-selection.ts#L8-L56`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/list-selection.ts#L8-L56),
[`#L59-L135`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/list-selection.ts#L59-L135).
(`dataSource.selection` is created in
[`app/src/components/list-data-source.ts#L19`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/list-data-source.ts#L19).)

### Focused thread vs. selected threads

**Yes — they are distinct concepts.**

- *Selection* = the multi-select set (`props.items`, `props.selection`).
- *Focus* = the single thread the user is "on". It lives in
  `FocusedContentStore`, and is exposed publicly:

```js
FocusedContentStore.focused('thread')        // Thread | null
FocusedContentStore.focusedId('thread')      // string | undefined
FocusedContentStore.keyboardCursor('thread') // Thread | null  (keyboard cursor)
FocusedContentStore.didFocusUsingClick('thread') // boolean
FocusedContentStore.listen(cb)              // Flux store listener
```

Source: [`app/src/flux/stores/focused-content-store.ts#L98-L138`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/focused-content-store.ts#L98-L138)
(docblock at [`#L11-L51`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/focused-content-store.ts#L11-L51)).
`FocusedContentStore` **is** exported from `mailspring-exports`
([`app/src/global/mailspring-exports.js#L153`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/global/mailspring-exports.js#L153)).

**How a toolbar button learns about the focused thread:** read
`FocusedContentStore.focused('thread')` at click time (this is what the
built-in `send-reminders` package does — it keeps its own store subscribed to
`FocusedContentStore`), or subscribe with
`Rx.Observable.fromStore(FocusedContentStore)`.

Source: [`app/internal_packages/send-reminders/lib/send-reminders-store.ts#L21`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/send-reminders/lib/send-reminders-store.ts#L21),
[`#L95`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/send-reminders/lib/send-reminders-store.ts#L95),
[`app/internal_packages/thread-list/lib/message-list-toolbar.tsx#L3-L9`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-list/lib/message-list-toolbar.tsx#L3-L9).

Caveat: `ThreadListStore` itself is **not** exported from `mailspring-exports`
(it lives in the `thread-list` internal package), so a plugin cannot subscribe
to it directly — use `FocusedContentStore` instead.

**Practical note:** `props.thread` (`items[0]`) is the first *selected* thread.
In the common single-selection case that is the focused thread, but with a
multi-select it is simply the earliest selected one.

---

## A3. Role `message:BodyHeader`

**Props received: exactly one — `message`, a `Message` model.**

```tsx
<InjectedComponentSet
  matching={{ role: 'message:BodyHeader' }}
  exposedProps={{ message: this.props.message }}
  direction="column"
  style={{ width: '100%' }}
/>
```

Source: [`app/internal_packages/message-list/lib/message-item-body.tsx#L202-L207`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/message-list/lib/message-item-body.tsx#L202-L207).

The set is rendered **above the message body, in the main window** (the message
*body* is the only part that goes into an iframe), so `Actions.openPopover`
works from there.

Source: [`app/internal_packages/message-list/lib/message-item-body.tsx#L174-L214`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/message-list/lib/message-item-body.tsx#L174-L214).

There is **no** `thread` prop on this role — get the thread yourself via
`message.threadId` → `DatabaseStore.find(Thread, message.threadId)`.

---

## A4. `Thread` model shape

`class Thread extends ModelWithMetadata` — all attributes are instance
properties.

| property | type | notes |
| --- | --- | --- |
| `id` | `string` | from `Model` |
| `accountId` | `string` | from `Model` |
| `version` | `number` | from `Model` |
| `snippet` | `string` | ~140-char plain-text summary of the **last message** |
| `subject` | `string` | queryable |
| `unread` | `boolean` | queryable — **there is no `hasUnread`** |
| `starred` | `boolean` | queryable |
| `categories` | `(Folder\|Label)[]` | getter = `folders.concat(labels)` |
| `folders` | `Folder[]` | |
| `labels` | `Label[]` | |
| `participants` | `Contact[]` | contacts on threads have **no id** |
| `attachmentCount` | `number` | |
| `firstMessageTimestamp` | `Date` | queryable, jsonKey `fmt` |
| `lastMessageReceivedTimestamp` | `Date` | queryable, jsonKey `lmrt` |
| `lastMessageSentTimestamp` | `Date` | queryable, jsonKey `lmst` |
| `inAllMail` | `boolean` | queryable |
| `pluginMetadata` | `PluginMetadata[]` | from `ModelWithMetadata` |

Methods: `messages({includeHidden})` (async), `sortedCategories()`,
`getMailboxPermalink()`.

Source: [`app/src/flux/models/thread.ts#L38-L152`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/thread.ts#L38-L152),
[`#L154-L162`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/thread.ts#L154-L162),
[`#L218-L222`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/thread.ts#L218-L222).
`id`/`accountId`/`version`: [`app/src/flux/models/model.ts#L41-L63`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/model.ts#L41-L63).
`grep -rn "hasUnread"` over the whole repo returns **nothing**.

## A5. `Message` model shape

`class Message extends ModelWithMetadata`.

| property | type | notes |
| --- | --- | --- |
| `id`, `accountId`, `version` | | from `Model` |
| `subject` | `string` | |
| `snippet` | `string` | short, 140-character **plain-text** summary of the body |
| `body` | `string` (HTML) | `AttributeJoinedData` — **only present if explicitly `include`d** in the query |
| `plaintext` | `boolean` | true when `body` is plain text |
| `date` | `Date` | queryable — when the message was delivered |
| `threadId` | `string` | queryable |
| `headerMessageId` | `string` | |
| `from` | **`Contact[]`** | a **collection**, not a single contact |
| `to`, `cc`, `bcc`, `replyTo` | `Contact[]` | |
| `files` | `File[]` | |
| `events` | `Event[]` | |
| `unread`, `starred`, `draft`, `pristine` | `boolean` | |
| `folders` | `{[folderId]: number}` | flag bits (`PlacementFlags`) |
| `listUnsubscribe`, `listUnsubscribePost` | `string` | |

Methods: `participants({includeFrom,includeBcc})`, `participantsForReply()`,
`participantsForReplyAll()`, `fromContact()`, `formattedDate()`, `isFromMe()`,
`isHidden()`, `isForwarded()`, `hasEmptyBody()`, `replyAttributionLine()`,
`categories()`, `folderIds()`, `fileIds()`.

Source: [`app/src/flux/models/message.ts#L82-L236`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/message.ts#L82-L236),
[`#L254-L336`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/message.ts#L254-L336),
[`#L400-L461`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/message.ts#L400-L461).

### `snippet` vs `preview` vs `body`

- **`snippet`** — plain text, ~140 chars, always present as an attribute.
- **`body`** — the full **HTML** body. It is a `JoinedData` attribute living in
  a separate table, so it is `undefined` unless the query explicitly included
  it (`DatabaseStore.findAll(Message).include(Message.attributes.body)`).
  Source: [`app/src/flux/models/message.ts#L60-L64`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/message.ts#L60-L64),
  usage example [`app/src/flux/models/thread.ts#L154-L162`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/thread.ts#L154-L162).
- **`preview`** — **does not exist.** There is no `preview` attribute on
  `Message` or `Thread`. `grep -rn "preview" app/src/flux/models/
  app/src/flux/attributes/` yields only an unrelated comment in
  `models/utils.ts`. Use `snippet`.

### Where the sender lives

`message.from` is an **array** of `Contact`. `Contact` has `name: string` and
`email: string`.

- `message.from[0].email`, `message.from[0].name`
- or the convenience accessor `message.fromContact()` →
  `Contact` or a placeholder `{name: 'Unknown', email: 'Unknown'}`.

Source: [`app/src/flux/models/message.ts#L101-L104`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/message.ts#L101-L104),
[`#L207-L212`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/message.ts#L207-L212),
[`#L427-L429`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/message.ts#L427-L429).
`Contact.name` / `Contact.email`: [`app/src/flux/models/contact.ts#L364-L366`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/contact.ts#L364-L366),
[`#L380-L383`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/contact.ts#L380-L383).

`thread.participants` is also `Contact[]` (no ids on thread participants).

---

## A6. `Actions.openPopover` / `Actions.closePopover`

```ts
Actions.openPopover(
  element: React.ReactElement,
  {
    originRect?: { top?, bottom?, left?, right?, width?, height? },
    direction?: 'up' | 'down' | 'left' | 'right',
    fallbackDirection?: 'up' | 'down' | 'left' | 'right',
    closeOnAppBlur?: boolean,     // default true
    callback?: () => void,        // called after the popover is rendered
  }
): void

Actions.closePopover(callback?: () => void): void
```

- **`className` is NOT an option** and is silently ignored. The popover is
  always wrapped in `<div class="fixed-popover-container">` / `<div
  class="fixed-popover">`. Style your own content instead.
- `direction` values are the literal strings `'up' | 'down' | 'left' | 'right'`
  (the `Direction` enum values).
- `closeOnAppBlur` defaults to `true` → the popover closes when focus leaves it.
- Only **one** popover exists at a time. Calling `openPopover` while one is
  open closes the old one and opens the new one.

Source: [`app/src/flux/stores/popover-store.tsx#L38-L56`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/popover-store.tsx#L38-L56),
[`#L58-L64`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/popover-store.tsx#L58-L64).
Action declarations: [`app/src/flux/actions.ts#L534-L535`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/actions.ts#L534-L535)
(scope `'window'` — the action only fires in the window it is fired from).
`Direction` enum: [`app/src/components/fixed-popover.tsx#L9-L21`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/fixed-popover.tsx#L9-L21).

### Can the user dismiss it?

**Yes**, both ways:

- **Click outside** — `FixedPopover.onBlur` fires when focus leaves the popover
  element and calls `Actions.closePopover()`. Gated by `closeOnAppBlur`
  (default `true`); when `closeOnAppBlur === false` it only closes if the blur
  target is outside the popover (a genuine click-out), not on window blur.
  Source: [`app/src/components/fixed-popover.tsx#L171-L179`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/fixed-popover.tsx#L171-L179),
  [`#L56-L58`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/fixed-popover.tsx#L56-L58).
  The popover is auto-focused on mount (`AutoFocuses` decorator,
  [`#L426`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/fixed-popover.tsx#L426)).
- **Escape** — `FixedPopover.onKeyDown` closes on `event.key === 'Escape'`.
  Source: [`app/src/components/fixed-popover.tsx#L181-L185`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/fixed-popover.tsx#L181-L185).
- **Window resize** also closes it.
  Source: [`app/src/components/fixed-popover.tsx#L113-L115`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/fixed-popover.tsx#L113-L115).

### Can an open popover be updated?

**There is no API to update an open popover.** `PopoverStore` exposes only
`isOpen` and `container`; `openPopover` tears down and re-creates the popover
(the old element is unmounted, so its React state is lost).

The practical pattern: the popover *content* is your own React component, so
keep the mutable state (task draft, loading, error) **inside** that component
and re-render it with `this.setState` — do not try to re-open the popover with
new props.

Sources: [`app/src/flux/stores/popover-store.tsx#L15-L64`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/popover-store.tsx#L15-L64)
(the whole store — there is no update method),
[`app/src/components/fixed-popover.tsx#L46-L52`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/fixed-popover.tsx#L46-L52)
("If `Actions.openPopover` is called when the popover is already open, it will
close the previous one and open the new one").

---

## A7. `PreferencesUIStore.registerPreferencesTab`

```ts
new PreferencesUIStore.TabItem({
  tabId: string,                 // unique key; 'General' selects the default tab
  displayName: string,           // may be localized()
  componentClassFn: () => any,   // returns the React component class
  order?: number,                // default Infinity
})

PreferencesUIStore.registerPreferencesTab(tabItem: PreferencesUIStoreTab): void
PreferencesUIStore.unregisterPreferencesTab(tabItemOrId: string | PreferencesUIStoreTab): void
```

- `TabItem` has **no `sectionId` property**. It has `tabId`, `displayName`,
  `componentClassFn`, `order`.
- `unregisterPreferencesTab` matches on `tabId` **or** object identity:
  `this._tabs.filter((s) => s.tabId !== tabItemOrId && s !== tabItemOrId)`.
  Passing `undefined` (a non-existent `sectionId`) removes **nothing**.

Source: [`app/src/flux/stores/preferences-ui-store.ts#L10-L27`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/preferences-ui-store.ts#L10-L27),
[`#L105-L117`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/preferences-ui-store.ts#L105-L117).

### Props the preferences component receives

The tab component is rendered as:

```tsx
<ConfigPropContainer>
  <TabComponent accountId={selection.accountId} />
</ConfigPropContainer>
```

`ConfigPropContainer` clones its child with two more props:

| prop | value |
| --- | --- |
| `accountId` | the account selected in the Preferences sidebar (`null` if none) |
| `config` | the whole config object, **plus** mutators `get(key)`, `set(key,value)`, `toggle(key)`, `contains(key,val)`, `toggleContains(key,val)` |
| `configSchema` | `AppEnv.config.getSchema('core')` — the **core** schema, *not* your plugin's |

So the component receives **three** props: `accountId`, `config`, `configSchema`.

Sources: [`app/internal_packages/preferences/lib/preferences-root.tsx#L71-L95`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/preferences/lib/preferences-root.tsx#L71-L95),
[`app/src/components/config-prop-container.tsx#L37-L74`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/components/config-prop-container.tsx#L37-L74).

The tab bar looks for an icon named `icon-preferences-<tabId.toLowerCase()>.png`
and **falls back** to `icon-preferences-general.png`, so a custom tab needs no
icon asset.

Source: [`app/internal_packages/preferences/lib/preferences-tabs-bar.tsx#L43-L51`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/preferences/lib/preferences-tabs-bar.tsx#L43-L51).

---

## A8. `AppEnv.config`

**One global store, shared by every plugin and by Mailspring itself.** There is
no per-plugin config object. Namespacing is by convention: the first key-path
segment is the package name.

### The API (there is **no** `setLocal`/`getLocal`)

```
AppEnv.config.get(keyPath?: string): any
    // no keyPath -> the whole settings object
    // returns the schema default when nothing is set

AppEnv.config.set(keyPath: string, value: any): boolean
    // coerces to the schema type; `undefined` resets to the default
    // returns false if the value could not be coerced

AppEnv.config.unset(keyPath: string): void        // restore the default
AppEnv.config.getSchema(keyPath: string): object | null
AppEnv.config.setSchema(keyPath: string, schema: object): void
AppEnv.config.observe(keyPath: string, cb: (value) => void): Disposable
    // fires immediately AND on every change
AppEnv.config.onDidChange(keyPathOrCb, cb?): Disposable
    // fires only when the value actually changes
AppEnv.config.transact(cb): void                  // batch change notifications
AppEnv.config.pushAtKeyPath(keyPath, value): void
AppEnv.config.unshiftAtKeyPath(keyPath, value): void
AppEnv.config.removeAtKeyPath(keyPath, value): void
```

`grep -rn "setLocal\|getLocal" app/` finds **nothing** — those methods do not
exist in this version of Mailspring.

Source: [`app/src/config.ts#L387-L390`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L387-L390) (`observe`),
[`#L404-L412`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L404-L412) (`onDidChange`),
[`#L432-L434`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L432-L434) (`get`),
[`#L455-L476`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L455-L476) (`set`),
[`#L482-L484`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L482-L484) (`unset`),
[`#L494-L504`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L494-L504) (`getSchema`),
[`#L511-L519`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L511-L519) (`transact`),
[`#L525-L565`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L525-L565) (array helpers),
[`#L567-L596`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L567-L596) (`setSchema`).

### Namespacing: how the plugin's `config` export becomes a schema

`Package.activate()` does:

```js
if (module.config && typeof module.config === 'object') {
  AppEnv.config.setSchema(this.name, { type: 'object', properties: module.config });
} else if (module.configDefaults && typeof module.configDefaults === 'object') {
  AppEnv.config.setDefaults(this.name, module.configDefaults);
}
```

where `this.name` is the **package name** from `package.json`. So for a package
named `mailspring-todoist` exporting

```js
export const config = { apiToken: { type: 'string', default: '' } };
```

the key path is **`mailspring-todoist.apiToken`** — exactly what the plugin's
`store.ts` uses. `configDefaults` (legacy) only sets defaults, no schema.

Source: [`app/src/package.ts#L56-L81`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/package.ts#L56-L81).

Note the ordering: `module.activate()` runs **before** `setSchema`, so the
schema is not registered during `activate()` itself.

### Persistence

- Stored in **`<configDirPath>/config.json`**, format `{ "*": { ...settings } }`.
- `configDirPath` = `~/.config/Mailspring/` (Linux),
  `~/Library/Application Support/Mailspring/` (macOS),
  `%APPDATA%\Mailspring\` (Windows).
- Writes are immediate and atomic (`atomicWriteFileSync`); `set()` therefore
  hits the disk synchronously.
- The file is chmod'ed `700`; the directory is created from a template on
  first run.

Sources: [`app/src/browser/config-persistence-manager.ts#L21-L57`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/browser/config-persistence-manager.ts#L21-L57),
[`#L131-L179`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/browser/config-persistence-manager.ts#L131-L179),
[`app/src/config.ts#L746-L749`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L746-L749).
Config-dir table: [`PLUGIN_SYSTEM_ARCHITECTURE.md`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/PLUGIN_SYSTEM_ARCHITECTURE.md).

### Schema types & coercion

`string`, `integer`, `number`, `boolean`, `array`, `object`, `null`; plus
`enum`, `minimum`, `maximum`, `title`, `description`, `default`, `items`,
`properties`. Values are coerced; if coercion fails the value is **not** set
and `set()` returns `false`.

Source: [`app/src/config.ts#L57-L281`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L57-L281),
[`#L760-L928`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/config.ts#L760-L928).

**Security note:** the plugin's `apiToken` is stored **in plaintext** in
`config.json` on disk. That is the only supported mechanism.

---

## A9. The deep link

### Does `mailspring://open-thread?subject=<...>&lastDate=<unix seconds>` work?

**Yes.** The `mailspring:` scheme is handled in the main process:

```js
} else if (parts.protocol === 'mailspring:') {
  if (parts.host.startsWith('notification-')) { ... }
  else if (parts.host === 'open-inbox') { ... }
  else if (parts.host === 'open-preferences') { ... }
  else if (parts.host === 'plugins') { ... }
  else {
    main.sendMessage('openThreadFromWeb', urlToOpen);   // <-- everything else
  }
}
```

So **any** host other than the four special ones — including `open-thread` — is
routed to the permalink handler. The handler parses only the **query string**;
the host/action is irrelevant to it:

```ts
const _parseOpenThreadUrl = (mailspringUrlString: string) => {
  const parsedUrl = url.parse(mailspringUrlString);
  const params = querystring.parse(parsedUrl.query) as any;
  return {
    subject: params.subject,
    date:     params.date     ? parseInt(params.date, 10)     : undefined,
    lastDate: params.lastDate ? parseInt(params.lastDate, 10) : undefined,
  };
};
```

and then matches a thread:

- `date` present → thread whose **`firstMessageTimestamp`** is within **±60 s**.
- otherwise (`lastDate`) → thread whose **`lastMessageSentTimestamp` OR
  `lastMessageReceivedTimestamp`** is within **±60 s**.
- always ANDed with an **exact** `subject` match.

`DATE_EPSILON = 60` seconds.

On success it calls `Actions.popoutThread(thread)` → opens a new
`thread-popout` window with that thread.

Sources:
[`app/src/browser/application.ts#L1094-L1117`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/browser/application.ts#L1094-L1117),
[`app/internal_packages/thread-list/lib/thread-permalink-handler.ts#L1-L73`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-list/lib/thread-permalink-handler.ts#L1-L73),
[`app/src/flux/stores/message-store.ts#L384-L394`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/message-store.ts#L384-L394).

Entry points into `openUrl`: macOS `open-url`, the Windows/Linux
second-instance event, and the pending-URL queue at startup.

Sources: [`app/src/browser/application.ts#L282-L286`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/browser/application.ts#L282-L286),
[`#L214-L216`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/browser/application.ts#L214-L216),
[`#L622-L625`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/browser/application.ts#L622-L625).

Clicking a `mailspring:` link **inside** Mailspring also routes to
`application.openUrl`, so a deep link also works from inside the app.

Source: [`app/src/window-event-handler.ts#L366-L368`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/window-event-handler.ts#L366-L368).

The handler lives in the **`thread-list` internal package**
(`app/internal_packages/thread-list/lib/thread-permalink-handler.ts`), not in a
standalone `thread-permalink-handler` package.

**Fragility to be aware of:**
1. The **subject must match exactly** (case- and whitespace-sensitive).
2. The timestamp must be within **60 seconds**.
3. `lastDate` matches the *thread's* last-sent/last-received timestamp, so
   passing a **message's** `date` (which may be an older message in the
   thread) will usually **not** match.
4. It only opens threads that are **already synced locally** — the link does
   not fetch anything from the server (CHANGELOG: "only works on computers
   with the account synced").
   Source: [`CHANGELOG.md`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/CHANGELOG.md)
   (entry "A new menu option, 'Copy Mailbox Permalink' …").
5. On failure it shows an error dialog: *"The thread %@ does not exist in your
   mailbox!"*.

### The supported way to link back into a thread

Use the model's own helper:

```js
thread.getMailboxPermalink()
// => `mailspring://thread?subject=${encodeURIComponent(subject)}&date=${Math.floor(firstMessageTimestamp.getTime()/1000)}`
```

Source: [`app/src/flux/models/thread.ts#L218-L222`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/models/thread.ts#L218-L222).
This is what Mailspring itself puts on the clipboard for
"Copy mailbox permalink" and the Share button.

Sources: [`app/internal_packages/thread-list/lib/thread-list-context-menu.ts#L308-L316`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-list/lib/thread-list-context-menu.ts#L308-L316),
[`app/internal_packages/thread-sharing/lib/thread-sharing-button.tsx#L27-L33`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-sharing/lib/thread-sharing-button.tsx#L27-L33).

Note the difference: the canonical form is `mailspring://thread?...&date=...`
with **`firstMessageTimestamp`**, while the plugin builds
`mailspring://open-thread?...&lastDate=...` with **`lastMessageReceivedTimestamp`**.
Both are parsed by the handler, but `date`/`firstMessageTimestamp` is the
form Mailspring itself emits.

### `mailto:` round trip

`mailto:` opens a **composer** with a new draft — it is a "compose" link, not
an "open this message" link. There is **no** message-level permalink in
Mailspring.

Sources: [`app/src/browser/application.ts#L1094-L1096`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/browser/application.ts#L1094-L1096),
[`app/src/flux/stores/draft-store.ts#L73`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/draft-store.ts#L73),
[`app/src/flux/stores/draft-factory.ts#L100-L103`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/flux/stores/draft-factory.ts#L100-L103).

### Public web permalink (works outside the app)

Yes, but it is the **thread-sharing** feature and it is opt-in + Pro-gated:

```js
`https://shared.getmailspring.com/thread/${identity.id}/${metadata.key}`
```

It only exists after the user has explicitly shared the thread, which uploads
the thread body and attachments to Mailspring's servers.

Sources: [`app/internal_packages/thread-sharing/lib/main.tsx#L41-L49`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-sharing/lib/main.tsx#L41-L49),
[`#L72-L144`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-sharing/lib/main.tsx#L72-L144),
[`#L146-L160`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/internal_packages/thread-sharing/lib/main.tsx#L146-L160).
There is **no** equivalent public web link for a single message.

---

## A10. `package.json`, `styles/`, `localized()`

### `engines.mailspring`

Only **presence** is checked — the version string is never compared:

```js
isEngineSet() { return !!this.json.engines.mailspring; }
```

and in `activatePackage`:

```js
if (!pkg.isEngineSet()) {
  console.error(localized(`This plugin or theme %@ does not list "mailspring" in it's package.json's "engines" field. …`));
  return;   // <- the plugin is NOT activated
}
```

So `"engines": { "mailspring": ">=1.6.3" }` is fine and is *not* a version
gate — but **omitting** `engines.mailspring` silently disables the plugin.

Sources: [`app/src/package.ts#L103-L105`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/package.ts#L103-L105),
[`app/src/package-manager.ts#L137-L147`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/package-manager.ts#L137-L147).

Other `package.json` facts:
- `name` must match `/^[a-zA-Z0-9._-]+$/`.
- `main` is required for non-theme plugins; it is `require`d and must export
  `activate()` (and `deactivate()`).
- `windowTypes` defaults to `{ default: true }`; `all: true` loads everywhere.
- Packages are discovered in `<configDir>/packages/`, `<configDir>/dev/packages/`
  (dev mode only) and `<resourcePath>/internal_packages/`.
- Non-`syncInit` packages activate **2.5 s after startup**.

Sources: [`app/src/package.ts#L7-L53`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/package.ts#L7-L53),
[`app/src/package-manager.ts#L30-L43`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/package-manager.ts#L30-L43),
[`#L98-L117`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/package-manager.ts#L98-L117).

### `styles/` — how LESS is loaded and scoped

`Package.loadStylesheets()`:

```js
const filenames = fs.readdirSync(stylesRoot);
const index = filenames.find((fn) => fn.startsWith('index.'));
if (index) {
  stylesheets = [path.join(stylesRoot, index)];       // ONLY index.*
} else {
  stylesheets = filenames.filter((fn) => fn.endsWith('ss'))  // all .less/.css
                    .map((fn) => path.join(stylesRoot, fn));
}
```

- **If a file named `index.*` exists in `styles/`, it is the only stylesheet
  loaded.** Every other file in `styles/` is then dead.
- Files must end in `less` or `css`; any other extension throws
  *"Mailspring does not support stylesheets with the extension: %@"*.
- LESS is compiled with `AppEnv.themes.cssContentsOfStylesheet(path)`; CSS is
  read verbatim.
- Import paths always include `<resourcePath>/static/style` and
  `<resourcePath>/static/style/base`, so `@import "ui-variables"` and
  `@import "ui-mixins"` work. The **active theme's** `styles/` dir is searched
  first, then the base theme's.
- **Styles are NOT scoped.** The compiled CSS is injected into the document
  globally (`AppEnv.styles.addStyleSheet`), so every selector must be
  namespaced by the plugin to avoid clashing with Mailspring or other plugins.
- A LESS compile error is caught, logged, and the stylesheet is replaced with
  an **empty string** — i.e. the plugin silently loses all its styles.

Sources: [`app/src/package.ts#L115-L161`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/package.ts#L115-L161),
[`app/src/theme-manager.ts#L347-L381`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/theme-manager.ts#L347-L381),
[`app/src/compile-cache-less.ts#L13-L24`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/compile-cache-less.ts#L13-L24),
[`app/src/theme-manager.ts#L287-L294`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/theme-manager.ts#L287-L294).

### `localized()`

```js
localized(en: string, ...subs: any[]): string
```

- Returns `localizations[en] || en` — the English string when there is no
  translation. **No locale file is required**; a plugin that ships no
  translations simply gets its English strings back.
- Substitution supports `%@` (positional, in order) and `%1$@` (indexed,
  reorderable).
- The translation table is Mailspring core's `app/lang/*.json`; plugins cannot
  add to it at runtime.
- `localizedReactFragment(en, ...subs)` returns a React fragment instead of a
  string, for translated markup.

Sources: [`app/src/intl.ts#L219-L234`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/intl.ts#L219-L234),
[`#L236-L265`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/intl.ts#L236-L265),
[`#L184-L217`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/intl.ts#L184-L217),
[`#L173-L178`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/intl.ts#L173-L178).

### Bonus: how `mailspring-exports` resolves at runtime

`AppEnv` adds `<resourcePath>/src/global` to Node's module search path via
`app-module-path`, so `require('mailspring-exports')` in a plugin resolves to
`<resourcePath>/src/global/mailspring-exports.js`. The TypeScript declaration
file for the same surface ships next to it
(`app/src/global/mailspring-exports.d.ts`) and can be copied into a plugin to
get real types instead of `any`.

Sources: [`app/src/app-env.ts#L68-L71`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/app-env.ts#L68-L71),
[`app/src/global/mailspring-exports.d.ts`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/global/mailspring-exports.d.ts).

---

# PART B — Contradictions with the current `src/` and the README

Everything below was found by comparing the contracts above with the plugin
code in this repo (`src/`, `styles/`, `README.md`).

### B1. `message.from` is an array, not an object — **bug**

`src/task-builder.ts:55`:

```ts
const from = message && message.from ? message.from.email || message.from.name : null;
```

`Message.from` is `Contact[]` (`message.ts:101-104`), so `message.from.email`
and `message.from.name` are both `undefined`. The "From: …" line in the task
notes is therefore **always empty**. Correct form:

```ts
const sender = message?.from?.[0];            // or message.fromContact()
const from = sender ? (sender.email || sender.name) : null;
```

### B2. `unregisterPreferencesTab(preferencesTab.sectionId)` — **bug**

`src/main.ts:74` passes `preferencesTab.sectionId`. `PreferencesUIStoreTab`
has **no** `sectionId`; the property is `tabId`
(`preferences-ui-store.ts:10-27`). `unregisterPreferencesTab(undefined)` filters
with `s.tabId !== undefined && s !== undefined` → **the tab is never
removed**. It should be `unregisterPreferencesTab(preferencesTab.tabId)`.

### B3. `@text-color-error` does not exist — the plugin's LESS does not compile

`styles/index.less` uses `@text-color-error` twice (`.todoist-popover-error`,
`.todoist-preferences-error`). Mailspring's base `ui-variables.less` defines
`@text-color`, `@text-color-subtle`, `@text-color-very-subtle`,
`@text-color-inverse`, … but **not** `@text-color-error`
([`app/static/style/base/ui-variables.less#L70-L86`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/static/style/base/ui-variables.less#L70-L86)).
Less 3 (`less-cache@1.1.1` → `less@^3.12.2`) throws
`NameError: variable @text-color-error is undefined`, Mailspring catches it
and substitutes an **empty stylesheet**
([`app/src/theme-manager.ts#L362-L381`](https://github.com/Foundry376/Mailspring/blob/29711c3953565a7374af7fd11b36bea6def6a53d/app/src/theme-manager.ts#L362-L381)).

*Verified empirically:* compiling the repo's `styles/index.less` with
`lessc@3` and Mailspring's own `static/style` import paths reproduces
`NameError: variable @text-color-error is undefined` at line 19; replacing only
that variable with `@text-color` makes the file compile cleanly (so it is the
only offending variable).

**Net effect: the plugin currently has no styles at all.**

### B4. `styles/main.less` is never loaded

`styles/` contains both `index.less` and `main.less`. Because a file starting
with `index.` exists, `Package.loadStylesheets()` loads **only** `index.less`
(`package.ts:136-149`). `main.less` is dead (and redundant — it just imports
`index.less`). The other three theme variables the plugin uses
(`@background-primary`, `@border-color-divider`, `@text-color-subtle`) all
exist, so once B3 is fixed the styles will apply.

### B5. The deep link works, but is not the supported form

`src/task-builder.ts:27-30` builds
`mailspring://open-thread?subject=…&lastDate=…`.

- It **does work**: the host `open-thread` falls through to the
  `openThreadFromWeb` branch and the handler ignores the host.
- But the **supported** form (what Mailspring emits) is
  `mailspring://thread?subject=…&date=…` built from
  `thread.getMailboxPermalink()`, matching `firstMessageTimestamp`.
- `lastDate` matches `lastMessageSentTimestamp`/`lastMessageReceivedTimestamp`
  within ±60 s. The plugin passes `thread.lastMessageReceivedTimestamp` for
  threads (good) but **`message.date`** for messages (bad — a message's own
  date is not the thread's last-received timestamp, so the link will usually
  fail to resolve for any message that is not the last one in the thread).
- The README TODO "Verify the Mailspring deep link" can therefore be closed
  with a **yes**, with the caveats above.

### B6. README "Extension points used" table — corrections

| README claim | Verdict |
| --- | --- |
| `ThreadActionsToolbarButton` … receives `props.items` = selected threads | **Correct.** `items` is `Thread[]` = the selection. The table should also mention `props.selection` (a `ListSelection`) and `props.thread` (= `items[0]`). |
| `message:BodyHeader` … receives `props.message` | **Correct.** `props.message` is a `Message` model. There is no `props.thread`. |
| `PreferencesUIStore.registerPreferencesTab(...)` | **Correct API**, but the tab component actually receives `accountId`, `config` and `configSchema` — the README does not say this. |
| `Actions.openPopover(...)` / `Actions.closePopover()` | **Correct.** But there is **no `className` option**; the plugin does not pass one, so this is fine. `openPopover`'s full option set is `{originRect, direction, fallbackDirection, closeOnAppBlur, callback}`. |

### B7. `Actions.openPopover` scope

`openPopover`/`closePopover` are `'window'`-scoped actions
(`actions.ts:534-535`), so they only affect the window they are fired from —
which is what the plugin wants (the thread list and the message body are in
the main window).

### B8. `serialize()` is dead

`src/main.ts:79-81` exports `serialize()`. Nothing in current Mailspring
core calls a plugin's `serialize()` (`grep -rn "serialize" app/src/` finds no
call site). Harmless, but it does nothing.

### B9. `store.ts` config keys are correct

`AppEnv.config.get('mailspring-todoist.<key>')` matches
`Package.activate()`'s `setSchema(this.name, …)` exactly, because the package
name in `package.json` is `mailspring-todoist`. The plugin's `config` export in
`src/main.ts` therefore produces the schema
`mailspring-todoist.{apiToken,defaultProjectId,defaultDueString,includeSnippet,includeLink}`.
**No change needed.**

Note the schema is registered *after* `activate()` runs, so `getSettings()`
must not be called at module scope during `activate()` — the current code only
calls it from React lifecycle methods, which is fine.

### B10. `includeSnippet` / `includeLink` defaults are boolean-typed

The schema declares `type: 'boolean'`, so `AppEnv.config.get(...)` returns the
schema default (`true`) when unset. The plugin's `!== false` guard is therefore
belt-and-braces but correct. `AppEnv.config.set(key, undefined)` resets to the
default — there is no need for a separate "unset" path.

### B11. `AppEnv.config.setLocal` / `getLocal` do not exist

If the ticket's assumption was that the plugin could use a "local" (non-synced,
per-package) config store, it cannot: there is exactly one global
`AppEnv.config`, persisted in `<configDir>/config.json`. The Todoist API token
will therefore be stored in plaintext in that file.

### B12. `props.thread` vs. the focused thread

`src/thread-toolbar-button.tsx` reads `this.props.items` — correct. But the
README's "Multi-select" TODO is the right place to note that the *focused*
thread (`FocusedContentStore.focused('thread')`) is a separate concept from
`items[0]`.

---

# PART C — Method / provenance

- Source read: the whole Mailspring repository, cloned at
  `29711c3953565a7374af7fd11b36bea6def6a53d` (`master`, 2026-10-19).
- Files read in full: `app/internal_packages/thread-list/lib/injects-toolbar-buttons.tsx`,
  `app/internal_packages/thread-list/lib/thread-permalink-handler.ts`,
  `app/internal_packages/thread-list/lib/thread-list-store.ts`,
  `app/internal_packages/message-list/lib/message-item-body.tsx`,
  `app/internal_packages/preferences/lib/preferences-root.tsx`,
  `app/internal_packages/preferences/lib/preferences-tabs-bar.tsx`,
  `app/internal_packages/thread-sharing/lib/main.tsx`,
  `app/src/components/injected-component.tsx`,
  `app/src/components/injected-component-set.tsx`,
  `app/src/components/list-selection.ts`,
  `app/src/components/fixed-popover.tsx`,
  `app/src/components/config-prop-container.tsx`,
  `app/src/flux/stores/popover-store.tsx`,
  `app/src/flux/stores/preferences-ui-store.tsx`,
  `app/src/flux/stores/focused-content-store.ts`,
  `app/src/flux/models/thread.ts`, `message.ts`, `contact.ts`, `model.ts`,
  `model-with-metadata.ts`,
  `app/src/config.ts`, `app/src/browser/config-persistence-manager.ts`,
  `app/src/package.ts`, `app/src/package-manager.ts`,
  `app/src/theme-manager.ts`, `app/src/compile-cache-less.ts`,
  `app/src/intl.ts`, `app/src/app-env.ts`,
  `app/src/global/mailspring-exports.js`,
  `app/src/browser/application.ts` (openUrl), `app/src/window-event-handler.ts`.
- Cross-checks: `grep -rn` over the repo for `hasUnread`, `preview`,
  `setLocal`, `getLocal`, `sectionId`, `text-color-error`, `openThreadFromWeb`,
  `mailspring://`, `serialize`.
- The LESS finding (B3) was **reproduced** with `lessc@3` against Mailspring's
  own `app/static/style` import paths.
- Not used: blog posts, community threads, or the (end-user-only) public docs
  site, because none of them define the plugin API.

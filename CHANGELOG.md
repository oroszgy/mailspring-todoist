# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-21

The first release.

### Added

- A Todoist button in the Mailspring thread list toolbar.
- A create-task popover with an editable title and notes, a project picker
  and a due date with *Today*, *Tomorrow* and *Next week* presets.
- The task notes hold the sender of the last message, a preview of the thread
  and a `mailspring://` link back into the thread.
- A preferences pane: the API token, the default project, the default due
  date, the preview and the link toggles, and a *Test connection* button.
- A release script that builds the plugin, packages it as a zip and publishes
  it on GitHub.

### Fixed

- The "include a preview" and "include a link" settings are honoured.
- The default due date is used: a plain date prefills the date field, a
  natural-language one is sent as `due_string`.
- The sender is in the task notes, as the README said it would be.

[0.1.0]: https://github.com/oroszgy/mailspring-todoist/releases/tag/v0.1.0

# Mailspring Todoist

Turning emails read in Mailspring into tasks in Todoist.

## Language

**Source email**:
The email a task comes from — either a single message or a whole thread.
_Avoid_: Input, source, item

**Thread**:
A conversation in Mailspring: one or more messages sharing a subject.
_Avoid_: Conversation, email

**Message**:
A single email inside a thread.
_Avoid_: Mail, email item

**Task**:
A unit of work in Todoist, created from a source email.
_Avoid_: Todo, item, entry

**Task draft**:
The proposed task before it is created: title, notes, project, section, labels, due date.
_Avoid_: Draft task, task preview, prefill

**Project**:
A Todoist container for tasks. The Inbox is the project used when none is chosen.
_Avoid_: Folder, list, board

**Section**:
A subdivision *within* a project. A section only exists in the context of its project.
_Avoid_: Subfolder, column, subtask

**Label**:
A tag attached to a task, independent of any project or section.
_Avoid_: Tag, category, keyword

**Default project**:
The project a task lands in when the user does not pick one.
_Avoid_: Fallback project, home project

**Popover**:
The small editor Mailspring opens over the window, where a task draft is confirmed.
_Avoid_: Modal, dialog, popup

**Quick-add**:
Creating a task straight from the source email, without opening the popover.
_Avoid_: Instant add, one-click add, silent create

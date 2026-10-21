# Security

## Reporting a vulnerability

Please report a vulnerability privately, by email to the maintainer
(gyorgy@orosz.link) rather than in a public issue. Include what you found and
how to reproduce it.

You can expect an answer within a week.

## What this plugin does with your data

- The plugin sends the title and the notes of the task you create to
  `api.todoist.com`, and nothing else. There is no analytics, no telemetry
  and no third party service in between.
- Your Todoist API token is stored in Mailspring's own config file, in plain
  text - Mailspring has one global config store and no secret storage. Anyone
  who can read that file can read the token.
- A personal API token works for one account only. Do not put a token of a
  shared account in here.
- The plugin reads the threads you select and the message of the thread you
  selected. It does not read any other message.

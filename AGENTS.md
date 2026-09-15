# Task Completion Requirements

- Run `npm run format:check` globally.
- Run `npm run lint` with zero warnings.
- Run `npm run typecheck`.
- Run `npm test`.
- Run `npm run validate:handlers` after command or listener changes.
- Run `npm run build` and `git diff --check` before completion.

# Architecture

This repository uses NestJS 11, Necord 6, Discord.js 14, and TypeScript decorators. Commands live in `src/commands/handlers/`; listeners live in `src/listeners/handlers/`. Register each handler exactly once in the corresponding module's `HANDLERS` array. Prefer the `create:command` and `create:listener` generators.

Keep listeners thin and inject feature services. Confirm gateway intents before adding listeners. Do not log message content, attachments, Discord credentials, or other secrets. Crypto automod events use `ActivityLogger`; avoid noisy logging for every message received.

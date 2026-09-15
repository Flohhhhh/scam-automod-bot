# Project structure

- `src/bot/`: Necord client configuration and gateway intents.
- `src/env/`: Zod schema and typed environment access.
- `src/crypto-spam-automod/`: Detection, bounded activity storage, enforcement, reporting, and tests.
- `src/listeners/handlers/`: Thin Discord gateway listeners registered by `ListenersModule`.
- `src/commands/handlers/`: Future slash commands registered by `CommandsModule`.
- `src/components/handlers/`: Future Discord interaction components.
- `src/common/`: Shared logging, guards, errors, and utilities.
- `scripts/`: Handler generators and registration validation.

Keep Discord listeners thin. Business behavior belongs in an injectable feature service, and each handler must be registered exactly once in its module's `HANDLERS` array.

# Setup

Create a Discord application and bot in the Developer Portal. Enable Server Members Intent and Message Content Intent, then invite it with the permissions listed in the README. The bot role must sit above ordinary members for timeouts to succeed.

Copy `.env.example` to `.env`. `DISCORD_BOT_TOKEN` authenticates the bot, while `DISCORD_MOD_LOG_CHANNEL_ID` selects the channel where the bot posts moderation reports. Never commit `.env`.

Set `DISCORD_DEVELOPMENT_GUILD_ID` to one or more comma-separated guild IDs during development so Necord registers future commands immediately in those guilds. Do not set it for the deployed production bot.

Use `npm run dev` for watch mode. Production runs `npm run build` followed by `npm start`. Railway can use the same commands and optionally supplies the documented Railway metadata variables.

# Scam Automod Bot

A dedicated Discord moderation bot built with NestJS, Necord, Discord.js, and TypeScript. It detects bursts of textless image posts across multiple channels, times out the sender, removes their recent messages, and posts an audit report as the bot user.

## Detection policy

- At least two image attachments and no text per qualifying message
- Qualifying messages in three distinct channels within two minutes
- Administrators and members with `Manage Messages` are exempt
- Triggered members receive a 24-hour timeout
- All messages observed from that member in the preceding hour are deleted
- Activity is held only in bounded process memory and is lost on restart

## Setup

### Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/ai-cM2?referralCode=cCeYAQ&utm_medium=integration&utm_source=template&utm_campaign=generic)

Make sure to set these intents on the Discord developer bot page otherwise build will fail!
<img width="2886" height="716" alt="image" src="https://github.com/user-attachments/assets/14c2dd28-703c-4634-9810-0a0b1c3dbdb4" />


### Custom

1. Use Node.js 22.20.0 and run `npm install`.
2. Copy `.env.example` to `.env` and provide `DISCORD_BOT_TOKEN` and `DISCORD_MOD_LOG_CHANNEL_ID`.
3. Enable the Server Members and Message Content privileged intents in the Discord Developer Portal.
4. Grant the bot `View Channel`, `Read Message History`, `Manage Messages`, `Moderate Members`, `Send Messages`, and `Embed Links`. Place its role above members it should moderate.
5. Run `npm run dev` locally or `npm run build && npm start` in production.

The health endpoint is available at `GET /health` on `PORT` (default `3000`).

## Development

```bash
npm run check
npm run create:command -- example "Example command"
npm run create:listener -- example MessageCreate
```

See [`docs/SETUP.md`](docs/SETUP.md), [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md), and [`docs/SCRIPTS.md`](docs/SCRIPTS.md).

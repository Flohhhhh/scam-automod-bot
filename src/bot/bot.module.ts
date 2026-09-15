import { Module } from "@nestjs/common";
import { GatewayIntentBits } from "discord.js";
import { NecordModule } from "necord";
import { EnvService } from "../env/env.service";

@Module({
  imports: [
    NecordModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        token: env.get("DISCORD_BOT_TOKEN"),
        development: env.get("NEST_ENV") === "production" ? undefined : env.get("DISCORD_DEVELOPMENT_GUILD_ID"),
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      }),
    }),
  ],
})
export class BotModule {}

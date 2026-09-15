import { Injectable } from "@nestjs/common";
import { Client, EmbedBuilder, type Message } from "discord.js";
import { EnvService } from "../env/env.service";
import type { ActivityRecord, EnforcementResult } from "./automod.types";

@Injectable()
export class ModerationReporter {
  constructor(
    private readonly client: Client,
    private readonly env: EnvService,
  ) {}

  async send(message: Message<true>, triggerRecords: ActivityRecord[], result: EnforcementResult) {
    const channelId = this.env.get("DISCORD_MOD_LOG_CHANNEL_ID");
    const channel = await this.client.channels.fetch(channelId);
    if (!channel?.isSendable()) throw new Error(`Moderation log channel ${channelId} is unavailable or not sendable`);

    const triggerChannels = [...new Set(triggerRecords.map((record) => record.channelId))]
      .map((id) => `<#${id}>`)
      .join(", ");
    const errors = result.purge.errors.slice(0, 5).join("\n") || "None";
    const embed = new EmbedBuilder()
      .setColor(result.timeout.ok && result.purge.failed === 0 ? 0xd64545 : 0xe39b32)
      .setTitle("Crypto image spam automatically handled")
      .setDescription(`User: ${message.author.tag} (${message.author.id})`)
      .addFields(
        { name: "Guild", value: `${message.guild.name} (${message.guild.id})` },
        { name: "Trigger channels", value: triggerChannels || "Unknown" },
        {
          name: "Messages",
          value: `${result.purge.deleted}/${result.purge.attempted} deleted; ${result.purge.failed} failed`,
        },
        { name: "Timeout", value: result.timeout.status },
        { name: "Deletion errors (up to 5)", value: errors.slice(0, 1024) },
      )
      .setTimestamp();

    await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
  }
}

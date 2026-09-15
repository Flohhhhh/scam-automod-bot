import { Injectable } from "@nestjs/common";
import type { Guild, GuildMember, Message } from "discord.js";
import { AUTOMOD } from "./automod.constants";
import type { ActivityRecord, EnforcementResult, PurgeResult, TimeoutResult } from "./automod.types";

@Injectable()
export class EnforcementService {
  async enforce(message: Message<true>, records: ActivityRecord[]): Promise<EnforcementResult> {
    const timeout = await this.timeoutMember(message.member);
    const purge = await this.purgeMessages(message.guild, records);
    return { timeout, purge };
  }

  async timeoutMember(member: GuildMember | null): Promise<TimeoutResult> {
    if (!member?.moderatable) return { ok: false, status: "not moderatable" };
    try {
      await member.timeout(AUTOMOD.timeoutDurationMs, "Automated action: cross-channel image spam");
      return { ok: true, status: "24-hour timeout applied" };
    } catch (error) {
      return { ok: false, status: `failed: ${this.errorMessage(error)}` };
    }
  }

  async purgeMessages(guild: Guild, records: ActivityRecord[]): Promise<PurgeResult> {
    const result: PurgeResult = { attempted: records.length, deleted: 0, failed: 0, errors: [] };
    const byChannel = new Map<string, string[]>();
    for (const record of records) {
      const ids = byChannel.get(record.channelId) ?? [];
      ids.push(record.messageId);
      byChannel.set(record.channelId, ids);
    }

    for (const [channelId, ids] of byChannel) {
      const channel = guild.channels.cache.get(channelId);
      if (!channel?.isTextBased() || !("bulkDelete" in channel)) {
        result.failed += ids.length;
        result.errors.push(`${channelId}: channel unavailable or unsupported`);
        continue;
      }
      for (let index = 0; index < ids.length; index += 100) {
        await this.deleteChunk(channel, ids.slice(index, index + 100), result);
      }
    }
    return result;
  }

  private async deleteChunk(
    channel: Extract<Guild["channels"]["cache"] extends Map<string, infer T> ? T : never, { bulkDelete: unknown }>,
    ids: string[],
    result: PurgeResult,
  ) {
    if (ids.length === 1) return this.deleteIndividually(channel, ids, result);
    try {
      const deleted = await channel.bulkDelete(ids, true);
      result.deleted += deleted.size;
      result.failed += ids.length - deleted.size;
    } catch (error) {
      result.errors.push(`${channel.id} bulk delete: ${this.errorMessage(error)}`);
      await this.deleteIndividually(channel, ids, result);
    }
  }

  private async deleteIndividually(
    channel: Extract<Guild["channels"]["cache"] extends Map<string, infer T> ? T : never, { bulkDelete: unknown }>,
    ids: string[],
    result: PurgeResult,
  ) {
    for (const id of ids) {
      try {
        await channel.messages.delete(id);
        result.deleted += 1;
      } catch (error) {
        result.failed += 1;
        result.errors.push(`${channel.id}/${id}: ${this.errorMessage(error)}`);
      }
    }
  }

  private errorMessage(error: unknown) {
    return error instanceof Error ? error.message : "unknown error";
  }
}

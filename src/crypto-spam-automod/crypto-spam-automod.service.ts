import { Injectable } from "@nestjs/common";
import { PermissionFlagsBits, type Message } from "discord.js";
import { ActivityLogger } from "../common/logging/activity-logger.service";
import { ActivityStore } from "./activity-store.service";
import { AUTOMOD } from "./automod.constants";
import { EnforcementService } from "./enforcement.service";
import { MessageClassifier } from "./message-classifier.service";
import { ModerationReporter } from "./moderation-reporter.service";

@Injectable()
export class CryptoSpamAutomodService {
  private readonly enforcementLocks = new Set<string>();

  constructor(
    private readonly store: ActivityStore,
    private readonly classifier: MessageClassifier,
    private readonly enforcement: EnforcementService,
    private readonly reporter: ModerationReporter,
    private readonly logger: ActivityLogger,
  ) {}

  async handleMessage(message: Message) {
    if (!message.inGuild() || message.author.bot || this.isStaff(message)) return;

    const now = Date.now();
    this.store.add({
      guildId: message.guildId,
      userId: message.author.id,
      channelId: message.channelId,
      messageId: message.id,
      createdAt: message.createdTimestamp || now,
      qualifying: this.classifier.isQualifyingImageMessage(message),
    });

    const triggerRecords = this.store
      .get(message.guildId, message.author.id, now - AUTOMOD.detectionWindowMs)
      .filter((record) => record.qualifying);
    const distinctChannels = new Set(triggerRecords.map((record) => record.channelId));
    if (
      triggerRecords.length < AUTOMOD.minimumQualifyingMessages ||
      distinctChannels.size < AUTOMOD.minimumDistinctChannels
    ) {
      return;
    }

    const key = ActivityStore.key(message.guildId, message.author.id);
    if (this.enforcementLocks.has(key)) return;
    this.enforcementLocks.add(key);

    try {
      this.logger.triggered(message.guildId, message.author.id, triggerRecords.length, distinctChannels.size);
      const history = this.store.get(message.guildId, message.author.id, now - AUTOMOD.historyWindowMs);
      const result = await this.enforcement.enforce(message, history);
      this.logger.enforced(
        message.guildId,
        message.author.id,
        result.timeout.ok,
        result.purge.deleted,
        result.purge.attempted,
        result.purge.failed,
      );
      try {
        await this.reporter.send(message, triggerRecords, result);
        this.logger.reported(message.guildId, message.author.id);
      } catch (error) {
        this.logger.error("Failed to send moderation report", error);
      }
    } finally {
      this.store.removeUser(message.guildId, message.author.id);
      this.enforcementLocks.delete(key);
    }
  }

  private isStaff(message: Message<true>) {
    return (
      message.member?.permissions.has(PermissionFlagsBits.Administrator) ||
      message.member?.permissions.has(PermissionFlagsBits.ManageMessages) ||
      false
    );
  }
}

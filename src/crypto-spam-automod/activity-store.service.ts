import { Inject, Injectable, Optional } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { ActivityLogger } from "../common/logging/activity-logger.service";
import { AUTOMOD } from "./automod.constants";
import type { ActivityRecord } from "./automod.types";

export interface ActivityStoreOptions {
  historyWindowMs?: number;
  maxPerUser?: number;
  maxTotal?: number;
}

export const ACTIVITY_STORE_OPTIONS = Symbol("ACTIVITY_STORE_OPTIONS");

@Injectable()
export class ActivityStore {
  private readonly recordsByUser = new Map<string, ActivityRecord[]>();
  private totalRecords = 0;
  private readonly historyWindowMs: number;
  private readonly maxPerUser: number;
  private readonly maxTotal: number;

  constructor(
    private readonly logger: ActivityLogger,
    @Optional()
    @Inject(ACTIVITY_STORE_OPTIONS)
    options: ActivityStoreOptions = {},
  ) {
    this.historyWindowMs = options.historyWindowMs ?? AUTOMOD.historyWindowMs;
    this.maxPerUser = options.maxPerUser ?? AUTOMOD.maxMessagesPerUser;
    this.maxTotal = options.maxTotal ?? AUTOMOD.maxTotalMessages;
  }

  static key(guildId: string, userId: string) {
    return `${guildId}:${userId}`;
  }

  add(record: ActivityRecord) {
    const key = ActivityStore.key(record.guildId, record.userId);
    const records = this.recordsByUser.get(key) ?? [];
    records.push(record);
    this.totalRecords += 1;

    while (records.length > this.maxPerUser) {
      records.shift();
      this.totalRecords -= 1;
    }

    this.recordsByUser.set(key, records);
    this.enforceGlobalCap();
  }

  get(guildId: string, userId: string, since = 0) {
    return (this.recordsByUser.get(ActivityStore.key(guildId, userId)) ?? []).filter(
      (record) => record.createdAt >= since,
    );
  }

  removeUser(guildId: string, userId: string) {
    const key = ActivityStore.key(guildId, userId);
    const records = this.recordsByUser.get(key);
    if (!records) return;
    this.totalRecords -= records.length;
    this.recordsByUser.delete(key);
  }

  @Interval(AUTOMOD.cleanupIntervalMs)
  cleanup(now = Date.now()) {
    const before = this.totalRecords;
    const cutoff = now - this.historyWindowMs;
    for (const [key, records] of this.recordsByUser) {
      const retained = records.filter((record) => record.createdAt >= cutoff);
      this.totalRecords -= records.length - retained.length;
      if (retained.length === 0) this.recordsByUser.delete(key);
      else this.recordsByUser.set(key, retained);
    }
    this.logger.cleanup(before - this.totalRecords, this.totalRecords);
  }

  size() {
    return this.totalRecords;
  }

  userCount() {
    return this.recordsByUser.size;
  }

  private enforceGlobalCap() {
    while (this.totalRecords > this.maxTotal) {
      let oldestKey: string | undefined;
      let oldestTimestamp = Number.POSITIVE_INFINITY;
      for (const [key, records] of this.recordsByUser) {
        if (records[0].createdAt < oldestTimestamp) {
          oldestKey = key;
          oldestTimestamp = records[0].createdAt;
        }
      }
      if (!oldestKey) return;
      const records = this.recordsByUser.get(oldestKey);
      records?.shift();
      this.totalRecords -= 1;
      if (records?.length === 0) this.recordsByUser.delete(oldestKey);
    }
  }
}

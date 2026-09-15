export interface ActivityRecord {
  guildId: string;
  userId: string;
  channelId: string;
  messageId: string;
  createdAt: number;
  qualifying: boolean;
}

export interface TimeoutResult {
  ok: boolean;
  status: string;
}

export interface PurgeResult {
  attempted: number;
  deleted: number;
  failed: number;
  errors: string[];
}

export interface EnforcementResult {
  timeout: TimeoutResult;
  purge: PurgeResult;
}

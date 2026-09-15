import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ActivityLogger {
  private readonly logger = new Logger("crypto-spam-automod");

  triggered(guildId: string, userId: string, qualifyingMessages: number, channels: number) {
    this.logger.warn(
      `Triggered guild=${guildId} user=${userId} qualifyingMessages=${qualifyingMessages} channels=${channels}`,
    );
  }

  enforced(guildId: string, userId: string, timeout: boolean, deleted: number, attempted: number, failed: number) {
    this.logger.log(
      `Enforced guild=${guildId} user=${userId} timeout=${timeout} deleted=${deleted}/${attempted} failed=${failed}`,
    );
  }

  cleanup(removed: number, remaining: number) {
    if (removed > 0) this.logger.debug(`Cleanup removed=${removed} remaining=${remaining}`);
  }

  reported(guildId: string, userId: string) {
    this.logger.log(`Report delivered guild=${guildId} user=${userId}`);
  }

  error(message: string, error?: unknown) {
    this.logger.error(message, error instanceof Error ? error.message : undefined);
  }
}

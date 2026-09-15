import { Module } from "@nestjs/common";
import { ActivityStore } from "./activity-store.service";
import { CryptoSpamAutomodService } from "./crypto-spam-automod.service";
import { EnforcementService } from "./enforcement.service";
import { MessageClassifier } from "./message-classifier.service";
import { ModerationReporter } from "./moderation-reporter.service";

@Module({
  providers: [ActivityStore, CryptoSpamAutomodService, EnforcementService, MessageClassifier, ModerationReporter],
  exports: [CryptoSpamAutomodService],
})
export class CryptoSpamAutomodModule {}

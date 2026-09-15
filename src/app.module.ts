import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { BotModule } from "./bot/bot.module";
import { CommandsModule } from "./commands/commands.module";
import { ComponentsModule } from "./components/components.module";
import { CryptoSpamAutomodModule } from "./crypto-spam-automod/crypto-spam-automod.module";
import { EnvModule } from "./env/env.module";
import { ListenersModule } from "./listeners/listeners.module";
import { LoggingModule } from "./common/logging/logging.module";
import { APP_FILTER } from "@nestjs/core";
import { AppExceptionFilter } from "./common/filters/app-exception.filter";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EnvModule,
    BotModule,
    LoggingModule,
    CryptoSpamAutomodModule,
    CommandsModule,
    ListenersModule,
    ComponentsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }],
})
export class AppModule {}

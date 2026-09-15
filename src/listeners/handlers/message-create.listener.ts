import { Injectable } from "@nestjs/common";
import { Events } from "discord.js";
import { Context, type ContextOf, On } from "necord";
import { CryptoSpamAutomodService } from "../../crypto-spam-automod/crypto-spam-automod.service";

@Injectable()
export class MessageCreateListener {
  constructor(private readonly automod: CryptoSpamAutomodService) {}

  @On(Events.MessageCreate)
  async handleMessageCreate(@Context() [message]: ContextOf<Events.MessageCreate>) {
    await this.automod.handleMessage(message);
  }
}

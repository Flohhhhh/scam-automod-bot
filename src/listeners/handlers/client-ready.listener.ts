import { Injectable, Logger } from "@nestjs/common";
import { Events } from "discord.js";
import { Context, type ContextOf, Once } from "necord";

@Injectable()
export class ClientReadyListener {
  private readonly logger = new Logger(ClientReadyListener.name);

  @Once(Events.ClientReady)
  handleClientReady(@Context() [client]: ContextOf<Events.ClientReady>) {
    this.logger.log(`Ready as ${client.user.tag}`);
  }
}

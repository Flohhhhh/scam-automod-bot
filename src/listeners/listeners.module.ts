import { Module, type Provider } from "@nestjs/common";
import { CryptoSpamAutomodModule } from "../crypto-spam-automod/crypto-spam-automod.module";
import { ClientReadyListener } from "./handlers/client-ready.listener";
import { MessageCreateListener } from "./handlers/message-create.listener";

const HANDLERS: Provider[] = [ClientReadyListener, MessageCreateListener];

@Module({ imports: [CryptoSpamAutomodModule], providers: [...HANDLERS] })
export class ListenersModule {}

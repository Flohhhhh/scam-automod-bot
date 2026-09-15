import { ArgumentsHost, Catch, HttpStatus, Injectable, Logger, type ExceptionFilter } from "@nestjs/common";
import { BaseInteraction } from "discord.js";
import { InteractionError } from "../errors/interaction-error";

@Catch()
@Injectable()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  async catch(exception: unknown, host: ArgumentsHost) {
    const message = exception instanceof Error ? exception.stack || exception.message : String(exception);
    this.logger.error(message);

    if (host.getType<string>() === "necord") {
      const [context] = host.getArgs();
      const interaction = Array.isArray(context) ? context[0] : undefined;
      if (interaction instanceof BaseInteraction) await InteractionError.reply(interaction, exception, this.logger);
      return;
    }

    if (host.getType() === "http") {
      const response = host.switchToHttp().getResponse();
      const status =
        typeof (exception as { getStatus?: unknown })?.getStatus === "function"
          ? (exception as { getStatus: () => number }).getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      response.status(status).json({ statusCode: status, message: "Internal server error" });
    }
  }
}

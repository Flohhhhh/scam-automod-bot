import { Logger } from "@nestjs/common";
import { DiscordAPIError, MessageFlags, type BaseInteraction } from "discord.js";

export class InteractionError extends Error {
  private static readonly logger = new Logger(InteractionError.name);

  constructor(
    public readonly userMessage: string,
    public readonly internalMessage?: string,
  ) {
    super(internalMessage || userMessage);
    this.name = "InteractionError";
  }

  static fromError(error: unknown) {
    if (error instanceof InteractionError) return error;
    let userMessage = "Something went wrong.";
    if (error instanceof DiscordAPIError) {
      if (`${error.code}` === "50013") userMessage = "I don't have the required permissions to do that.";
      if (`${error.code}` === "50001") userMessage = "I don't have access to do that.";
      if (`${error.code}` === "10008") userMessage = "That message no longer exists.";
    }
    return new InteractionError(userMessage, error instanceof Error ? error.message : String(error));
  }

  static async reply(interaction: BaseInteraction, error: unknown, logger = InteractionError.logger) {
    if (!interaction.isRepliable()) return;
    const interactionError = InteractionError.fromError(error);
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: interactionError.userMessage });
      } else {
        await interaction.reply({ content: interactionError.userMessage, flags: MessageFlags.Ephemeral });
      }
    } catch (replyError) {
      logger.error("Failed to reply to interaction", replyError);
    }
  }
}

import {
  applyDecorators,
  Injectable,
  SetMetadata,
  UseGuards,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { BaseInteraction, type GuildTextBasedChannel, type PermissionResolvable } from "discord.js";
import { NecordExecutionContext } from "necord";
import { InteractionError } from "../errors/interaction-error";

const KEY = "required_bot_permissions";

@Injectable()
export class RequireBotPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<PermissionResolvable[]>(KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const [interaction] = NecordExecutionContext.create(context).getContext();
    if (!(interaction instanceof BaseInteraction) || !interaction.inGuild()) return true;
    const channel = interaction.channel as GuildTextBasedChannel | null;
    const bot = interaction.guild?.members.me;
    if (!channel || !bot || !channel.permissionsFor(bot)?.has(required)) {
      throw new InteractionError("I lack permission to do that.");
    }
    return true;
  }
}

export const RequiredBotPermission = (...permissions: PermissionResolvable[]) =>
  applyDecorators(UseGuards(RequireBotPermissionGuard), SetMetadata(KEY, permissions));

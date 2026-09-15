import {
  applyDecorators,
  Injectable,
  SetMetadata,
  UseGuards,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { BaseInteraction, type PermissionResolvable } from "discord.js";
import { NecordExecutionContext } from "necord";
import { InteractionError } from "../errors/interaction-error";

const KEY = "required_member_permissions";

@Injectable()
export class RequireMemberPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<PermissionResolvable[]>(KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const [interaction] = NecordExecutionContext.create(context).getContext();
    if (!(interaction instanceof BaseInteraction) || !interaction.inGuild()) return true;
    if (!interaction.memberPermissions?.has(required)) throw new InteractionError("You lack permission to do that.");
    return true;
  }
}

export const RequiredMemberPermission = (...permissions: PermissionResolvable[]) =>
  applyDecorators(UseGuards(RequireMemberPermissionGuard), SetMetadata(KEY, permissions));

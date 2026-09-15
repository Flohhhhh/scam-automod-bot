import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { z } from "zod";
import { EnvSchema } from "./env";
import { EnvService } from "./env.service";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (environment) => {
        const parsed = EnvSchema.safeParse(environment);
        if (!parsed.success) throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
        return parsed.data;
      },
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}

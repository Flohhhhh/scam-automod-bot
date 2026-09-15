import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const snowflake = z.string().regex(/^\d{17,20}$/, "Must be a Discord snowflake ID");

export const EnvSchema = z.object({
  NEST_ENV: z
    .enum(["development", "staging", "production"])
    .optional()
    .default(process.env.NODE_ENV === "development" ? "development" : "production"),
  PORT: z.coerce.number().int().min(1).max(65_535).optional().default(3000),
  DISCORD_BOT_TOKEN: nonEmptyString,
  DISCORD_MOD_LOG_CHANNEL_ID: snowflake,
  DISCORD_DEVELOPMENT_GUILD_ID: nonEmptyString
    .transform((value) => value.split(",").map((id) => id.trim()))
    .pipe(z.array(snowflake).min(1))
    .optional(),
  RAILWAY_PUBLIC_DOMAIN: nonEmptyString.optional(),
  RAILWAY_PRIVATE_DOMAIN: nonEmptyString.optional(),
  RAILWAY_PROJECT_NAME: nonEmptyString.optional(),
  RAILWAY_ENVIRONMENT_NAME: nonEmptyString.optional(),
  RAILWAY_SERVICE_NAME: nonEmptyString.optional(),
  RAILWAY_PROJECT_ID: nonEmptyString.optional(),
  RAILWAY_ENVIRONMENT_ID: nonEmptyString.optional(),
  RAILWAY_SERVICE_ID: nonEmptyString.optional(),
});

export type Env = z.infer<typeof EnvSchema>;

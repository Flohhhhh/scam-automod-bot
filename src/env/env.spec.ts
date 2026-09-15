import { EnvSchema } from "./env";

describe("EnvSchema", () => {
  const valid = {
    DISCORD_BOT_TOKEN: "token",
    DISCORD_MOD_LOG_CHANNEL_ID: "12345678901234567",
  };

  it("applies runtime defaults", () => {
    expect(EnvSchema.parse(valid)).toMatchObject({ NEST_ENV: "production", PORT: 3000 });
  });

  it("validates required Discord IDs", () => {
    expect(() => EnvSchema.parse({ ...valid, DISCORD_MOD_LOG_CHANNEL_ID: "not-an-id" })).toThrow();
  });

  it("parses development guild IDs", () => {
    expect(
      EnvSchema.parse({ ...valid, DISCORD_DEVELOPMENT_GUILD_ID: "12345678901234567, 22345678901234567" })
        .DISCORD_DEVELOPMENT_GUILD_ID,
    ).toEqual(["12345678901234567", "22345678901234567"]);
  });
});

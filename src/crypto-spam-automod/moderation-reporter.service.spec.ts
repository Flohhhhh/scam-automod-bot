import type { Client, Message } from "discord.js";
import type { EnvService } from "../env/env.service";
import { ModerationReporter } from "./moderation-reporter.service";

const message = {
  author: { id: "user", tag: "test-user" },
  guild: { id: "guild", name: "Guild" },
} as Message<true>;
const result = {
  timeout: { ok: true, status: "24-hour timeout applied" },
  purge: { attempted: 3, deleted: 3, failed: 0, errors: [] },
};
const records = [
  { guildId: "guild", userId: "user", channelId: "one", messageId: "1", createdAt: 1, qualifying: true },
];

describe("ModerationReporter", () => {
  const env = { get: jest.fn().mockReturnValue("12345678901234567") } as unknown as EnvService;

  it("sends a mention-safe embed as the bot", async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const client = {
      channels: { fetch: jest.fn().mockResolvedValue({ isSendable: () => true, send }) },
    } as unknown as Client;
    await new ModerationReporter(client, env).send(message, records, result);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ embeds: expect.any(Array), allowedMentions: { parse: [] } }),
    );
  });

  it("rejects an unavailable report channel", async () => {
    const client = { channels: { fetch: jest.fn().mockResolvedValue(null) } } as unknown as Client;
    await expect(new ModerationReporter(client, env).send(message, records, result)).rejects.toThrow(/unavailable/);
  });
});

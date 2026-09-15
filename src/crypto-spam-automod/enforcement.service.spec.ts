import type { Guild, GuildMember } from "discord.js";
import { EnforcementService } from "./enforcement.service";
import type { ActivityRecord } from "./automod.types";

const service = new EnforcementService();
const record = (channelId: string, messageId: string) =>
  ({ guildId: "g", userId: "u", channelId, messageId, createdAt: 1, qualifying: false }) as ActivityRecord;

describe("EnforcementService", () => {
  it("reports members that cannot be moderated and timeout failures", async () => {
    await expect(service.timeoutMember({ moderatable: false } as GuildMember)).resolves.toEqual({
      ok: false,
      status: "not moderatable",
    });
    const member = { moderatable: true, timeout: jest.fn().mockRejectedValue(new Error("role hierarchy")) };
    await expect(service.timeoutMember(member as unknown as GuildMember)).resolves.toEqual({
      ok: false,
      status: "failed: role hierarchy",
    });
  });

  it("uses bulk deletion, individual deletion, fallback, and unavailable-channel accounting", async () => {
    const individuallyDeleted: string[] = [];
    const bulkDelete = jest
      .fn()
      .mockResolvedValueOnce(
        new Map([
          ["1", true],
          ["2", true],
        ]),
      )
      .mockRejectedValueOnce(new Error("missing permission"));
    const makeChannel = (id: string) => ({
      id,
      isTextBased: () => true,
      bulkDelete,
      messages: { delete: jest.fn(async (messageId: string) => individuallyDeleted.push(messageId)) },
    });
    const guild = {
      channels: {
        cache: new Map([
          ["a", makeChannel("a")],
          ["b", makeChannel("b")],
          ["c", makeChannel("c")],
        ]),
      },
    } as unknown as Guild;
    const result = await service.purgeMessages(guild, [
      record("a", "1"),
      record("a", "2"),
      record("b", "3"),
      record("c", "4"),
      record("c", "5"),
      record("missing", "6"),
    ]);
    expect(individuallyDeleted).toEqual(["3", "4", "5"]);
    expect(result).toMatchObject({ attempted: 6, deleted: 5, failed: 1 });
    expect(result.errors).toHaveLength(2);
  });
});

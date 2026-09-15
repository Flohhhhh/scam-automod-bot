import { Collection, PermissionFlagsBits, type Message } from "discord.js";
import type { ActivityLogger } from "../common/logging/activity-logger.service";
import { ActivityStore } from "./activity-store.service";
import { CryptoSpamAutomodService } from "./crypto-spam-automod.service";
import type { EnforcementService } from "./enforcement.service";
import { MessageClassifier } from "./message-classifier.service";
import type { ModerationReporter } from "./moderation-reporter.service";

function fakeMessage(id: string, channelId: string, options: { content?: string; staff?: boolean } = {}) {
  const images = new Collection([
    ["1", { name: "one.png", contentType: "image/png" }],
    ["2", { name: "two.png", contentType: "image/png" }],
  ]);
  return {
    id,
    channelId,
    guildId: "guild",
    createdTimestamp: Date.now(),
    content: options.content ?? "",
    attachments: images,
    author: { id: "user", tag: "test-user", bot: false },
    member: {
      permissions: {
        has: (permission: bigint) => options.staff === true && permission === PermissionFlagsBits.ManageMessages,
      },
    },
    guild: { id: "guild", name: "Guild" },
    inGuild: () => true,
  } as unknown as Message;
}

describe("CryptoSpamAutomodService", () => {
  const activityLogger = {
    cleanup: jest.fn(),
    triggered: jest.fn(),
    enforced: jest.fn(),
    reported: jest.fn(),
    error: jest.fn(),
  } as unknown as ActivityLogger;
  let store: ActivityStore;
  let enforce: jest.Mock;
  let send: jest.Mock;
  let service: CryptoSpamAutomodService;

  beforeEach(() => {
    jest.clearAllMocks();
    store = new ActivityStore(activityLogger);
    enforce = jest.fn().mockResolvedValue({
      timeout: { ok: true, status: "done" },
      purge: { attempted: 4, deleted: 4, failed: 0, errors: [] },
    });
    send = jest.fn().mockResolvedValue(undefined);
    service = new CryptoSpamAutomodService(
      store,
      new MessageClassifier(),
      { enforce } as unknown as EnforcementService,
      { send } as unknown as ModerationReporter,
      activityLogger,
    );
  });

  it("does not trigger in two channels and triggers in the third", async () => {
    await service.handleMessage(fakeMessage("ordinary", "one", { content: "hello" }));
    await service.handleMessage(fakeMessage("image-one", "one"));
    await service.handleMessage(fakeMessage("image-two", "two"));
    expect(enforce).not.toHaveBeenCalled();
    await service.handleMessage(fakeMessage("image-three", "three"));
    expect(enforce).toHaveBeenCalledTimes(1);
    expect(enforce.mock.calls[0][1].map((item: { messageId: string }) => item.messageId)).toEqual([
      "ordinary",
      "image-one",
      "image-two",
      "image-three",
    ]);
    expect(send).toHaveBeenCalledTimes(1);
    expect(activityLogger.reported).toHaveBeenCalledWith("guild", "user");
  });

  it("does not track staff", async () => {
    await service.handleMessage(fakeMessage("staff", "one", { staff: true }));
    expect(store.size()).toBe(0);
  });

  it("prevents duplicate enforcement while an action is running", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    enforce.mockImplementation(async () => {
      await gate;
      return { timeout: { ok: true, status: "done" }, purge: { attempted: 3, deleted: 3, failed: 0, errors: [] } };
    });
    await service.handleMessage(fakeMessage("one", "one"));
    await service.handleMessage(fakeMessage("two", "two"));
    const running = service.handleMessage(fakeMessage("three", "three"));
    await service.handleMessage(fakeMessage("four", "four"));
    expect(enforce).toHaveBeenCalledTimes(1);
    release();
    await running;
  });

  it("isolates report failures", async () => {
    send.mockRejectedValue(new Error("cannot send"));
    await service.handleMessage(fakeMessage("one", "one"));
    await service.handleMessage(fakeMessage("two", "two"));
    await expect(service.handleMessage(fakeMessage("three", "three"))).resolves.toBeUndefined();
    expect(activityLogger.error).toHaveBeenCalledWith("Failed to send moderation report", expect.any(Error));
  });
});

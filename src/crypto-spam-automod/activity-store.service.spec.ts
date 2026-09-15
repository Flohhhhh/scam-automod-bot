import { ActivityLogger } from "../common/logging/activity-logger.service";
import { ActivityStore } from "./activity-store.service";

const logger = { cleanup: jest.fn() } as unknown as ActivityLogger;
const record = (userId: string, messageId: string, createdAt: number) => ({
  guildId: "guild",
  userId,
  channelId: "channel",
  messageId,
  createdAt,
  qualifying: false,
});

describe("ActivityStore", () => {
  beforeEach(() => jest.clearAllMocks());

  it("enforces per-user and global caps with oldest-first eviction", () => {
    const store = new ActivityStore(logger, { historyWindowMs: 100, maxPerUser: 2, maxTotal: 3 });
    store.add(record("one", "1", 1));
    store.add(record("one", "2", 2));
    store.add(record("one", "3", 3));
    expect(store.get("guild", "one").map((item) => item.messageId)).toEqual(["2", "3"]);
    store.add(record("two", "4", 4));
    store.add(record("three", "5", 5));
    expect(store.size()).toBe(3);
    expect(store.get("guild", "one").map((item) => item.messageId)).toEqual(["3"]);
  });

  it("expires records and removes empty user keys", () => {
    const store = new ActivityStore(logger, { historyWindowMs: 100 });
    store.add(record("one", "1", 100));
    store.add(record("two", "2", 250));
    store.cleanup(300);
    expect(store.get("guild", "one")).toEqual([]);
    expect(store.get("guild", "two")).toHaveLength(1);
    expect(store.userCount()).toBe(1);
    expect(logger.cleanup).toHaveBeenCalledWith(1, 1);
  });
});

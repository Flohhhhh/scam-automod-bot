export const AUTOMOD = Object.freeze({
  minimumImagesPerMessage: 2,
  minimumQualifyingMessages: 3,
  minimumDistinctChannels: 3,
  detectionWindowMs: 2 * 60 * 1000,
  historyWindowMs: 60 * 60 * 1000,
  timeoutDurationMs: 24 * 60 * 60 * 1000,
  cleanupIntervalMs: 5 * 60 * 1000,
  maxMessagesPerUser: 200,
  maxTotalMessages: 50_000,
});

import {
  countActiveSessions,
  pruneSessions,
} from "./presenceCore.js";

const sessions = new Map();

export function createDevPresenceStore() {
  return {
    async heartbeat(visitorId) {
      sessions.set(visitorId, Date.now());
      pruneSessions(sessions);
    },
    async getCount() {
      pruneSessions(sessions);
      return countActiveSessions(sessions);
    },
  };
}

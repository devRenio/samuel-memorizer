import {
  countActiveSessions,
  pruneSessions,
  pruneUserActivity,
} from "./presenceCore.js";

const sessions = new Map();
const userActivity = new Map();

export function createDevPresenceStore() {
  return {
    async heartbeat(visitorId, userid = "") {
      const now = Date.now();
      sessions.set(visitorId, now);
      pruneSessions(sessions);
      if (userid) {
        userActivity.set(userid, now);
        pruneUserActivity(userActivity);
      }
    },
    async getCount() {
      pruneSessions(sessions);
      return countActiveSessions(sessions);
    },
    async getUserActivity() {
      pruneUserActivity(userActivity);
      return Object.fromEntries(userActivity);
    },
  };
}

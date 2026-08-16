import {
  countActiveSessions,
  handlePresenceRequest,
  jsonResponse,
  parseAllowOrigins,
  pruneSessions,
  pruneUserActivity,
} from "../server/presenceCore.js";

export class PresenceCounter {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = null;
    this.userActivity = null;
  }

  async loadSessions() {
    if (this.sessions) return this.sessions;

    const stored = await this.state.storage.get("sessions");
    this.sessions = new Map();
    if (stored && typeof stored === "object") {
      for (const [key, ts] of Object.entries(stored)) {
        if (typeof ts === "number") {
          this.sessions.set(key, ts);
        }
      }
    }
    return this.sessions;
  }

  async loadUserActivity() {
    if (this.userActivity) return this.userActivity;

    const stored = await this.state.storage.get("userActivity");
    this.userActivity = new Map();
    if (stored && typeof stored === "object") {
      for (const [key, ts] of Object.entries(stored)) {
        if (typeof ts === "number") {
          this.userActivity.set(key, ts);
        }
      }
    }
    return this.userActivity;
  }

  async saveSessions(sessions) {
    await this.state.storage.put("sessions", Object.fromEntries(sessions));
  }

  async saveUserActivity(activity) {
    await this.state.storage.put("userActivity", Object.fromEntries(activity));
  }

  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (pathname === "/user-activity" && request.method === "GET") {
      const activity = await this.loadUserActivity();
      pruneUserActivity(activity);
      await this.saveUserActivity(activity);
      return jsonResponse({ activity: Object.fromEntries(activity) });
    }

    const store = {
      heartbeat: async (visitorId, userid = "") => {
        const now = Date.now();
        const sessions = await this.loadSessions();
        sessions.set(visitorId, now);
        pruneSessions(sessions);
        await this.saveSessions(sessions);

        if (userid) {
          const activity = await this.loadUserActivity();
          activity.set(userid, now);
          pruneUserActivity(activity);
          await this.saveUserActivity(activity);
        }
      },
      getCount: async () => {
        const sessions = await this.loadSessions();
        pruneSessions(sessions);
        await this.saveSessions(sessions);
        return countActiveSessions(sessions);
      },
    };

    return handlePresenceRequest(request, store, {
      allowOrigins: parseAllowOrigins(this.env.JBCH_CORS_ORIGINS),
    });
  }
}

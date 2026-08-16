import {
  countActiveSessions,
  handlePresenceRequest,
  parseAllowOrigins,
  pruneSessions,
} from "../server/presenceCore.js";

export class PresenceCounter {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = null;
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

  async saveSessions(sessions) {
    await this.state.storage.put("sessions", Object.fromEntries(sessions));
  }

  async fetch(request) {
    const store = {
      heartbeat: async (visitorId) => {
        const sessions = await this.loadSessions();
        sessions.set(visitorId, Date.now());
        pruneSessions(sessions);
        await this.saveSessions(sessions);
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

import { handleBffRequest } from "../server/jbchBffCore.js";
import { PresenceCounter } from "./PresenceCounter.js";

export { PresenceCounter };

function parseAllowOrigins(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/presence")) {
      const id = env.PRESENCE.idFromName("global");
      const stub = env.PRESENCE.get(id);
      return stub.fetch(request);
    }

    if (url.pathname.startsWith("/api/jbch")) {
      return handleBffRequest(request, env, {
        allowOrigins: parseAllowOrigins(env.JBCH_CORS_ORIGINS),
        secure: true,
        presenceNamespace: env.PRESENCE,
      });
    }

    return new Response("Not found", { status: 404 });
  },
};

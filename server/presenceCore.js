export const PRESENCE_WINDOW_MS = 210_000;
export const PRUNE_AGE_MS = 480_000;

export function validateVisitorId(id) {
  return (
    typeof id === "string" &&
    id.length >= 8 &&
    id.length <= 64 &&
    /^[a-zA-Z0-9_-]+$/.test(id)
  );
}

export function pruneSessions(sessions, now = Date.now()) {
  for (const [key, ts] of sessions) {
    if (typeof ts !== "number" || now - ts > PRUNE_AGE_MS) {
      sessions.delete(key);
    }
  }
}

export function countActiveSessions(sessions, now = Date.now()) {
  let count = 0;
  for (const ts of sessions.values()) {
    if (typeof ts === "number" && now - ts < PRESENCE_WINDOW_MS) {
      count += 1;
    }
  }
  return count;
}

export function parseAllowOrigins(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function presenceCorsHeaders(origin, allowOrigins) {
  const allowed = allowOrigins.length > 0 ? allowOrigins : [origin];
  const match =
    origin && allowed.some((item) => item === origin || item === "*")
      ? origin
      : (allowed[0] ?? "");

  if (!match) return {};

  return {
    "Access-Control-Allow-Origin": match,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

export async function handlePresenceRequest(request, store, options = {}) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  const origin = request.headers.get("Origin") ?? "";
  const allowOrigins = options.allowOrigins ?? [];
  const cors = presenceCorsHeaders(origin, allowOrigins);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    let response;

    if (pathname.endsWith("/heartbeat") && request.method === "POST") {
      const body = await request.json().catch(() => null);
      const visitorId = String(body?.visitorId ?? "").trim();
      if (!validateVisitorId(visitorId)) {
        response = jsonResponse({ error: "유효하지 않은 visitorId입니다." }, 400);
      } else {
        await store.heartbeat(visitorId);
        response = jsonResponse({ ok: true });
      }
    } else if (pathname.endsWith("/count") && request.method === "GET") {
      const count = await store.getCount();
      response = jsonResponse({ count });
    } else {
      response = jsonResponse({ error: "Not found" }, 404);
    }

    for (const [key, value] of Object.entries(cors)) {
      response.headers.set(key, value);
    }
    return response;
  } catch (err) {
    const response = jsonResponse(
      { error: err.message || "서버 오류" },
      500,
    );
    for (const [key, value] of Object.entries(cors)) {
      response.headers.set(key, value);
    }
    return response;
  }
}

import { getPresenceBase, isPresenceConfigured } from "./presenceConfig";

const VISITOR_ID_KEY = "samuel_presence_visitor_id";

function createVisitorId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function getPresenceVisitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_ID_KEY)?.trim();
    if (existing) return existing;
    const created = createVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, created);
    return created;
  } catch {
    return createVisitorId();
  }
}

async function parseResponse(res) {
  const data = await res.json().catch(() => null);
  if (!data) {
    throw new Error("서버 응답을 해석할 수 없습니다.");
  }
  if (!res.ok) {
    throw new Error(data.error || `요청 실패 (${res.status})`);
  }
  return data;
}

async function presenceFetch(path, options = {}) {
  if (!isPresenceConfigured()) {
    throw new Error("접속자 수 API 설정이 없습니다.");
  }

  const url = `${getPresenceBase()}${path}`;
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
  } catch (err) {
    if (err?.name === "TypeError") {
      throw new Error("네트워크 오류입니다.");
    }
    throw err;
  }

  return parseResponse(res);
}

export async function presenceHeartbeat() {
  await presenceFetch("/heartbeat", {
    method: "POST",
    body: JSON.stringify({ visitorId: getPresenceVisitorId() }),
  });
}

export async function presenceFetchCount() {
  const data = await presenceFetch("/count", { method: "GET" });
  return typeof data.count === "number" ? data.count : 0;
}

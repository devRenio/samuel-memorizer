import { PROD_JBCH_BFF_URL } from "../constants/bff";

/** 접속자 수 API — dev: Vite 미들웨어, prod: Worker Durable Object */

export function getPresenceBase() {
  if (import.meta.env.DEV) return "/api/presence";

  const bff = import.meta.env.VITE_JBCH_BFF_URL?.trim() || PROD_JBCH_BFF_URL;
  const base = bff.replace(/\/api\/jbch\/?$/, "");
  if (base) return `${base}/api/presence`;
  return "";
}

export function isPresenceConfigured() {
  return Boolean(getPresenceBase());
}

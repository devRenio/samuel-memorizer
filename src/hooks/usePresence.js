import { useCallback, useEffect, useRef, useState } from "react";
import { isPresenceConfigured } from "../lib/presenceConfig";
import { presenceFetchCount, presenceHeartbeat } from "../lib/presenceApi";

const HEARTBEAT_MS = 150_000;

export function usePresence({ userid = "" } = {}) {
  const [status, setStatus] = useState("disabled");
  const [count, setCount] = useState(0);
  const useridRef = useRef("");

  useEffect(() => {
    useridRef.current = String(userid ?? "")
      .trim()
      .toLowerCase();
  }, [userid]);

  const refreshCount = useCallback(async () => {
    if (!isPresenceConfigured()) return;
    try {
      const next = await presenceFetchCount();
      setCount(next);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  const ping = useCallback(async () => {
    if (!isPresenceConfigured()) return;
    try {
      await presenceHeartbeat(useridRef.current);
      await refreshCount();
    } catch {
      setStatus("error");
    }
  }, [refreshCount]);

  useEffect(() => {
    if (!isPresenceConfigured()) {
      setStatus("disabled");
      return undefined;
    }

    let cancelled = false;
    setStatus("loading");

    async function start() {
      try {
        await presenceHeartbeat(useridRef.current);
        if (cancelled) return;
        const next = await presenceFetchCount();
        if (cancelled) return;
        setCount(next);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    start();
    const timer = setInterval(() => {
      if (!cancelled) ping();
    }, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [ping, userid]);

  return { status, count, refreshCount };
}

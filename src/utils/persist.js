import { useEffect, useState } from "react";

const PREFIX = "business-os:";

function readLocal(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently, app still works in-memory
  }
}

/**
 * Drop-in replacement for useState that also persists to localStorage,
 * so refreshing the page (or redeploying) never loses data entered in
 * the browser. This keeps the app fully working with zero backend —
 * connect Supabase later (see src/lib/supabaseClient.js) for multi-device sync.
 */
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => readLocal(key, initialValue));
  useEffect(() => {
    writeLocal(key, state);
  }, [key, state]);
  return [state, setState];
}

export function clearAllLocalData() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* noop */
  }
}

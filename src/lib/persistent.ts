import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store. The server snapshot is always `fallback`, so
 * hydration never mismatches; the client re-renders with the saved value.
 * Survives private mode / blocked storage by falling back to memory.
 */
export function createPersistentStore<T>(key: string, fallback: T, parse: (raw: unknown) => T | null) {
  let value: T | undefined;
  const listeners = new Set<() => void>();

  const load = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) return parse(JSON.parse(raw)) ?? fallback;
    } catch {
      /* storage unavailable or corrupt */
    }
    return fallback;
  };

  const get = (): T => (value ??= load());

  const set = (next: T | ((prev: T) => T)) => {
    value = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* keep in memory only */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        value = load();
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const useValue = () => useSyncExternalStore(subscribe, get, () => fallback);

  return { get, set, useValue };
}

/* ───────── App stores ───────── */

export interface Scores {
  X: number;
  O: number;
  draws: number;
}

const ZERO: Scores = { X: 0, O: 0, draws: 0 };
const count = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0);

export const scoresStore = createPersistentStore<Scores>("wood-gear:scores:v1", ZERO, (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return { X: count(r.X), O: count(r.O), draws: count(r.draws) };
});

export const mutedStore = createPersistentStore<boolean>("wood-gear:muted:v1", false, (raw) =>
  typeof raw === "boolean" ? raw : null,
);

export const resetScores = () => scoresStore.set(ZERO);
export const recordResult = (result: "X" | "O" | "draw") =>
  scoresStore.set((s) => (result === "draw" ? { ...s, draws: s.draws + 1 } : { ...s, [result]: s[result] + 1 }));

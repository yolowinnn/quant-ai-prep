"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ProgressState = {
  solved: Set<string>;
  starred: Set<string>;
  ready: boolean;
  toggleSolved: (id: string) => void;
  toggleStarred: (id: string) => void;
  isSolved: (id: string) => boolean;
  isStarred: (id: string) => boolean;
  reset: () => void;
};

const KEY = "quant-ai-prep:progress:v1";

const ProgressContext = createContext<ProgressState | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSolved(new Set(parsed.solved ?? []));
        setStarred(new Set(parsed.starred ?? []));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  // Persist whenever either set changes — but only after the initial load has
  // run, so the empty initial state can never clobber previously stored data.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ solved: [...solved], starred: [...starred] })
      );
    } catch {
      /* storage may be unavailable */
    }
  }, [solved, starred, ready]);

  const toggleSolved = useCallback((id: string) => {
    setSolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: "run-points", points: 3, source: "quant" }, "*"); } catch (e) {}
      }
      return next;
    });
  }, []);

  const toggleStarred = useCallback((id: string) => {
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSolved(new Set());
    setStarred(new Set());
  }, []);

  const value = useMemo<ProgressState>(
    () => ({
      solved,
      starred,
      ready,
      toggleSolved,
      toggleStarred,
      isSolved: (id) => solved.has(id),
      isStarred: (id) => starred.has(id),
      reset,
    }),
    [solved, starred, ready, toggleSolved, toggleStarred, reset]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

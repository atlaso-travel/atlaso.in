"use client";
import { useState, useEffect } from "react";

const KEY = "atlaso_saved";

export function useSavedOperators() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSavedIds(JSON.parse(raw));
    } catch {}
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return { savedIds, toggleSave };
}

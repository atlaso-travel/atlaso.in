"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "atlaso_comparisons";

export type SavedComparison = {
  id: string;
  name: string;
  savedAt: string;
  packageIds: string[];
};

export function useSavedComparisons() {
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setComparisons(JSON.parse(raw));
    } catch {}
  }, []);

  const saveComparison = useCallback((name: string, packageIds: string[]) => {
    const entry: SavedComparison = {
      id: Date.now().toString(),
      name,
      savedAt: new Date().toISOString(),
      packageIds,
    };
    setComparisons((prev) => {
      const next = [entry, ...prev];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const removeComparison = useCallback((id: string) => {
    setComparisons((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setComparisons([]);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }, []);

  return { comparisons, saveComparison, removeComparison, clearAll };
}

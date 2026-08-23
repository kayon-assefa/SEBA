import { useCallback, useEffect, useState } from "react";

// Feature #55 - recently viewed/edited products (local, per-browser)
const KEY = "products_recently_viewed_v1";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setIds(raw ? JSON.parse(raw) : []);
    } catch {
      setIds([]);
    }
  }, []);

  const markViewed = useCallback((id: string) => {
    setIds((current) => {
      const next = [id, ...current.filter((existing) => existing !== id)].slice(
        0,
        MAX_ITEMS
      );
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recentlyViewedIds: ids, markViewed };
}

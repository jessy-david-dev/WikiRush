"use client";

import { useEffect, useState } from "react";

const KEY = "wikirush_search_allowed";

export function useSearchAllowed() {
  const [allowed, setAllowed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(KEY) === "true";
  });

  function toggle() {
    setAllowed((prev) => {
      const next = !prev;
      localStorage.setItem(KEY, String(next));
      return next;
    });
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        if (!allowed) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [allowed]);

  return { allowed, toggle };
}

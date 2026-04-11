"use client";

import { useEffect, useState } from "react";

const KEY = "wikirush_search_allowed";

// Pour les modes solo/blitz : état local via localStorage + blocage Ctrl+F
export function useSearchAllowed() {
  const [allowed, setAllowed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(KEY) === "true";
  });

  useCtrlFBlock(allowed);

  function toggle() {
    setAllowed((prev) => {
      const next = !prev;
      localStorage.setItem(KEY, String(next));
      return next;
    });
  }

  return { allowed, toggle };
}

// Pour le mode multi : blocage Ctrl+F basé sur room.searchAllowed (vérité côté serveur)
export function useCtrlFBlock(allowed: boolean) {
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
}

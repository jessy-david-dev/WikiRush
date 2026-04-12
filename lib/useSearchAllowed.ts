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

// Pour le mode multi : blocage Ctrl+F + DevTools basé sur room.searchAllowed (vérité côté serveur)
export function useCtrlFBlock(allowed: boolean) {
  useEffect(() => {
    if (allowed) return;

    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      // Ctrl+F (recherche)
      if (ctrl && e.key === "f") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Raccourcis DevTools : F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === "F12" ||
        (ctrl && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) ||
        (ctrl && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
    };
  }, [allowed]);
}

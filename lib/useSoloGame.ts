"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { fetchArticle, pickTwoArticles, normalizeTitle } from "./wiki";
import { useTimer } from "./useTimer";
import { saveSession, clearSession } from "./session";
import type { Puzzle } from "./types";

export type SoloPhase = "setup" | "playing" | "won";

export function useSoloGame() {
  const timer = useTimer();

  const clicksRef = useRef(0);
  const [clicksDisplay, setClicksDisplay] = useState(0);
  const pathRef = useRef<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const timerStartedRef = useRef(false);
  const gameEndedRef = useRef(false);
  const loadingRef = useRef(false);

  const [html, setHtml] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<SoloPhase>("setup");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadArticle(t: string): Promise<string | null> {
    setLoadError(null);
    setLoading(true);
    loadingRef.current = true;
    const art = await fetchArticle(t);
    setLoading(false);
    loadingRef.current = false;
    if (!art) { setLoadError(`Impossible de charger "${t}".`); return null; }
    setHtml(art.html);
    setTitle(art.title);
    return art.title;
  }

  async function start() {
    setLoading(true);
    clicksRef.current = 0; setClicksDisplay(0);
    pathRef.current = []; setHistory([]);
    timerStartedRef.current = false;
    gameEndedRef.current = false;
    timer.reset();
    setLoadError(null);

    const p = await pickTwoArticles();
    setPuzzle(p);
    const canonical = await loadArticle(p.start);
    if (!canonical) return;
    pathRef.current = [canonical];
    setHistory([canonical]);
    setPhase("playing");
    saveSession({ screen: "solo", soloPuzzle: p, soloHistory: [canonical], soloClicks: 0 });
  }

  const navigate = useCallback(async (t: string) => {
    if (loadingRef.current || gameEndedRef.current) return;
    clicksRef.current += 1;
    setClicksDisplay(clicksRef.current);
    if (!timerStartedRef.current) { timer.start(); timerStartedRef.current = true; }

    const canonical = await loadArticle(t);
    if (!canonical) return;
    const newPath = [...pathRef.current, canonical];
    pathRef.current = newPath;
    setHistory(newPath);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (puzzle && normalizeTitle(canonical) === normalizeTitle(puzzle.target)) {
      timer.stop();
      gameEndedRef.current = true;
      setPhase("won");
      clearSession();
    } else {
      saveSession({ screen: "solo", soloPuzzle: puzzle ?? undefined, soloHistory: newPath, soloClicks: clicksRef.current });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle]);

  const goBack = useCallback(async () => {
    if (loadingRef.current || gameEndedRef.current || pathRef.current.length <= 1) return;
    clicksRef.current += 1;
    setClicksDisplay(clicksRef.current);
    if (!timerStartedRef.current) { timer.start(); timerStartedRef.current = true; }

    const newPath = pathRef.current.slice(0, -1);
    const canonical = await loadArticle(newPath[newPath.length - 1]);
    if (!canonical) return;
    pathRef.current = newPath;
    setHistory(newPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset() {
    timer.reset();
    clicksRef.current = 0; setClicksDisplay(0);
    pathRef.current = []; setHistory([]);
    timerStartedRef.current = false;
    gameEndedRef.current = false;
    setHtml(""); setTitle("");
    setPuzzle(null);
    setPhase("setup");
    setLoadError(null);
    clearSession();
  }

  // Expose une fonction pour restaurer une session sauvegardée
  async function restore(savedPuzzle: Puzzle, savedHistory: string[], savedClicks: number) {
    setPuzzle(savedPuzzle);
    clicksRef.current = savedClicks; setClicksDisplay(savedClicks);
    const lastTitle = savedHistory[savedHistory.length - 1];
    const canonical = await loadArticle(lastTitle);
    if (!canonical) return false;
    pathRef.current = savedHistory;
    setHistory(savedHistory);
    timerStartedRef.current = false;
    gameEndedRef.current = false;
    setPhase("playing");
    return true;
  }

  return {
    phase, puzzle, html, title, loading, loadError, history,
    clicks: clicksDisplay, elapsed: timer.elapsed,
    canGoBack: pathRef.current.length > 1,
    start, navigate, goBack, reset, restore,
    retryLoad: () => title && loadArticle(title),
  };
}

export function useSoloKeyboard(
  active: boolean,
  goBack: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "Backspace" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goBack]);
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { fetchArticle, pickTwoArticles, normalizeTitle } from "./wiki";

const BLITZ_DURATION = 120; // 2 minutes

export type BlitzPhase = "setup" | "playing" | "won" | "lost";

export function useBlitzGame() {
  const [phase, setPhase] = useState<BlitzPhase>("setup");
  const [html, setHtml] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(BLITZ_DURATION);
  const [clicks, setClicks] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [puzzle, setPuzzle] = useState<{ start: string; target: string } | null>(null);

  const clicksRef = useRef(0);
  const pathRef = useRef<string[]>([]);
  const loadingRef = useRef(false);
  const endedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  function stopTimer() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  function startTimer() {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const left = Math.max(0, BLITZ_DURATION - elapsed);
      setTimeLeft(left);
      if (left <= 0 && !endedRef.current) {
        endedRef.current = true;
        stopTimer();
        setPhase("lost");
        saveGame(false, pathRef.current, clicksRef.current, BLITZ_DURATION);
      }
    }, 100);
  }

  useEffect(() => () => stopTimer(), []);

  async function saveGame(won: boolean, path: string[], clicks: number, timeSeconds: number) {
    if (!puzzle) return;
    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "blitz",
        startArticle: puzzle.start,
        targetArticle: puzzle.target,
        path,
        clicks,
        timeSeconds: BLITZ_DURATION - timeLeft,
        won,
      }),
    }).catch(() => {});
  }

  async function loadArticle(t: string) {
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
    stopTimer();
    clicksRef.current = 0; setClicks(0);
    pathRef.current = []; setHistory([]);
    endedRef.current = false;
    setTimeLeft(BLITZ_DURATION);
    setLoadError(null);

    const p = await pickTwoArticles();
    setPuzzle(p);
    const canonical = await loadArticle(p.start);
    if (!canonical) return;

    pathRef.current = [canonical];
    setHistory([canonical]);
    setPhase("playing");
    startTimer();
  }

  const navigate = useCallback(async (t: string) => {
    if (loadingRef.current || endedRef.current) return;
    clicksRef.current += 1;
    setClicks(clicksRef.current);

    const canonical = await loadArticle(t);
    if (!canonical) return;

    const newPath = [...pathRef.current, canonical];
    pathRef.current = newPath;
    setHistory(newPath);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (puzzle && normalizeTitle(canonical) === normalizeTitle(puzzle.target)) {
      endedRef.current = true;
      stopTimer();
      setPhase("won");
      saveGame(true, newPath, clicksRef.current, timeLeft);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle, timeLeft]);

  function reset() {
    stopTimer();
    endedRef.current = false;
    clicksRef.current = 0; setClicks(0);
    pathRef.current = []; setHistory([]);
    setHtml(""); setTitle("");
    setTimeLeft(BLITZ_DURATION);
    setPuzzle(null);
    setPhase("setup");
    setLoadError(null);
  }

  return {
    phase, puzzle, html, title, loading, loadError,
    timeLeft, clicks, history,
    canGoBack: false, // pas de retour en blitz
    start, navigate, reset,
    retryLoad: () => title && loadArticle(title),
  };
}

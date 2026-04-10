"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { fetchArticle, pickTwoArticles } from "./wiki";

const BLITZ_DURATION = 120; // 2 minutes en secondes

export type BlitzPhase = "setup" | "playing" | "ended";

export function useBlitzGame() {
  const [phase, setPhase] = useState<BlitzPhase>("setup");
  const [html, setHtml] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(BLITZ_DURATION);
  const [clicks, setClicks] = useState(0);
  const [visited, setVisited] = useState<string[]>([]); // articles uniques

  const clicksRef = useRef(0);
  const visitedRef = useRef<Set<string>>(new Set());
  const visitedListRef = useRef<string[]>([]);
  const loadingRef = useRef(false);
  const endedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  function startTimer() {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const left = Math.max(0, BLITZ_DURATION - elapsed);
      setTimeLeft(left);
      if (left <= 0) endGame();
    }, 200);
  }

  function endGame() {
    if (endedRef.current) return;
    endedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("ended");
    // Sauvegarder
    fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "blitz",
        startArticle: visitedListRef.current[0] ?? "",
        targetArticle: "",
        path: visitedListRef.current,
        clicks: clicksRef.current,
        timeSeconds: BLITZ_DURATION,
        won: true,
      }),
    }).catch(() => {});
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

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
    clicksRef.current = 0; setClicks(0);
    visitedRef.current = new Set();
    visitedListRef.current = [];
    endedRef.current = false;
    setTimeLeft(BLITZ_DURATION);
    setVisited([]);
    setLoadError(null);

    const { start: startArticle } = await pickTwoArticles();
    const canonical = await loadArticle(startArticle);
    if (!canonical) return;

    visitedRef.current.add(canonical);
    visitedListRef.current = [canonical];
    setVisited([canonical]);
    setPhase("playing");
    startTimer();
  }

  const navigate = useCallback(async (t: string) => {
    if (loadingRef.current || endedRef.current) return;
    clicksRef.current += 1;
    setClicks(clicksRef.current);

    const canonical = await loadArticle(t);
    if (!canonical) return;

    if (!visitedRef.current.has(canonical)) {
      visitedRef.current.add(canonical);
      visitedListRef.current = [...visitedListRef.current, canonical];
      setVisited([...visitedListRef.current]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    endedRef.current = false;
    clicksRef.current = 0; setClicks(0);
    visitedRef.current = new Set();
    visitedListRef.current = [];
    setVisited([]);
    setHtml(""); setTitle("");
    setTimeLeft(BLITZ_DURATION);
    setPhase("setup");
    setLoadError(null);
  }

  return {
    phase, html, title, loading, loadError,
    timeLeft, clicks, visited,
    start, navigate, reset,
    retryLoad: () => title && loadArticle(title),
  };
}

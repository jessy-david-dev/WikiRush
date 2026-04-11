"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { fetchArticle, normalizeTitle } from "./wiki";
import { useTimer } from "./useTimer";

export type DailyPhase =
  | "loading"
  | "playing"
  | "won"
  | "gave_up"
  | "already_played";

export type DailyPuzzleInfo = {
  id: string;
  date: string;
  startArticle: string;
  targetArticle: string;
};

export type DailyResult = {
  clicks: number;
  timeSeconds: number;
  won: boolean;
  path: string[];
};

export function useDailyGame() {
  const timer = useTimer();
  const [phase, setPhase] = useState<DailyPhase>("loading");
  const [puzzle, setPuzzle] = useState<DailyPuzzleInfo | null>(null);
  const [myResult, setMyResult] = useState<DailyResult | null>(null);

  const [html, setHtml] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const clicksRef = useRef(0);
  const [clicks, setClicks] = useState(0);
  const pathRef = useRef<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const timerStartedRef = useRef(false);
  const gameEndedRef = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    fetch("/api/daily")
      .then((r) => r.json())
      .then(
        async (data: {
          puzzle: DailyPuzzleInfo;
          alreadyPlayed: boolean;
          myResult: DailyResult | null;
        }) => {
          setPuzzle(data.puzzle);
          if (data.alreadyPlayed && data.myResult) {
            setMyResult(data.myResult);
            setPhase("already_played");
            return;
          }
          // Charger l'article de départ
          const art = await fetchArticle(data.puzzle.startArticle);
          if (!art) {
            setLoadError("Impossible de charger l'article de départ.");
            return;
          }
          setHtml(art.html);
          setTitle(art.title);
          pathRef.current = [art.title];
          setHistory([art.title]);
          setPhase("playing");
        },
      )
      .catch(() => setLoadError("Impossible de charger le défi du jour."));
  }, []);

  async function loadArticle(t: string) {
    setLoadError(null);
    setLoading(true);
    loadingRef.current = true;
    const art = await fetchArticle(t);
    setLoading(false);
    loadingRef.current = false;
    if (!art) {
      setLoadError(`Impossible de charger "${t}".`);
      return null;
    }
    setHtml(art.html);
    setTitle(art.title);
    return art.title;
  }

  async function submitResult(won: boolean) {
    if (!puzzle) return;
    const result: DailyResult = {
      clicks: clicksRef.current,
      timeSeconds: timer.elapsed,
      won,
      path: pathRef.current,
    };
    setMyResult(result);
    await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        puzzleId: puzzle.id,
        ...result,
        path: result.path,
      }),
    }).catch(() => {});
  }

  const navigate = useCallback(
    async (t: string) => {
      if (loadingRef.current || gameEndedRef.current) return;
      clicksRef.current += 1;
      setClicks(clicksRef.current);
      if (!timerStartedRef.current) {
        timer.start();
        timerStartedRef.current = true;
      }

      const canonical = await loadArticle(t);
      if (!canonical) return;
      const newPath = [...pathRef.current, canonical];
      pathRef.current = newPath;
      setHistory(newPath);
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (
        puzzle &&
        normalizeTitle(canonical) === normalizeTitle(puzzle.targetArticle)
      ) {
        timer.stop();
        gameEndedRef.current = true;
        setPhase("won");
        await submitResult(true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [puzzle],
  );

  const goBack = useCallback(async () => {
    if (
      loadingRef.current ||
      gameEndedRef.current ||
      pathRef.current.length <= 1
    )
      return;
    clicksRef.current += 1;
    setClicks(clicksRef.current);
    if (!timerStartedRef.current) {
      timer.start();
      timerStartedRef.current = true;
    }
    const newPath = pathRef.current.slice(0, -1);
    const canonical = await loadArticle(newPath[newPath.length - 1]);
    if (!canonical) return;
    pathRef.current = newPath;
    setHistory(newPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function giveUp() {
    timer.stop();
    gameEndedRef.current = true;
    setPhase("gave_up");
    await submitResult(false);
  }

  return {
    phase,
    puzzle,
    myResult,
    html,
    title,
    loading,
    loadError,
    history,
    clicks,
    elapsed: timer.elapsed,
    canGoBack: pathRef.current.length > 1,
    navigate,
    goBack,
    giveUp,
    retryLoad: () => title && loadArticle(title),
  };
}

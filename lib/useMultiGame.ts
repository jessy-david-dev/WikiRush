"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  fetchArticle,
  pickTwoArticles,
  prefetchArticle,
  POLL_INTERVAL,
  COUNTDOWN_DURATION,
} from "./wiki";
import { useTimer } from "./useTimer";
import { saveSession, clearSession } from "./session";
import type { Room } from "../app/api/rooms/route";

export function useMultiGame() {
  const timer = useTimer();

  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const clicksRef = useRef(0);
  const [clicksDisplay, setClicksDisplay] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const historyRef = useRef<string[]>([]);
  const [html, setHtml] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const timerStartedRef = useRef(false);

  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPhaseRef = useRef<string | null>(null);
  const prevRoundRef = useRef(0);

  // Article loading

  async function loadArticle(t: string): Promise<string | null> {
    setLoading(true);
    loadingRef.current = true;
    setLoadError(null);
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

  // Countdown

  function startCountdown(start: number) {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const tick = () => {
      const rem = Math.ceil((COUNTDOWN_DURATION - (Date.now() - start)) / 1000);
      setCountdown(rem <= 0 ? 0 : rem);
    };
    tick();
    countdownRef.current = setInterval(tick, 200);
  }

  function stopCountdown() {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);
  }

  // Polling

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function poll(code: string, pid: string) {
    try {
      const res = await fetch(`/api/rooms/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heartbeat", playerId: pid }),
      });
      if (res.ok) setRoom(((await res.json()) as { room: Room }).room);
    } catch {
      /* ignore */
    }
  }

  const pollCodeRef = useRef<string | null>(null);
  const pollPidRef = useRef<string | null>(null);

  function startPolling(code: string, pid: string) {
    stopPolling();
    pollCodeRef.current = code;
    pollPidRef.current = pid;
    pollRef.current = setInterval(() => poll(code, pid), POLL_INTERVAL);
  }

  // Relance le polling quand le tab redevient visible (les setInterval sont throttlés en arrière-plan)
  useEffect(() => {
    function onVisible() {
      if (
        document.visibilityState === "visible" &&
        pollCodeRef.current &&
        pollPidRef.current
      ) {
        poll(pollCodeRef.current, pollPidRef.current);
        startPolling(pollCodeRef.current, pollPidRef.current);
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase sync

  useEffect(() => {
    if (!room) return;
    const prevPhase = prevPhaseRef.current;
    const prevRound = prevRoundRef.current;
    prevPhaseRef.current = room.phase;
    prevRoundRef.current = room.round;

    if (room.phase === "countdown" && prevPhase !== "countdown") {
      setHtml("");
      setLoadError(null);
      clicksRef.current = 0;
      setClicksDisplay(0);
      timerStartedRef.current = false;
      timer.reset();
      startCountdown(room.countdownStart ?? Date.now());
    }
    if (room.phase === "playing" && prevPhase !== "playing") {
      stopCountdown();
      historyRef.current = [room.startArticle];
      setHistory([room.startArticle]);
      loadArticle(room.startArticle);
    }
    if (room.phase === "results" && prevPhase !== "results") {
      timer.stop();
    }
    if (room.round !== prevRound && room.phase === "playing") {
      loadArticle(room.startArticle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  // Countdown -> playing transition
  useEffect(() => {
    if (!room || room.phase !== "countdown" || !playerId) return;
    if (Date.now() - (room.countdownStart ?? 0) >= COUNTDOWN_DURATION) {
      fetch(`/api/rooms/${room.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "play", playerId }),
      })
        .then((r) => r.json())
        .then((d) => {
          if ((d as { room: Room }).room) setRoom((d as { room: Room }).room);
        })
        .catch(() => {});
    }
  }, [countdown, room, playerId]);

  // Navigation

  const navigate = useCallback(
    async (t: string) => {
      if (!room || !playerId || loadingRef.current || room.phase !== "playing")
        return;
      clicksRef.current += 1;
      setClicksDisplay(clicksRef.current);
      if (!timerStartedRef.current) {
        timer.start();
        timerStartedRef.current = true;
      }

      // Heartbeat optimiste pour éviter le kick pendant le chargement de l'article
      fetch(`/api/rooms/${room.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heartbeat", playerId }),
      }).catch(() => {});

      const canonical = await loadArticle(t);
      if (!canonical) return;

      const newHistory = [...historyRef.current, canonical];
      historyRef.current = newHistory;
      setHistory(newHistory);
      window.scrollTo({ top: 0, behavior: "smooth" });

      try {
        const res = await fetch(`/api/rooms/${room.code}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "navigate",
            playerId,
            article: canonical,
          }),
        });
        if (res.ok) setRoom(((await res.json()) as { room: Room }).room);
      } catch {
        /* on continue localement */
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [room, playerId],
  );

  // Room actions

  async function createRoom(
    playerName: string,
    maxPlayers = 16,
    totalRounds = 3,
    gameMode: "race" | "all_finish" = "race",
  ): Promise<{ error?: string }> {
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName, maxPlayers, totalRounds, gameMode }),
    });
    const data = (await res.json()) as {
      room?: Room;
      playerId?: string;
      error?: string;
    };
    if (!res.ok) return { error: data.error ?? "Erreur" };
    setRoom(data.room!);
    setPlayerId(data.playerId!);
    startPolling(data.room!.code, data.playerId!);
    saveSession({
      screen: "lobby",
      multiRoomCode: data.room!.code,
      multiPlayerId: data.playerId!,
      playerName,
    });
    return {};
  }

  async function joinRoom(
    playerName: string,
    code: string,
  ): Promise<{ error?: string }> {
    const res = await fetch(`/api/rooms/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", playerName }),
    });
    const data = (await res.json()) as {
      room?: Room;
      playerId?: string;
      error?: string;
    };
    if (!res.ok) return { error: data.error ?? "Impossible de rejoindre" };
    setRoom(data.room!);
    setPlayerId(data.playerId!);
    startPolling(data.room!.code, data.playerId!);
    saveSession({
      screen: "lobby",
      multiRoomCode: data.room!.code,
      multiPlayerId: data.playerId!,
      playerName,
    });
    return {};
  }

  async function startGame(): Promise<{ error?: string }> {
    if (!room || !playerId) return {};
    const puzzle = await pickTwoArticles();
    const res = await fetch(`/api/rooms/${room.code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        playerId,
        startArticle: puzzle.start,
        targetArticle: puzzle.target,
      }),
    });
    const data = (await res.json()) as { room?: Room; error?: string };
    if (!res.ok) return { error: data.error ?? "Erreur" };
    prefetchArticle(puzzle.start);
    setRoom(data.room!);
    return {};
  }

  const goBack = useCallback(async () => {
    if (!room || !playerId || loadingRef.current || room.phase !== "playing") return;
    if (historyRef.current.length <= 1) return;

    clicksRef.current += 1;
    setClicksDisplay(clicksRef.current);
    if (!timerStartedRef.current) { timer.start(); timerStartedRef.current = true; }

    const newHistory = historyRef.current.slice(0, -1);
    const target = newHistory[newHistory.length - 1];

    fetch(`/api/rooms/${room.code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "heartbeat", playerId }),
    }).catch(() => {});

    const canonical = await loadArticle(target);
    if (!canonical) return;

    historyRef.current = newHistory;
    setHistory(newHistory);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await fetch(`/api/rooms/${room.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "navigate", playerId, article: canonical }),
      });
      if (res.ok) setRoom((await res.json() as { room: Room }).room);
    } catch { /* on continue localement */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, playerId]);

  async function setSearchAllowed(value: boolean) {
    if (!room || !playerId) return;
    const res = await fetch(`/api/rooms/${room.code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setSearchAllowed", playerId, value }),
    });
    if (res.ok) setRoom(((await res.json()) as { room: Room }).room);
  }

  async function surrender() {
    if (!room || !playerId) return;
    const res = await fetch(`/api/rooms/${room.code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "surrender", playerId }),
    });
    if (res.ok) setRoom(((await res.json()) as { room: Room }).room);
  }

  async function nextRound() {
    if (!room || !playerId) return;
    const res = await fetch(`/api/rooms/${room.code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "nextRound", playerId }),
    });
    if (res.ok) setRoom(((await res.json()) as { room: Room }).room);
  }

  async function resetGame() {
    if (!room || !playerId) return;
    const res = await fetch(`/api/rooms/${room.code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resetGame", playerId }),
    });
    if (res.ok) setRoom(((await res.json()) as { room: Room }).room);
  }

  function leave() {
    stopPolling();
    stopCountdown();
    timer.stop();
    setRoom(null);
    setPlayerId(null);
    setHtml("");
    setTitle("");
    setHistory([]);
    historyRef.current = [];
    clicksRef.current = 0;
    setClicksDisplay(0);
    timerStartedRef.current = false;
    clearSession();
  }

  // Restore session depuis sessionStorage (F5)
  async function restore(code: string, pid: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/rooms/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heartbeat", playerId: pid }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { room: Room };
      setRoom(data.room);
      setPlayerId(pid);
      startPolling(code, pid);
      return true;
    } catch {
      return false;
    }
  }

  return {
    room,
    playerId,
    html,
    title,
    loading,
    loadError,
    history,
    clicks: clicksDisplay,
    elapsed: timer.elapsed,
    countdown,
    createRoom,
    joinRoom,
    startGame,
    nextRound,
    resetGame,
    leave,
    navigate,
    goBack,
    canGoBack: historyRef.current.length > 1,
    surrender,
    setSearchAllowed,
    restore,
    retryLoad: () => title && loadArticle(title),
  };
}

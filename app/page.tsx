"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Screen } from "../lib/types";
import { useSoloGame, useSoloKeyboard } from "../lib/useSoloGame";
import { useMultiGame } from "../lib/useMultiGame";
import { loadSession, clearSession } from "../lib/session";
import { HomeScreen } from "./components/HomeScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { SoloScreen } from "./components/SoloScreen";
import { GameScreen } from "./components/GameScreen";
import { AuthModal } from "./components/AuthModal";
import { ProfileScreen } from "./components/ProfileScreen";

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

async function saveGame(data: {
  mode: string;
  startArticle: string;
  targetArticle: string;
  path: string[];
  clicks: number;
  timeSeconds: number;
  won: boolean;
}) {
  try {
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch { /* silencieux — pas de compte ou hors ligne */ }
}

export default function WikiRush() {
  const { data: session } = useSession();
  const [screen, setScreen] = useState<Screen>("home");
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const solo = useSoloGame();
  const multi = useMultiGame();

  // Pré-remplir le pseudo avec le nom du compte connecté
  useEffect(() => {
    if (session?.user?.name && !playerName) setPlayerName(session.user.name);
  }, [session]);  // eslint-disable-line react-hooks/exhaustive-deps

  // Restaurer la session apres F5
  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;

    if (saved.screen === "solo" && saved.soloPuzzle && saved.soloHistory?.length) {
      setScreen("solo");
      solo.restore(saved.soloPuzzle, saved.soloHistory, saved.soloClicks ?? 0)
        .then((ok) => { if (!ok) { clearSession(); setScreen("home"); } });
    } else if (
      (saved.screen === "lobby" || saved.screen === "game") &&
      saved.multiRoomCode && saved.multiPlayerId
    ) {
      if (saved.playerName) setPlayerName(saved.playerName);
      multi.restore(saved.multiRoomCode, saved.multiPlayerId).then((ok) => {
        if (ok) setScreen("lobby");
        else { clearSession(); setScreen("home"); }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bloquer le bouton retour navigateur
  useEffect(() => {
    const onPop = () => history.pushState(null, "", window.location.href);
    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Backspace = retour arriere en solo
  useSoloKeyboard(screen === "solo" && solo.phase === "playing", solo.goBack);

  // Sync ecran quand la room change de phase
  useEffect(() => {
    if (!multi.room) return;
    const { phase } = multi.room;
    queueMicrotask(() => {
      if (phase === "countdown" || phase === "playing") setScreen("game");
    });
  }, [multi.room]);

  // Sauvegarder partie solo terminée
  useEffect(() => {
    if (solo.phase !== "won" || !solo.puzzle) return;
    saveGame({
      mode: "solo",
      startArticle: solo.puzzle.start,
      targetArticle: solo.puzzle.target,
      path: solo.history,
      clicks: solo.clicks,
      timeSeconds: solo.elapsed,
      won: true,
    });
  }, [solo.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Actions home ----

  async function handleCreateRoom() {
    if (!playerName.trim()) { setError("Entre ton pseudo !"); return; }
    setLoading(true); setError(null);
    const { error: err } = await multi.createRoom(playerName.trim());
    setLoading(false);
    if (err) { setError(err); return; }
    setScreen("lobby");
  }

  async function handleJoinRoom() {
    if (!playerName.trim()) { setError("Entre ton pseudo !"); return; }
    if (joinCode.trim().length !== 4) { setError("Le code doit faire 4 lettres"); return; }
    setLoading(true); setError(null);
    const { error: err } = await multi.joinRoom(playerName.trim(), joinCode.trim().toUpperCase());
    setLoading(false);
    if (err) { setError(err); return; }
    setScreen("lobby");
  }

  async function handleStartGame() {
    setLoading(true); setError(null);
    const { error: err } = await multi.startGame();
    setLoading(false);
    if (err) setError(err);
  }

  async function handleNextRound() {
    await multi.nextRound();
    setScreen("lobby");
  }

  async function handleResetGame() {
    await multi.resetGame();
    setScreen("lobby");
  }

  function handleLeave() {
    multi.leave();
    setScreen("home");
  }

  // ---- Rendu ----

  if (screen === "profile") {
    return (
      <ProfileScreen
        userName={session?.user?.name ?? "Joueur"}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "home") {
    return (
      <>
        <HomeScreen
          playerName={playerName} setPlayerName={setPlayerName}
          joinCode={joinCode} setJoinCode={setJoinCode}
          error={error} setError={setError} loading={loading}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onSolo={() => { solo.reset(); setScreen("solo"); }}
          session={session}
          onShowAuth={() => setShowAuth(true)}
          onShowProfile={() => setScreen("profile")}
        />
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => setShowAuth(false)}
          />
        )}
      </>
    );
  }

  if (screen === "solo") {
    return (
      <SoloScreen
        phase={solo.phase} puzzle={solo.puzzle}
        html={solo.html} title={solo.title}
        loading={solo.loading} loadError={solo.loadError}
        history={solo.history} clicks={solo.clicks}
        elapsedDisplay={fmt(solo.elapsed)}
        canGoBack={solo.canGoBack}
        onStart={solo.start}
        onNavigate={solo.navigate}
        onBack={solo.goBack}
        onQuit={() => { solo.reset(); setScreen("home"); }}
        onNewGame={solo.start}
        onRetry={solo.retryLoad}
      />
    );
  }

  if (screen === "lobby" && multi.room && multi.playerId) {
    return (
      <LobbyScreen
        room={multi.room} playerId={multi.playerId}
        error={error} setError={setError} loading={loading}
        onLeave={handleLeave}
        onStart={handleStartGame}
        onReset={handleResetGame}
      />
    );
  }

  if (screen === "game" && multi.room && multi.playerId) {
    return (
      <GameScreen
        room={multi.room} playerId={multi.playerId}
        html={multi.html} title={multi.title}
        loading={multi.loading} loadError={multi.loadError}
        history={multi.history} clicks={multi.clicks}
        elapsed={fmt(multi.elapsed)}
        countdown={multi.countdown}
        onNavigate={multi.navigate}
        onRetry={multi.retryLoad}
        onNextRound={handleNextRound}
        onResetGame={handleResetGame}
      />
    );
  }

  return null;
}

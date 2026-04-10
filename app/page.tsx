"use client";

import { useState } from "react";
import { useSoloGame } from "../lib/useSoloGame";
import { useMultiGame } from "../lib/useMultiGame";
import { useGameEffects } from "../lib/useGameEffects";
import { useGameHandlers } from "../lib/useGameHandlers";
import { fmt } from "../lib/utils";
import type { Screen } from "../lib/types";
import { HomeScreen } from "./components/HomeScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { SoloScreen } from "./components/SoloScreen";
import { GameScreen } from "./components/GameScreen";
import { AuthModal } from "./components/AuthModal";
import { ProfileScreen } from "./components/ProfileScreen";

export default function WikiRush() {
  const [screen, setScreen] = useState<Screen>("home");
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const solo = useSoloGame();
  const multi = useMultiGame();

  const { session } = useGameEffects({ solo, multi, screen, setScreen, setPlayerName });
  const handlers = useGameHandlers({ solo, multi, playerName, joinCode, setScreen, setError, setLoading });

  if (screen === "profile") return (
    <ProfileScreen userName={session?.user?.name ?? "Joueur"} onBack={() => setScreen("home")} />
  );

  if (screen === "home") return (
    <>
      <HomeScreen
        playerName={playerName} setPlayerName={setPlayerName}
        joinCode={joinCode} setJoinCode={setJoinCode}
        error={error} setError={setError} loading={loading}
        onCreateRoom={handlers.handleCreateRoom}
        onJoinRoom={handlers.handleJoinRoom}
        onSolo={handlers.handleSolo}
        session={session}
        onShowAuth={() => setShowAuth(true)}
        onShowProfile={() => setScreen("profile")}
      />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />}
    </>
  );

  if (screen === "solo") return (
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

  if (screen === "lobby" && multi.room && multi.playerId) return (
    <LobbyScreen
      room={multi.room} playerId={multi.playerId}
      error={error} setError={setError} loading={loading}
      onLeave={handlers.handleLeave}
      onStart={handlers.handleStartGame}
      onReset={handlers.handleResetGame}
    />
  );

  if (screen === "game" && multi.room && multi.playerId) return (
    <GameScreen
      room={multi.room} playerId={multi.playerId}
      html={multi.html} title={multi.title}
      loading={multi.loading} loadError={multi.loadError}
      history={multi.history} clicks={multi.clicks}
      elapsed={fmt(multi.elapsed)}
      countdown={multi.countdown}
      onNavigate={multi.navigate}
      onRetry={multi.retryLoad}
      onNextRound={handlers.handleNextRound}
      onResetGame={handlers.handleResetGame}
    />
  );

  return null;
}

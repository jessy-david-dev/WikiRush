"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Screen } from "../lib/types";
import { useSoloGame, useSoloKeyboard } from "../lib/useSoloGame";
import { useMultiGame } from "../lib/useMultiGame";
import { loadSession, clearSession } from "../lib/session";
import { fmt, saveGame } from "../lib/utils";
import { useGameHandlers } from "../lib/useGameHandlers";
import { HomeScreen } from "./components/HomeScreen";
import { LobbyScreen } from "./components/LobbyScreen";
import { SoloScreen } from "./components/SoloScreen";
import { GameScreen } from "./components/GameScreen";
import { AuthModal } from "./components/AuthModal";
import { ProfileScreen } from "./components/ProfileScreen";

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

  const handlers = useGameHandlers({
    solo, multi, playerName, joinCode, setScreen, setError, setLoading,
  });

  // Pré-remplir le pseudo avec le nom du compte connecté
  useEffect(() => {
    if (session?.user?.name && !playerName) setPlayerName(session.user.name);
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restaurer la session après F5
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

  // Backspace = retour arrière en solo
  useSoloKeyboard(screen === "solo" && solo.phase === "playing", solo.goBack);

  // Sync écran quand la room change de phase
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

  // Sauvegarder partie multi quand les résultats arrivent
  useEffect(() => {
    const room = multi.room;
    const pid = multi.playerId;
    if (!room || !pid || room.phase !== "results") return;
    const me = room.players.find((p) => p.id === pid);
    if (!me) return;
    saveGame({
      mode: "multi",
      startArticle: room.startArticle,
      targetArticle: room.targetArticle,
      path: multi.history,
      clicks: multi.clicks,
      timeSeconds: multi.elapsed,
      won: room.roundWinner === pid,
    });
  }, [multi.room?.phase]); // eslint-disable-line react-hooks/exhaustive-deps

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
          onCreateRoom={handlers.handleCreateRoom}
          onJoinRoom={handlers.handleJoinRoom}
          onSolo={handlers.handleSolo}
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
        onLeave={handlers.handleLeave}
        onStart={handlers.handleStartGame}
        onReset={handlers.handleResetGame}
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
        onNextRound={handlers.handleNextRound}
        onResetGame={handlers.handleResetGame}
      />
    );
  }

  return null;
}

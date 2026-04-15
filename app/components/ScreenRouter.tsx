"use client";

import { Dispatch, SetStateAction } from "react";
import { Session } from "next-auth";
import type { Screen } from "../../lib/types";
import type { useSoloGame } from "../../lib/useSoloGame";
import type { useMultiGame } from "../../lib/useMultiGame";
import type { useGameHandlers } from "../../lib/useGameHandlers";
import { fmt } from "../../lib/utils";
import { HomeScreen } from "./HomeScreen";
import { LobbyScreen } from "./LobbyScreen";
import { SoloScreen } from "./SoloScreen";
import { GameScreen } from "./GameScreen";
import { AuthModal } from "./AuthModal";
import { ProfileScreen } from "./ProfileScreen";
import { LeaderboardScreen } from "./LeaderboardScreen";
import { DailyScreen } from "./DailyScreen";
import { BlitzScreen } from "./BlitzScreen";

type Props = {
  screen: Screen;
  setScreen: Dispatch<SetStateAction<Screen>>;
  session: Session | null;
  solo: ReturnType<typeof useSoloGame>;
  multi: ReturnType<typeof useMultiGame>;
  handlers: ReturnType<typeof useGameHandlers>;
  playerName: string;
  setPlayerName: Dispatch<SetStateAction<string>>;
  joinCode: string;
  setJoinCode: Dispatch<SetStateAction<string>>;
  maxPlayers: number;
  setMaxPlayers: Dispatch<SetStateAction<number>>;
  totalRounds: number;
  setTotalRounds: Dispatch<SetStateAction<number>>;
  gameMode: "race" | "all_finish";
  setGameMode: Dispatch<SetStateAction<"race" | "all_finish">>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  loading: boolean;
  showAuth: boolean;
  setShowAuth: Dispatch<SetStateAction<boolean>>;
};

export function ScreenRouter({
  screen,
  setScreen,
  session,
  solo,
  multi,
  handlers,
  playerName,
  setPlayerName,
  joinCode,
  setJoinCode,
  maxPlayers,
  setMaxPlayers,
  totalRounds,
  setTotalRounds,
  gameMode,
  setGameMode,
  error,
  setError,
  loading,
  showAuth,
  setShowAuth,
}: Props) {
  if (screen === "profile")
    return (
      <ProfileScreen
        userName={session?.user?.name ?? "Joueur"}
        onBack={() => setScreen("home")}
      />
    );

  if (screen === "leaderboard")
    return <LeaderboardScreen onBack={() => setScreen("home")} />;

  if (screen === "daily")
    return (
      <DailyScreen
        onBack={() => setScreen("home")}
        currentUserId={session?.user?.id ?? undefined}
      />
    );

  if (screen === "blitz")
    return <BlitzScreen onBack={() => setScreen("home")} />;

  if (screen === "home")
    return (
      <>
        <HomeScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          error={error}
          setError={setError}
          loading={loading}
          onCreateRoom={handlers.handleCreateRoom}
          onJoinRoom={handlers.handleJoinRoom}
          onSolo={handlers.handleSolo}
          session={session}
          onShowAuth={() => setShowAuth(true)}
          onShowProfile={() => setScreen("profile")}
          onShowLeaderboard={() => setScreen("leaderboard")}
          onDaily={() => setScreen("daily")}
          onBlitz={() => setScreen("blitz")}
        />
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => setShowAuth(false)}
          />
        )}
      </>
    );

  if (screen === "solo")
    return (
      <SoloScreen
        phase={solo.phase}
        puzzle={solo.puzzle}
        html={solo.html}
        title={solo.title}
        loading={solo.loading}
        loadError={solo.loadError}
        history={solo.history}
        clicks={solo.clicks}
        elapsedDisplay={fmt(solo.elapsed)}
        canGoBack={solo.canGoBack}
        onStart={solo.start}
        onNavigate={solo.navigate}
        onBack={solo.goBack}
        onQuit={() => {
          solo.reset();
          setScreen("home");
        }}
        onNewGame={solo.start}
        onRetry={solo.retryLoad}
      />
    );

  if (screen === "lobby" && multi.room && multi.playerId)
    return (
      <LobbyScreen
        room={multi.room}
        playerId={multi.playerId}
        error={error}
        setError={setError}
        loading={loading}
        onLeave={handlers.handleLeave}
        onStart={handlers.handleStartGame}
        onReset={handlers.handleResetGame}
        maxPlayers={maxPlayers}
        setMaxPlayers={setMaxPlayers}
        totalRounds={totalRounds}
        setTotalRounds={setTotalRounds}
        gameMode={gameMode}
        setGameMode={setGameMode}
        onSetGameMode={(v) => multi.setGameMode(v)}
        onSetTotalRounds={(v) => multi.setTotalRounds(v)}
        onSetMaxPlayers={(v) => multi.setMaxPlayers(v)}
        onSetSearchAllowed={(v) => multi.setSearchAllowed(v)}
        onSetTimeLimit={(v) => multi.setTimeLimit(v)}
      />
    );

  if (screen === "game" && multi.room && multi.playerId)
    return (
      <GameScreen
        room={multi.room}
        playerId={multi.playerId}
        html={multi.html}
        title={multi.title}
        loading={multi.loading}
        loadError={multi.loadError}
        history={multi.history}
        clicks={multi.clicks}
        elapsed={fmt(multi.elapsed)}
        countdown={multi.countdown}
        timeLeft={multi.timeLeft}
        onNavigate={multi.navigate}
        onGoBack={multi.goBack}
        canGoBack={multi.canGoBack}
        onRetry={multi.retryLoad}
        onNextRound={handlers.handleNextRound}
        onStartGame={handlers.handleStartGame}
        onResetGame={handlers.handleResetGame}
        onSurrender={handlers.handleSurrender}
      />
    );

  return null;
}

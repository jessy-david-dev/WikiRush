"use client";

import { useState } from "react";
import { useSoloGame } from "../lib/useSoloGame";
import { useMultiGame } from "../lib/useMultiGame";
import { useGameEffects } from "../lib/useGameEffects";
import { useGameHandlers } from "../lib/useGameHandlers";
import { ScreenRouter } from "./components/ScreenRouter";
import type { Screen } from "../lib/types";

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

  return (
    <ScreenRouter
      screen={screen} setScreen={setScreen} session={session}
      solo={solo} multi={multi} handlers={handlers}
      playerName={playerName} setPlayerName={setPlayerName}
      joinCode={joinCode} setJoinCode={setJoinCode}
      error={error} setError={setError} loading={loading}
      showAuth={showAuth} setShowAuth={setShowAuth}
    />
  );
}

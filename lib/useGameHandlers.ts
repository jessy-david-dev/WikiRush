import { Dispatch, SetStateAction } from "react";
import type { Screen } from "./types";
import type { useSoloGame } from "./useSoloGame";
import type { useMultiGame } from "./useMultiGame";

type UseSoloGame = ReturnType<typeof useSoloGame>;
type UseMultiGame = ReturnType<typeof useMultiGame>;

type Handlers = {
  solo: UseSoloGame;
  multi: UseMultiGame;
  playerName: string;
  joinCode: string;
  setScreen: Dispatch<SetStateAction<Screen>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export function useGameHandlers({
  solo, multi, playerName, joinCode, setScreen, setError, setLoading,
}: Handlers) {
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

  function handleSolo() {
    solo.reset();
    setScreen("solo");
  }

  return {
    handleCreateRoom,
    handleJoinRoom,
    handleStartGame,
    handleNextRound,
    handleResetGame,
    handleLeave,
    handleSolo,
  };
}

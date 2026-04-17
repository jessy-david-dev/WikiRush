"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { useSession } from "next-auth/react";
import type { Screen } from "./types";
import type { useSoloGame } from "./useSoloGame";
import type { useMultiGame } from "./useMultiGame";
import { loadSession, clearSession } from "./session";
import { saveGame } from "./utils";
import { useSoloKeyboard } from "./useSoloGame";

type UseSoloGame = ReturnType<typeof useSoloGame>;
type UseMultiGame = ReturnType<typeof useMultiGame>;

export function useGameEffects({
  solo,
  multi,
  screen,
  setScreen,
  setPlayerName,
}: {
  solo: UseSoloGame;
  multi: UseMultiGame;
  screen: Screen;
  setScreen: Dispatch<SetStateAction<Screen>>;
  setPlayerName: Dispatch<SetStateAction<string>>;
}) {
  const { data: session } = useSession();

  // Pré-remplir le pseudo avec le nom du compte connecté
  useEffect(() => {
    if (session?.user?.name) setPlayerName(session.user.name);
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restaurer la session après F5
  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;

    if (
      saved.screen === "solo" &&
      saved.soloPuzzle &&
      saved.soloHistory?.length
    ) {
      setScreen("solo");
      solo
        .restore(saved.soloPuzzle, saved.soloHistory, saved.soloClicks ?? 0)
        .then((ok) => {
          if (!ok) {
            clearSession();
            setScreen("home");
          }
        });
    } else if (
      (saved.screen === "lobby" || saved.screen === "game") &&
      saved.multiRoomCode &&
      saved.multiPlayerId
    ) {
      if (saved.playerName) setPlayerName(saved.playerName);
      const savedCode = saved.multiRoomCode;
      multi.restore(saved.multiRoomCode, saved.multiPlayerId).then((ok) => {
        // si une nouvelle room a été rejointe pendant le restore, on laisse
        const current = loadSession();
        if (current?.multiRoomCode && current.multiRoomCode !== savedCode)
          return;
        if (ok) setScreen("lobby");
        else {
          clearSession();
          setScreen("home");
        }
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
  }, [multi.room]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return { session };
}

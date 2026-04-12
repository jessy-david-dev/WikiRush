"use client";

import { useState } from "react";
import type { Room } from "../api/rooms/route";

type LobbyScreenProps = {
  room: Room;
  playerId: string;
  error: string | null;
  setError: (v: string | null) => void;
  loading: boolean;
  onLeave: () => void;
  onStart: () => void;
  onReset: () => void;
  maxPlayers: number;
  setMaxPlayers: (v: number) => void;
  totalRounds: number;
  setTotalRounds: (v: number) => void;
  gameMode: Room["gameMode"];
  setGameMode: (v: Room["gameMode"]) => void;
  onSetGameMode: (v: Room["gameMode"]) => void;
  onSetSearchAllowed: (v: boolean) => void;
  onSetTimeLimit: (v: number) => void;
};

export function LobbyScreen({
  room,
  playerId,
  error,
  setError,
  loading,
  onLeave,
  onStart,
  onReset,
  maxPlayers,
  setMaxPlayers,
  totalRounds,
  setTotalRounds,
  gameMode,
  setGameMode,
  onSetGameMode,
  onSetSearchAllowed,
  onSetTimeLimit,
}: LobbyScreenProps) {
  const isHost = room.players.find((p) => p.id === playerId)?.isHost ?? false;
  const [copied, setCopied] = useState(false);
  const [blurred, setBlurred] = useState(true);

  function copyCode() {
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const btnGhost =
    "w-full min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors";
  const btnPrimary =
    "w-full min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 cursor-pointer transition-colors";

  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col items-center px-4 py-5 gap-5 sm:gap-6 max-w-120 mx-auto">
      <button
        className="self-start min-h-9 px-3 rounded-lg text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer"
        onClick={onLeave}
      >
        Quitter
      </button>

      {/* Code */}
      <div className="w-full text-center bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs text-[#888] uppercase tracking-widest">
            Code de la salle
          </span>
          <button
            onClick={() => setBlurred((b) => !b)}
            className="text-[10px] sm:text-xs text-[#555] hover:text-[#888] transition-colors cursor-pointer"
          >
            {blurred ? "Afficher" : "Masquer"}
          </button>
        </div>
        <button
          className="flex items-center justify-center gap-2 mx-auto px-2 py-1 rounded-lg hover:bg-[#242424] cursor-pointer bg-transparent border-none"
          onClick={copyCode}
        >
          <span
            className={`text-5xl sm:text-[clamp(42px,12vw,64px)] font-black font-mono tracking-[0.15em] text-[#7c3aed] leading-none transition-all duration-200 select-none ${blurred ? "blur-md" : ""}`}
          >
            {room.code}
          </span>
          <span
            className={`text-lg sm:text-xl leading-none transition-colors ${copied ? "text-green-400" : "text-[#888]"}`}
          >
            {copied ? "✓" : "⧉"}
          </span>
        </button>
        <span className="block text-xs text-[#888] mt-2">
          {copied ? "Copié !" : "Clique pour copier"}
        </span>
      </div>

      {error && (
        <div className="w-full flex items-center justify-between gap-3 bg-red-950/40 border border-red-600 text-red-300 px-3 py-2.5 rounded-xl text-xs sm:text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="shrink-0 px-1.5 rounded hover:bg-white/10 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Players */}
      <div className="w-full">
        <h3 className="text-[10px] sm:text-xs font-bold text-[#888] uppercase tracking-wider mb-2">
          Joueurs ({room.players.length}/{room.maxPlayers})
        </h3>
        <ul className="flex flex-col gap-2">
          {room.players.map((p) => (
            <li
              key={p.id}
              className={`flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3.5 py-2.5 min-h-11 border ${p.id === playerId ? "border-[#7c3aed]" : "border-[#2e2e2e]"}`}
            >
              <span className="flex-1 font-semibold text-sm truncate">
                {p.name}
              </span>
              {p.isHost && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 uppercase tracking-wide shrink-0">
                  Hôte
                </span>
              )}
              {p.id === playerId && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 uppercase tracking-wide shrink-0">
                  Toi
                </span>
              )}
              <span className="text-sm font-bold text-[#7c3aed] shrink-0">
                {p.score} pts
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isHost && (
        <div className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-[10px] sm:text-xs font-bold text-[#888] uppercase tracking-wider">
            Paramètres
          </h3>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#888]">Mode de jeu</span>
            <select
              value={gameMode}
              onChange={(e) => { const v = e.target.value as Room["gameMode"]; setGameMode(v); onSetGameMode(v); }}
              className="w-full min-h-11 px-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl text-sm text-[#f0f0f0] outline-none focus:border-[#7c3aed] cursor-pointer transition-colors"
            >
              <option value="race">Course - le premier arrivé gagne</option>
              <option value="all_finish">
                Normal - tout le monde joue jusqu&apos;au bout
              </option>
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs text-[#888]">Joueurs max</span>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full min-h-11 px-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl text-sm text-[#f0f0f0] outline-none focus:border-[#7c3aed] cursor-pointer transition-colors"
              >
                {[2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16].map((n) => (
                  <option key={n} value={n}>
                    {n} joueurs
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-xs text-[#888]">Manches</span>
              <select
                value={totalRounds}
                onChange={(e) => setTotalRounds(Number(e.target.value))}
                className="w-full min-h-11 px-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl text-sm text-[#f0f0f0] outline-none focus:border-[#7c3aed] cursor-pointer transition-colors"
              >
                {[1, 2, 3, 4, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#888]">Temps par manche</span>
            <select
              value={room.timeLimit}
              onChange={(e) => onSetTimeLimit(Number(e.target.value))}
              className="w-full min-h-11 px-2 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl text-sm text-[#f0f0f0] outline-none focus:border-[#7c3aed] cursor-pointer transition-colors"
            >
              <option value={0}>Illimité</option>
              {[60, 120, 180, 300, 600].map((s) => (
                <option key={s} value={s}>
                  {s < 60 ? `${s}s` : `${s / 60} min`}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onSetSearchAllowed(!room.searchAllowed)}
            className={`w-full min-h-11 rounded-xl text-sm font-semibold border transition-colors cursor-pointer flex items-center justify-between px-4 ${room.searchAllowed ? "bg-[#7c3aed]/10 border-[#7c3aed] text-[#a78bfa]" : "bg-[#1a1a1a] border-[#2e2e2e] text-[#888]"}`}
          >
            <span>🔍 Recherche Ctrl+F</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${room.searchAllowed ? "bg-[#7c3aed]/30 text-[#a78bfa]" : "bg-[#242424] text-[#555]"}`}
            >
              {room.searchAllowed ? "Autorisée" : "Bloquée"}
            </span>
          </button>
        </div>
      )}

      {!isHost && (
        <div
          className={`w-full min-h-11 rounded-xl text-sm font-semibold border flex items-center justify-between px-4 ${room.searchAllowed ? "bg-[#7c3aed]/10 border-[#7c3aed] text-[#a78bfa]" : "bg-[#1a1a1a] border-[#2e2e2e] text-[#888]"}`}
        >
          <span>🔍 Recherche Ctrl+F</span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${room.searchAllowed ? "bg-[#7c3aed]/30 text-[#a78bfa]" : "bg-[#242424] text-[#555]"}`}
          >
            {room.searchAllowed ? "Autorisée" : "Bloquée"}
          </span>
        </div>
      )}

      {room.round > 0 && (
        <p className="text-xs text-[#888] text-center">
          Manche {room.round} terminée
        </p>
      )}

      {isHost ? (
        <div className="w-full flex flex-col gap-2.5">
          <button className={btnPrimary} onClick={onStart} disabled={loading}>
            {loading
              ? "Préparation..."
              : room.round === 0
                ? "Démarrer la partie"
                : "Manche suivante"}
          </button>
          {room.round > 0 && (
            <button className={btnGhost} onClick={onReset}>
              Nouvelle partie (reset scores)
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#888] text-center animate-pulse-slow">
          En attente que l&apos;hôte démarre...
        </p>
      )}
    </div>
  );
}

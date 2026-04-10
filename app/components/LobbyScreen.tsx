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
};

export function LobbyScreen({
  room, playerId, error, setError, loading, onLeave, onStart, onReset,
}: LobbyScreenProps) {
  const isHost = room.players.find((p) => p.id === playerId)?.isHost ?? false;
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const btnGhost = "w-full min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors";
  const btnPrimary = "w-full min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 cursor-pointer transition-colors";

  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col items-center px-4 py-5 gap-5 sm:gap-6 max-w-120 mx-auto">
      <button className="self-start min-h-9 px-3 rounded-lg text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer" onClick={onLeave}>
        Quitter
      </button>

      {/* Code */}
      <div className="w-full text-center bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 sm:p-6">
        <span className="block text-[10px] sm:text-xs text-[#888] uppercase tracking-widest mb-2">Code de la salle</span>
        <button className="flex items-center justify-center gap-2 mx-auto px-2 py-1 rounded-lg hover:bg-[#242424] cursor-pointer bg-transparent border-none" onClick={copyCode}>
          <span className="text-5xl sm:text-[clamp(42px,12vw,64px)] font-black font-mono tracking-[0.15em] text-[#7c3aed] leading-none">
            {room.code}
          </span>
          <span className={`text-lg sm:text-xl leading-none transition-colors ${copied ? "text-green-400" : "text-[#888]"}`}>
            {copied ? "✓" : "⧉"}
          </span>
        </button>
        <span className="block text-xs text-[#888] mt-2">{copied ? "Copié !" : "Clique pour copier"}</span>
      </div>

      {error && (
        <div className="w-full flex items-center justify-between gap-3 bg-red-950/40 border border-red-600 text-red-300 px-3 py-2.5 rounded-xl text-xs sm:text-sm">
          {error}
          <button onClick={() => setError(null)} className="shrink-0 px-1.5 rounded hover:bg-white/10 cursor-pointer">✕</button>
        </div>
      )}

      {/* Players */}
      <div className="w-full">
        <h3 className="text-[10px] sm:text-xs font-bold text-[#888] uppercase tracking-wider mb-2">
          Joueurs ({room.players.length}/8)
        </h3>
        <ul className="flex flex-col gap-2">
          {room.players.map((p) => (
            <li key={p.id} className={`flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3.5 py-2.5 min-h-11 border ${p.id === playerId ? "border-[#7c3aed]" : "border-[#2e2e2e]"}`}>
              <span className="flex-1 font-semibold text-sm truncate">{p.name}</span>
              {p.isHost && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 uppercase tracking-wide shrink-0">Hôte</span>}
              {p.id === playerId && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 uppercase tracking-wide shrink-0">Toi</span>}
              <span className="text-sm font-bold text-[#7c3aed] shrink-0">{p.score} pts</span>
            </li>
          ))}
        </ul>
      </div>

      {room.round > 0 && <p className="text-xs text-[#888] text-center">Manche {room.round} terminée</p>}

      {isHost ? (
        <div className="w-full flex flex-col gap-2.5">
          <button className={btnPrimary} onClick={onStart} disabled={loading}>
            {loading ? "Préparation..." : room.round === 0 ? "Démarrer la partie" : "Manche suivante"}
          </button>
          {room.round > 0 && (
            <button className={btnGhost} onClick={onReset}>Nouvelle partie (reset scores)</button>
          )}
        </div>
      ) : (
        <p className="text-sm text-[#888] text-center animate-pulse-slow">En attente que l&apos;hôte démarre...</p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { ArticleView } from "./ArticleView";
import { Breadcrumbs } from "./Breadcrumbs";
import type { Room } from "../api/rooms/route";

type GameScreenProps = {
  room: Room;
  playerId: string;
  html: string;
  title: string;
  loading: boolean;
  loadError: string | null;
  history: string[];
  clicks: number;
  elapsed: string;
  countdown: number | null;
  onNavigate: (title: string) => void;
  onRetry: () => void;
  onNextRound: () => void;
  onResetGame: () => void;
};

export function GameScreen({
  room, playerId, html, title, loading, loadError, history, clicks, elapsed,
  countdown, onNavigate, onRetry, onNextRound, onResetGame,
}: GameScreenProps) {
  const breadcrumbEndRef = useRef<HTMLDivElement>(null);
  const myPlayer = room.players.find((p) => p.id === playerId);
  const isHost = myPlayer?.isHost ?? false;
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = room.roundWinner ? room.players.find((p) => p.id === room.roundWinner) : null;

  useEffect(() => {
    breadcrumbEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" });
  }, [history]);

  const btnPrimary = "w-full min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] cursor-pointer transition-colors";
  const btnGhost = "w-full min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors";

  // Results
  if (room.phase === "results") return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-5 sm:gap-6">
        <div className="text-center bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 sm:p-6">
          {winner ? (
            <>
              <div className="text-4xl sm:text-5xl mb-2">🏆</div>
              <div className="text-base sm:text-lg font-bold">{winner.name} a gagné la manche !</div>
            </>
          ) : (
            <div className="text-base sm:text-lg font-bold">Manche terminée !</div>
          )}
        </div>
        <div className="text-center text-xs sm:text-sm text-[#888]">
          <span className="text-[#f0f0f0]">{room.startArticle}</span>
          <span className="mx-2">→</span>
          <span className="text-[#7c3aed] font-bold">{room.targetArticle}</span>
        </div>
        <div>
          <h3 className="text-[10px] sm:text-xs font-bold text-[#888] uppercase tracking-wider mb-3">Classement</h3>
          <ul className="flex flex-col gap-2">
            {sortedPlayers.map((p, i) => (
              <li key={p.id} className={`flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-3.5 py-2.5 min-h-11 border ${p.id === playerId ? "border-[#7c3aed]" : "border-[#2e2e2e]"}`}>
                <span className="text-xs sm:text-sm font-bold text-[#888] min-w-6 sm:min-w-7">#{i + 1}</span>
                <span className="flex-1 font-semibold text-sm truncate">{p.name}</span>
                {p.hasWon && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-900/40 text-green-300 uppercase tracking-wide shrink-0">Gagnant</span>}
                <span className="font-bold text-[#7c3aed] text-sm shrink-0">{p.score} pts</span>
              </li>
            ))}
          </ul>
        </div>
        {isHost ? (
          <div className="flex flex-col gap-2.5">
            <button className={btnPrimary} onClick={onNextRound}>Manche suivante</button>
            <button className={btnGhost} onClick={onResetGame}>Nouvelle partie</button>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[#888] text-center animate-pulse-slow">En attente de l&apos;hôte...</p>
        )}
      </div>
    </div>
  );

  // Countdown
  if (room.phase === "countdown") return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-6 sm:gap-10 flex-col sm:flex-row mb-10 sm:mb-12">
          <div className="flex flex-col items-center gap-1 max-w-48">
            <span className="text-[10px] sm:text-[11px] text-[#888] uppercase tracking-wider">Départ</span>
            <span className="text-base sm:text-lg font-bold text-center">{room.startArticle}</span>
          </div>
          <span className="text-xl sm:text-2xl text-[#888] rotate-90 sm:rotate-0">→</span>
          <div className="flex flex-col items-center gap-1 max-w-48">
            <span className="text-[10px] sm:text-[11px] text-[#888] uppercase tracking-wider">Cible</span>
            <span className="text-lg sm:text-xl font-bold text-[#7c3aed] text-center">{room.targetArticle}</span>
          </div>
        </div>
        <div className="text-[clamp(72px,20vw,140px)] font-black leading-none text-[#7c3aed] animate-count-pop">
          {countdown !== null && countdown > 0 ? countdown : "Partez !"}
        </div>
      </div>
    </div>
  );

  // Playing
  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] flex flex-col">
      {/* Topbar */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f]/97 backdrop-blur-sm border-b border-[#2e2e2e] flex items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-2">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5 sm:gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#888] shrink-0">Cible</span>
            <span className="text-xs font-bold text-[#7c3aed] truncate">{room.targetArticle}</span>
          </div>
          <Breadcrumbs history={history} endRef={breadcrumbEndRef} />
        </div>
        <div className="flex gap-2 sm:gap-3 shrink-0 text-[10px] sm:text-xs font-bold text-[#888] tabular-nums">
          <span>{elapsed}</span>
          <span>{clicks} clics</span>
          <span className="hidden sm:inline">{myPlayer?.score ?? 0} pts</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto bg-white">
          {loading && (
            <div className="flex items-center gap-3 py-10 px-4 text-[#888]">
              <div className="spinner" /> Chargement...
            </div>
          )}
          {loadError && (
            <div className="flex flex-col items-center gap-4 py-10 px-4 text-center">
              <p className="text-[#888] text-sm">{loadError}</p>
              <button className="min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] cursor-pointer" onClick={onRetry}>
                Réessayer
              </button>
            </div>
          )}
          {!loading && !loadError && html && (
            <div className="article-container">
              <h1 className="article-title">{title}</h1>
              <ArticleView html={html} onNavigate={onNavigate} disabled={loading} />
            </div>
          )}
        </div>

        {/* Sidebar - desktop seulement */}
        <aside className="hidden md:flex w-36 lg:w-44 shrink-0 bg-[#1a1a1a] border-l border-[#2e2e2e] flex-col px-3 py-4 overflow-y-auto gap-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#888]">Joueurs</h4>
          <ul className="flex flex-col gap-2.5">
            {sortedPlayers.map((p) => (
              <li key={p.id} className="flex flex-col gap-0.5">
                <span className={`text-xs font-semibold truncate ${p.id === playerId ? "text-[#7c3aed]" : "text-[#f0f0f0]"}`}>{p.name}</span>
                <span className="text-xs text-[#888]">{p.score} pts</span>
                {p.hasWon && <span className="text-[10px] text-green-400 font-bold">Gagné !</span>}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

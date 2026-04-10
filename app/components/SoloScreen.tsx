"use client";

import { useEffect, useRef } from "react";
import { ArticleView } from "./ArticleView";
import { Breadcrumbs } from "./Breadcrumbs";
import { ShareBar } from "./ShareBar";
import type { Puzzle } from "../../lib/types";

type SoloPhase = "setup" | "playing" | "won";

type SoloScreenProps = {
  phase: SoloPhase;
  puzzle: Puzzle | null;
  html: string;
  title: string;
  loading: boolean;
  loadError: string | null;
  history: string[];
  clicks: number;
  elapsedDisplay: string;
  canGoBack: boolean;
  onStart: () => void;
  onNavigate: (title: string) => void;
  onBack: () => void;
  onQuit: () => void;
  onNewGame: () => void;
  onRetry: () => void;
};

export function SoloScreen({
  phase, puzzle, html, title, loading, loadError, history, clicks,
  elapsedDisplay, canGoBack, onStart, onNavigate, onBack, onQuit, onNewGame, onRetry,
}: SoloScreenProps) {
  const breadcrumbEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    breadcrumbEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" });
  }, [history]);

  const btnPrimary = "w-full min-h-11 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 cursor-pointer transition-colors";
  const btnGhost = "w-full min-h-11 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors";

  if (phase === "setup") return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col items-center justify-center px-4 py-8 gap-5 max-w-sm mx-auto text-center">
      <button className="self-start min-h-9 px-3 rounded-lg text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer" onClick={onQuit}>
        Retour
      </button>
      <h2 className="text-2xl sm:text-3xl font-black">Mode Solo</h2>
      <p className="text-[#888] text-sm sm:text-base leading-relaxed">
        Deux articles aléatoires seront choisis. Atteins l&apos;article cible en cliquant uniquement sur les liens !
      </p>
      <button className={btnPrimary} onClick={onStart} disabled={loading}>
        {loading ? "Préparation..." : "Lancer une partie"}
      </button>
    </div>
  );

  if (phase === "won") return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md text-center flex flex-col gap-4 sm:gap-5">
        <div className="text-5xl sm:text-6xl leading-none">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-black">Article atteint !</h2>
        <div className="flex gap-6 sm:gap-8 justify-center">
          <div className="flex flex-col gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#7c3aed]">{clicks}</span>
            <span className="text-xs text-[#888]">clics</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#7c3aed]">{elapsedDisplay}</span>
            <span className="text-xs text-[#888]">temps</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl px-3 sm:px-4 py-3 flex flex-wrap gap-1 text-xs sm:text-sm text-[#888] text-left">
          {history.map((t, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-[#555]">›</span>}
              <span className={i === history.length - 1 ? "text-[#16a34a] font-semibold" : ""}>{t}</span>
            </span>
          ))}
        </div>
        <ShareBar text={`🎉 J'ai atteint "${puzzle?.target}" en ${clicks} clics et ${elapsedDisplay} sur WikiRush !`} />
        <div className="flex flex-col gap-2.5">
          <button className={btnPrimary} onClick={onNewGame}>Nouvelle partie</button>
          <button className={btnGhost} onClick={onQuit}>Accueil</button>
        </div>
      </div>
    </div>
  );

  // Playing
  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] flex flex-col">
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="article-container">
          {title && <h1 className="article-title">{title}</h1>}
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
            <ArticleView html={html} onNavigate={onNavigate} disabled={loading} />
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f]/97 backdrop-blur-sm border-t border-[#2e2e2e] flex items-center justify-between px-3 sm:px-4 py-2 gap-2 sm:gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-[#888] uppercase">Trouver</span>
          <span className="text-sm sm:text-base font-black text-[#7c3aed] truncate">{puzzle?.target}</span>
          <Breadcrumbs history={history} endRef={breadcrumbEndRef} />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex flex-col items-center gap-0.5 min-w-10">
            <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#888] uppercase">Temps</span>
            <span className="text-xs sm:text-sm font-black tabular-nums">{elapsedDisplay}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 min-w-10">
            <span className="text-[8px] sm:text-[9px] font-bold tracking-wider text-[#888] uppercase">Clics</span>
            <span className="text-xs sm:text-sm font-black tabular-nums">{clicks}</span>
          </div>
          {canGoBack && (
            <button className="min-h-8 sm:min-h-9 px-2 sm:px-3 rounded-lg text-xs font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] disabled:opacity-50 cursor-pointer" onClick={onBack} disabled={loading}>
              ← +1
            </button>
          )}
          <button className="min-h-8 sm:min-h-9 px-2 sm:px-3 rounded-lg text-xs font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer" onClick={onQuit}>
            Quitter
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useBlitzGame } from "../../lib/useBlitzGame";
import { ArticleView } from "./ArticleView";

function fmtLeft(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function BlitzScreen({ onBack }: { onBack: () => void }) {
  const game = useBlitzGame();

  const btnPrimary = "w-full min-h-11 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 cursor-pointer transition-colors";
  const btnGhost = "w-full min-h-11 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors";

  const danger = game.timeLeft < 30;

  if (game.phase === "setup") return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col items-center justify-center px-4 py-8 gap-5 max-w-sm mx-auto text-center">
      <button className="self-start min-h-9 px-3 rounded-lg text-sm font-semibold bg-[#242424] border border-[#2e2e2e] hover:bg-[#1a1a1a] cursor-pointer" onClick={onBack}>
        Retour
      </button>
      <div className="text-5xl">⚡</div>
      <h2 className="text-2xl sm:text-3xl font-black">Mode Blitz</h2>
      <p className="text-[#888] text-sm sm:text-base leading-relaxed">
        Tu as <span className="text-[#f0f0f0] font-bold">2 minutes</span>{" "}pour naviguer de l&apos;article de départ jusqu&apos;à l&apos;article cible en cliquant sur les liens Wikipedia. Plus tu es rapide, mieux c&apos;est !
      </p>
      <button className={btnPrimary} onClick={game.start} disabled={game.loading}>
        {game.loading ? "Préparation..." : "Lancer le chrono !"}
      </button>
    </div>
  );

  if (game.phase === "won") return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md text-center flex flex-col gap-5">
        <div className="text-5xl sm:text-6xl leading-none">🎉</div>
        <h2 className="text-2xl sm:text-3xl font-black">Article trouvé !</h2>
        {game.puzzle && (
          <p className="text-[#888] text-sm">
            <span className="text-[#f0f0f0] font-semibold">{game.puzzle.start}</span>
            {" → "}
            <span className="text-[#7c3aed] font-semibold">{game.puzzle.target}</span>
          </p>
        )}
        <div className="flex gap-8 justify-center">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-[#7c3aed]">{fmtLeft(game.timeLeft)}</span>
            <span className="text-xs text-[#888]">temps restant</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-[#7c3aed]">{game.clicks}</span>
            <span className="text-xs text-[#888]">clics</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-[#7c3aed]">{game.history.length}</span>
            <span className="text-xs text-[#888]">articles</span>
          </div>
        </div>
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex flex-wrap gap-1 text-xs text-[#888] text-left max-h-48 overflow-y-auto">
          {game.history.map((t, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-[#555]">›</span>}
              <span className={t === game.puzzle?.target ? "text-[#7c3aed] font-bold" : ""}>{t}</span>
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          <button className={btnPrimary} onClick={game.start} disabled={game.loading}>
            Rejouer
          </button>
          <button className={btnGhost} onClick={() => { game.reset(); onBack(); }}>Accueil</button>
        </div>
      </div>
    </div>
  );

  if (game.phase === "lost") return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md text-center flex flex-col gap-5">
        <div className="text-5xl sm:text-6xl leading-none">⏱️</div>
        <h2 className="text-2xl sm:text-3xl font-black">Temps écoulé !</h2>
        {game.puzzle && (
          <p className="text-[#888] text-sm">
            L&apos;objectif était d&apos;atteindre{" "}
            <span className="text-[#7c3aed] font-semibold">{game.puzzle.target}</span>
          </p>
        )}
        <div className="flex gap-8 justify-center">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-red-400">{game.clicks}</span>
            <span className="text-xs text-[#888]">clics</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-black text-red-400">{game.history.length}</span>
            <span className="text-xs text-[#888]">articles visités</span>
          </div>
        </div>
        {game.history.length > 0 && (
          <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex flex-wrap gap-1 text-xs text-[#888] text-left max-h-48 overflow-y-auto">
            {game.history.map((t, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-[#555]">›</span>}
                <span>{t}</span>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          <button className={btnPrimary} onClick={game.start} disabled={game.loading}>
            Réessayer
          </button>
          <button className={btnGhost} onClick={() => { game.reset(); onBack(); }}>Accueil</button>
        </div>
      </div>
    </div>
  );

  // Playing
  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] flex flex-col">
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="article-container">
          {game.title && <h1 className="article-title">{game.title}</h1>}
          {game.loading && (
            <div className="flex items-center gap-3 py-10 px-4 text-[#888]"><div className="spinner" /> Chargement...</div>
          )}
          {game.loadError && (
            <div className="flex flex-col items-center gap-4 py-10 px-4 text-center">
              <p className="text-[#888] text-sm">{game.loadError}</p>
              <button className="min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#2563eb] text-white cursor-pointer" onClick={() => game.retryLoad()}>
                Réessayer
              </button>
            </div>
          )}
          {!game.loading && !game.loadError && game.html && (
            <ArticleView html={game.html} onNavigate={game.navigate} disabled={game.loading} />
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f]/97 backdrop-blur-sm border-t border-[#2e2e2e] px-3 sm:px-4 py-2 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#888]">Clics</span>
              <span className="text-sm font-black tabular-nums">{game.clicks}</span>
            </div>
          </div>

          {/* Timer */}
          <div className={`text-2xl sm:text-3xl font-black tabular-nums transition-colors ${danger ? "text-red-400 animate-pulse" : "text-[#f0f0f0]"}`}>
            {fmtLeft(game.timeLeft)}
          </div>

          {game.puzzle && (
            <div className="text-right">
              <div className="text-[8px] font-bold uppercase tracking-wider text-[#888]">Cible</div>
              <div className="text-xs font-bold text-[#7c3aed] max-w-28 truncate">{game.puzzle.target}</div>
            </div>
          )}
        </div>
        {game.history.length > 0 && (
          <div className="text-[10px] text-[#555] truncate">
            {game.history.join(" › ")}
          </div>
        )}
      </div>
    </div>
  );
}

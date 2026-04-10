"use client";

import { useEffect, useRef, useState } from "react";
import { useDailyGame } from "../../lib/useDailyGame";
import { fmt } from "../../lib/utils";
import { ArticleView } from "./ArticleView";
import { Breadcrumbs } from "./Breadcrumbs";

const MEDALS = ["🥇", "🥈", "🥉"];

type LeaderboardEntry = { rank: number; name: string; clicks: number; timeSeconds: number; userId: string };

export function DailyScreen({ onBack, currentUserId }: { onBack: () => void; currentUserId?: string }) {
  const game = useDailyGame();
  const breadcrumbEndRef = useRef<HTMLDivElement>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);

  useEffect(() => {
    breadcrumbEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" });
  }, [game.history]);

  function fetchLeaderboard() {
    setLoadingLb(true);
    fetch("/api/daily/leaderboard")
      .then((r) => r.json())
      .then(setLeaderboard)
      .finally(() => setLoadingLb(false));
  }

  useEffect(() => {
    if (game.phase === "won" || game.phase === "gave_up" || game.phase === "already_played") {
      fetchLeaderboard();
    }
  }, [game.phase]);

  const btnPrimary = "w-full min-h-11 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 cursor-pointer transition-colors";
  const btnGhost = "w-full min-h-11 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors";

  // Loading initial
  if (game.phase === "loading") return (
    <div className="min-h-dvh bg-[#0f0f0f] flex items-center justify-center">
      <div className="spinner" />
    </div>
  );

  // Erreur initiale
  if (game.loadError && game.phase === "loading") return (
    <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0] flex flex-col items-center justify-center gap-4 px-4">
      <p className="text-[#888]">{game.loadError}</p>
      <button className={btnGhost} style={{ width: "auto", padding: "0 20px" }} onClick={onBack}>Retour</button>
    </div>
  );

  // Résultat (won / gave_up / already_played)
  if (game.phase === "won" || game.phase === "gave_up" || game.phase === "already_played") {
    const result = game.myResult;
    return (
      <div className="min-h-dvh bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col max-w-lg mx-auto px-4 py-8 gap-6">
        <button className="self-start min-h-9 px-3 rounded-lg text-sm font-semibold bg-[#242424] border border-[#2e2e2e] hover:bg-[#1a1a1a] cursor-pointer" onClick={onBack}>
          ← Retour
        </button>

        <div className="text-center">
          <div className="text-xs font-bold text-[#888] uppercase tracking-widest mb-1">Défi du jour - {game.puzzle?.date}</div>
          <div className="text-2xl sm:text-3xl font-black mb-1">
            {game.phase === "won" ? "🎉 Réussi !" : game.phase === "gave_up" ? "😔 Abandonné" : "✅ Déjà joué"}
          </div>
          <div className="text-sm text-[#888]">
            <span className="text-[#f0f0f0] font-semibold">{game.puzzle?.startArticle}</span>
            <span className="mx-2">→</span>
            <span className="text-[#7c3aed] font-semibold">{game.puzzle?.targetArticle}</span>
          </div>
        </div>

        {result && (
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-black text-[#7c3aed]">{result.clicks}</div>
                <div className="text-xs text-[#888]">clics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-[#7c3aed]">{fmt(result.timeSeconds)}</div>
                <div className="text-xs text-[#888]">temps</div>
              </div>
            </div>
            {result.path.length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs text-[#888] pt-3 border-t border-[#2e2e2e]">
                {result.path.map((t, i) => (
                  <span key={i} className="flex items-center gap-0.5">
                    {i > 0 && <span className="text-[#555]">›</span>}
                    <span className={i === result.path.length - 1 && result.won ? "text-[#16a34a] font-semibold" : ""}>{t}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Classement du jour */}
        <div>
          <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-3">Classement du jour</h3>
          {loadingLb ? (
            <div className="flex justify-center py-6"><div className="spinner" /></div>
          ) : leaderboard.length === 0 ? (
            <p className="text-sm text-[#888] text-center py-4">Aucun résultat pour l&apos;instant.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaderboard.map((entry, i) => (
                <div key={i} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${entry.userId === currentUserId ? "border-[#7c3aed] bg-[#7c3aed]/8" : "border-[#2e2e2e] bg-[#1a1a1a]"}`}>
                  <span className="text-lg w-7 text-center shrink-0">{MEDALS[i] ?? `#${entry.rank}`}</span>
                  <span className="flex-1 font-semibold text-sm truncate">{entry.name}</span>
                  <span className="text-xs text-[#888] tabular-nums shrink-0">{entry.clicks} clics · {fmt(entry.timeSeconds)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className={btnGhost} onClick={onBack}>Retour à l&apos;accueil</button>
      </div>
    );
  }

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
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f0f]/97 backdrop-blur-sm border-t border-[#2e2e2e] flex items-center justify-between px-3 sm:px-4 py-2 gap-2">
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold uppercase tracking-widest text-[#888] shrink-0">🗓 Défi du jour · cible</span>
            <span className="text-xs font-black text-[#7c3aed] truncate">{game.puzzle?.targetArticle}</span>
          </div>
          <Breadcrumbs history={game.history} endRef={breadcrumbEndRef} />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-center gap-0.5 min-w-10">
            <span className="text-[8px] font-bold tracking-wider text-[#888] uppercase">Clics</span>
            <span className="text-xs font-black tabular-nums">{game.clicks}</span>
          </div>
          {game.canGoBack && (
            <button className="min-h-8 px-2 rounded-lg text-xs font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] disabled:opacity-50 cursor-pointer" onClick={game.goBack} disabled={game.loading}>
              ← +1
            </button>
          )}
          <button className="min-h-8 px-2 rounded-lg text-xs font-semibold bg-red-950/40 border border-red-900 text-red-400 hover:bg-red-900/40 cursor-pointer" onClick={game.giveUp}>
            Abandonner
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

type Game = {
  id: string;
  mode: string;
  startArticle: string;
  targetArticle: string;
  path: string[];
  clicks: number;
  timeSeconds: number;
  won: boolean;
  playedAt: string;
};

type Stats = {
  total: number;
  won: number;
  avgClicks: number;
  avgTime: number;
  bestClicks: number;
  bestTime: number;
};

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function computeStats(games: Game[]): Stats {
  const won = games.filter((g) => g.won);
  return {
    total: games.length,
    won: won.length,
    avgClicks: won.length ? Math.round(won.reduce((s, g) => s + g.clicks, 0) / won.length) : 0,
    avgTime: won.length ? won.reduce((s, g) => s + g.timeSeconds, 0) / won.length : 0,
    bestClicks: won.length ? Math.min(...won.map((g) => g.clicks)) : 0,
    bestTime: won.length ? Math.min(...won.map((g) => g.timeSeconds)) : 0,
  };
}

export function ProfileScreen({ userName, onBack }: { userName: string; onBack: () => void }) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "solo" | "multi">("all");

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data) => setGames(data as Game[]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? games : games.filter((g) => g.mode === filter);
  const stats = computeStats(filtered);

  const statCardCls = "bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-3.5 text-center flex flex-col gap-1";

  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col max-w-175 mx-auto px-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between py-4 gap-3">
        <button className="min-h-9.5 px-3.5 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer" onClick={onBack}>
          ← Retour
        </button>
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-lg font-bold shrink-0">
            {userName[0].toUpperCase()}
          </span>
          <h2 className="text-xl font-bold">{userName}</h2>
        </div>
        <button
          className="min-h-9.5 px-3.5 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer"
          onClick={() => signOut({ redirect: false }).then(onBack)}
        >
          Déconnexion
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2.5 my-4">
        <div className={statCardCls}>
          <span className="text-[22px] font-black">{stats.total}</span>
          <span className="text-[11px] uppercase tracking-wider text-[#888]">Parties</span>
        </div>
        <div className={statCardCls}>
          <span className="text-[22px] font-black">{stats.won}</span>
          <span className="text-[11px] uppercase tracking-wider text-[#888]">Victoires</span>
        </div>
        <div className={statCardCls}>
          <span className="text-[22px] font-black">{stats.avgClicks > 0 ? stats.avgClicks : "—"}</span>
          <span className="text-[11px] uppercase tracking-wider text-[#888]">Clics moy.</span>
        </div>
        <div className={statCardCls}>
          <span className="text-[22px] font-black">{stats.avgTime > 0 ? fmt(stats.avgTime) : "—"}</span>
          <span className="text-[11px] uppercase tracking-wider text-[#888]">Temps moy.</span>
        </div>
        <div className={`${statCardCls} border-[#7c3aed]`}>
          <span className="text-[22px] font-black text-[#7c3aed]">{stats.bestClicks > 0 ? stats.bestClicks : "—"}</span>
          <span className="text-[11px] uppercase tracking-wider text-[#888]">Meilleur clics</span>
        </div>
        <div className={`${statCardCls} border-[#7c3aed]`}>
          <span className="text-[22px] font-black text-[#7c3aed]">{stats.bestTime > 0 ? fmt(stats.bestTime) : "—"}</span>
          <span className="text-[11px] uppercase tracking-wider text-[#888]">Meilleur temps</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(["all", "solo", "multi"] as const).map((f) => (
          <button
            key={f}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${filter === f ? "bg-[#7c3aed] border-[#7c3aed] text-white" : "bg-[#242424] border-[#2e2e2e] text-[#888] hover:text-[#f0f0f0]"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Tout" : f === "solo" ? "Solo" : "Multi"}
          </button>
        ))}
      </div>

      {/* Game list */}
      <div className="flex flex-col gap-2.5">
        {loading && (
          <div className="flex items-center gap-3 py-10 text-[#888]"><div className="spinner" /> Chargement...</div>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-[#888] text-center py-10">Aucune partie enregistrée.</p>
        )}
        {filtered.map((g) => (
          <div key={g.id} className={`bg-[#1a1a1a] rounded-xl px-4 py-3.5 flex flex-col gap-2 border-l-4 ${g.won ? "border-l-[#16a34a] border-y border-r border-[#2e2e2e]" : "border-l-[#2e2e2e] border-y border-r border-[#2e2e2e] opacity-70"}`}>
            <div className="flex items-center gap-2.5 text-xs">
              <span className="bg-[#242424] rounded px-2 py-0.5 font-semibold text-[#888]">{g.mode === "solo" ? "Solo" : "Multi"}</span>
              <span className="text-[#888] ml-auto">{new Date(g.playedAt).toLocaleDateString("fr-FR")}</span>
              <span className={`font-bold ${g.won ? "text-[#16a34a]" : "text-[#888]"}`}>{g.won ? "Victoire" : "Abandon"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold flex-wrap">
              <span>{g.startArticle}</span>
              <span className="text-[#888]">→</span>
              <span className="text-[#7c3aed]">{g.targetArticle}</span>
            </div>
            {g.won && (
              <div className="flex gap-4 text-xs text-[#888]">
                <span>{g.clicks} clics</span>
                <span>{fmt(g.timeSeconds)}</span>
                <span>{g.path.length - 1} articles parcourus</span>
              </div>
            )}
            {g.path.length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs text-[#888] pt-1 border-t border-[#2e2e2e]">
                {g.path.map((t, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-[#555]">›</span>}
                    <span className={i === g.path.length - 1 && g.won ? "text-[#16a34a] font-semibold" : ""}>{t}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

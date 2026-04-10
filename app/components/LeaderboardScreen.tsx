"use client";

import { useEffect, useState } from "react";

type LeaderboardRow = {
  id: string;
  name: string;
  totalGames: number;
  wins: number;
  soloGames: number;
  soloWins: number;
  multiGames: number;
  multiWins: number;
  avgClicks: number | null;
  bestTime: number | null;
};

type Mode = "all" | "solo" | "multi";

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("all");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => { setRows(data); setLoading(false); });
  }, []);

  const sorted = [...rows]
    .filter((r) => mode === "solo" ? r.soloGames > 0 : mode === "multi" ? r.multiGames > 0 : true)
    .sort((a, b) => {
      if (mode === "solo") return b.soloWins - a.soloWins || b.soloGames - a.soloGames;
      if (mode === "multi") return b.multiWins - a.multiWins || b.multiGames - a.multiGames;
      return b.wins - a.wins || b.totalGames - a.totalGames;
    });

  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in max-w-2xl mx-auto px-4 py-5 sm:py-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
        <button
          className="min-h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer shrink-0"
          onClick={onBack}
        >
          Retour
        </button>
        <h2 className="text-xl sm:text-2xl font-black">Classement</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 sm:mb-5">
        {(["all", "solo", "multi"] as Mode[]).map((m) => (
          <button
            key={m}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold border cursor-pointer transition-colors ${mode === m ? "bg-[#7c3aed] border-[#7c3aed] text-white" : "bg-[#1a1a1a] border-[#2e2e2e] text-[#888] hover:text-[#f0f0f0]"}`}
            onClick={() => setMode(m)}
          >
            {m === "all" ? "Global" : m === "solo" ? "Solo" : "Multi"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : sorted.length === 0 ? (
        <p className="text-[#888] text-sm text-center py-12">Aucune partie jouée pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-2.5">
          {sorted.map((row, i) => {
            const games = mode === "solo" ? row.soloGames : mode === "multi" ? row.multiGames : row.totalGames;
            const wins = mode === "solo" ? row.soloWins : mode === "multi" ? row.multiWins : row.wins;

            return (
              <div key={row.id} className={`flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-3 sm:py-3.5 rounded-xl border ${i < 3 ? "border-[#7c3aed] bg-[#7c3aed]/8" : "border-[#2e2e2e] bg-[#1a1a1a]"}`}>
                <span className="text-lg sm:text-xl w-7 sm:w-8 text-center shrink-0">{MEDALS[i] ?? `#${i + 1}`}</span>
                <span className="flex-1 font-bold text-xs sm:text-sm truncate">{row.name}</span>
                <div className="flex gap-2.5 sm:gap-4 shrink-0">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs sm:text-sm font-black tabular-nums">{wins}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#888]">victoires</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-xs sm:text-sm font-black tabular-nums">{games}</span>
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[#888]">parties</span>
                  </div>
                  {row.avgClicks != null && (
                    <div className="hidden sm:flex flex-col items-center gap-0.5">
                      <span className="text-sm font-black tabular-nums">{row.avgClicks}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#888]">moy. clics</span>
                    </div>
                  )}
                  {row.bestTime != null && (
                    <div className="hidden sm:flex flex-col items-center gap-0.5">
                      <span className="text-sm font-black tabular-nums">{fmt(row.bestTime)}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#888]">meilleur</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

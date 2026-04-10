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

  const sorted = [...rows].sort((a, b) => {
    if (mode === "solo") return b.soloWins - a.soloWins || b.soloGames - a.soloGames;
    if (mode === "multi") return b.multiWins - a.multiWins || b.multiGames - a.multiGames;
    return b.wins - a.wins || b.totalGames - a.totalGames;
  }).filter((r) => {
    if (mode === "solo") return r.soloGames > 0;
    if (mode === "multi") return r.multiGames > 0;
    return true;
  });

  return (
    <div className="screen leaderboard-screen">
      <div className="leaderboard-header">
        <button className="btn btn-ghost btn-back" onClick={onBack}>Retour</button>
        <h2 className="leaderboard-title">Classement</h2>
      </div>

      <div className="leaderboard-tabs">
        {(["all", "solo", "multi"] as Mode[]).map((m) => (
          <button
            key={m}
            className={`leaderboard-tab ${mode === m ? "active" : ""}`}
            onClick={() => setMode(m)}
          >
            {m === "all" ? "Global" : m === "solo" ? "Solo" : "Multijoueur"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="leaderboard-loading"><div className="loading-spinner" /></div>
      ) : sorted.length === 0 ? (
        <p className="leaderboard-empty">Aucune partie jouée pour le moment.</p>
      ) : (
        <div className="leaderboard-list">
          {sorted.map((row, i) => {
            const games = mode === "solo" ? row.soloGames : mode === "multi" ? row.multiGames : row.totalGames;
            const wins = mode === "solo" ? row.soloWins : mode === "multi" ? row.multiWins : row.wins;

            return (
              <div key={row.id} className={`leaderboard-row ${i < 3 ? "top" : ""}`}>
                <span className="lb-rank">{MEDALS[i] ?? `#${i + 1}`}</span>
                <span className="lb-name">{row.name}</span>
                <div className="lb-stats">
                  <span className="lb-stat"><span className="lb-stat-val">{wins}</span><span className="lb-stat-label">victoires</span></span>
                  <span className="lb-stat"><span className="lb-stat-val">{games}</span><span className="lb-stat-label">parties</span></span>
                  {row.avgClicks != null && (
                    <span className="lb-stat"><span className="lb-stat-val">{row.avgClicks}</span><span className="lb-stat-label">moy. clics</span></span>
                  )}
                  {row.bestTime != null && (
                    <span className="lb-stat"><span className="lb-stat-val">{fmt(row.bestTime)}</span><span className="lb-stat-label">meilleur temps</span></span>
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

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

export function ProfileScreen({
  userName,
  onBack,
}: {
  userName: string;
  onBack: () => void;
}) {
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

  return (
    <div className="screen profile-screen">
      <div className="profile-header">
        <button className="btn btn-ghost btn-back" onClick={onBack}>← Retour</button>
        <div className="profile-title">
          <span className="profile-avatar">{userName[0].toUpperCase()}</span>
          <h2 className="profile-name">{userName}</h2>
        </div>
        <button className="btn btn-ghost" onClick={() => signOut({ redirect: false }).then(onBack)}>
          Déconnexion
        </button>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card">
          <span className="stat-card-value">{stats.total}</span>
          <span className="stat-card-label">Parties</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-value">{stats.won}</span>
          <span className="stat-card-label">Victoires</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-value">{stats.avgClicks > 0 ? stats.avgClicks : "—"}</span>
          <span className="stat-card-label">Clics moy.</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-value">{stats.avgTime > 0 ? fmt(stats.avgTime) : "—"}</span>
          <span className="stat-card-label">Temps moy.</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-card-value">{stats.bestClicks > 0 ? stats.bestClicks : "—"}</span>
          <span className="stat-card-label">Meilleur clics</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-card-value">{stats.bestTime > 0 ? fmt(stats.bestTime) : "—"}</span>
          <span className="stat-card-label">Meilleur temps</span>
        </div>
      </div>

      <div className="profile-filters">
        {(["all", "solo", "multi"] as const).map((f) => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "Tout" : f === "solo" ? "Solo" : "Multi"}
          </button>
        ))}
      </div>

      <div className="games-list">
        {loading && <div className="article-loading"><div className="loading-spinner" /> Chargement...</div>}
        {!loading && filtered.length === 0 && (
          <p className="games-empty">Aucune partie enregistrée.</p>
        )}
        {filtered.map((g) => (
          <div key={g.id} className={`game-card ${g.won ? "won" : "lost"}`}>
            <div className="game-card-top">
              <span className="game-card-mode">{g.mode === "solo" ? "Solo" : "Multi"}</span>
              <span className="game-card-date">{new Date(g.playedAt).toLocaleDateString("fr-FR")}</span>
              <span className={`game-card-result ${g.won ? "won" : "lost"}`}>{g.won ? "Victoire" : "Abandon"}</span>
            </div>
            <div className="game-card-route">
              <span className="game-card-start">{g.startArticle}</span>
              <span className="game-card-arrow">→</span>
              <span className="game-card-target">{g.targetArticle}</span>
            </div>
            {g.won && (
              <div className="game-card-stats">
                <span>{g.clicks} clics</span>
                <span>{fmt(g.timeSeconds)}</span>
                <span>{g.path.length - 1} articles parcourus</span>
              </div>
            )}
            {g.path.length > 0 && (
              <div className="game-card-path">
                {g.path.map((t, i) => (
                  <span key={i} className="game-path-item">
                    {i > 0 && <span className="game-path-sep">›</span>}
                    <span className={i === g.path.length - 1 && g.won ? "game-path-end" : ""}>{t}</span>
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

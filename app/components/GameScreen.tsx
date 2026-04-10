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

  if (room.phase === "results") {
    return (
      <div className="screen results-screen">
        <div className="results-content">
          <div className="results-winner-banner">
            {winner ? (
              <>
                <div className="results-winner-emoji">Victoire !</div>
                <div className="results-winner-name">{winner.name} a gagne la manche !</div>
              </>
            ) : (
              <div className="results-winner-name">Manche terminee !</div>
            )}
          </div>
          <div className="results-path">
            <span className="path-start">{room.startArticle}</span>
            <span className="path-arrow"> → </span>
            <span className="path-end">{room.targetArticle}</span>
          </div>
          <div className="results-scoreboard">
            <h3 className="results-title">Classement</h3>
            <ul className="scoreboard-list">
              {sortedPlayers.map((p, i) => (
                <li key={p.id} className={`scoreboard-item ${p.id === playerId ? "me" : ""}`}>
                  <span className="scoreboard-rank">#{i + 1}</span>
                  <span className="scoreboard-name">{p.name}</span>
                  {p.hasWon && <span className="player-badge winner">Gagnant</span>}
                  <span className="scoreboard-score">{p.score} pts</span>
                </li>
              ))}
            </ul>
          </div>
          {isHost ? (
            <div className="results-actions">
              <button className="btn btn-primary" onClick={onNextRound}>Manche suivante</button>
              <button className="btn btn-ghost" onClick={onResetGame}>Nouvelle partie</button>
            </div>
          ) : (
            <p className="lobby-waiting">En attente de l&apos;hote...</p>
          )}
        </div>
      </div>
    );
  }

  if (room.phase === "countdown") {
    return (
      <div className="screen countdown-screen">
        <div className="countdown-content">
          <div className="countdown-path">
            <div className="countdown-article">
              <span className="countdown-label">Depart</span>
              <span className="countdown-article-name">{room.startArticle}</span>
            </div>
            <div className="countdown-arrow">→</div>
            <div className="countdown-article">
              <span className="countdown-label">Cible</span>
              <span className="countdown-article-name highlight">{room.targetArticle}</span>
            </div>
          </div>
          <div className="countdown-number">
            {countdown !== null && countdown > 0 ? countdown : "Partez !"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen game-screen">
      <div className="game-topbar">
        <div className="topbar-trail-zone">
          <div className="topbar-target-row">
            <span className="topbar-label">CIBLE</span>
            <span className="topbar-target-name">{room.targetArticle}</span>
          </div>
          <Breadcrumbs history={history} endRef={breadcrumbEndRef} />
        </div>
        <div className="topbar-stats">
          <span className="stat">{elapsed}</span>
          <span className="stat">{clicks} clics</span>
          <span className="stat">{myPlayer?.score ?? 0} pts</span>
        </div>
      </div>

      <div className="game-layout">
        <div className="game-main">
          {loading && (
            <div className="article-loading"><div className="loading-spinner" /> Chargement...</div>
          )}
          {loadError && (
            <div className="article-error">
              <p>{loadError}</p>
              <button className="btn btn-secondary" onClick={onRetry}>Reessayer</button>
            </div>
          )}
          {!loading && !loadError && html && (
            <div className="article-container">
              <h1 className="article-title">{title}</h1>
              <ArticleView html={html} onNavigate={onNavigate} disabled={loading} />
            </div>
          )}
        </div>

        <aside className="game-sidebar">
          <h4 className="sidebar-title">Joueurs</h4>
          <ul className="sidebar-players">
            {sortedPlayers.map((p) => (
              <li key={p.id} className={`sidebar-player ${p.id === playerId ? "me" : ""}`}>
                <span className="sidebar-player-name">{p.name}</span>
                <span className="sidebar-player-score">{p.score} pts</span>
                {p.hasWon && <span className="sidebar-player-won">Gagne !</span>}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

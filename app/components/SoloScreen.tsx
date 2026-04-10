"use client";

import { useEffect, useRef } from "react";
import { ArticleView } from "./ArticleView";
import { Breadcrumbs } from "./Breadcrumbs";
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

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function SoloScreen({
  phase, puzzle, html, title, loading, loadError, history, clicks,
  elapsedDisplay, canGoBack, onStart, onNavigate, onBack, onQuit, onNewGame, onRetry,
}: SoloScreenProps) {
  const breadcrumbEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    breadcrumbEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" });
  }, [history]);

  return (
    <div className="screen solo-screen">
      {phase === "setup" && (
        <div className="center-content">
          <button className="btn btn-ghost btn-back" onClick={onQuit}>Retour</button>
          <h2 className="section-title">Mode Solo</h2>
          <p className="section-desc">
            Deux articles aleatoires seront choisis. Atteins l&apos;article cible en cliquant uniquement sur les liens !
          </p>
          <button className="btn btn-primary" onClick={onStart} disabled={loading}>
            {loading ? "Preparation..." : "Lancer une partie"}
          </button>
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="game-main">
            <div className="article-container">
              {title && <h1 className="article-title">{title}</h1>}
              {loading && (
                <div className="article-loading">
                  <div className="loading-spinner" />
                  Chargement...
                </div>
              )}
              {loadError && (
                <div className="article-error">
                  <p>{loadError}</p>
                  <button className="btn btn-secondary" onClick={onRetry}>Reessayer</button>
                </div>
              )}
              {!loading && !loadError && html && (
                <ArticleView html={html} onNavigate={onNavigate} disabled={loading} />
              )}
            </div>
          </div>

          <div className="solo-bottombar">
            <div className="breadcrumb-zone">
              <span className="breadcrumb-label">VOUS DEVEZ TROUVER</span>
              <span className="breadcrumb-target">{puzzle?.target}</span>
              <Breadcrumbs history={history} endRef={breadcrumbEndRef} />
            </div>
            <div className="solo-stats">
              <div className="solo-stat">
                <span className="solo-stat-label">TEMPS</span>
                <span className="solo-stat-value">{elapsedDisplay}</span>
              </div>
              <div className="solo-stat">
                <span className="solo-stat-label">CLICS</span>
                <span className="solo-stat-value">{clicks}</span>
              </div>
              {canGoBack && (
                <button className="btn btn-ghost solo-back-btn" onClick={onBack} disabled={loading}>
                  &larr; Retour <span className="solo-back-cost">+1</span>
                </button>
              )}
              <button className="btn btn-ghost solo-quit" onClick={onQuit}>
                Quitter
              </button>
            </div>
          </div>
        </>
      )}

      {phase === "won" && (
        <div className="victory-screen">
          <div className="victory-content">
            <div className="victory-emoji">Bravo !</div>
            <h2 className="victory-title">Article atteint !</h2>
            <div className="victory-stats">
              <div className="victory-stat">
                <span className="victory-stat-value">{clicks}</span>
                <span className="victory-stat-label">clics</span>
              </div>
              <div className="victory-stat">
                <span className="victory-stat-value">{elapsedDisplay}</span>
                <span className="victory-stat-label">temps</span>
              </div>
            </div>
            <div className="victory-path-full">
              {history.map((t, i) => (
                <span key={i} className="victory-path-item">
                  {i > 0 && <span className="victory-path-sep">›</span>}
                  <span className={i === history.length - 1 ? "victory-path-end" : "victory-path-step"}>{t}</span>
                </span>
              ))}
            </div>
            <div className="victory-actions">
              <button className="btn btn-primary" onClick={onNewGame}>Nouvelle partie</button>
              <button className="btn btn-ghost" onClick={onQuit}>Accueil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

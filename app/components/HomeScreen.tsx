"use client";

import type { Session } from "next-auth";

type HomeScreenProps = {
  playerName: string;
  setPlayerName: (v: string) => void;
  joinCode: string;
  setJoinCode: (v: string) => void;
  error: string | null;
  setError: (v: string | null) => void;
  loading: boolean;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onSolo: () => void;
  session: Session | null;
  onShowAuth: () => void;
  onShowProfile: () => void;
};

export function HomeScreen({
  playerName, setPlayerName, joinCode, setJoinCode,
  error, setError, loading, onCreateRoom, onJoinRoom, onSolo,
  session, onShowAuth, onShowProfile,
}: HomeScreenProps) {
  return (
    <div className="screen home-screen">
      <div className="home-topbar">
        {session?.user ? (
          <button className="btn-account" onClick={onShowProfile}>
            <span className="account-avatar">{session.user.name?.[0]?.toUpperCase() ?? "?"}</span>
            <span className="account-name">{session.user.name}</span>
          </button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={onShowAuth}>
            Connexion / Inscription
          </button>
        )}
      </div>

      <div className="home-hero">
        <div className="home-logo">
          <span className="logo-wiki">Wiki</span>
          <span className="logo-race">Rush</span>
        </div>
        <p className="home-subtitle">
          Navigue entre les articles Wikipedia pour atteindre la cible en premier !
        </p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)} className="error-close">x</button>
        </div>
      )}

      <div className="home-form">
        <input
          className="input"
          type="text"
          placeholder="Ton pseudo"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          onKeyDown={(e) => e.key === "Enter" && onCreateRoom()}
        />

        <div className="home-actions">
          <div className="home-section">
            <h3>Multijoueur</h3>
            <button className="btn btn-primary" onClick={onCreateRoom} disabled={loading}>
              {loading ? "Creation..." : "Creer une partie"}
            </button>
            <div className="join-row">
              <input
                className="input input-code"
                type="text"
                placeholder="Code (ex: WIKI)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                maxLength={4}
                onKeyDown={(e) => e.key === "Enter" && onJoinRoom()}
              />
              <button className="btn btn-secondary" onClick={onJoinRoom} disabled={loading}>
                Rejoindre
              </button>
            </div>
          </div>

          <div className="home-divider">ou</div>

          <div className="home-section">
            <h3>Solo</h3>
            <button className="btn btn-ghost" onClick={onSolo}>
              Jouer en solo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

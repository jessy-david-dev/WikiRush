"use client";

import { useState } from "react";
import type { Room } from "../api/rooms/route";

type LobbyScreenProps = {
  room: Room;
  playerId: string;
  error: string | null;
  setError: (v: string | null) => void;
  loading: boolean;
  onLeave: () => void;
  onStart: () => void;
  onReset: () => void;
};

export function LobbyScreen({
  room, playerId, error, setError, loading, onLeave, onStart, onReset,
}: LobbyScreenProps) {
  const isHost = room.players.find((p) => p.id === playerId)?.isHost ?? false;
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(room.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="screen lobby-screen">
      <button className="btn btn-ghost btn-back" onClick={onLeave}>Quitter</button>

      <div className="lobby-code-block">
        <span className="lobby-code-label">Code de la salle</span>
        <button className="lobby-code-copy" onClick={copyCode} title="Copier le code">
          <span className="lobby-code">{room.code}</span>
          <span className="lobby-copy-icon">{copied ? "✓" : "⧉"}</span>
        </button>
        <span className="lobby-code-hint">{copied ? "Copié !" : "Clique sur le code pour le copier"}</span>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)} className="error-close">x</button>
        </div>
      )}

      <div className="lobby-players">
        <h3 className="lobby-section-title">Joueurs ({room.players.length}/8)</h3>
        <ul className="player-list">
          {room.players.map((p) => (
            <li key={p.id} className={`player-item ${p.id === playerId ? "me" : ""}`}>
              <span className="player-name">{p.name}</span>
              {p.isHost && <span className="player-badge host">Hote</span>}
              {p.id === playerId && <span className="player-badge you">Toi</span>}
              <span className="player-score">{p.score} pts</span>
            </li>
          ))}
        </ul>
      </div>

      {room.round > 0 && <div className="lobby-round-info">Manche {room.round} terminee</div>}

      {isHost ? (
        <div className="lobby-host-actions">
          <button className="btn btn-primary" onClick={onStart} disabled={loading}>
            {loading ? "Preparation..." : room.round === 0 ? "Demarrer la partie" : "Manche suivante"}
          </button>
          {room.round > 0 && (
            <button className="btn btn-ghost" onClick={onReset}>Nouvelle partie (reset scores)</button>
          )}
        </div>
      ) : (
        <p className="lobby-waiting">En attente que l&apos;hote demarre...</p>
      )}
    </div>
  );
}

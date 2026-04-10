"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Mode = "login" | "register";

export function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json() as { error?: string };
        if (!res.ok) { setError(data.error ?? "Erreur"); return; }
      }

      const result = await signIn("credentials", {
        email, password, redirect: false,
      });

      if (result?.error) { setError("Email ou mot de passe incorrect"); return; }
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-tabs">
          <button
            className={`modal-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(null); }}
          >
            Connexion
          </button>
          <button
            className={`modal-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(null); }}
          >
            Inscription
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              className="input"
              type="text"
              placeholder="Pseudo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={30}
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <div className="error-banner" style={{ marginBottom: 0 }}>{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer un compte"}
          </button>
        </form>

        <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
      </div>
    </div>
  );
}

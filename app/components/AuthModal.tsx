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
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("Email ou mot de passe incorrect"); return; }
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full min-h-11 px-3.5 bg-[#0f0f0f] border-[1.5px] border-[#2e2e2e] rounded-xl text-[#f0f0f0] text-sm outline-none focus:border-[#7c3aed]";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-1000 p-4" onClick={onClose}>
      <div className="relative bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-8 w-full max-w-96 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3.5 text-[#888] hover:text-[#f0f0f0] text-lg leading-none px-1.5 py-1 cursor-pointer bg-transparent border-none" onClick={onClose} aria-label="Fermer">✕</button>

        <div className="flex border-b border-[#2e2e2e] mb-6">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              className={`flex-1 text-sm font-semibold py-2.5 border-b-2 -mb-px cursor-pointer bg-transparent transition-colors ${mode === m ? "text-[#7c3aed] border-[#7c3aed]" : "text-[#888] border-transparent hover:text-[#f0f0f0]"}`}
              onClick={() => { setMode(m); setError(null); }}
            >
              {m === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {mode === "register" && (
            <input className={inputCls} type="text" placeholder="Pseudo" value={name} onChange={(e) => setName(e.target.value)} required maxLength={30} />
          )}
          <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={inputCls} type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

          {error && (
            <div className="bg-red-950/40 border border-red-600 text-red-300 px-3 py-2 rounded-xl text-sm">{error}</div>
          )}

          <button className="w-full min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 cursor-pointer mt-1" type="submit" disabled={loading}>
            {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer un compte"}
          </button>
          {mode === "register" && (
            <p className="text-xs text-[#555] text-center leading-relaxed">
              En créant un compte, vous acceptez notre{" "}
              <a href="/privacy" className="text-[#888] hover:text-[#f0f0f0] underline underline-offset-2 transition-colors">
                politique de confidentialité
              </a>.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

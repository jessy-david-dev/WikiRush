"use client";

import Image from "next/image";
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
  onShowLeaderboard: () => void;
};

export function HomeScreen({
  playerName, setPlayerName, joinCode, setJoinCode,
  error, setError, loading, onCreateRoom, onJoinRoom, onSolo,
  session, onShowAuth, onShowProfile, onShowLeaderboard,
}: HomeScreenProps) {
  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col items-center justify-center px-4 py-6 gap-8">
      {/* Topbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer"
          onClick={onShowLeaderboard}
        >
          🏆 Classement
        </button>
        {session?.user ? (
          <button
            className="flex items-center gap-2 bg-[#242424] border border-[#2e2e2e] rounded-full pl-1.5 pr-3 py-1.5 cursor-pointer hover:bg-[#1a1a1a] text-sm font-medium"
            onClick={onShowProfile}
          >
            <span className="w-7 h-7 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs font-bold">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </span>
            <span className="max-w-[120px] truncate">{session.user.name}</span>
          </button>
        ) : (
          <button
            className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer"
            onClick={onShowAuth}
          >
            Connexion / Inscription
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="text-center">
        <Image src="/wikirush.png" alt="WikiRush" width={320} height={320} className="w-[clamp(200px,55vw,320px)] h-auto mx-auto mix-blend-screen" priority />
        <p className="mt-3 text-[#888] text-sm max-w-[360px] mx-auto">
          Navigue entre les articles Wikipedia pour atteindre la cible en premier !
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-[400px] flex flex-col gap-4">
        {error && (
          <div className="flex items-center justify-between gap-3 bg-red-950/40 border border-red-600 text-red-300 px-3 py-2.5 rounded-xl text-sm">
            {error}
            <button onClick={() => setError(null)} className="text-base px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer">✕</button>
          </div>
        )}

        <input
          className="w-full min-h-[44px] px-3.5 bg-[#1a1a1a] border-[1.5px] border-[#2e2e2e] rounded-xl text-[#f0f0f0] text-sm outline-none focus:border-[#7c3aed]"
          type="text"
          placeholder="Ton pseudo"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          onKeyDown={(e) => e.key === "Enter" && onCreateRoom()}
        />

        <div className="flex flex-col gap-4">
          {/* Multijoueur */}
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider">Multijoueur</h3>
            <button
              className="w-full min-h-[44px] px-5 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 cursor-pointer"
              onClick={onCreateRoom} disabled={loading}
            >
              {loading ? "Création..." : "Créer une partie"}
            </button>
            <div className="flex gap-2.5 items-center">
              <input
                className="flex-1 min-h-[44px] px-3.5 bg-[#0f0f0f] border-[1.5px] border-[#2e2e2e] rounded-xl text-[#f0f0f0] font-mono text-lg tracking-widest uppercase outline-none focus:border-[#7c3aed]"
                type="text"
                placeholder="CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                maxLength={4}
                onKeyDown={(e) => e.key === "Enter" && onJoinRoom()}
              />
              <button
                className="min-h-[44px] px-5 rounded-xl text-sm font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] disabled:opacity-50 cursor-pointer flex-shrink-0"
                onClick={onJoinRoom} disabled={loading}
              >
                Rejoindre
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative text-center text-[#888] text-xs">
            <span className="relative z-10 px-3 bg-[#0f0f0f]">ou</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#2e2e2e] -z-0" />
          </div>

          {/* Solo */}
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#888] uppercase tracking-wider">Solo</h3>
            <button
              className="w-full min-h-[44px] px-5 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer"
              onClick={onSolo}
            >
              Jouer en solo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

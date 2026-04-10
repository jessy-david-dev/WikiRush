"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Session } from "next-auth";

function todayEmoji(n: number): string {
  if (n >= 10000) return "🚀";
  if (n >= 5000) return "🔥";
  if (n >= 1000) return "⚡";
  if (n >= 500) return "🎯";
  if (n >= 100) return "🎮";
  if (n >= 10) return "👾";
  return "🌱";
}

function useDailyStats() {
  const [today, setToday] = useState<number | null>(null); // renommé plus bas en total
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setToday(d.total))
      .catch(() => {});
  }, []);
  return today;
}

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
  onDaily: () => void;
  onBlitz: () => void;
};

export function HomeScreen({
  playerName,
  setPlayerName,
  joinCode,
  setJoinCode,
  error,
  setError,
  loading,
  onCreateRoom,
  onJoinRoom,
  onSolo,
  session,
  onShowAuth,
  onShowProfile,
  onShowLeaderboard,
  onDaily,
  onBlitz,
}: HomeScreenProps) {
  const btnGhost =
    "min-h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer whitespace-nowrap";
  const today = useDailyStats();

  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col items-center justify-center px-4 py-16 gap-6 sm:gap-8">
      {/* Topbar */}
      <div className="fixed top-3 right-3 flex items-center gap-1.5 sm:gap-2 z-50">
        <button className={btnGhost} onClick={onShowLeaderboard}>
          🏆 Classement
        </button>
        {session?.user ? (
          <button
            className="flex items-center gap-1.5 sm:gap-2 bg-[#242424] border border-[#2e2e2e] rounded-full pl-1 pr-2.5 sm:pr-3 py-1 cursor-pointer hover:bg-[#1a1a1a]"
            onClick={onShowProfile}
          >
            <span className="w-7 h-7 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </span>
            <span className="hidden sm:block max-w-28 truncate text-sm font-medium">
              {session.user.name}
            </span>
          </button>
        ) : (
          <button className={btnGhost} onClick={onShowAuth}>
            Connexion
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="text-center">
        <Image
          src="/wikirush.png"
          alt="WikiRush"
          width={320}
          height={320}
          className="w-40 sm:w-56 md:w-72 h-auto mx-auto mix-blend-screen"
          priority
        />
        <p className="mt-3 text-sm sm:text-base font-semibold text-[#f0f0f0] max-w-xs sm:max-w-sm mx-auto leading-relaxed tracking-wide">
          Navigue entre les articles Wikipedia pour atteindre la cible en
          premier !
        </p>
        {today !== null && (
          <p className="mt-2 text-xs text-[#888]">
            {todayEmoji(today)}{" "}
            <span className="font-semibold text-[#f0f0f0]">
              {today.toLocaleString("fr-FR")}
            </span>{" "}
            partie{today > 1 ? "s" : ""} jouée{today > 1 ? "s" : ""} au total
          </p>
        )}
      </div>

      {/* Form */}
      <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-3 sm:gap-4">
        {error && (
          <div className="flex items-center justify-between gap-3 bg-red-950/40 border border-red-600 text-red-300 px-3 py-2.5 rounded-xl text-xs sm:text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="shrink-0 px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <input
          className="w-full min-h-11 px-3.5 bg-[#1a1a1a] border-[1.5px] border-[#2e2e2e] rounded-xl text-[#f0f0f0] text-sm outline-none focus:border-[#7c3aed] transition-colors"
          type="text"
          placeholder="Ton pseudo"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
          onKeyDown={(e) => e.key === "Enter" && onCreateRoom()}
        />

        {/* Multijoueur */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <h3 className="text-[10px] sm:text-xs font-bold text-[#888] uppercase tracking-wider">
            Multijoueur
          </h3>
          <button
            className="w-full min-h-11 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-50 cursor-pointer transition-colors"
            onClick={onCreateRoom}
            disabled={loading}
          >
            {loading ? "Création..." : "Créer une partie"}
          </button>
          {/* Join row - colonne sur mobile, ligne sur sm+ */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              className="flex-1 min-h-11 px-3.5 bg-[#0f0f0f] border-[1.5px] border-[#2e2e2e] rounded-xl text-[#f0f0f0] font-mono text-base sm:text-lg tracking-widest uppercase outline-none focus:border-[#7c3aed] transition-colors"
              type="text"
              placeholder="Code de la partie"
              value={joinCode}
              onChange={(e) =>
                setJoinCode(e.target.value.toUpperCase().slice(0, 4))
              }
              maxLength={4}
              onKeyDown={(e) => e.key === "Enter" && onJoinRoom()}
            />
            <button
              className="w-full sm:w-auto min-h-11 px-5 rounded-xl text-sm font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] disabled:opacity-50 cursor-pointer shrink-0 transition-colors"
              onClick={onJoinRoom}
              disabled={loading}
            >
              Rejoindre
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative text-center text-[#888] text-xs py-1">
          <span className="relative z-10 px-3 bg-[#0f0f0f]">ou</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-[#2e2e2e]" />
        </div>

        {/* Solo */}
        <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 sm:p-5 flex flex-col gap-3">
          <h3 className="text-[10px] sm:text-xs font-bold text-[#888] uppercase tracking-wider">
            Solo
          </h3>
          <button
            className="w-full min-h-11 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
            onClick={onSolo}
          >
            🎯 Jouer en solo
          </button>
          <button
            className="w-full min-h-11 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
            onClick={onDaily}
          >
            🗓 Défi du jour
          </button>
          <button
            className="w-full min-h-11 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors"
            onClick={onBlitz}
          >
            ⚡ Mode Blitz - 2 min
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type PublicProfile = {
  id: string;
  name: string;
  createdAt: string;
  stats: {
    total: number;
    wins: number;
    winRate: number;
    avgClicks: number | null;
    bestClicks: number | null;
    bestTime: number | null;
    avgTime: number | null;
    solo: { games: number; wins: number };
    multi: { games: number; wins: number };
    daily: { games: number; wins: number };
    blitz: { games: number; wins: number };
  };
};

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const MODE_LABELS: Record<string, string> = {
  solo: "Solo",
  multi: "Multijoueur",
  daily: "Défi du jour",
  blitz: "Blitz",
};

export function PublicProfileScreen({
  userId,
  onBack,
}: {
  userId: string;
  onBack: () => void;
}) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setProfile(d);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const statCard =
    "bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-3 sm:p-3.5 text-center flex flex-col gap-1";
  const btnGhost =
    "min-h-9 px-3 rounded-lg text-xs sm:text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] cursor-pointer transition-colors";

  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] animate-fade-in flex flex-col max-w-2xl mx-auto px-4 pb-10">
      <div className="flex items-center gap-3 py-4">
        <button className={btnGhost} onClick={onBack}>
          ← Retour
        </button>
        {profile && (
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-base sm:text-lg font-bold shrink-0">
              {profile.name[0].toUpperCase()}
            </span>
            <div>
              <h2 className="text-base sm:text-xl font-bold">{profile.name}</h2>
              <p className="text-[10px] text-[#555]">
                Membre depuis{" "}
                {new Date(profile.createdAt).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-[#888] text-sm py-10 text-center animate-pulse">
          Chargement...
        </div>
      )}
      {notFound && (
        <p className="text-[#888] text-sm py-10 text-center">
          Joueur introuvable.
        </p>
      )}

      {profile && (
        <div className="flex flex-col gap-5">
          {/* Stats principales */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <div className={statCard}>
              <span className="text-lg sm:text-[22px] font-black">
                {profile.stats.total}
              </span>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#888]">
                Parties
              </span>
            </div>
            <div className={statCard}>
              <span className="text-lg sm:text-[22px] font-black">
                {profile.stats.wins}
              </span>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#888]">
                Victoires
              </span>
            </div>
            <div className={statCard}>
              <span className="text-lg sm:text-[22px] font-black">
                {profile.stats.winRate}%
              </span>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#888]">
                Win rate
              </span>
            </div>
            <div className={statCard}>
              <span className="text-lg sm:text-[22px] font-black">
                {profile.stats.avgClicks ?? "-"}
              </span>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#888]">
                Clics moy.
              </span>
            </div>
            <div className={`${statCard} border-[#7c3aed]`}>
              <span className="text-lg sm:text-[22px] font-black text-[#7c3aed]">
                {profile.stats.bestClicks ?? "-"}
              </span>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#888]">
                Meilleur clics
              </span>
            </div>
            <div className={`${statCard} border-[#7c3aed]`}>
              <span className="text-lg sm:text-[22px] font-black text-[#7c3aed]">
                {profile.stats.bestTime ? fmt(profile.stats.bestTime) : "-"}
              </span>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-wider text-[#888]">
                Meilleur temps
              </span>
            </div>
          </div>

          {/* Stats par mode */}
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4 flex flex-col gap-2">
            <h3 className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1">
              Par mode
            </h3>
            {(["solo", "multi", "daily", "blitz"] as const).map((m) => {
              const s = profile.stats[m];
              if (s.games === 0) return null;
              return (
                <div
                  key={m}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-[#2e2e2e] last:border-0"
                >
                  <span className="font-semibold text-[#f0f0f0]">
                    {MODE_LABELS[m]}
                  </span>
                  <div className="flex items-center gap-3 text-[#888] text-xs">
                    <span>
                      <span className="text-[#f0f0f0] font-bold">{s.wins}</span>{" "}
                      victoires
                    </span>
                    <span>
                      <span className="text-[#f0f0f0] font-bold">
                        {s.games}
                      </span>{" "}
                      parties
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

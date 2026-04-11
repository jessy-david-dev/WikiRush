"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  email: string;
  banned: boolean;
  createdAt: string;
  _count: { games: number };
};

type Game = {
  id: string;
  mode: string;
  startArticle: string;
  targetArticle: string;
  clicks: number;
  timeSeconds: number;
  won: boolean;
  playedAt: string;
  user: { name: string };
};

type ModeStat = {
  mode: string;
  _count: { id: number };
  _avg: { clicks: number | null; timeSeconds: number | null };
};

type ActivityDay = { date: string; count: number };

type AdminStats = {
  totalUsers: number;
  totalGames: number;
  todayGames: number;
  recentUsers: User[];
  recentGames: Game[];
  modeStats: ModeStat[];
  activity: ActivityDay[];
};

type DailyPuzzle = {
  id: string;
  date: string;
  startArticle: string;
  targetArticle: string;
  _count: { results: number };
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? `${m}m${sec.toString().padStart(2, "0")}s` : `${sec}s`;
}

function MiniBarChart({ data }: { data: ActivityDay[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        const day = new Date(d.date + "T12:00:00").toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        });
        return (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            <div
              className="w-full bg-[#7c3aed]/60 rounded-sm group-hover:bg-[#7c3aed] transition-colors"
              style={{ height: `${Math.max(pct, 4)}%` }}
            />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-[#2e2e2e] text-[#f0f0f0] text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {day} - {d.count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [dailyPuzzles, setDailyPuzzles] = useState<DailyPuzzle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "games" | "daily">(
    "overview",
  );

  // Daily puzzle form
  const [puzzleForm, setPuzzleForm] = useState({
    date: "",
    startArticle: "",
    targetArticle: "",
  });
  const [editingPuzzle, setEditingPuzzle] = useState<DailyPuzzle | null>(null);
  const [puzzleSaving, setPuzzleSaving] = useState(false);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "user" | "puzzle";
    id: string;
    label: string;
  } | null>(null);

  function refreshStats() {
    return fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData);
  }

  function refreshDaily() {
    return fetch("/api/admin/daily")
      .then((r) => r.json())
      .then(setDailyPuzzles);
  }

  useEffect(() => {
    Promise.all([refreshStats(), refreshDaily()])
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleBan(user: User) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned: !user.banned }),
    });
    if (res.ok) await refreshStats();
  }

  async function handleDeleteUser(id: string) {
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    await refreshStats();
    setConfirmDelete(null);
  }

  async function handleDeletePuzzle(id: string) {
    await fetch(`/api/admin/daily/${id}`, { method: "DELETE" });
    await refreshDaily();
    setConfirmDelete(null);
  }

  async function handleSavePuzzle() {
    setPuzzleSaving(true);
    try {
      if (editingPuzzle) {
        await fetch(`/api/admin/daily/${editingPuzzle.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startArticle: puzzleForm.startArticle,
            targetArticle: puzzleForm.targetArticle,
          }),
        });
      } else {
        await fetch("/api/admin/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(puzzleForm),
        });
      }
      await refreshDaily();
      setPuzzleForm({ date: "", startArticle: "", targetArticle: "" });
      setEditingPuzzle(null);
    } finally {
      setPuzzleSaving(false);
    }
  }

  function startEditPuzzle(p: DailyPuzzle) {
    setEditingPuzzle(p);
    setPuzzleForm({
      date: p.date,
      startArticle: p.startArticle,
      targetArticle: p.targetArticle,
    });
  }

  const card = "bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl p-4";
  const tabBtn = (active: boolean) =>
    `px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
      active
        ? "bg-[#7c3aed] text-white"
        : "bg-[#1a1a1a] border border-[#2e2e2e] text-[#888] hover:text-[#f0f0f0]"
    }`;
  const inputCls =
    "w-full min-h-10 px-3 bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl text-sm text-[#f0f0f0] outline-none focus:border-[#7c3aed] transition-colors";

  return (
    <div className="min-h-dvh w-full bg-[#0f0f0f] text-[#f0f0f0] px-4 py-8 flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Admin</h1>
          <p className="text-xs text-[#555] mt-0.5">
            WikiRush - panneau d&apos;administration
          </p>
        </div>
        <Link
          href="/"
          className="min-h-9 px-3 rounded-lg text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] hover:bg-[#1a1a1a] transition-colors"
        >
          ← Accueil
        </Link>
      </div>

      {loading && (
        <div className="text-[#888] text-sm animate-pulse">Chargement...</div>
      )}
      {!loading && !data && (
        <div className="text-red-400 text-sm">
          Accès refusé ou erreur serveur.
        </div>
      )}

      {/* Confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4">
            <p className="font-semibold text-sm">Confirmer la suppression</p>
            <p className="text-[#888] text-sm">
              Supprimer{" "}
              <span className="text-[#f0f0f0] font-semibold">
                {confirmDelete.label}
              </span>{" "}
              ? Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 min-h-10 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#f0f0f0] cursor-pointer hover:bg-[#2e2e2e]"
                onClick={() => setConfirmDelete(null)}
              >
                Annuler
              </button>
              <button
                className="flex-1 min-h-10 rounded-xl text-sm font-semibold bg-red-700 text-white cursor-pointer hover:bg-red-600"
                onClick={() =>
                  confirmDelete.type === "user"
                    ? handleDeleteUser(confirmDelete.id)
                    : handleDeletePuzzle(confirmDelete.id)
                }
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              className={tabBtn(tab === "overview")}
              onClick={() => setTab("overview")}
            >
              Vue d&apos;ensemble
            </button>
            <button
              className={tabBtn(tab === "users")}
              onClick={() => setTab("users")}
            >
              Utilisateurs{" "}
              <span className="ml-1 text-[#555]">({data.totalUsers})</span>
            </button>
            <button
              className={tabBtn(tab === "games")}
              onClick={() => setTab("games")}
            >
              Parties récentes
            </button>
            <button
              className={tabBtn(tab === "daily")}
              onClick={() => setTab("daily")}
            >
              Défis du jour
            </button>
          </div>

          {/* Overview */}
          {tab === "overview" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "Utilisateurs",
                    value: data.totalUsers.toLocaleString("fr-FR"),
                  },
                  {
                    label: "Parties totales",
                    value: data.totalGames.toLocaleString("fr-FR"),
                  },
                  {
                    label: "Parties aujourd'hui",
                    value: data.todayGames.toLocaleString("fr-FR"),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className={card}>
                    <p className="text-[10px] text-[#555] uppercase tracking-widest mb-1">
                      {label}
                    </p>
                    <p className="text-3xl font-black text-[#7c3aed]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Graphique activité */}
              <div className={card}>
                <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-4">
                  Activité - 14 derniers jours
                </h2>
                <MiniBarChart data={data.activity} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#555]">
                    {new Date(
                      data.activity[0]?.date + "T12:00:00",
                    ).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="text-[10px] text-[#555]">
                    aujourd&apos;hui
                  </span>
                </div>
              </div>

              {/* Modes */}
              <div className={card}>
                <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-3">
                  Parties par mode
                </h2>
                <div className="flex flex-col gap-2">
                  {data.modeStats
                    .sort((a, b) => b._count.id - a._count.id)
                    .map((m) => (
                      <div
                        key={m.mode}
                        className="flex items-center justify-between text-sm py-1.5 border-b border-[#2e2e2e] last:border-0"
                      >
                        <span className="font-semibold capitalize">
                          {m.mode}
                        </span>
                        <div className="flex items-center gap-4 text-[#888]">
                          <span>
                            {m._count.id.toLocaleString("fr-FR")} parties
                          </span>
                          {m._avg.clicks !== null && (
                            <span>~{Math.round(m._avg.clicks)} clics</span>
                          )}
                          {m._avg.timeSeconds !== null && (
                            <span>~{fmt(m._avg.timeSeconds)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div className={card}>
              <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-3">
                Utilisateurs
              </h2>
              <div className="flex flex-col gap-1">
                {data.recentUsers.map((u) => (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between py-2.5 border-b border-[#2e2e2e] last:border-0 gap-3 ${u.banned ? "opacity-50" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate flex items-center gap-2">
                        {u.name}
                        {u.banned && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-900/40 text-red-400 uppercase">
                            Banni
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#555] truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-xs text-[#888]">
                        {u._count.games} parties
                      </p>
                      <p className="text-[10px] text-[#555]">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleBan(u)}
                        className={`min-h-8 px-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${u.banned ? "bg-green-900/30 text-green-400 hover:bg-green-900/50" : "bg-orange-900/30 text-orange-400 hover:bg-orange-900/50"}`}
                      >
                        {u.banned ? "Débannir" : "Bannir"}
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({
                            type: "user",
                            id: u.id,
                            label: u.name,
                          })
                        }
                        className="min-h-8 px-2.5 rounded-lg text-xs font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 cursor-pointer transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Games */}
          {tab === "games" && (
            <div className={card}>
              <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-3">
                50 dernières parties
              </h2>
              <div className="flex flex-col gap-1">
                {data.recentGames.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between py-2 border-b border-[#2e2e2e] last:border-0 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-semibold">{g.user.name}</span>
                        <span className="text-[#555] mx-1">-</span>
                        <span className="text-[#888] text-xs">
                          {g.startArticle} → {g.targetArticle}
                        </span>
                      </p>
                      <p className="text-[10px] text-[#555]">
                        {new Date(g.playedAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${g.won ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}
                      >
                        {g.won ? "Gagné" : "Perdu"}
                      </span>
                      <span className="text-xs text-[#888] capitalize hidden sm:inline">
                        {g.mode}
                      </span>
                      <span className="text-xs text-[#555]">
                        {g.clicks} clics
                      </span>
                      <span className="text-xs text-[#555] hidden sm:inline">
                        {fmt(g.timeSeconds)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily puzzles */}
          {tab === "daily" && (
            <div className="flex flex-col gap-4">
              {/* Formulaire */}
              <div className={card}>
                <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-3">
                  {editingPuzzle
                    ? `Modifier le puzzle du ${editingPuzzle.date}`
                    : "Nouveau puzzle"}
                </h2>
                <div className="flex flex-col gap-2.5">
                  {!editingPuzzle && (
                    <input
                      className={inputCls}
                      type="date"
                      value={puzzleForm.date}
                      onChange={(e) =>
                        setPuzzleForm((f) => ({ ...f, date: e.target.value }))
                      }
                      placeholder="Date (YYYY-MM-DD)"
                    />
                  )}
                  <input
                    className={inputCls}
                    type="text"
                    value={puzzleForm.startArticle}
                    onChange={(e) =>
                      setPuzzleForm((f) => ({
                        ...f,
                        startArticle: e.target.value,
                      }))
                    }
                    placeholder="Article de départ (ex: Tour Eiffel)"
                  />
                  <input
                    className={inputCls}
                    type="text"
                    value={puzzleForm.targetArticle}
                    onChange={(e) =>
                      setPuzzleForm((f) => ({
                        ...f,
                        targetArticle: e.target.value,
                      }))
                    }
                    placeholder="Article cible (ex: Napoléon Bonaparte)"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePuzzle}
                      disabled={
                        puzzleSaving ||
                        (!editingPuzzle && !puzzleForm.date) ||
                        !puzzleForm.startArticle ||
                        !puzzleForm.targetArticle
                      }
                      className="flex-1 min-h-10 rounded-xl text-sm font-semibold bg-[#7c3aed] text-white hover:bg-[#6d28d9] disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      {puzzleSaving
                        ? "Enregistrement..."
                        : editingPuzzle
                          ? "Modifier"
                          : "Créer"}
                    </button>
                    {editingPuzzle && (
                      <button
                        onClick={() => {
                          setEditingPuzzle(null);
                          setPuzzleForm({
                            date: "",
                            startArticle: "",
                            targetArticle: "",
                          });
                        }}
                        className="min-h-10 px-4 rounded-xl text-sm font-semibold bg-[#242424] border border-[#2e2e2e] text-[#888] cursor-pointer hover:text-[#f0f0f0]"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Liste */}
              {dailyPuzzles && (
                <div className={card}>
                  <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-3">
                    Puzzles existants
                  </h2>
                  <div className="flex flex-col gap-1">
                    {dailyPuzzles.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between py-2.5 border-b border-[#2e2e2e] last:border-0 gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{p.date}</p>
                          <p className="text-xs text-[#888] truncate">
                            {p.startArticle} → {p.targetArticle}
                          </p>
                          <p className="text-[10px] text-[#555]">
                            {p._count.results} résultat
                            {p._count.results > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => startEditPuzzle(p)}
                            className="min-h-8 px-2.5 rounded-lg text-xs font-semibold bg-[#242424] border border-[#2e2e2e] text-[#888] hover:text-[#f0f0f0] cursor-pointer"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: "puzzle",
                                id: p.id,
                                label: `puzzle du ${p.date}`,
                              })
                            }
                            className="min-h-8 px-2.5 rounded-lg text-xs font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 cursor-pointer"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      games: {
        select: { mode: true, won: true, clicks: true, timeSeconds: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
  }

  const all = user.games;
  const won = all.filter((g) => g.won);
  const solo = all.filter((g) => g.mode === "solo");
  const multi = all.filter((g) => g.mode === "multi");
  const daily = all.filter((g) => g.mode === "daily");
  const blitz = all.filter((g) => g.mode === "blitz");

  const avgClicks = won.length
    ? Math.round(won.reduce((s, g) => s + g.clicks, 0) / won.length)
    : null;
  const bestClicks = won.length ? Math.min(...won.map((g) => g.clicks)) : null;
  const bestTime = won.length
    ? Math.min(...won.map((g) => g.timeSeconds))
    : null;
  const avgTime = won.length
    ? won.reduce((s, g) => s + g.timeSeconds, 0) / won.length
    : null;

  return NextResponse.json({
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
    stats: {
      total: all.length,
      wins: won.length,
      winRate: all.length ? Math.round((won.length / all.length) * 100) : 0,
      avgClicks,
      bestClicks,
      bestTime,
      avgTime,
      solo: { games: solo.length, wins: solo.filter((g) => g.won).length },
      multi: { games: multi.length, wins: multi.filter((g) => g.won).length },
      daily: { games: daily.length, wins: daily.filter((g) => g.won).length },
      blitz: { games: blitz.length, wins: blitz.filter((g) => g.won).length },
    },
  });
}

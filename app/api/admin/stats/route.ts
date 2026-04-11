import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Activité sur les 14 derniers jours
  const since14 = new Date(todayStart);
  since14.setDate(since14.getDate() - 13);

  const [
    totalUsers,
    totalGames,
    todayGames,
    recentUsers,
    recentGames,
    modeStats,
    activityRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.game.count({ where: { playedAt: { gte: todayStart } } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        banned: true,
        createdAt: true,
        _count: { select: { games: true } },
      },
    }),
    prisma.game.findMany({
      orderBy: { playedAt: "desc" },
      take: 50,
      select: {
        id: true,
        mode: true,
        startArticle: true,
        targetArticle: true,
        clicks: true,
        timeSeconds: true,
        won: true,
        playedAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.game.groupBy({
      by: ["mode"],
      _count: { id: true },
      _avg: { clicks: true, timeSeconds: true },
    }),
    prisma.game.findMany({
      where: { playedAt: { gte: since14 } },
      select: { playedAt: true },
    }),
  ]);

  // Agréger l'activité par jour
  const activityMap = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(since14);
    d.setDate(d.getDate() + i);
    activityMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const g of activityRaw) {
    const key = g.playedAt.toISOString().slice(0, 10);
    activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
  }
  const activity = Array.from(activityMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    totalUsers,
    totalGames,
    todayGames,
    recentUsers,
    recentGames,
    modeStats,
    activity,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const revalidate = 60;

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        games: {
          select: { mode: true, won: true, clicks: true, timeSeconds: true },
        },
      },
    });

    const rows = users
      .map((u) => {
        const all = u.games;
        const solo = all.filter((g) => g.mode === "solo");
        const multi = all.filter((g) => g.mode === "multi");
        const daily = all.filter((g) => g.mode === "daily");
        const blitz = all.filter((g) => g.mode === "blitz");
        const wins = all.filter((g) => g.won);
        const wonGames = wins.filter((g) => g.clicks > 0);
        const avgClicks = wonGames.length
          ? Math.round(
              wonGames.reduce((s, g) => s + g.clicks, 0) / wonGames.length,
            )
          : null;
        const bestTime = wins.length
          ? Math.min(...wins.map((g) => g.timeSeconds))
          : null;

        const soloWins = solo.filter((g) => g.won);
        const dailyWins = daily.filter((g) => g.won);
        const blitzWins = blitz.filter((g) => g.won);

        const soloAvgClicks = soloWins.filter((g) => g.clicks > 0).length
          ? Math.round(soloWins.reduce((s, g) => s + g.clicks, 0) / soloWins.filter((g) => g.clicks > 0).length)
          : null;
        const dailyAvgClicks = dailyWins.filter((g) => g.clicks > 0).length
          ? Math.round(dailyWins.reduce((s, g) => s + g.clicks, 0) / dailyWins.filter((g) => g.clicks > 0).length)
          : null;
        const blitzBestTime = blitzWins.length
          ? Math.min(...blitzWins.map((g) => g.timeSeconds))
          : null;

        return {
          id: u.id,
          name: u.name,
          totalGames: all.length,
          wins: wins.length,
          soloGames: solo.length,
          soloWins: soloWins.length,
          soloAvgClicks,
          multiGames: multi.length,
          multiWins: multi.filter((g) => g.won).length,
          dailyGames: daily.length,
          dailyWins: dailyWins.length,
          dailyAvgClicks,
          blitzGames: blitz.length,
          blitzWins: blitzWins.length,
          blitzBestTime,
          avgClicks,
          bestTime,
        };
      })
      .filter((r) => r.totalGames > 0)
      .sort((a, b) => b.wins - a.wins || b.totalGames - a.totalGames)
      .slice(0, 100);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

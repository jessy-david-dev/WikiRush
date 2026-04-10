import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { games: true },
  });

  const rows = users
    .map((u) => {
      const all = u.games;
      const solo = all.filter((g) => g.mode === "solo");
      const multi = all.filter((g) => g.mode === "multi");
      const wins = all.filter((g) => g.won);
      const wonGames = all.filter((g) => g.won && g.clicks > 0);
      const avgClicks = wonGames.length
        ? Math.round(wonGames.reduce((s, g) => s + g.clicks, 0) / wonGames.length)
        : null;
      const bestTime = wins.length
        ? Math.min(...wins.map((g) => g.timeSeconds))
        : null;

      return {
        id: u.id,
        name: u.name,
        totalGames: all.length,
        wins: wins.length,
        soloGames: solo.length,
        soloWins: solo.filter((g) => g.won).length,
        multiGames: multi.length,
        multiWins: multi.filter((g) => g.won).length,
        avgClicks,
        bestTime,
      };
    })
    .filter((r) => r.totalGames > 0)
    .sort((a, b) => b.wins - a.wins || b.totalGames - a.totalGames);

  return NextResponse.json(rows);
}

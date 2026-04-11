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
        const wins = all.filter((g) => g.won);
        const wonGames = wins.filter((g) => g.clicks > 0);
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
      .sort((a, b) => b.wins - a.wins || b.totalGames - a.totalGames)
      .slice(0, 100);

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

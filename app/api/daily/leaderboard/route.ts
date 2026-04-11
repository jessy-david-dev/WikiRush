import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const date = new Date().toISOString().slice(0, 10);
  const puzzle = await prisma.dailyPuzzle.findUnique({ where: { date } });
  if (!puzzle) return NextResponse.json([]);

  const results = await prisma.dailyResult.findMany({
    where: { puzzleId: puzzle.id, won: true },
    include: { user: { select: { name: true } } },
    orderBy: [{ clicks: "asc" }, { timeSeconds: "asc" }],
    take: 20,
  });

  return NextResponse.json(
    results.map((r, i) => ({
      rank: i + 1,
      name: r.user.name,
      clicks: r.clicks,
      timeSeconds: r.timeSeconds,
      userId: r.userId,
    })),
  );
}

import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const games = await prisma.game.findMany({
    where: { userId: session.user.id },
    select: {
      id: true, mode: true, startArticle: true, targetArticle: true,
      path: true, clicks: true, timeSeconds: true, won: true, playedAt: true,
    },
    orderBy: { playedAt: "desc" },
  });

  const dailyResults = await prisma.dailyResult.findMany({
    where: { userId: session.user.id },
    select: {
      id: true, puzzleId: true, path: true, clicks: true,
      timeSeconds: true, won: true, playedAt: true,
    },
    orderBy: { playedAt: "desc" },
  });

  const data = {
    profile: user,
    games: games.map((g) => ({ ...g, path: JSON.parse(g.path) as string[] })),
    dailyResults: dailyResults.map((d) => ({ ...d, path: JSON.parse(d.path) as string[] })),
    exportedAt: new Date().toISOString(),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="wikirush-data-${session.user.id}.json"`,
    },
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

// POST /api/games - sauvegarder une partie
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { mode, startArticle, targetArticle, path, clicks, timeSeconds, won } =
    (await req.json()) as {
      mode: string;
      startArticle: string;
      targetArticle: string;
      path: string[];
      clicks: number;
      timeSeconds: number;
      won: boolean;
    };

  const game = await prisma.game.create({
    data: {
      userId: session.user.id,
      mode,
      startArticle,
      targetArticle,
      path: JSON.stringify(path),
      clicks,
      timeSeconds,
      won,
    },
  });

  return NextResponse.json({ id: game.id });
}

// GET /api/games - historique de l'utilisateur connecté
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const games = await prisma.game.findMany({
    where: { userId: session.user.id },
    orderBy: { playedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(
    games.map((g) => ({
      ...g,
      path: JSON.parse(g.path) as string[],
    })),
  );
}

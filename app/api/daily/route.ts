import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { pickTwoArticles } from "../../../lib/wiki";

function todayKey() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

async function getOrCreatePuzzle() {
  const date = todayKey();
  const existing = await prisma.dailyPuzzle.findUnique({ where: { date } });
  if (existing) return existing;

  const { start, target } = await pickTwoArticles();
  return prisma.dailyPuzzle.create({ data: { date, startArticle: start, targetArticle: target } });
}

// GET - retourne le puzzle du jour + si l'utilisateur a déjà joué
export async function GET() {
  const session = await auth();
  const puzzle = await getOrCreatePuzzle();

  let myResult = null;
  if (session?.user?.id) {
    myResult = await prisma.dailyResult.findUnique({
      where: { puzzleId_userId: { puzzleId: puzzle.id, userId: session.user.id } },
    });
  }

  return NextResponse.json({
    puzzle: { id: puzzle.id, date: puzzle.date, startArticle: puzzle.startArticle, targetArticle: puzzle.targetArticle },
    alreadyPlayed: !!myResult,
    myResult: myResult ? { clicks: myResult.clicks, timeSeconds: myResult.timeSeconds, won: myResult.won, path: JSON.parse(myResult.path) } : null,
  });
}

// POST - soumettre un résultat
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { puzzleId, path, clicks, timeSeconds, won } = await req.json() as {
    puzzleId: string; path: string[]; clicks: number; timeSeconds: number; won: boolean;
  };

  // Vérifier que le puzzle est bien celui du jour
  const puzzle = await prisma.dailyPuzzle.findUnique({ where: { id: puzzleId } });
  if (!puzzle || puzzle.date !== todayKey()) {
    return NextResponse.json({ error: "Puzzle invalide" }, { status: 400 });
  }

  // Upsert - on n'enregistre qu'une fois
  const result = await prisma.dailyResult.upsert({
    where: { puzzleId_userId: { puzzleId, userId: session.user.id } },
    create: { puzzleId, userId: session.user.id, path: JSON.stringify(path), clicks, timeSeconds, won },
    update: {},
  });

  return NextResponse.json({ id: result.id });
}

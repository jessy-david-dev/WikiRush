import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// GET /api/admin/daily — liste tous les puzzles
export async function GET() {
  const puzzles = await prisma.dailyPuzzle.findMany({
    orderBy: { date: "desc" },
    take: 30,
    include: { _count: { select: { results: true } } },
  });
  return NextResponse.json(puzzles);
}

// POST /api/admin/daily — créer un puzzle pour une date
export async function POST(req: Request) {
  const { date, startArticle, targetArticle } = await req.json() as {
    date: string;
    startArticle: string;
    targetArticle: string;
  };

  const puzzle = await prisma.dailyPuzzle.upsert({
    where: { date },
    create: { date, startArticle, targetArticle },
    update: { startArticle, targetArticle },
  });
  return NextResponse.json(puzzle);
}

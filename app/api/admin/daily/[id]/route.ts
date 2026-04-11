import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/admin/daily/[id] - modifier un puzzle
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const { startArticle, targetArticle } = (await req.json()) as {
    startArticle: string;
    targetArticle: string;
  };
  const puzzle = await prisma.dailyPuzzle.update({
    where: { id },
    data: { startArticle, targetArticle },
  });
  return NextResponse.json(puzzle);
}

// DELETE /api/admin/daily/[id] - supprimer un puzzle
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.dailyPuzzle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

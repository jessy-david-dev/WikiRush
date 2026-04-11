import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type Params = { params: Promise<{ id: string }> };

// DELETE /api/admin/users/[id] - supprimer un utilisateur
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// PATCH /api/admin/users/[id] - ban/unban
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const { banned } = (await req.json()) as { banned: boolean };
  const user = await prisma.user.update({ where: { id }, data: { banned } });
  return NextResponse.json({ id: user.id, banned: user.banned });
}

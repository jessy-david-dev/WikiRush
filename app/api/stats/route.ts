import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const revalidate = 60; // revalide toutes les 60s

export async function GET() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCount = await prisma.game.count({
    where: { playedAt: { gte: todayStart } },
  });

  const totalCount = await prisma.game.count();

  return NextResponse.json({ today: todayCount, total: totalCount });
}

// Route handler: POST /api/rooms - creer une room
// GET /api/rooms?code=XXXX - recuperer l'etat d'une room

import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";

// Types

export type Player = {
  id: string;
  name: string;
  score: number;
  currentArticle: string;
  path: string[]; // articles visités cette manche
  hasWon: boolean;
  hasSurrendered: boolean;
  isHost: boolean;
  lastSeen: number; // timestamp ms
};

export type Room = {
  code: string;
  players: Player[];
  phase: "waiting" | "countdown" | "playing" | "results";
  round: number;
  totalRounds: number;
  maxPlayers: number;
  gameMode: "race" | "all_finish"; // race = 1er gagne, all_finish = tout le monde joue
  searchAllowed: boolean;
  timeLimit: number; // secondes par manche, 0 = illimité
  startArticle: string;
  targetArticle: string;
  roundWinner: string | null;
  countdownStart: number | null;
  roundStart: number | null;
  createdAt: number;
};

// Helpers

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generatePlayerId(): string {
  return crypto.randomUUID();
}

function dbToRoom(row: {
  code: string;
  players: unknown;
  phase: string;
  round: number;
  totalRounds: number;
  maxPlayers: number;
  gameMode: string;
  searchAllowed: boolean;
  timeLimit: number;
  startArticle: string;
  targetArticle: string;
  roundWinner: string | null;
  countdownStart: bigint | null;
  roundStart: bigint | null;
  createdAt: bigint;
}): Room {
  return {
    code: row.code,
    players: row.players as Player[],
    phase: row.phase as Room["phase"],
    round: row.round,
    totalRounds: row.totalRounds,
    maxPlayers: row.maxPlayers,
    gameMode: (row.gameMode ?? "race") as Room["gameMode"],
    searchAllowed: row.searchAllowed ?? false,
    timeLimit: row.timeLimit ?? 0,
    startArticle: row.startArticle,
    targetArticle: row.targetArticle,
    roundWinner: row.roundWinner,
    countdownStart: row.countdownStart !== null ? Number(row.countdownStart) : null,
    roundStart: row.roundStart !== null ? Number(row.roundStart) : null,
    createdAt: Number(row.createdAt),
  };
}

// Nettoie les rooms inactives depuis plus de 2h
async function pruneOldRooms() {
  const cutoff = BigInt(Date.now() - 2 * 60 * 60 * 1000);
  await prisma.room.deleteMany({ where: { createdAt: { lt: cutoff } } });
}

// POST /api/rooms
// Body: { playerName: string }
// Response: { room: Room, playerId: string }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { playerName, maxPlayers, totalRounds, gameMode, timeLimit } = body as {
    playerName: string;
    maxPlayers?: number;
    totalRounds?: number;
    gameMode?: string;
    timeLimit?: number;
  };

  if (
    !playerName ||
    typeof playerName !== "string" ||
    playerName.trim() === ""
  ) {
    return Response.json({ error: "Pseudo invalide" }, { status: 400 });
  }

  const clampedMax = Math.min(
    Math.max(typeof maxPlayers === "number" ? Math.floor(maxPlayers) : 16, 2),
    16,
  );
  const clampedRounds = Math.min(
    Math.max(typeof totalRounds === "number" ? Math.floor(totalRounds) : 3, 1),
    10,
  );

  await pruneOldRooms();

  // Generer un code unique
  let code = generateCode();
  let attempts = 0;
  while (attempts < 20) {
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  const playerId = generatePlayerId();
  const now = BigInt(Date.now());

  const clampedMode: Room["gameMode"] = gameMode === "all_finish" ? "all_finish" : "race";
  const clampedTime = typeof timeLimit === "number" ? Math.max(0, Math.floor(timeLimit)) : 0;

  const players: Player[] = [
    {
      id: playerId,
      name: playerName.trim().slice(0, 20),
      score: 0,
      currentArticle: "",
      path: [],
      hasWon: false,
      hasSurrendered: false,
      isHost: true,
      lastSeen: Date.now(),
    },
  ];

  const row = await prisma.room.create({
    data: {
      code,
      players: players as object[],
      phase: "waiting",
      round: 0,
      totalRounds: clampedRounds,
      maxPlayers: clampedMax,
      gameMode: clampedMode,
      searchAllowed: false,
      timeLimit: clampedTime,
      startArticle: "",
      targetArticle: "",
      roundWinner: null,
      countdownStart: null,
      roundStart: null,
      createdAt: now,
    },
  });

  const room = dbToRoom(row);
  return Response.json({ room, playerId });
}

// GET /api/rooms?code=XXXX
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return Response.json({ error: "Code manquant" }, { status: 400 });
  }

  const row = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });

  if (!row) {
    return Response.json({ error: "Room introuvable" }, { status: 404 });
  }

  return Response.json({ room: dbToRoom(row) });
}

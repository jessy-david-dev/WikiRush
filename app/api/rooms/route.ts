// Route handler: POST /api/rooms - creer une room
// GET /api/rooms?code=XXXX - recuperer l'etat d'une room

import { NextRequest } from "next/server";

// Types

export type Player = {
  id: string;
  name: string;
  score: number;
  currentArticle: string;
  hasWon: boolean;
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
  startArticle: string;
  targetArticle: string;
  roundWinner: string | null; // player id
  countdownStart: number | null; // timestamp ms
  roundStart: number | null; // timestamp ms
  createdAt: number;
};

// Stockage en memoire (singleton Node.js)

declare global {
  // eslint-disable-next-line no-var
  var __wikirooms: Map<string, Room> | undefined;
}

function getRooms(): Map<string, Room> {
  if (!global.__wikirooms) {
    global.__wikirooms = new Map();
  }
  return global.__wikirooms;
}

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

// Nettoie les rooms inactives depuis plus de 2h
function pruneOldRooms(rooms: Map<string, Room>) {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.createdAt > 2 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}

// Handlers

// POST /api/rooms
// Body: { playerName: string }
// Response: { room: Room, playerId: string }
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { playerName, maxPlayers, totalRounds } = body as { playerName: string; maxPlayers?: number; totalRounds?: number };

  if (!playerName || typeof playerName !== "string" || playerName.trim() === "") {
    return Response.json({ error: "Pseudo invalide" }, { status: 400 });
  }

  const clampedMax = Math.min(Math.max(typeof maxPlayers === "number" ? Math.floor(maxPlayers) : 16, 2), 16);
  const clampedRounds = Math.min(Math.max(typeof totalRounds === "number" ? Math.floor(totalRounds) : 3, 1), 10);

  const rooms = getRooms();
  pruneOldRooms(rooms);

  // Generer un code unique
  let code = generateCode();
  let attempts = 0;
  while (rooms.has(code) && attempts < 20) {
    code = generateCode();
    attempts++;
  }

  const playerId = generatePlayerId();

  const room: Room = {
    code,
    players: [
      {
        id: playerId,
        name: playerName.trim().slice(0, 20),
        score: 0,
        currentArticle: "",
        hasWon: false,
        isHost: true,
        lastSeen: Date.now(),
      },
    ],
    phase: "waiting",
    round: 0,
    totalRounds: clampedRounds,
    maxPlayers: clampedMax,
    startArticle: "",
    targetArticle: "",
    roundWinner: null,
    countdownStart: null,
    roundStart: null,
    createdAt: Date.now(),
  };

  rooms.set(code, room);

  return Response.json({ room, playerId });
}

// GET /api/rooms?code=XXXX
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return Response.json({ error: "Code manquant" }, { status: 400 });
  }

  const rooms = getRooms();
  const room = rooms.get(code.toUpperCase());

  if (!room) {
    return Response.json({ error: "Room introuvable" }, { status: 404 });
  }

  return Response.json({ room });
}

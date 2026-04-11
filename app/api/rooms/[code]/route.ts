// Route handler pour les actions sur une room specifique
// PATCH /api/rooms/[code] - actions: join, heartbeat, start, navigate, leave, nextRound

import { NextRequest } from "next/server";
import type { Room, Player } from "../route";
import { prisma } from "../../../../lib/prisma";

function dbToRoom(row: {
  code: string;
  players: unknown;
  phase: string;
  round: number;
  totalRounds: number;
  maxPlayers: number;
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
    startArticle: row.startArticle,
    targetArticle: row.targetArticle,
    roundWinner: row.roundWinner,
    countdownStart: row.countdownStart !== null ? Number(row.countdownStart) : null,
    roundStart: row.roundStart !== null ? Number(row.roundStart) : null,
    createdAt: Number(row.createdAt),
  };
}

function generatePlayerId(): string {
  return crypto.randomUUID();
}

// Timeout joueur inactif : 15s
const PLAYER_TIMEOUT_MS = 15_000;

function prunePlayers(players: Player[]): Player[] {
  const now = Date.now();
  return players.filter((p) => now - p.lastSeen < PLAYER_TIMEOUT_MS);
}

// PATCH /api/rooms/[code]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const row = await prisma.room.findUnique({ where: { code: code.toUpperCase() } });

  if (!row) {
    return Response.json({ error: "Room introuvable" }, { status: 404 });
  }

  const room = dbToRoom(row);

  const body = await request.json();
  const { action, playerId, playerName, article, startArticle, targetArticle } =
    body as {
      action: string;
      playerId?: string;
      playerName?: string;
      article?: string;
      startArticle?: string;
      targetArticle?: string;
    };

  // Nettoyer les joueurs inactifs avant chaque action
  room.players = prunePlayers(room.players);

  switch (action) {
    // Rejoindre
    case "join": {
      if (
        !playerName ||
        typeof playerName !== "string" ||
        playerName.trim() === ""
      ) {
        return Response.json({ error: "Pseudo invalide" }, { status: 400 });
      }
      if (room.players.length >= room.maxPlayers) {
        return Response.json(
          { error: `Salle pleine (${room.maxPlayers} joueurs max)` },
          { status: 409 },
        );
      }
      if (room.phase !== "waiting" && room.phase !== "results") {
        return Response.json(
          { error: "Partie en cours, attends la prochaine manche" },
          { status: 409 },
        );
      }

      const newId = generatePlayerId();
      const player: Player = {
        id: newId,
        name: playerName.trim().slice(0, 20),
        score: 0,
        currentArticle: "",
        hasWon: false,
        isHost: false,
        lastSeen: Date.now(),
      };
      room.players.push(player);
      await saveRoom(room);
      return Response.json({ room, playerId: newId });
    }

    // Heartbeat (polling)
    case "heartbeat": {
      const player = room.players.find((p) => p.id === playerId);
      if (player) {
        player.lastSeen = Date.now();
      }
      await saveRoom(room);
      return Response.json({ room });
    }

    // Demarrer la partie
    case "start": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json(
          { error: "Seul l'hote peut demarrer" },
          { status: 403 },
        );
      }
      if (room.players.length < 1) {
        return Response.json(
          { error: "Pas assez de joueurs" },
          { status: 400 },
        );
      }
      if (!startArticle || !targetArticle) {
        return Response.json({ error: "Articles manquants" }, { status: 400 });
      }

      // Reset scores si c'est la toute premiere manche
      if (room.round === 0) {
        for (const p of room.players) {
          p.score = 0;
        }
      }

      room.round += 1;
      room.startArticle = startArticle;
      room.targetArticle = targetArticle;
      room.roundWinner = null;
      room.phase = "countdown";
      room.countdownStart = Date.now();
      room.roundStart = null;

      // Reset etat joueurs pour cette manche
      for (const p of room.players) {
        p.currentArticle = startArticle;
        p.hasWon = false;
      }

      await saveRoom(room);
      return Response.json({ room });
    }

    // Passer en playing (apres countdown)
    case "play": {
      if (room.phase !== "countdown") {
        return Response.json({ room });
      }
      const elapsed = Date.now() - (room.countdownStart ?? 0);
      if (elapsed >= 3000) {
        room.phase = "playing";
        room.roundStart = Date.now();
        await saveRoom(room);
      }
      return Response.json({ room });
    }

    // Navigation vers un article
    case "navigate": {
      if (room.phase !== "playing") {
        return Response.json({ room });
      }
      const player = room.players.find((p) => p.id === playerId);
      if (!player) {
        return Response.json({ error: "Joueur inconnu" }, { status: 404 });
      }

      if (!article || typeof article !== "string" || article.length > 300) {
        return Response.json({ error: "Article invalide" }, { status: 400 });
      }
      player.currentArticle = article;
      player.lastSeen = Date.now();

      const normalize = (s: string) =>
        decodeURIComponent(s).replace(/_/g, " ").toLowerCase().trim();

      if (
        !player.hasWon &&
        normalize(player.currentArticle) === normalize(room.targetArticle)
      ) {
        player.hasWon = true;

        const alreadyWon = room.players.some(
          (p) => p.hasWon && p.id !== player.id,
        );
        if (!alreadyWon) {
          player.score += 10;
          room.roundWinner = player.id;
          room.phase = "results";
        }
      }

      await saveRoom(room);
      return Response.json({ room });
    }

    // Manche suivante / rejouer
    case "nextRound": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json(
          { error: "Seul l'hote peut continuer" },
          { status: 403 },
        );
      }
      room.phase = "waiting";
      room.roundWinner = null;
      room.countdownStart = null;
      room.roundStart = null;
      for (const p of room.players) {
        p.hasWon = false;
        p.currentArticle = "";
      }
      await saveRoom(room);
      return Response.json({ room });
    }

    // Nouvelle partie (reset total)
    case "resetGame": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json(
          { error: "Seul l'hote peut reinitialiser" },
          { status: 403 },
        );
      }
      room.phase = "waiting";
      room.round = 0;
      room.roundWinner = null;
      room.countdownStart = null;
      room.roundStart = null;
      for (const p of room.players) {
        p.score = 0;
        p.hasWon = false;
        p.currentArticle = "";
      }
      await saveRoom(room);
      return Response.json({ room });
    }

    default:
      return Response.json({ error: "Action inconnue" }, { status: 400 });
  }
}

async function saveRoom(room: Room) {
  await prisma.room.update({
    where: { code: room.code },
    data: {
      players: room.players as object[],
      phase: room.phase,
      round: room.round,
      totalRounds: room.totalRounds,
      maxPlayers: room.maxPlayers,
      startArticle: room.startArticle,
      targetArticle: room.targetArticle,
      roundWinner: room.roundWinner,
      countdownStart: room.countdownStart !== null ? BigInt(room.countdownStart) : null,
      roundStart: room.roundStart !== null ? BigInt(room.roundStart) : null,
    },
  });
}

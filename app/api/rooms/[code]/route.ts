// Route handler pour les actions sur une room specifique
// PATCH /api/rooms/[code] - actions: join, heartbeat, start, navigate, leave, nextRound

import { NextRequest } from "next/server";
import type { Room, Player } from "../route";

// Acces au singleton

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

function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// Timeout joueur inactif : 15s
const PLAYER_TIMEOUT_MS = 15_000;

function prunePlayers(room: Room) {
  const now = Date.now();
  room.players = room.players.filter(
    (p) => now - p.lastSeen < PLAYER_TIMEOUT_MS
  );
}

// PATCH /api/rooms/[code]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const rooms = getRooms();
  const room = rooms.get(code.toUpperCase());

  if (!room) {
    return Response.json({ error: "Room introuvable" }, { status: 404 });
  }

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
  prunePlayers(room);

  switch (action) {
    // Rejoindre
    case "join": {
      if (!playerName || typeof playerName !== "string" || playerName.trim() === "") {
        return Response.json({ error: "Pseudo invalide" }, { status: 400 });
      }
      if (room.players.length >= 8) {
        return Response.json({ error: "Salle pleine (8 joueurs max)" }, { status: 409 });
      }
      if (room.phase !== "waiting" && room.phase !== "results") {
        return Response.json({ error: "Partie en cours, attends la prochaine manche" }, { status: 409 });
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
      return Response.json({ room, playerId: newId });
    }

    // Heartbeat (polling)
    case "heartbeat": {
      const player = room.players.find((p) => p.id === playerId);
      if (player) {
        player.lastSeen = Date.now();
      }
      return Response.json({ room });
    }

    // Demarrer la partie
    case "start": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json({ error: "Seul l'hote peut demarrer" }, { status: 403 });
      }
      if (room.players.length < 1) {
        return Response.json({ error: "Pas assez de joueurs" }, { status: 400 });
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

      return Response.json({ room });
    }

    // Passer en playing (apres countdown)
    case "play": {
      if (room.phase !== "countdown") {
        return Response.json({ room });
      }
      // On laisse les clients gerer le timing - le 1er qui appelle play apres 3s active
      const elapsed = Date.now() - (room.countdownStart ?? 0);
      if (elapsed >= 3000) {
        room.phase = "playing";
        room.roundStart = Date.now();
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

      player.currentArticle = article ?? "";
      player.lastSeen = Date.now();

      // Verifier si le joueur a atteint la cible
      const normalize = (s: string) =>
        decodeURIComponent(s).replace(/_/g, " ").toLowerCase().trim();

      if (
        !player.hasWon &&
        normalize(player.currentArticle) === normalize(room.targetArticle)
      ) {
        player.hasWon = true;

        // 1er joueur a gagner = +10 points
        const alreadyWon = room.players.some(
          (p) => p.hasWon && p.id !== player.id
        );
        if (!alreadyWon) {
          player.score += 10;
          room.roundWinner = player.id;
          room.phase = "results";
        }
      }

      return Response.json({ room });
    }

    // Manche suivante / rejouer
    case "nextRound": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json({ error: "Seul l'hote peut continuer" }, { status: 403 });
      }
      room.phase = "waiting";
      room.roundWinner = null;
      room.countdownStart = null;
      room.roundStart = null;
      for (const p of room.players) {
        p.hasWon = false;
        p.currentArticle = "";
      }
      return Response.json({ room });
    }

    // Nouvelle partie (reset total)
    case "resetGame": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json({ error: "Seul l'hote peut reinitialiser" }, { status: 403 });
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
      return Response.json({ room });
    }

    default:
      return Response.json({ error: "Action inconnue" }, { status: 400 });
  }
}

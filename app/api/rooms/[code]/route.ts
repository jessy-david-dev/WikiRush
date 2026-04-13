// Route handler pour les actions sur une room specifique
// PATCH /api/rooms/[code] - actions: join, heartbeat, start, navigate, surrender, nextRound, resetGame

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
    countdownStart:
      row.countdownStart !== null ? Number(row.countdownStart) : null,
    roundStart: row.roundStart !== null ? Number(row.roundStart) : null,
    createdAt: Number(row.createdAt),
  };
}

function generatePlayerId(): string {
  return crypto.randomUUID();
}

// Timeout joueur inactif : 45s (heartbeat toutes les 2s, on laisse large pour les tabs en arrière-plan)
const PLAYER_TIMEOUT_MS = 45_000;

function prunePlayers(players: Player[]): Player[] {
  const now = Date.now();
  return players.filter((p) => now - p.lastSeen < PLAYER_TIMEOUT_MS);
}

// Calcule les points d'un joueur selon ses clics et son temps
// Points clics : max 10, -1 par tranche de 5 clics
// Points temps : max 10, selon le temps restant (avec timeLimit) ou -1 par 30s (sans limite)
// Total max : 20 pts
function calcPlayerPoints(player: Player, room: Room): number {
  const clicks = Math.max(0, (player.path?.length ?? 1) - 1);
  const clickPts = Math.max(0, 10 - Math.floor(clicks / 5));

  const wonAt = player.wonAt ?? Date.now();
  const roundStart = room.roundStart ?? wonAt;
  const elapsed = wonAt - roundStart;

  let timePts: number;
  if (room.timeLimit > 0) {
    const timeLeft = room.timeLimit * 1000 - elapsed;
    timePts = Math.max(
      0,
      Math.floor((timeLeft / (room.timeLimit * 1000)) * 10),
    );
  } else {
    timePts = Math.max(0, 10 - Math.floor(elapsed / 30000));
  }

  return clickPts + timePts;
}

// Vérifie si la manche doit se terminer en mode all_finish
function checkAllFinished(room: Room): boolean {
  if (room.gameMode !== "all_finish") return false;
  return room.players.every((p) => p.hasWon || p.hasSurrendered);
}

// Attribue les points aux gagnants selon clics + temps
function assignAllFinishPoints(room: Room) {
  const winners = room.players.filter((p) => p.hasWon);
  winners.forEach((p) => {
    p.score += calcPlayerPoints(p, room);
  });
  if (winners.length > 0) {
    room.roundWinner = winners[0].id;
  }
  room.phase = "results";
}

// PATCH /api/rooms/[code]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const row = await prisma.room.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!row) {
    return Response.json({ error: "Room introuvable" }, { status: 404 });
  }

  const room = dbToRoom(row);

  const body = await request.json();
  const {
    action,
    playerId,
    playerName,
    article,
    startArticle,
    targetArticle,
    value,
  } = body as {
    action: string;
    playerId?: string;
    playerName?: string;
    article?: string;
    startArticle?: string;
    targetArticle?: string;
    value?: boolean | number | string;
  };

  // Nettoyer les joueurs inactifs uniquement hors partie (lobby/résultats)
  // En playing, un joueur peut lire une longue page sans heartbeat pendant +40s
  if (room.phase !== "playing" && room.phase !== "countdown") {
    room.players = prunePlayers(room.players);
  }

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
        path: [],
        hasWon: false,
        hasSurrendered: false,
        isHost: false,
        lastSeen: Date.now(),
        wonAt: null,
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
        p.path = [startArticle];
        p.hasWon = false;
        p.hasSurrendered = false;
        p.wonAt = null;
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
      if (!player.path) player.path = [];
      player.path.push(article);
      player.lastSeen = Date.now();

      const normalize = (s: string) =>
        decodeURIComponent(s).replace(/_/g, " ").toLowerCase().trim();

      if (
        !player.hasWon &&
        !player.hasSurrendered &&
        normalize(player.currentArticle) === normalize(room.targetArticle)
      ) {
        player.hasWon = true;
        player.wonAt = Date.now();

        if (room.gameMode === "race") {
          // Mode course : 1er arrivé gagne la manche immédiatement
          const alreadyWon = room.players.some(
            (p) => p.hasWon && p.id !== player.id,
          );
          if (!alreadyWon) {
            player.score += calcPlayerPoints(player, room);
            room.roundWinner = player.id;
            room.phase = "results";
          }
        } else {
          // Mode all_finish : on attend que tout le monde finisse ou abandonne
          if (checkAllFinished(room)) {
            assignAllFinishPoints(room);
          }
        }
      }

      await saveRoom(room);
      return Response.json({ room });
    }

    // Forfait
    case "surrender": {
      if (room.phase !== "playing") {
        return Response.json({ room });
      }
      const player = room.players.find((p) => p.id === playerId);
      if (!player) {
        return Response.json({ error: "Joueur inconnu" }, { status: 404 });
      }
      if (player.hasWon || player.hasSurrendered) {
        return Response.json({ room });
      }

      player.hasSurrendered = true;
      player.lastSeen = Date.now();

      if (room.gameMode === "race") {
        // En mode course, forfait ne termine pas la manche - on attend qu'un vrai gagnant arrive
        // Sauf si tous ont abandonné
        const anyoneStillPlaying = room.players.some(
          (p) => !p.hasWon && !p.hasSurrendered,
        );
        if (!anyoneStillPlaying) {
          room.phase = "results";
          // Pas de roundWinner si tout le monde a abandonné
        }
      } else {
        // Mode all_finish : si tout le monde a fini ou abandonné, on termine
        if (checkAllFinished(room)) {
          assignAllFinishPoints(room);
        }
      }

      await saveRoom(room);
      return Response.json({ room });
    }

    // Hôte toggle recherche Ctrl+F
    case "setSearchAllowed": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json(
          { error: "Seul l'hôte peut modifier ce paramètre" },
          { status: 403 },
        );
      }
      room.searchAllowed =
        typeof value === "boolean" ? value : !room.searchAllowed;
      await saveRoom(room);
      return Response.json({ room });
    }

    // Hôte change le mode de jeu
    case "setGameMode": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json(
          { error: "Seul l'hôte peut modifier ce paramètre" },
          { status: 403 },
        );
      }
      if (value === "race" || value === "all_finish") {
        room.gameMode = value;
        await saveRoom(room);
      }
      return Response.json({ room });
    }

    // Hôte change le nombre de manches
    case "setTotalRounds": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json(
          { error: "Seul l'hôte peut modifier ce paramètre" },
          { status: 403 },
        );
      }
      if (typeof value === "number") {
        room.totalRounds = Math.min(Math.max(Math.floor(value), 1), 10);
        await saveRoom(room);
      }
      return Response.json({ room });
    }

    // Hôte change la limite de temps
    case "setTimeLimit": {
      const host = room.players.find((p) => p.id === playerId);
      if (!host?.isHost) {
        return Response.json(
          { error: "Seul l'hôte peut modifier ce paramètre" },
          { status: 403 },
        );
      }
      room.timeLimit =
        typeof value === "number" ? Math.max(0, Math.floor(value)) : 0;
      await saveRoom(room);
      return Response.json({ room });
    }

    // Fin du temps imparti - déclenché par le client qui détecte l'expiration
    case "timeUp": {
      if (room.phase !== "playing") {
        return Response.json({ room });
      }
      if (!room.timeLimit || !room.roundStart) {
        return Response.json({ room });
      }
      const elapsed = Date.now() - room.roundStart;
      if (elapsed < room.timeLimit * 1000 - 1000) {
        // Pas encore expiré (tolérance 1s pour le lag réseau)
        return Response.json({ room });
      }
      // Marquer les non-finis comme abandonnés
      for (const p of room.players) {
        if (!p.hasWon && !p.hasSurrendered) {
          p.hasSurrendered = true;
        }
      }
      assignAllFinishPoints(room); // attribue les points aux gagnants selon l'ordre
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
        p.hasSurrendered = false;
        p.currentArticle = "";
        p.wonAt = null;
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
        p.hasSurrendered = false;
        p.currentArticle = "";
        p.wonAt = null;
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
      gameMode: room.gameMode,
      searchAllowed: room.searchAllowed,
      timeLimit: room.timeLimit,
      startArticle: room.startArticle,
      targetArticle: room.targetArticle,
      roundWinner: room.roundWinner,
      countdownStart:
        room.countdownStart !== null ? BigInt(room.countdownStart) : null,
      roundStart: room.roundStart !== null ? BigInt(room.roundStart) : null,
    },
  });
}

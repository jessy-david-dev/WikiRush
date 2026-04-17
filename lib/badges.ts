export type Badge = { name: string; file: string; threshold: number };

export const BADGES: Badge[] = [
  { name: "Omniscient", file: "omniscient", threshold: 10000 },
  { name: "Transcendant", file: "transcendant", threshold: 5000 },
  { name: "Mythique", file: "mythique", threshold: 2500 },
  { name: "Légende", file: "légende", threshold: 1000 },
  { name: "Maître", file: "maître", threshold: 500 },
  { name: "Expert", file: "expert", threshold: 150 },
  { name: "Adepte", file: "adepte", threshold: 50 },
  { name: "Initié", file: "initié", threshold: 20 },
  { name: "Apprenti", file: "apprenti", threshold: 5 },
  { name: "Novice", file: "novice", threshold: 0 },
];

export function getBadge(wins: number): Badge {
  return BADGES.find((b) => wins >= b.threshold) ?? BADGES[BADGES.length - 1];
}

export function getNextBadge(wins: number): Badge | null {
  const idx = BADGES.findIndex((b) => wins >= b.threshold);
  return idx > 0 ? BADGES[idx - 1] : null;
}

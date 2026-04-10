export function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export async function saveGame(data: {
  mode: string;
  startArticle: string;
  targetArticle: string;
  path: string[];
  clicks: number;
  timeSeconds: number;
  won: boolean;
}) {
  try {
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch { /* silencieux — pas de compte ou hors ligne */ }
}

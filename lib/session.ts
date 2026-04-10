// Persistence sessionStorage pour F5 / rechargement de page

const KEY = "wikirace_session";

export type SessionData = {
  screen: "solo" | "lobby" | "game";
  // Solo
  soloPuzzle?: { start: string; target: string };
  soloHistory?: string[];
  soloClicks?: number;
  // Multi
  multiRoomCode?: string;
  multiPlayerId?: string;
  playerName?: string;
};

export function saveSession(data: SessionData) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* ignore quota */ }
}

export function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionData) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

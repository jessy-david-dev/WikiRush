import type { WikiArticle, Puzzle } from "./types";
import { getFallbackPuzzle } from "./puzzles";

const WIKI_API_BASE = "https://fr.wikipedia.org/w/api.php";
const MIN_ARTICLE_BYTES = 10000;
const BAD_TITLE_PREFIXES = ["Liste de", "Liste des", "Index de", "Portail:"];
const BAD_TITLE_SUFFIXES = ["(homonymie)", "(disambiguation)"];

// Cache de promesses module-level
const articleCache = new Map<string, Promise<WikiArticle | null>>();

function doFetchArticle(title: string): Promise<WikiArticle | null> {
  const params = new URLSearchParams({
    action: "parse",
    page: title,
    format: "json",
    origin: "*",
    prop: "text|displaytitle",
    disableeditsection: "1",
    redirects: "1",
  });
  return fetch(`${WIKI_API_BASE}?${params}`)
    .then((res) => {
      if (!res.ok) throw new Error("Erreur reseau");
      return res.json();
    })
    .then((data): WikiArticle => {
      if (data.error) throw new Error(data.error.info ?? "Article introuvable");
      return {
        html: data.parse.text["*"] as string,
        title: data.parse.title as string,
      };
    })
    .catch((err) => {
      articleCache.delete(title);
      throw err;
    });
}

function getCachedArticle(title: string): Promise<WikiArticle | null> {
  if (!articleCache.has(title)) {
    articleCache.set(title, doFetchArticle(title));
  }
  return articleCache.get(title)!;
}

export function prefetchArticle(title: string): void {
  getCachedArticle(title).catch(() => {});
}

export async function fetchArticle(title: string): Promise<WikiArticle | null> {
  try {
    return await getCachedArticle(title);
  } catch {
    return null;
  }
}

interface WikiPageInfo {
  title: string;
  length: number;
}

function isGoodArticle(page: WikiPageInfo): boolean {
  const t = page.title;
  return (
    page.length >= MIN_ARTICLE_BYTES &&
    !BAD_TITLE_PREFIXES.some((p) => t.startsWith(p)) &&
    !BAD_TITLE_SUFFIXES.some((s) => t.endsWith(s))
  );
}

async function fetchRandomCandidates(): Promise<string[]> {
  const params = new URLSearchParams({
    action: "query",
    generator: "random",
    grnnamespace: "0",
    grnlimit: "50",
    grnfilterredir: "nonredirects",
    prop: "info",
    format: "json",
    origin: "*",
  });
  const res = await fetch(`${WIKI_API_BASE}?${params}`);
  if (!res.ok) throw new Error("Erreur reseau");
  const data = (await res.json()) as {
    query: { pages: Record<string, WikiPageInfo> };
  };
  return Object.values(data.query.pages)
    .filter(isGoodArticle)
    .map((p) => p.title);
}

export async function pickTwoArticles(): Promise<Puzzle> {
  try {
    const collected: string[] = [];
    for (let i = 0; i < 3; i++) {
      const batch = await fetchRandomCandidates();
      for (const title of batch) {
        if (!collected.includes(title)) collected.push(title);
        if (collected.length >= 2)
          return { start: collected[0], target: collected[1] };
      }
    }
  } catch {
    // Fallback si l'API est indisponible
  }
  return getFallbackPuzzle();
}

export function normalizeTitle(s: string): string {
  return decodeURIComponent(s).replace(/_/g, " ").toLowerCase().trim();
}

export const POLL_INTERVAL = 2000;
export const COUNTDOWN_DURATION = 3000;

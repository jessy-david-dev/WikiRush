export type Screen = "home" | "lobby" | "game" | "solo" | "profile" | "leaderboard";

export type WikiArticle = {
  title: string;
  html: string;
};

export type Puzzle = {
  start: string;
  target: string;
};

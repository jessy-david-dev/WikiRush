export type Screen =
  | "home"
  | "lobby"
  | "game"
  | "solo"
  | "profile"
  | "leaderboard"
  | "daily"
  | "blitz";

export type WikiArticle = {
  title: string;
  html: string;
};

export type Puzzle = {
  start: string;
  target: string;
};

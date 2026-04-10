-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "startArticle" TEXT NOT NULL,
    "targetArticle" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "timeSeconds" REAL NOT NULL,
    "won" BOOLEAN NOT NULL DEFAULT true,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DailyPuzzle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "startArticle" TEXT NOT NULL,
    "targetArticle" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DailyResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "puzzleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "timeSeconds" REAL NOT NULL,
    "won" BOOLEAN NOT NULL,
    "playedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DailyResult_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "DailyPuzzle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DailyResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Game_userId_idx" ON "Game"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPuzzle_date_key" ON "DailyPuzzle"("date");

-- CreateIndex
CREATE INDEX "DailyResult_puzzleId_idx" ON "DailyResult"("puzzleId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyResult_puzzleId_userId_key" ON "DailyResult"("puzzleId", "userId");

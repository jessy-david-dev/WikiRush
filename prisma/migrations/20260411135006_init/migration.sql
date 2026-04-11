-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "startArticle" TEXT NOT NULL,
    "targetArticle" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "timeSeconds" DOUBLE PRECISION NOT NULL,
    "won" BOOLEAN NOT NULL DEFAULT true,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPuzzle" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startArticle" TEXT NOT NULL,
    "targetArticle" TEXT NOT NULL,

    CONSTRAINT "DailyPuzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyResult" (
    "id" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "timeSeconds" DOUBLE PRECISION NOT NULL,
    "won" BOOLEAN NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyResult_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyResult" ADD CONSTRAINT "DailyResult_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "DailyPuzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyResult" ADD CONSTRAINT "DailyResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

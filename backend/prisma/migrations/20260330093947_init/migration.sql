-- CreateEnum
CREATE TYPE "role" AS ENUM ('GUEST', 'PLAYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "game_mode" AS ENUM ('CASUAL', 'TAG');

-- CreateEnum
CREATE TYPE "game_result" AS ENUM ('WIN', 'DRAW', 'ABANDONED');

-- CreateEnum
CREATE TYPE "game_result_reason" AS ENUM ('CORRECT_GUESS', 'LIVES_EXHAUSTED', 'TIMEOUT', 'DISCONNECT', 'MUTUAL_SKIP');

-- CreateEnum
CREATE TYPE "log_action_type" AS ENUM ('ASK', 'GUESS', 'SKIP');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "google_id" TEXT,
    "role" "role" NOT NULL DEFAULT 'PLAYER',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "user_id" TEXT,
    "character_id" TEXT,
    "board_id" TEXT,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_instances" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "board_id" TEXT,
    "board_name" TEXT NOT NULL,
    "mode" "game_mode" NOT NULL,
    "turn_timer" INTEGER,
    "lives" INTEGER NOT NULL,
    "is_public" BOOLEAN NOT NULL,
    "player1_user_id" TEXT,
    "player1_name" TEXT NOT NULL,
    "player2_user_id" TEXT,
    "player2_name" TEXT NOT NULL,
    "result" "game_result" NOT NULL,
    "result_reason" "game_result_reason" NOT NULL,
    "winner_is_player1" BOOLEAN,

    CONSTRAINT "game_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_log_entries" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "game_instance_id" TEXT NOT NULL,
    "turn_number" INTEGER NOT NULL,
    "player_is_player1" BOOLEAN NOT NULL,
    "action_type" "log_action_type" NOT NULL,
    "subject" TEXT,
    "result" TEXT,

    CONSTRAINT "game_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BoardToCharacter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BoardToCharacter_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_user_id_key" ON "images"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_character_id_key" ON "images"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "images_board_id_key" ON "images"("board_id");

-- CreateIndex
CREATE INDEX "game_instances_player1_user_id_idx" ON "game_instances"("player1_user_id");

-- CreateIndex
CREATE INDEX "game_instances_player2_user_id_idx" ON "game_instances"("player2_user_id");

-- CreateIndex
CREATE INDEX "game_instances_created_at_idx" ON "game_instances"("created_at");

-- CreateIndex
CREATE INDEX "game_log_entries_game_instance_id_idx" ON "game_log_entries"("game_instance_id");

-- CreateIndex
CREATE INDEX "_BoardToCharacter_B_index" ON "_BoardToCharacter"("B");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_instances" ADD CONSTRAINT "game_instances_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_instances" ADD CONSTRAINT "game_instances_player1_user_id_fkey" FOREIGN KEY ("player1_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_instances" ADD CONSTRAINT "game_instances_player2_user_id_fkey" FOREIGN KEY ("player2_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_log_entries" ADD CONSTRAINT "game_log_entries_game_instance_id_fkey" FOREIGN KEY ("game_instance_id") REFERENCES "game_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToCharacter" ADD CONSTRAINT "_BoardToCharacter_A_fkey" FOREIGN KEY ("A") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BoardToCharacter" ADD CONSTRAINT "_BoardToCharacter_B_fkey" FOREIGN KEY ("B") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

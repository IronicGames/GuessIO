/*
  Warnings:

  - You are about to drop the column `createdAt` on the `character_instances` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `character_sets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `character_sets` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `characters` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `character_sets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `character_sets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `characters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "character_instances" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "character_sets" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "google_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- AddForeignKey
ALTER TABLE "character_sets" ADD CONSTRAINT "character_sets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

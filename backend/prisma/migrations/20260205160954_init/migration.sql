-- CreateTable
CREATE TABLE "character_sets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_instances" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "character_set_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_instances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "character_instances" ADD CONSTRAINT "character_instances_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_instances" ADD CONSTRAINT "character_instances_character_set_id_fkey" FOREIGN KEY ("character_set_id") REFERENCES "character_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

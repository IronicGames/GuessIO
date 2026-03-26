import { Prisma } from '@prisma/client';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
} from '@shared/types/character.types';
import prisma from '@lib/prisma';

export type Character = Prisma.CharacterGetPayload<{
  include: { image: true; boards: true };
}> | null;

export async function createCharacter(
  boardId: string,
  dto: CreateCharacterDto
): Promise<string> {
  const character = await prisma.character.create({
    data: {
      name: dto.name!,
      description: dto.description,
      tags: dto.tags,
      image: dto.imageUrl ? { create: { imageUrl: dto.imageUrl } } : undefined,
      boards: { connect: { id: boardId } },
    },
  });

  return character.id;
}

export async function addCharacterToBoard(
  characterId: string,
  boardId: string
): Promise<{ characterId: string; boardId: string }> {
  await prisma.character.update({
    where: { id: characterId },
    data: { boards: { connect: { id: boardId } } },
  });

  return { characterId, boardId };
}

export async function removeCharacterFromBoard(
  characterId: string,
  boardId: string
): Promise<{ characterId: string; boardId: string }> {
  await prisma.character.update({
    where: { id: characterId },
    data: { boards: { disconnect: { id: boardId } } },
  });

  return { characterId, boardId };
}

export async function updateCharacter(
  characterId: string,
  dto: UpdateCharacterDto
): Promise<string> {
  if (!dto.imageUrl) {
    await prisma.image.deleteMany({ where: { characterId: characterId } });
  }
  const character = await prisma.character.update({
    where: { id: characterId },
    data: {
      name: dto.name,
      description: dto.description,
      tags: dto.tags,
      image: dto.imageUrl
        ? {
            upsert: {
              create: { imageUrl: dto.imageUrl },
              update: { imageUrl: dto.imageUrl },
            },
          }
        : undefined,
    },
  });

  return character.id;
}

export async function deleteCharacter(characterId: string): Promise<string> {
  const character = await prisma.character.delete({
    where: { id: characterId },
  });

  return character.id;
}

export async function getCharacter(characterId: string): Promise<Character> {
  return prisma.character.findUnique({
    where: { id: characterId },
    include: { image: true, boards: true },
  });
}

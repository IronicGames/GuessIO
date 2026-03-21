import { Prisma } from '@prisma/client';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
} from '../../../shared/types/character.types';
import prisma from '../lib/prisma';

type Character = Prisma.CharacterGetPayload<{
  include: {
    image: true;
    board: true;
  };
}> | null;

export async function createCharacter(
  createCharacterDto: CreateCharacterDto
): Promise<string> {
  const createdCharacter = await prisma.character.create({
    data: {
      boardId: createCharacterDto.boardId,
      name: createCharacterDto.name,
      description: createCharacterDto.description,
      image: createCharacterDto.imageUrl
        ? {
            create: {
              imageUrl: createCharacterDto.imageUrl,
            },
          }
        : undefined,
      tags: createCharacterDto.tags,
    },
  });
  return createdCharacter.id;
}

export async function getCharacter(id: string): Promise<Character> {
  return await prisma.character.findFirst({
    where: {
      id: id,
    },
    include: {
      image: true,
      board: true,
    },
  });
}

export async function updateCharacter(
  id: string,
  updateCharacterDto: UpdateCharacterDto
): Promise<string> {
  const updatedCharacter = await prisma.character.update({
    where: {
      id: id,
    },
    data: {
      name: updateCharacterDto.name,
      description: updateCharacterDto.description,
      tags: updateCharacterDto.tags,
      image: updateCharacterDto.imageUrl
        ? {
            upsert: {
              create: {
                imageUrl: updateCharacterDto.imageUrl,
              },
              update: {
                imageUrl: updateCharacterDto.imageUrl,
              },
            },
          }
        : undefined,
    },
  });
  return updatedCharacter.id;
}

export async function deleteCharacter(id: string): Promise<string> {
  const deletedBoard = await prisma.character.delete({
    where: {
      id,
    },
  });
  return deletedBoard.id;
}

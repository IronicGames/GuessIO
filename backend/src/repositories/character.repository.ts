import { type Prisma } from '@prisma/client';
import { type CreateCharacterDto, type UpdateCharacterDto } from '@shared/types/character.types';
import prisma from '@lib/prisma';

export type Character = Prisma.CharacterGetPayload<{
  include: { image: true; boards: true };
}> | null;

export async function createCharacter(boardId: string, dto: CreateCharacterDto): Promise<string> {
  const character = await prisma.character.create({
    data: {
      name: dto.name!,
      tags: dto.tags,
      image: dto.imageUrl ? { create: { imageUrl: dto.imageUrl } } : undefined,
      boards: { connect: { id: boardId } },
    },
  });

  return character.id;
}

export async function addCharacterToBoard(
  characterId: string,
  boardId: string,
): Promise<{ characterId: string; boardId: string }> {
  await prisma.character.update({
    where: { id: characterId },
    data: { boards: { connect: { id: boardId } } },
  });

  return { characterId, boardId };
}

export async function removeCharacterFromBoard(
  characterId: string,
  boardId: string,
): Promise<{ characterId: string; boardId: string }> {
  await prisma.character.update({
    where: { id: characterId },
    data: { boards: { disconnect: { id: boardId } } },
  });

  return { characterId, boardId };
}

export async function updateCharacter(
  characterId: string,
  dto: UpdateCharacterDto,
): Promise<string> {
  if (!dto.imageUrl) {
    await prisma.image.deleteMany({ where: { characterId: characterId } });
  }
  const character = await prisma.character.update({
    where: { id: characterId },
    data: {
      name: dto.name,
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

export async function createCharacters(boardId: string, dtos: CreateCharacterDto[]): Promise<void> {
  const toConnect = dtos.filter((d) => d.characterId).map((d) => d.characterId!);
  const toCreate = dtos.filter((d) => !d.characterId);
  await prisma.$transaction([
    ...(toConnect.length > 0
      ? [
          prisma.board.update({
            where: { id: boardId },
            data: { characters: { connect: toConnect.map((id) => ({ id })) } },
          }),
        ]
      : []),
    ...toCreate.map((dto) =>
      prisma.character.create({
        data: {
          name: dto.name!,
          tags: dto.tags,
          image: dto.imageUrl ? { create: { imageUrl: dto.imageUrl } } : undefined,
          boards: { connect: { id: boardId } },
        },
      }),
    ),
  ]);
}

export async function deleteCharacters(characterIds: string[], boardId: string): Promise<void> {
  const characters = await prisma.character.findMany({
    where: { id: { in: characterIds } },
    include: { _count: { select: { boards: true } } },
  });

  const toDelete = characters.filter((c) => c._count.boards === 1).map((c) => c.id);
  const toDisconnect = characters.filter((c) => c._count.boards > 1).map((c) => c.id);

  await prisma.$transaction([
    prisma.character.deleteMany({ where: { id: { in: toDelete } } }),
    ...toDisconnect.map((id) =>
      prisma.character.update({
        where: { id },
        data: { boards: { disconnect: { id: boardId } } },
      }),
    ),
  ]);
}

export async function getCharacterCountForBoard(boardId: string): Promise<number> {
  const result = await prisma.board.findUnique({
    where: { id: boardId },
    select: { _count: { select: { characters: true } } },
  });
  return result?._count.characters ?? 0;
}

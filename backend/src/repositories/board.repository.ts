import { type Prisma } from '@prisma/client';
import { type CreateBoardDto, type UpdateBoardDto } from '@shared/types/board.types';
import prisma from '@lib/prisma';

export type BoardWithCharacters = Prisma.BoardGetPayload<{
  include: {
    image: true;
    characters: { include: { image: true; boards: true } };
  };
}> | null;

export async function createBoard(userId: string, createBoardDto: CreateBoardDto): Promise<string> {
  const createdBoard = await prisma.board.create({
    data: {
      name: createBoardDto.name,
      description: createBoardDto.description,
      isPublic: createBoardDto.isPublic,
      image: createBoardDto.imageUrl
        ? {
            create: {
              imageUrl: createBoardDto.imageUrl,
            },
          }
        : undefined,
      userId: userId,
    },
  });
  return createdBoard.id;
}

export async function getBoard(id: string): Promise<BoardWithCharacters> {
  return await prisma.board.findFirst({
    where: {
      id: id,
    },
    include: {
      image: true,
      characters: { include: { image: true, boards: true } },
    },
  });
}

export async function getBoardsForUser(
  id: string,
  includePublic: boolean,
): Promise<BoardWithCharacters[]> {
  return await prisma.board.findMany({
    where: includePublic
      ? {
          OR: [{ user: { id } }, { isPublic: true }],
        }
      : {
          user: { id },
        },
    include: {
      image: true,
      characters: { include: { image: true, boards: true } },
    },
  });
}

export async function updateBoard(id: string, updateBoardDto: UpdateBoardDto): Promise<string> {
  if (!updateBoardDto.imageUrl) {
    await prisma.image.deleteMany({ where: { boardId: id } });
  }
  const updatedBoard = await prisma.board.update({
    where: {
      id: id,
    },
    data: {
      name: updateBoardDto.name,
      description: updateBoardDto.description,
      image: updateBoardDto.imageUrl
        ? {
            upsert: {
              create: {
                imageUrl: updateBoardDto.imageUrl,
              },
              update: {
                imageUrl: updateBoardDto.imageUrl,
              },
            },
          }
        : undefined,
      isPublic: updateBoardDto.isPublic,
    },
  });
  return updatedBoard.id;
}

export async function deleteBoard(id: string): Promise<string> {
  const deletedBoard = await prisma.board.delete({
    where: {
      id: id,
    },
  });
  return deletedBoard.id;
}

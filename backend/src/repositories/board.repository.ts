import { Prisma } from '@prisma/client';
import { CreateBoardDto, UpdateBoardDto } from '@shared/board.types';
import prisma from '../lib/prisma';

export type FullBoard = Prisma.BoardGetPayload<{
  include: {
    image: true;
    characterInstances: { include: { character: true } };
  };
}> | null;

export async function createBoard(
  createBoardDto: CreateBoardDto
): Promise<string> {
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
      userId: createBoardDto.userId,
    },
  });
  return createdBoard.id;
}

export async function getBoard(id: string): Promise<FullBoard> {
  return await prisma.board.findFirst({
    where: {
      id: id,
    },
    include: {
      image: true,
      characterInstances: { include: { character: true } },
    },
  });
}

export async function getBoardsForUser(id: string): Promise<FullBoard[]> {
  return await prisma.board.findMany({
    where: {
      user: {
        id: id,
      },
    },
    include: {
      image: true,
      characterInstances: { include: { character: true } },
    },
  });
}

export async function updateBoard(
  id: string,
  updateBoardDto: UpdateBoardDto
): Promise<string> {
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

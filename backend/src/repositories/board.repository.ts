import { Prisma } from '@prisma/client';
import { CreateBoardDto, UpdateBoardDto } from '@shared/board.types';
import prisma from 'src/lib/prisma';

export type BoardWithImageAndCharacterInstances = Prisma.BoardGetPayload<{
  include: { image: true; characterInstances: true };
}> | null;

export async function createBoard(
  createBoardDto: CreateBoardDto
): Promise<string | null> {
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
    include: {
      image: true,
      characterInstances: true,
    },
  });
  return createdBoard?.id;
}

export async function getBoard(
  id: string
): Promise<BoardWithImageAndCharacterInstances> {
  return await prisma.board.findFirst({
    where: {
      id: id,
    },
    include: {
      image: true,
      characterInstances: true,
    },
  });
}

export async function getBoardsForUser(
  id: string
): Promise<BoardWithImageAndCharacterInstances[]> {
  return await prisma.board.findMany({
    where: {
      user: {
        id: id,
      },
    },
    include: {
      image: true,
      characterInstances: true,
    },
  });
}

export async function updateBoard(
  updateBoardDto: UpdateBoardDto
): Promise<string | null> {
  const updatedBoard = await prisma.board.update({
    where: {
      id: updateBoardDto.id,
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
    include: {
      image: true,
      characterInstances: true,
    },
  });
  return updatedBoard?.id;
}

export async function deleteBoard(id: string): Promise<string | null> {
  const deletedBoard = await prisma.board.delete({
    where: {
      id: id,
    },
  });
  return deletedBoard?.id;
}

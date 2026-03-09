import { Prisma } from '@prisma/client';
import prisma from 'src/lib/prisma';

export type BoardWithImageAndCharacterInstances = Prisma.BoardGetPayload<{
  include: { image: true; characterInstances: true };
}> | null;

export async function createBoard(
  name: string,
  userId: string,
  description?: string,
  isPublic?: boolean,
  imageUrl?: string
): Promise<BoardWithImageAndCharacterInstances> {
  return await prisma.board.create({
    data: {
      name,
      description,
      isPublic: isPublic ?? false,
      image: imageUrl
        ? {
            create: {
              imageUrl,
            },
          }
        : undefined,
      userId,
    },
    include: {
      image: true,
      characterInstances: true,
    },
  });
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

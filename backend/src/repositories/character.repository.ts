import { Prisma } from '@prisma/client';
import prisma from 'src/lib/prisma';

type CharacterInstance = Prisma.CharacterInstanceGetPayload<{
  include: {
    character: {
      include: {
        image: true;
      };
    };
  };
}> | null;
export async function createCharacterInstance(
  boardId: string,
  characterId?: string,
  name?: string,
  description?: string,
  imageUrl?: string,
  tags?: string[]
): Promise<CharacterInstance> {
  return await prisma.$transaction(async (tx) => {
    let resolvedCharacterId: string;
    if (characterId) {
      resolvedCharacterId = characterId;
    } else {
      const character = await tx.character.create({
        data: {
          name: name ?? '',
          description,
          image: imageUrl
            ? {
                create: {
                  imageUrl,
                },
              }
            : undefined,
        },
      });
      resolvedCharacterId = character.id;
    }
    const characterInstance = await tx.characterInstance.create({
      data: {
        boardId,
        characterId: resolvedCharacterId,
        tags: tags ?? [],
      },
      include: {
        character: {
          include: {
            image: true,
          },
        },
      },
    });
    return characterInstance;
  });
}

export async function getCharacterInstance(
  id: string
): Promise<CharacterInstance> {
  return await prisma.characterInstance.findFirst({
    where: {
      id: id,
    },
    include: {
      character: {
        include: {
          image: true,
        },
      },
    },
  });
}

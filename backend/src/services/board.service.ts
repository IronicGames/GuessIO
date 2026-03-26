import {
  BoardDto,
  CreateBoardDto,
  UpdateBoardDto,
} from '@shared/types/board.types';
import { NotFoundError } from '@errors/app-error';
import * as boardRepository from '@repositories/board.repository';
import { CharacterDto } from '@shared/types/character.types';
import { ToImageDto } from '@shared/types/image.types';
import { Character, Board, Image } from '@prisma/client';

export async function getBoardsForUser(userId: string): Promise<BoardDto[]> {
  const boards = await boardRepository.getBoardsForUser(userId);
  const boardDtos = boards
    .filter((board) => board != null)
    .map((board) => {
      return {
        id: board.id,
        name: board.name,
        description: board.description,
        isPublic: board.isPublic,
        userId: board.userId,
        createdAt: board.createdAt.toString(),
        updatedAt: board.updatedAt.toString(),
        image: ToImageDto(board.image),
        characters: board.characters.map((character) =>
          ToCharacterDto(character)
        ),
      } as BoardDto;
    });
  return boardDtos;
}

export async function createBoard(
  userId: string,
  createBoardDto: CreateBoardDto
): Promise<string> {
  const createdBoardId = await boardRepository.createBoard(
    userId,
    createBoardDto
  );
  if (!createdBoardId) {
    throw new NotFoundError('Board not found');
  }
  return createdBoardId;
}

export async function updateBoard(
  id: string,
  updateBoardDto: UpdateBoardDto
): Promise<string> {
  let updatedBoardId: string;
  try {
    updatedBoardId = await boardRepository.updateBoard(id, updateBoardDto);
  } catch {
    throw new NotFoundError('Board not found');
  }
  return updatedBoardId;
}

export async function deleteBoard(id: string): Promise<string> {
  let deletedBoardId: string;
  try {
    deletedBoardId = await boardRepository.deleteBoard(id);
  } catch {
    throw new NotFoundError('Board not found');
  }
  return deletedBoardId;
}

type CharacterWithBoardsAndImage = Character & {
  boards: Board[];
  image: Image | null;
};

export function ToCharacterDto(
  character: CharacterWithBoardsAndImage | null
): CharacterDto | null {
  return character
    ? {
        id: character.id,
        name: character.name,
        createdAt: character.createdAt.toISOString(),
        updatedAt: character.updatedAt.toISOString(),
        description: character.description,
        tags: character.tags ?? [],
        image: ToImageDto(character.image),
        boardIds: character.boards.map((board) => board.id),
      }
    : null;
}

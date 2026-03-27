import { type BoardDto, type CreateBoardDto, type UpdateBoardDto } from '@shared/types/board.types';
import { NotFoundError, UnauthorizedError } from '@errors/app-error';
import * as boardRepository from '@repositories/board.repository';
import { type CharacterDto } from '@shared/types/character.types';
import { ToImageDto } from '@shared/types/image.types';
import { type Character, type Board, type Image } from '@prisma/client';

export async function getBoardsForUser(userId: string): Promise<BoardDto[]> {
  const boards = await boardRepository.getBoardsForUser(userId);
  const boardDtos = boards.filter((board) => board != null).map(ToBoardDto);
  return boardDtos;
}

export async function getBoard(userId: string, boardId: string): Promise<BoardDto> {
  const board = await boardRepository.getBoard(boardId);
  if (!board) {
    throw new NotFoundError('Board not found');
  }
  if (userId !== board.userId) {
    throw new UnauthorizedError(`Board ${boardId} does not belong to user ${userId}`);
  }
  return ToBoardDto(board);
}

export async function createBoard(userId: string, createBoardDto: CreateBoardDto): Promise<string> {
  const createdBoardId = await boardRepository.createBoard(userId, createBoardDto);
  if (!createdBoardId) {
    throw new NotFoundError('Board not created');
  }
  return createdBoardId;
}

export async function updateBoard(id: string, updateBoardDto: UpdateBoardDto): Promise<string> {
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

type BoardWithCharactersAndImage = Board & {
  characters: CharacterWithBoardsAndImage[];
  image: Image | null;
};

type CharacterWithBoardsAndImage = Character & {
  boards: Board[];
  image: Image | null;
};

export function ToCharacterDto(character: CharacterWithBoardsAndImage | null): CharacterDto | null {
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

export function ToBoardDto(board: BoardWithCharactersAndImage): BoardDto {
  return {
    id: board.id,
    name: board.name,
    description: board.description,
    isPublic: board.isPublic,
    userId: board.userId,
    createdAt: board.createdAt.toString(),
    updatedAt: board.updatedAt.toString(),
    image: ToImageDto(board.image),
    characters: board.characters.map((character) => ToCharacterDto(character)),
  } as BoardDto;
}

import { CreateBoardDto, UpdateBoardDto } from '@shared/board.types';
import { NotFoundError } from 'src/errors/app-error';
import * as boardRepository from 'src/repositories/board.repository';
export async function getBoardsForUser(
  userId: string
): Promise<boardRepository.BoardWithImageAndCharacterInstances[]> {
  return await boardRepository.getBoardsForUser(userId);
}
export async function createBoard(
  createBoardDto: CreateBoardDto
): Promise<string> {
  const createdBoardId = await boardRepository.createBoard(createBoardDto);
  if (!createdBoardId) {
    throw new NotFoundError('Board not found');
  }
  return createdBoardId;
}

export async function updateBoard(
  updateBoardDto: UpdateBoardDto
): Promise<string> {
  const updatedBoardId = await boardRepository.updateBoard(updateBoardDto);
  if (!updatedBoardId) {
    throw new NotFoundError('Board not found');
  }
  return updatedBoardId;
}

export async function deleteBoard(id: string): Promise<string> {
  const deletedBoardId = await boardRepository.deleteBoard(id);
  if (!deletedBoardId) {
    throw new NotFoundError('Board not found');
  }
  return deletedBoardId;
}

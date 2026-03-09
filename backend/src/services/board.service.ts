import * as boardRepository from 'src/repositories/board.repository';
export async function getBoardsForUser(
  userId: string
): Promise<boardRepository.BoardWithImageAndCharacterInstances[]> {
  return await boardRepository.getBoardsForUser(userId);
}

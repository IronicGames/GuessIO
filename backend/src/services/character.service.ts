import { NotFoundError, BadRequestError } from '../errors/app-error';
import { type CreateCharacterDto, type UpdateCharacterDto } from '@shared/types/character.types';
import * as characterRepository from '../repositories/character.repository';
import { MAX_CHARACTERS_PER_BOARD, validateImageUrl } from '@backend/utils/misc-validation';

export async function createCharacter(
  boardId: string,
  dto: CreateCharacterDto,
): Promise<{ characterId: string; boardId: string }> {
  validateImageUrl(dto.imageUrl);

  const count = await characterRepository.getCharacterCountForBoard(boardId);
  if (count >= MAX_CHARACTERS_PER_BOARD) {
    throw new BadRequestError(
      `A board cannot have more than ${MAX_CHARACTERS_PER_BOARD} characters`,
    );
  }

  if (dto.characterId) {
    return characterRepository.addCharacterToBoard(dto.characterId, boardId);
  }

  const characterId = await characterRepository.createCharacter(boardId, dto);
  return { characterId, boardId };
}

export async function createCharacters(boardId: string, dtos: CreateCharacterDto[]): Promise<void> {
  const count = await characterRepository.getCharacterCountForBoard(boardId);
  if (count + dtos.length > MAX_CHARACTERS_PER_BOARD) {
    throw new BadRequestError(
      `Adding ${dtos.length} would exceed the ${MAX_CHARACTERS_PER_BOARD} character limit`,
    );
  }
  for (const dto of dtos.filter((d) => !d.characterId)) {
    validateImageUrl(dto.imageUrl);
  }
  await characterRepository.createCharacters(boardId, dtos);
}

export async function updateCharacter(
  characterId: string,
  dto: UpdateCharacterDto,
): Promise<{ characterId: string }> {
  validateImageUrl(dto.imageUrl);

  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  const updatedCharacterId = await characterRepository.updateCharacter(characterId, dto);
  return { characterId: updatedCharacterId };
}

export async function deleteCharacter(
  characterId: string,
  boardId: string,
): Promise<{ characterId: string; boardId: string }> {
  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  if (character.boards.length === 1) {
    const deletedCharacterId = await characterRepository.deleteCharacter(characterId);
    return { characterId: deletedCharacterId, boardId };
  }

  return characterRepository.removeCharacterFromBoard(characterId, boardId);
}

export async function deleteCharacters(characterIds: string[], boardId: string): Promise<void> {
  await characterRepository.deleteCharacters(characterIds, boardId);
}

export async function getCharacter(characterId: string): Promise<characterRepository.Character> {
  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  return character;
}

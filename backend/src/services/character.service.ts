import { NotFoundError } from '../errors/app-error';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
} from '@shared/types/character.types';
import * as characterRepository from '../repositories/character.repository';

export async function createCharacter(
  boardId: string,
  dto: CreateCharacterDto
): Promise<{ characterId: string; boardId: string }> {
  if (dto.characterId) {
    return characterRepository.addCharacterToBoard(dto.characterId, boardId);
  }

  const characterId = await characterRepository.createCharacter(boardId, dto);
  return { characterId, boardId };
}

export async function updateCharacter(
  characterId: string,
  dto: UpdateCharacterDto
): Promise<{ characterId: string }> {
  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  const updatedCharacterId = await characterRepository.updateCharacter(
    characterId,
    dto
  );
  return { characterId: updatedCharacterId };
}

export async function deleteCharacter(
  characterId: string,
  boardId: string
): Promise<{ characterId: string; boardId: string }> {
  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  if (character.boards.length === 1) {
    const deletedCharacterId =
      await characterRepository.deleteCharacter(characterId);
    return { characterId: deletedCharacterId, boardId };
  }

  return characterRepository.removeCharacterFromBoard(characterId, boardId);
}

export async function getCharacter(
  characterId: string
): Promise<characterRepository.Character> {
  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  return character;
}

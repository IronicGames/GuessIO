import { NotFoundError } from '../errors/app-error';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
} from '@shared/character.types';
import * as characterRepository from '../repositories/character.repository';

export async function createCharacter(
  createCharacterDto: CreateCharacterDto
): Promise<string> {
  const createdCharacterId =
    await characterRepository.createCharacter(createCharacterDto);
  if (!createdCharacterId) {
    throw new NotFoundError('Character not found');
  }
  return createdCharacterId;
}

export async function updateCharacter(
  id: string,
  updateCharacterDto: UpdateCharacterDto
): Promise<string> {
  let updatedCharacterId: string;
  try {
    updatedCharacterId = await characterRepository.updateCharacter(
      id,
      updateCharacterDto
    );
  } catch {
    throw new NotFoundError('Character not found');
  }
  return updatedCharacterId;
}

export async function deleteCharacter(id: string): Promise<string> {
  let deletedCharacterId: string;
  try {
    deletedCharacterId = await characterRepository.deleteCharacter(id);
  } catch {
    throw new NotFoundError('Character not found');
  }
  return deletedCharacterId;
}

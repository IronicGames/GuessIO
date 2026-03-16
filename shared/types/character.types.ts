import { ImageDto } from './image.types';

export interface CharacterDto {
  id: string;
  name: string;
  description: string | null;
  image: ImageDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharacterDto {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateCharacterDto {
  name?: string;
  description?: string;
  imageUrl?: string;
}

export function ToCharacterDto(
  character: {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
  } | null
): CharacterDto | null {
  return character
    ? ({
        id: character.id,
        name: character.id,
        createdAt: character.createdAt.toString(),
        updatedAt: character.updatedAt.toString(),
        description: character.description,
      } as CharacterDto)
    : null;
}

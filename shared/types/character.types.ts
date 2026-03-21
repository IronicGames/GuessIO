import { ImageDto } from './image.types';

export interface CharacterDto {
  id: string;
  name: string;
  description: string | null;
  image: ImageDto | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCharacterDto {
  boardId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface UpdateCharacterDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  tags: string[];
}

export function ToCharacterDto(
  character: {
    name: string;
    id: string;
    tags: string[];
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
        tags: character.tags ?? [],
      } as CharacterDto)
    : null;
}

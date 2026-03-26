import { ImageDto } from './image.types';

export interface CharacterSummaryDto {
  id: string;
  name: string;
  description: string | null;
  image: ImageDto | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CharacterDto extends CharacterSummaryDto {
  boardIds: string[];
}

export interface CreateCharacterDto {
  characterId: string;
  name?: string;
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

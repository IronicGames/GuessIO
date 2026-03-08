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

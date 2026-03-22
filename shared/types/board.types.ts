import { CharacterDto } from './character.types';
import { ImageDto } from './image.types';

export interface BoardDto {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  image: ImageDto;
  userId: string;
  characters: CharacterDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardDto {
  name: string;
  description?: string;
  isPublic?: boolean;
  imageUrl?: string;
}

export interface UpdateBoardDto {
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
}

import { CharacterInstanceDto } from './character-instance.types';
import { ImageDto } from './image.types';

export interface BoardDto {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  image: ImageDto;
  userId: string;
  characterInstances: CharacterInstanceDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardDto {
  userId: string;
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

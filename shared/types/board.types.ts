import { CharacterDto } from './character.types';
import { ImageDto } from './image.types';

export interface BoardSummaryDto {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  image: ImageDto;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
export interface BoardDto extends BoardSummaryDto {
  characters: CharacterDto[];
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

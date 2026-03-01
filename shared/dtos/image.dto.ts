export interface ImageDto {
  id: string;
  imageUrl: string;
}

export interface CreateImageDto {
  imageUrl: string;
  userId?: string;
  characterId?: string;
  boardId?: string;
}

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

export function ToImageDto(
  image: {
    id: string;
    imageUrl: string;
    userId: string | null;
    characterId: string | null;
    boardId: string | null;
  } | null
): ImageDto | null {
  return image
    ? ({ id: image.id, imageUrl: image.imageUrl } as ImageDto)
    : null;
}

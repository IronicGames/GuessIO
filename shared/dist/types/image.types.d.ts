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
export declare function ToImageDto(image: {
    id: string;
    imageUrl: string;
    userId: string | null;
    characterId: string | null;
    boardId: string | null;
} | null): ImageDto | null;
//# sourceMappingURL=image.types.d.ts.map
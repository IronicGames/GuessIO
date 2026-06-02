import { type ImageDto } from './image.types';
export interface CharacterSummaryDto {
    id: string;
    name: string;
    image: ImageDto | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
export interface CharacterDto extends CharacterSummaryDto {
    boardIds: string[];
}
export interface CreateCharacterDto {
    characterId?: string;
    name?: string;
    imageUrl?: string;
    tags?: string[];
}
export interface UpdateCharacterDto {
    name?: string;
    imageUrl?: string;
    tags?: string[];
}
//# sourceMappingURL=character.types.d.ts.map
import { type CharacterDto } from './character.types';
import { type ImageDto } from './image.types';
export interface BoardSummaryDto {
    id: string;
    name: string;
    description?: string;
    isPublic: boolean;
    image?: ImageDto;
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
export interface ManifestJson {
    version: number;
    files: Record<string, string>;
}
export interface BoardJson {
    version: number;
    name: string;
    description?: string;
    image: string;
    characters: CharacterEntry[];
}
export interface CharacterEntry {
    name: string;
    tags: string[];
    image: string;
}
export interface BoardImportPreview {
    name: string;
    characterCount: number;
    firstImageUrl?: string;
}
//# sourceMappingURL=board.types.d.ts.map
import { CharacterDto, ToCharacterDto } from './character.types';

export interface CharacterInstanceDto {
  id: string;
  tags: string[];
  boardId: string;
  character: CharacterDto | null;
}

export function ToCharacterInstanceDtos(
  characterInstances: {
    id: string;
    characterId: string;
    boardId: string;
    tags: string[];
    character: {
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      description: string | null;
    };
  }[]
): CharacterInstanceDto[] {
  return characterInstances
    ? characterInstances.map((ci) => {
        return {
          id: ci.id,
          tags: ci.tags,
          boardId: ci.boardId,
          character: ToCharacterDto(ci.character),
        } as CharacterInstanceDto;
      })
    : [];
}

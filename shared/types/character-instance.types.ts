import { CharacterDto } from './character.types';

export interface CharacterInstanceDto {
  id: string;
  tags: string[];
  boardId: string;
  characterId: string;
}

export interface CharacterInstanceWithDetailsDto extends CharacterInstanceDto {
  character: CharacterDto;
}

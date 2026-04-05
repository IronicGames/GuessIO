import { asyncHandler } from '@middleware/error-handler.middleware';
import { type Request, type Response } from 'express';
import * as characterService from '@services/character.service';
import { type CreateCharacterDto } from '@shared/types/character.types';

export const createCharacter = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };
  const { characterId, name, imageUrl, tags } = req.body;

  const result = await characterService.createCharacter(boardId, {
    characterId,
    name,
    imageUrl,
    tags,
  });

  res.json(result);
});

export const createCharacters = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };
  const { characters } = req.body as { characters: CreateCharacterDto[] };
  await characterService.createCharacters(boardId, characters);
  res.status(201).json({ created: characters.length });
});

export const updateCharacter = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params as { characterId: string };
  const { name, imageUrl, tags } = req.body;

  const result = await characterService.updateCharacter(characterId, {
    name,
    imageUrl,
    tags,
  });

  res.json(result);
});

export const deleteCharacter = asyncHandler(async (req: Request, res: Response) => {
  const { boardId, characterId } = req.params as {
    boardId: string;
    characterId: string;
  };

  const result = await characterService.deleteCharacter(characterId, boardId);

  res.json(result);
});

export const deleteCharacters = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };
  const { ids } = req.body as { ids: string[] };
  await characterService.deleteCharacters(ids, boardId);
  res.json({ deleted: ids.length });
});

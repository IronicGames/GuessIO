import { asyncHandler } from '@middleware/error-handler.middleware';
import { type Request, type Response } from 'express';
import * as characterService from '@services/character.service';

export const createCharacter = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };
  const { characterId, name, description, imageUrl, tags } = req.body;

  const result = await characterService.createCharacter(boardId, {
    characterId,
    name,
    description,
    imageUrl,
    tags,
  });

  res.json(result);
});

export const updateCharacter = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params as { characterId: string };
  const { name, description, imageUrl, tags } = req.body;

  const result = await characterService.updateCharacter(characterId, {
    name,
    description,
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

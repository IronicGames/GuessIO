import { asyncHandler } from '../middleware/error-handler.middleware';
import { Request, Response } from 'express';
import * as characterService from '../services/character.service';
import { BadRequestError } from '../errors/app-error';

export const createCharacter = asyncHandler(
  async (req: Request, res: Response) => {
    const name = req.body.name;
    const boardId = req.params.id;
    if (!name) {
      throw new BadRequestError('Board name is required');
    }
    if (!boardId) {
      throw new BadRequestError('Board ID is required');
    }

    const createdCharacter = await characterService.createCharacter({
      boardId: req.body.boardId,
      name: req.body.name,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
    });
    res.json({ id: createdCharacter });
  }
);

export const updateCharacter = asyncHandler(
  async (req: Request, res: Response) => {
    const name = req.body.name;
    const id = req.params.id as string;
    if (!id) {
      throw new BadRequestError('Character ID not found');
    }

    if (!name) {
      throw new BadRequestError('Character name is required');
    }

    const updatedCharacter = await characterService.updateCharacter(id, {
      name,
      description: req.body.description,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
    });
    res.json({ id: updatedCharacter });
  }
);

export const deleteCharacter = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      throw new BadRequestError('Character ID not found');
    }

    const deletedCharacter = await characterService.deleteCharacter(id);
    res.json({ id: deletedCharacter });
  }
);

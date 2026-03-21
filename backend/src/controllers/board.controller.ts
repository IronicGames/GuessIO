import { Request, Response } from 'express';
import * as boardService from '@services/board.service';
import { BadRequestError } from '@errors/app-error';
import { asyncHandler } from '@middleware/error-handler.middleware';

export const getBoardsForUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      throw new BadRequestError('User ID not found');
    }

    const boards = await boardService.getBoardsForUser(userId);
    res.json(boards);
  }
);

export const createBoard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  const name = req.body.name;
  if (!userId) {
    throw new BadRequestError('User ID not found');
  }

  if (!name) {
    throw new BadRequestError('Board name is required');
  }

  const createdBoard = await boardService.createBoard({
    userId,
    name,
    description: req.body.description,
    isPublic: req.body.isPublic,
    imageUrl: req.body.imageUrl,
  });
  res.json({ id: createdBoard });
});

export const updateBoard = asyncHandler(async (req: Request, res: Response) => {
  const name = req.body.name;
  const id = req.params.id as string;
  if (!id) {
    throw new BadRequestError('Board ID not found');
  }

  if (!name) {
    throw new BadRequestError('Board name is required');
  }

  const updatedBoard = await boardService.updateBoard(id, {
    name,
    description: req.body.description,
    isPublic: req.body.isPublic,
    imageUrl: req.body.imageUrl,
  });
  res.json({ id: updatedBoard });
});

export const deleteBoard = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    throw new BadRequestError('Board ID not found');
  }

  const deletedBoard = await boardService.deleteBoard(id);
  res.json({ id: deletedBoard });
});

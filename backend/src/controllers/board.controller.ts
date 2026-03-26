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
  const { name, description, isPublic, imageUrl } = req.body;
  if (!userId) {
    throw new BadRequestError('User ID not found');
  }
  if (!name) {
    throw new BadRequestError('Board name is required');
  }
  const createdBoard = await boardService.createBoard(userId, {
    name,
    description,
    isPublic,
    imageUrl,
  });
  res.json({ id: createdBoard });
});

export const updateBoard = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };
  const { name, description, isPublic, imageUrl } = req.body;
  if (!name) {
    throw new BadRequestError('Board name is required');
  }
  const updatedBoard = await boardService.updateBoard(boardId, {
    name,
    description,
    isPublic,
    imageUrl,
  });
  res.json({ id: updatedBoard });
});

export const deleteBoard = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };
  const deletedBoard = await boardService.deleteBoard(boardId);
  res.json({ id: deletedBoard });
});

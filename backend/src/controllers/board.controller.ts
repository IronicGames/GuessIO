import { type Request, type Response } from 'express';
import * as boardService from '@services/board.service';
import { asyncHandler } from '@middleware/error-handler.middleware';

export const getBoardsForUser = asyncHandler(async (req: Request, res: Response) => {
  const boards = await boardService.getBoardsForUser(req.userId);
  res.json(boards);
});

export const getBoard = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };

  const board = await boardService.getBoard(req.userId, boardId);
  res.json(board);
});

export const createBoard = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, isPublic, imageUrl } = req.body;
  const createdBoard = await boardService.createBoard(req.userId, {
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

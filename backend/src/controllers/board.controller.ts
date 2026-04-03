import { type Request, type Response } from 'express';
import * as boardService from '@services/board.service';
import { asyncHandler } from '@middleware/error-handler.middleware';
import { Role } from '@prisma/client';

export const getBoardsForUser = asyncHandler(async (req: Request, res: Response) => {
  const includePublic = req.query.includePublic === 'true';
  const boards = await boardService.getBoardsForUser(req.user.id, includePublic ?? false);
  res.json(boards);
});

export const getBoard = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };

  const board = await boardService.getBoard(req.user.id, boardId);
  res.json(board);
});

export const createBoard = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, isPublic, imageUrl } = req.body;
  const createdBoard = await boardService.createBoard(req.user.id, {
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

  const updatedBoard = await boardService.updateBoard(req.user.id, req.user.role as Role, boardId, {
    name,
    description,
    isPublic,
    imageUrl,
  });
  res.json({ id: updatedBoard });
});

export const deleteBoard = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };
  const deletedBoard = await boardService.deleteBoard(req.user.id, req.user.role as Role, boardId);
  res.json({ id: deletedBoard });
});

import { type Request, type Response } from 'express';
import * as boardService from '@services/board.service';
import * as boardExportService from '@services/board-export.service';
import { asyncHandler } from '@middleware/error-handler.middleware';
import { type Role } from '@prisma/client';
import { importBoard, previewImport } from '@backend/services/board-import.service';

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

export const deleteBoards = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };
  const count = await boardService.deleteBoards(req.user.id, ids);
  res.json({ deleted: count });
});

export const exportBoard = asyncHandler(async (req: Request, res: Response) => {
  const { boardId } = req.params as { boardId: string };
  const exportedFile = await boardExportService.createBoardZip(req.user.id, boardId);
  res.setHeader('Content-Disposition', `attachment; filename="${exportedFile.filename}"`);
  res.setHeader('Content-Type', 'application/zip');
  res.end(exportedFile.bytes);
});

export const previewBoardImport = asyncHandler(async (req: Request, res: Response) => {
  const preview = await previewImport(req.file!.buffer);
  res.json(preview);
});

export const importBoardController = asyncHandler(async (req: Request, res: Response) => {
  const boardId = await importBoard(req.user.id, req.file!.buffer);
  res.status(201).json({ id: boardId });
});

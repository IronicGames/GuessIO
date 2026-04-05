import {
  createBoard,
  getBoardsForUser,
  updateBoard,
  deleteBoard,
  getBoard,
  exportBoard,
  previewBoardImport,
  importBoardController,
  deleteBoards,
} from '@controllers/board.controller';
import { importRateLimit } from '@middleware/rate-limit.middleware';
import characterRouter from './character.route';
import { Router } from 'express';
import { validate } from '@middleware/validation/validation.middleware';
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
  boardIdsSchema,
} from '@middleware/validation/validation.schemas';
import { importUpload } from '@backend/middleware/import.middleware';

const router = Router();

router.post('/import/preview', importRateLimit, importUpload.single('file'), previewBoardImport);
router.post('/import', importRateLimit, importUpload.single('file'), importBoardController);
router.delete('/bulk', validate(boardIdsSchema), deleteBoards);
router.get('/', getBoardsForUser);
router.get('/:boardId', validate(boardIdParamSchema, 'params'), getBoard);
router.post('/', validate(createBoardSchema), createBoard);
router.put(
  '/:boardId',
  validate(boardIdParamSchema, 'params'),
  validate(updateBoardSchema),
  updateBoard,
);
router.delete('/:boardId', validate(boardIdParamSchema, 'params'), deleteBoard);
router.get('/:boardId/export', validate(boardIdParamSchema, 'params'), exportBoard);
router.use('/:boardId/characters', characterRouter);

export default router;

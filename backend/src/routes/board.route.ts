import {
  createBoard,
  getBoardsForUser,
  updateBoard,
  deleteBoard,
  getBoard,
} from './../controllers/board.controller';
import characterRouter from './character.route';
import { Router } from 'express';
import { requireAuth } from '@middleware/auth.middleware';
import { validate } from '@middleware/validation/validation.middleware';
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
} from '@middleware/validation/validation.schemas';

const router = Router();

router.get('/', requireAuth, getBoardsForUser);
router.get('/:boardId', requireAuth, validate(boardIdParamSchema, 'params'), getBoard);
router.post('/', requireAuth, validate(createBoardSchema), createBoard);
router.put(
  '/:boardId',
  requireAuth,
  validate(boardIdParamSchema, 'params'),
  validate(updateBoardSchema),
  updateBoard,
);
router.delete('/:boardId', requireAuth, validate(boardIdParamSchema, 'params'), deleteBoard);

router.use('/:boardId/characters', characterRouter);

export default router;

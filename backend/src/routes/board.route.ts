import {
  createBoard,
  getBoardsForUser,
  updateBoard,
  deleteBoard,
  getBoard,
  exportBoard,
} from '@controllers/board.controller';
import characterRouter from './character.route';
import { Router } from 'express';
import { validate } from '@middleware/validation/validation.middleware';
import {
  createBoardSchema,
  updateBoardSchema,
  boardIdParamSchema,
} from '@middleware/validation/validation.schemas';

const router = Router();

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

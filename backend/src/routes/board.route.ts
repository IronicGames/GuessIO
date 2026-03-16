import {
  createBoard,
  getBoardsForUser,
  updateBoard,
  deleteBoard,
} from './../controllers/board.controller';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getBoardsForUser); // GET /api/boards
router.post('/', requireAuth, createBoard); // POST /api/boards/
router.put('/:id', requireAuth, updateBoard); // PUT /api/boards/
router.delete('/:id', requireAuth, deleteBoard); // DELETE /api/boards/

export default router;

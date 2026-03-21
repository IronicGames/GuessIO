import {
  createBoard,
  getBoardsForUser,
  updateBoard,
  deleteBoard,
} from './../controllers/board.controller';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getBoardsForUser); // GET /api/board/
router.post('/', requireAuth, createBoard); // POST /api/board/
router.put('/:id', requireAuth, updateBoard); // PUT /api/board/
router.delete('/:id', requireAuth, deleteBoard); // DELETE /api/board/

export default router;

import {
  createBoard,
  getBoardsForUser,
  updateBoard,
  deleteBoard,
} from './../controllers/board.controller';
import { Router } from 'express';
import { requireAuth } from 'src/middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getBoardsForUser); // GET /api/boards
router.post('/create', requireAuth, createBoard); // POST /api/boards/create
router.put('/update', requireAuth, updateBoard); // POST /api/boards/create
router.delete('/delete', requireAuth, deleteBoard); // POST /api/boards/create

export default router;

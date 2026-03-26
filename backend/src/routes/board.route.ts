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

const router = Router();

router.get('/', requireAuth, getBoardsForUser); // GET    /api/boards
router.get('/:boardId', requireAuth, getBoard); // GET    /api/boards
router.post('/', requireAuth, createBoard); // POST   /api/boards
router.put('/:boardId', requireAuth, updateBoard); // PUT    /api/boards/:boardId
router.delete('/:boardId', requireAuth, deleteBoard); // DELETE /api/boards/:boardId

router.use('/:boardId/characters', characterRouter); // mount character routes

export default router;

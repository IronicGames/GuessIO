import { getBoardsForUser } from './../controllers/board.controller';
import { Router } from 'express';
import { requireAuth } from 'src/middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, getBoardsForUser); // GET /api/boards

export default router;

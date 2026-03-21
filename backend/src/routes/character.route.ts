import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from './../controllers/character.controller';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', requireAuth, createCharacter); // POST /api/character/
router.put('/:id', requireAuth, updateCharacter); // PUT /api/character/
router.delete('/:id', requireAuth, deleteCharacter); // DELETE /api/character/

export default router;

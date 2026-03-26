import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from './../controllers/character.controller';
import { Router } from 'express';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router({ mergeParams: true }); // mergeParams gives access to :boardId from parent

router.post('/', requireAuth, createCharacter); // POST   /api/boards/:boardId/characters
router.put('/:characterId', requireAuth, updateCharacter); // PUT    /api/boards/:boardId/characters/:characterId
router.delete('/:characterId', requireAuth, deleteCharacter); // DELETE /api/boards/:boardId/characters/:characterId

export default router;

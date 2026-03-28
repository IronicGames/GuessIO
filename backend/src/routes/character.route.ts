import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from './../controllers/character.controller';
import { Router } from 'express';
import { requireAuth } from '@middleware/auth.middleware';
import { validate } from '@middleware/validation/validation.middleware';
import {
  createCharacterSchema,
  updateCharacterSchema,
  characterIdParamSchema,
} from '@middleware/validation/validation.schemas';

const router = Router({ mergeParams: true });

router.post('/', requireAuth, validate(createCharacterSchema), createCharacter);
router.put(
  '/:characterId',
  requireAuth,
  validate(characterIdParamSchema, 'params'),
  validate(updateCharacterSchema),
  updateCharacter,
);
router.delete(
  '/:characterId',
  requireAuth,
  validate(characterIdParamSchema, 'params'),
  deleteCharacter,
);

export default router;

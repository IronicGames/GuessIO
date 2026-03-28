import {
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from './../controllers/character.controller';
import { Router } from 'express';
import { validate } from '@middleware/validation/validation.middleware';
import {
  createCharacterSchema,
  updateCharacterSchema,
  characterIdParamSchema,
} from '@middleware/validation/validation.schemas';

const router = Router({ mergeParams: true });

router.post('/', validate(createCharacterSchema), createCharacter);
router.put(
  '/:characterId',
  validate(characterIdParamSchema, 'params'),
  validate(updateCharacterSchema),
  updateCharacter,
);
router.delete('/:characterId', validate(characterIdParamSchema, 'params'), deleteCharacter);

export default router;

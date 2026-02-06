import { CharacterSchema } from './character.dto';
import z from 'zod';

export const CharacterSetSchema = z.object({
  name: z.string(),
  characters: z.array(CharacterSchema),
});

export type CharacterSetDto = z.infer<typeof CharacterSetSchema>;

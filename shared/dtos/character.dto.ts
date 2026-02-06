import { z } from 'zod';
export const CharacterSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
});

export type CharacterDto = z.infer<typeof CharacterSchema>;

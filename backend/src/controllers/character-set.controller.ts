import {
  CharacterSetDto,
  CharacterSetSchema,
} from '@shared/dtos/character-set.dto';
import { Request, Response } from 'express';

export const createCharacterSet = async (req: Request, res: Response) => {
  const parseResult = CharacterSetSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.name });
  }
  const characterSet: CharacterSetDto = parseResult.data;

  characterSet.characters;
};

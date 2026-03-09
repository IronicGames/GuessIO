import { Request, Response } from 'express';
import * as boardService from '../services/board.service';

export const getBoardsForUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const boards = await boardService.getBoardsForUser(userId as string);
    res.json(boards);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(errorMessage);
    res.status(500).json({ error: 'Failed to retrieve boards' });
  }
};

import { Request, Response } from 'express';

export const getHealth = (_: Request, res: Response) =>
  res.json({
    status: res.statusCode,
    timestamp: new Date().toISOString(),
    service: 'guess-io-backend',
  });

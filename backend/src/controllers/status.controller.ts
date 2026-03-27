import { type Request, type Response } from 'express';
import prisma from '@lib/prisma';

export const getHealth = async (_: Request, res: Response) => {
  try {
    // Attempt a simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'guess-io-backend',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'guess-io-backend',
      database: 'disconnected',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    await prisma.$disconnect();
  }
};

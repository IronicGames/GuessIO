import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';

export function errorHandler(err: Error, req: Request, res: Response) {
  // Log error
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      status: 401,
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      status: 401,
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    // @ts-expect-error
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Resource already exists',
        status: 409,
      });
    }
    // @ts-expect-error
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Resource not found',
        status: 404,
      });
    }
  }

  // Unknown errors (500)
  return res.status(500).json({
    error: 'Internal server error',
    status: 500,
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

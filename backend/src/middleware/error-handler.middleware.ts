import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '@errors/app-error';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  if (!(err instanceof AppError) || !err.isOperational) {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Board not found', status: 404 });
    }
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Resource already exists', status: 409 });
    }
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token', status: 401 });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired', status: 401 });
  }

  // Body parser sets err.type — cast needed since base Error doesn't have this field
  if ((err as Error & { type?: string }).type === 'entity.too.large') {
    return res
      .status(413)
      .json({ error: 'Image too large. Maximum file size is 5MB.', status: 413 });
  }

  return res.status(500).json({ error: 'Internal server error', status: 500 });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

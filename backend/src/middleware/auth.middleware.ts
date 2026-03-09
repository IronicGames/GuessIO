import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from 'src/errors/app-error';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = authService.verifyToken(token);
    req.userId = decodedToken.userId;
    next();
  } catch (_) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

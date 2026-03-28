import { type Request, type Response, type NextFunction } from 'express';
import { authService } from '@services/auth.service';
import { ForbiddenError, UnauthorizedError } from '@errors/app-error';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    req.user = authService.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
}

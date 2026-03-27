import { type Request, type Response, type NextFunction } from 'express';
import { authService } from '@services/auth.service';
import { UnauthorizedError } from '@errors/app-error';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    throw new UnauthorizedError('No token provided');
  }

  const decodedToken = authService.verifyToken(token);
  req.userId = decodedToken.userId;
  next();
}

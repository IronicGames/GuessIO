import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    req.userId = decoded.userId;

    next(); // Continue to controller
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(errorMessage);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

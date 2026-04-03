import { parse } from 'cookie';
import type { Socket } from 'socket.io';
import { authService } from '@services/auth.service';
import { UnauthorizedError } from '@backend/errors/app-error';

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return next(new UnauthorizedError('No auth cookie'));

  const cookies = parse(cookieHeader);
  const token = cookies.token;

  if (!token) return next(new UnauthorizedError('No token in cookie'));

  try {
    const user = authService.verifyToken(token);
    socket.data.user = user; // available in all handlers via socket.data.user
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

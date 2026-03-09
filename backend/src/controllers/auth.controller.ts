import { Request, Response } from 'express';
import { config } from '../constants/env';
import { authService } from 'src/services/auth.service';
import * as userService from 'src/services/user.service';

export const initiateGoogleLogin = (_req: Request, res: Response) => {
  const authUrl = authService.getGoogleAuthUrl();
  res.redirect(authUrl);
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    const { user, token } = await authService.handleGoogleCallback(code);

    const frontendUrl = config.frontendUrl;
    const profilePictureUrl = user.profilePicture?.imageUrl || '';

    res.redirect(
      `${frontendUrl}/auth/callback?` +
        `token=${token}&` +
        `userId=${user.id}&` +
        `userName=${encodeURIComponent(user.name)}&` +
        `userPicture=${encodeURIComponent(profilePictureUrl)}`
    );
  } catch (_error) {
    const errorMessage =
      _error instanceof Error ? _error.message : 'Unknown error';
    console.error(errorMessage);
    const frontendUrl = config.frontendUrl;
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    const user = await userService.getUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (_error) {
    const errorMessage =
      _error instanceof Error ? _error.message : 'Unknown error';
    console.error(errorMessage);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

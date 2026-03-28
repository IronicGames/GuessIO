import { type Request, type Response } from 'express';
import { config } from '@utils/constants/env';
import { authService } from '@services/auth.service';
import * as userService from '@services/user.service';
import { asyncHandler } from '@middleware/error-handler.middleware';
import { type UserProfile } from '@shared/types/user.types';

export const initiateGoogleLogin = (req: Request, res: Response) => {
  const authUrl = authService.getGoogleAuthUrl();
  res.redirect(authUrl);
};

export const handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
  const { code, error } = req.query as { code?: string; error?: string };

  if (error) {
    res.redirect(
      `${config.frontendUrl}?error=${error === 'access_denied' ? 'login_cancelled' : 'auth_failed'}`,
    );
    return;
  }

  if (!code) {
    res.redirect(`${config.frontendUrl}?error=auth_failed`);
    return;
  }

  const token = await authService.handleGoogleCallback(code);
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.deployment === 'production',
    sameSite: 'lax',
  });
  res.redirect(`${config.frontendUrl}`);
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.user.id);
  res.json(user);
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (req.user.isGuest) {
    res.json({
      id: req.user.id,
      name: req.user.name,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
    } as UserProfile);
    return;
  }
  const id = req.user.id!;
  const user = await userService.getUserProfile(id);

  res.json(user);
});

export const loginAsGuest = asyncHandler(async (req: Request, res: Response) => {
  const token = authService.createGuestToken(req.body.name);

  res.cookie('token', token, {
    httpOnly: true,
    secure: config.deployment === 'production',
    sameSite: 'lax',
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  });

  res.json({ success: true });
});

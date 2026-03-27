import { type Request, type Response } from 'express';
import { config } from '@utils/constants/env';
import { authService } from '@services/auth.service';
import * as userService from '@services/user.service';
import { asyncHandler } from '@middleware/error-handler.middleware';
import { redirectToFrontendWithError } from '@utils/error/redirect-with-error';

export const initiateGoogleLogin = (req: Request, res: Response) => {
  const authUrl = authService.getGoogleAuthUrl();
  res.redirect(authUrl);
};

export const handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return redirectToFrontendWithError(
        res,
        error === 'access_denied' ? 'login_cancelled' : 'auth_failed',
      );
    }

    if (!code || typeof code !== 'string') {
      return redirectToFrontendWithError(res, 'missing_code');
    }

    const token = await authService.handleGoogleCallback(code);
    res.cookie('token', token, {
      httpOnly: true,
      //TODO: make this true when on production and we are able to use HTTPS
      secure: false,
      sameSite: 'lax',
    });
    res.redirect(`${config.frontendUrl}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return redirectToFrontendWithError(res, 'auth_failed');
  }
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.userId) {
    res.json(null);
  }
  const user = await userService.getUserById(req.userId!);
  res.json(user);
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const id = req.userId!;

  const user = await userService.getUserProfile(id);

  res.json(user);
});

import { Request, Response } from 'express';
import { config } from '../utils/constants/env';
import { authService } from '../services/auth.service';
import * as userService from '../services/user.service';
import { BadRequestError } from '../errors/app-error';
import { asyncHandler } from '../middleware/error-handler.middleware';
import { redirectToFrontendWithError } from '../utils/error/redirect-with-error';

export const initiateGoogleLogin = (req: Request, res: Response) => {
  const authUrl = authService.getGoogleAuthUrl();
  res.redirect(authUrl);
};

export const handleGoogleCallback = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { code, error } = req.query;

      if (error) {
        return redirectToFrontendWithError(
          res,
          error === 'access_denied' ? 'login_cancelled' : 'auth_failed'
        );
      }

      if (!code || typeof code !== 'string') {
        return redirectToFrontendWithError(res, 'missing_code');
      }

      const token = await authService.handleGoogleCallback(code);

      res.redirect(`${config.frontendUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return redirectToFrontendWithError(res, 'auth_failed');
    }
  }
);

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new BadRequestError('No token provided');
    }

    const token = authHeader.substring(7);
    const decodedToken = authService.verifyToken(token);

    const user = await userService.getUserById(decodedToken.userId);

    res.json(user);
  }
);

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.userId!;

    const user = await userService.getUserProfile(id);

    res.json(user);
  }
);

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import prisma from '../lib/prisma.js';
import { config } from 'src/constants/env.js';

const authService = new AuthService();

export const initiateGoogleLogin = (req: Request, res: Response) => {
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

    // Redirect to frontend with token
    const frontendUrl = config.frontendUrl || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
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

    // Get full user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicUrl: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

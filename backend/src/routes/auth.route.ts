import { Router } from 'express';
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getCurrentUser,
  getUserProfile,
} from '@controllers/auth.controller';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router();

router.get('/google', initiateGoogleLogin);
router.get('/google/callback', handleGoogleCallback);
router.get('/profile', requireAuth, getUserProfile);
router.get('/me', requireAuth, getCurrentUser);

export default router;

import { Router } from 'express';
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getCurrentUser,
  getUserProfile,
} from '@controllers/auth.controller';
import { requireAuth } from '@middleware/auth.middleware';

const router = Router();

router.get('/google', initiateGoogleLogin); // GET    /api/auth/google
router.get('/google/callback', handleGoogleCallback); // GET    /api/auth/google/callback
router.get('/profile', requireAuth, getUserProfile); // GET    /api/auth/profile
router.get('/me', requireAuth, getCurrentUser); // GET    /api/auth/me
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'lax' });
  res.json({ success: true });
});
export default router;

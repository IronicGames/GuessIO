import { Router } from 'express';
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getCurrentUser,
  getUserProfile,
} from '@controllers/auth.controller';
import { requireAuth } from '@middleware/auth.middleware';
import { validate } from '@middleware/validation/validation.middleware';
import { googleCallbackQuerySchema } from '@middleware/validation/validation.schemas';

const router = Router();

router.get('/google', initiateGoogleLogin);
router.get('/google/callback', validate(googleCallbackQuerySchema, 'query'), handleGoogleCallback);
router.get('/profile', requireAuth, getUserProfile);
router.get('/me', requireAuth, getCurrentUser);
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'lax' });
  res.json({ success: true });
});
export default router;

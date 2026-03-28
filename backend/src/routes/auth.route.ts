import { Router } from 'express';
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getCurrentUser,
  getUserProfile,
  loginAsGuest,
} from '@controllers/auth.controller';
import { requireAuth, requireRole } from '@middleware/auth.middleware';
import { validate } from '@middleware/validation/validation.middleware';
import { guestLoginSchema } from '@middleware/validation/validation.schemas';
import { Role } from '@shared/types/misc.types';

const router = Router();

router.get('/google', initiateGoogleLogin);
router.get('/google/callback', handleGoogleCallback);
router.get('/profile', requireAuth, getUserProfile);
router.get('/me', requireAuth, requireRole(Role.PLAYER, Role.ADMIN), getCurrentUser);
router.post('/loginAsGuest', validate(guestLoginSchema), loginAsGuest);
router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'lax' });
  res.json({ success: true });
});
export default router;

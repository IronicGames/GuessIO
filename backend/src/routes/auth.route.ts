import { Router } from 'express';
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getCurrentUser,
} from '../controllers/auth.controller.js';

const router = Router();

router.get('/google', initiateGoogleLogin);
router.get('/google/callback', handleGoogleCallback);
router.get('/me', getCurrentUser);

export default router;

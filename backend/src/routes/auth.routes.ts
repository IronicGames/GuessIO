import { Router } from 'express';
import {
  initiateGoogleLogin,
  handleGoogleCallback,
  getCurrentUser,
} from '../controllers/auth.controller.js';

const authRoutes = Router();

authRoutes.get('/google', initiateGoogleLogin);

authRoutes.get('/google/callback', handleGoogleCallback);

authRoutes.get('/me', getCurrentUser);

export default authRoutes;

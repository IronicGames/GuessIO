import { Router } from 'express';
import { createOrGetGoogleUser } from '../controllers/user.controller.js';

const router = Router();

router.post('/google', createOrGetGoogleUser); // POST /api/users/google

export default router;

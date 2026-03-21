import { Router } from 'express';
import { getHealth } from '@controllers/status.controller';

const router = Router();

router.get('/health', getHealth); // GET /api/health

export default router;

import { Router } from 'express';
import { getHealth } from '../controllers/status.controller';
import { API_ROUTES } from '../constants/constants';

const statusRoutes = Router();

statusRoutes.get(API_ROUTES.HEALTH, getHealth);

export default statusRoutes;

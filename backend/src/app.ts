import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/status.routes';
import authRoutes from './routes/auth.routes';
import { API_ROUTES, getApiRoute } from './constants/constants';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.use(API_ROUTES.ROOT, statusRoutes);

// Auth routes
app.use(getApiRoute(API_ROUTES.AUTH), authRoutes);

export default app;

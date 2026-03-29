import { requireAuth, requireRole } from '@middleware/auth.middleware';
import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/status.route';
import authRoutes from './routes/auth.route';
import boardRoutes from './routes/board.route';
import characterRoutes from './routes/character.route';
import { errorHandler } from './middleware/error-handler.middleware';
import cookieParser from 'cookie-parser';
import { config } from './utils/constants/env';
import { Role } from '@shared/types/misc.types';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // base64 inflates ~33% so 5MB file ≈ 7MB body
// Routes
app.use('/api', statusRoutes); // /api/health
app.use('/api/auth', authRoutes); // /api/auth/*
app.use('/api/boards', requireAuth, requireRole(Role.PLAYER, Role.ADMIN), boardRoutes); // /api/board/*
app.use('/api/character', requireAuth, requireRole(Role.PLAYER, Role.ADMIN), characterRoutes); // /api/character/*

app.use(errorHandler);
export default app;

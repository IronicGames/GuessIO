import { requireAuth } from '@middleware/auth.middleware';
import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/status.route';
import authRoutes from './routes/auth.route';
import boardRoutes from './routes/board.route';
import { errorHandler } from './middleware/error-handler.middleware';
import cookieParser from 'cookie-parser';
import { config } from './utils/constants/env';

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
app.use('/api/boards', requireAuth, boardRoutes); // /api/boards/* (characters nested: /api/boards/:boardId/characters)

app.use(errorHandler);
export default app;

import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/status.route';
import authRoutes from './routes/auth.route';
import boardRoutes from './routes/board.route';
import characterRoutes from './routes/character.route';
import { errorHandler } from './middleware/error-handler.middleware';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', statusRoutes); // /api/health
app.use('/api/auth', authRoutes); // /api/auth/*
app.use('/api/boards', boardRoutes); // /api/board/*
app.use('/api/character', characterRoutes); // /api/character/*

app.use(errorHandler);
export default app;

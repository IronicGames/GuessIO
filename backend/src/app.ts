import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/status.route';
import authRoutes from './routes/auth.route';
import boardRoutes from './routes/board.route';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', statusRoutes); // /api/health
app.use('/api/auth', authRoutes); // /api/auth/*
app.use('/api/boards', boardRoutes); // /api/boards/*

export default app;

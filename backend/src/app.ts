import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/status.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', statusRoutes); // /api/health
app.use('/api/auth', authRoutes); // /api/auth/*

export default app;

import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/status.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', statusRoutes); // /api/health
app.use('/api/users', userRoutes); // /api/users/*

export default app;

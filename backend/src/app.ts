import express from 'express';
import cors from 'cors';
import statusRoutes from './routes/status.routes';
import { API_ROUTES } from './constants/constants';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.use(API_ROUTES.ROOT, statusRoutes);

export default app;

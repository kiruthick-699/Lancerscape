/**
 * backend/src/app.ts
 * 
 * Express application setup and configuration
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import disputeRoutes from './routes/disputeRoutes';

const app: Express = express();

// CORS Configuration
// TODO: Replace with actual allowed origins from environment variables
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes Placeholder
// TODO: Import and register route handlers
// Example:
// import projectRoutes from './routes/projects';
// import milestoneRoutes from './routes/milestones';
// app.use('/api/projects', projectRoutes);
// app.use('/api/milestones', milestoneRoutes);

// Dispute Routes
app.use('/api/disputes', disputeRoutes);

app.use('/api', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'LancerScape API - Routes not yet configured' });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import leetcodeRoutes from './routes/leetcodeRoutes.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { validateEnv } from './utils/envValidator.js';

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - allow Vercel and local development
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Local frontend
    /\.vercel\.app$/, // All Vercel deployments (production + previews)
    process.env.FRONTEND_URL // Custom frontend URL if set
  ].filter(Boolean),
  credentials: true
}));

// Security: Limit request body size
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(logger);

app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    const pool = (await import('./config/database.js')).default;
    await pool.query('SELECT 1');
    
    res.json({
      code: 'SUCCESS',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      code: 'SERVICE_UNAVAILABLE',
      message: 'Server is unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.use('/auth', authRoutes);
app.use('/submissions', submissionRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/leetcode', leetcodeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


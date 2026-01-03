import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import leetcodeRoutes from './routes/leetcodeRoutes.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

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

app.use(express.json());
app.use(logger);

app.get('/health', (req, res) => {
  res.json({
    code: 'SUCCESS',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/auth', authRoutes);
app.use('/submissions', submissionRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/leetcode', leetcodeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


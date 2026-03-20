import dotenv from 'dotenv';

// Load environment variables FIRST before importing other modules
dotenv.config();

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import analysisRoutes from './routes/analysisRoutes.js';
import { initializeCSVCache } from './utils/csvParser.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Routes
app.use('/api', analysisRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Start server - Initialize CSV cache first
initializeCSVCache().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Backend server running on http://localhost:${PORT}`);
    console.log(`✓ CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`✓ CSV cache loaded with 400+ IT job roles`);
  });
}).catch((error) => {
  console.error('Failed to initialize CSV cache:', error.message);
  console.error('Server may not function properly');
  process.exit(1);
});

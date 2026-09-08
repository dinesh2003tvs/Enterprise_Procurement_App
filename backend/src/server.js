const express = require('express');
const cors = require('cors');
const { PORT, FRONTEND_URL, NODE_ENV } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const requestRoutes = require('./routes/request.routes');

const app = express();

// --- Middleware Configuration ---
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, server-to-server)
      if (!origin) return callback(null, true);

      // Allow if matches FRONTEND_URL, any vercel.app domain, localhost, or non-production
      const isVercel = origin.endsWith('.vercel.app') || origin.includes('vercel.app');
      const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
      const isExplicit = allowedOrigins.includes(origin) || FRONTEND_URL === '*' || !FRONTEND_URL;

      if (isVercel || isLocal || isExplicit || NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow by reflecting origin
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  })
);

// Explicit preflight handler for all routes
app.options('*', cors());

app.use(express.json());

// Request logging in development
if (NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// --- Mount Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// --- 404 Catch-All ---
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: `API route ${req.originalUrl} not found`
  });
});

// --- Centralized Error Handling Middleware ---
app.use(errorHandler);

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Enterprise Procurement API Server running on port ${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`Environment:  ${NODE_ENV}`);
    console.log(`====================================================`);
  });
}

module.exports = app;


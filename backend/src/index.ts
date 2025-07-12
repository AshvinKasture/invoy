import express, { Application } from 'express';
import apiRoutes from './routes';
import { logger, cors, timeout } from './middleware/common';
import { errorHandler, notFound } from './middleware/errorHandler';

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Global middleware
app.use(cors);
app.use(logger);
app.use(timeout(30000)); // 30 second timeout
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Invoy API Server',
    status: 'running',
    version: '1.0.0',
    docs: '/api',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

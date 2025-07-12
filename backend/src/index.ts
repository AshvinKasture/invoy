import express, { Application } from 'express';
import { loadEnvironment, getEnvValue } from './utils/environment';
import apiRoutes from './routes';
import { logger, cors, timeout } from './middleware/common';
import { errorHandler, notFound } from './middleware/errorHandler';
import { initializeDatabase, closeDatabase } from './database';

// Load environment variables first
const envConfig = loadEnvironment();

const app: Application = express();
const PORT = getEnvValue('PORT');

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

// Start server with database initialization
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${getEnvValue('NODE_ENV') || 'development'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('📡 HTTP server closed');
        
        try {
          await closeDatabase();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force exit after 30 seconds
      setTimeout(() => {
        console.log('⏰ Force shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle process signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;

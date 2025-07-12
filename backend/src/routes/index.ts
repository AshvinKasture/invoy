import { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import { sendSuccess, sendError } from '../utils/response';
import { checkDatabaseHealth } from '../database';
import { getEnvValue } from '../utils/environment';

const router = Router();

// Health check route with database status
router.get('/health', async (req: Request, res: Response) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    const healthData = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      environment: getEnvValue('NODE_ENV'),
      version: '1.0.0',
      database: dbHealth,
      timestamp: new Date().toISOString()
    };

    if (dbHealth.status === 'healthy') {
      sendSuccess(res, healthData, 'API is healthy');
    } else {
      res.status(503);
      sendError(res, 'API is unhealthy', 503);
    }
  } catch (error) {
    res.status(503);
    sendError(res, 'Health check failed', 503, (error as Error).message);
  }
});

// API routes
router.use('/users', userRoutes);
router.use('/products', productRoutes);

// Root API route
router.get('/', (req: Request, res: Response) => {
  sendSuccess(res, {
    name: 'Invoy API',
    version: '1.0.0',
    description: 'RESTful API with Express and TypeScript',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      products: '/api/products'
    }
  }, 'Welcome to Invoy API');
});

export default router;

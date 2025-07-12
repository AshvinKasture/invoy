import { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import { sendSuccess } from '../utils/response';

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  sendSuccess(res, {
    status: 'healthy',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  }, 'API is healthy');
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

import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { isDevelopment } from '../utils/environment';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);
  
  // Don't send error response if headers are already sent
  if (res.headersSent) {
    return next(err);
  }
  
  sendError(
    res,
    'Something went wrong!',
    500,
    isDevelopment() ? err.message : undefined
  );
};

/**
 * 404 Not Found middleware
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

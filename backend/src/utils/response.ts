import { Response } from 'express';
import { isDevelopment } from './environment';
import { ApiResponse } from '../types';

/**
 * Send a successful API response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  res.status(statusCode).json(response);
};

/**
 * Send an error API response
 */
export const sendError = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  error?: string
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error: isDevelopment() ? error : undefined,
    timestamp: new Date().toISOString()
  };
  res.status(statusCode).json(response);
};

/**
 * Send a not found response
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): void => {
  sendError(res, message, 404);
};

/**
 * Send a bad request response
 */
export const sendBadRequest = (
  res: Response,
  message: string = 'Bad request',
  error?: string
): void => {
  sendError(res, message, 400, error);
};

/**
 * Send an unauthorized response
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): void => {
  sendError(res, message, 401);
};

/**
 * Send a forbidden response
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): void => {
  sendError(res, message, 403);
};

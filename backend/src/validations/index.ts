import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import { sendBadRequest } from '../utils/response';

/**
 * Interface for validation error response
 */
export interface ValidationErrorResponse {
  field: string;
  message: string;
  value?: any;
}

/**
 * Middleware to handle validation results
 * This should be used after validation chains
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors: ValidationErrorResponse[] = errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));
    
    sendBadRequest(
      res,
      'Validation failed',
      `Validation errors: ${validationErrors.map(e => `${e.field}: ${e.message}`).join(', ')}`
    );
    return;
  }
  
  next();
};

/**
 * Higher-order function to create validation middleware
 * @param validations Array of validation chains
 * @returns Express middleware that runs validations and handles errors
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validations in parallel
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Handle validation errors
    handleValidationErrors(req, res, next);
  };
};

/**
 * Middleware to sanitize request data
 * Removes any fields that are not expected
 */
export const sanitizeRequest = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      const sanitizedBody: any = {};
      
      allowedFields.forEach(field => {
        if (req.body.hasOwnProperty(field)) {
          sanitizedBody[field] = req.body[field];
        }
      });
      
      req.body = sanitizedBody;
    }
    
    next();
  };
};

/**
 * Custom validation result interface for better type safety
 */
export interface CustomValidationResult {
  isValid: boolean;
  errors: ValidationErrorResponse[];
}

/**
 * Helper function to get validation results without throwing
 */
export const getValidationResults = (req: Request): CustomValidationResult => {
  const errors = validationResult(req);
  
  if (errors.isEmpty()) {
    return {
      isValid: true,
      errors: []
    };
  }
  
  return {
    isValid: false,
    errors: errors.array().map((error: ValidationError) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }))
  };
};

import { body, param, query, ValidationChain } from 'express-validator';
import { Request } from 'express';

/**
 * Common validation patterns and utilities
 */
export class ValidationUtils {
  /**
   * Validates that a string is a valid UUID (v4)
   */
  static uuid(field: string = 'id'): ValidationChain {
    return param(field)
      .isUUID(4)
      .withMessage(`${field} must be a valid UUID v4`);
  }

  /**
   * Validates that a string is a valid MongoDB ObjectId
   */
  static mongoId(field: string = 'id'): ValidationChain {
    return param(field)
      .isMongoId()
      .withMessage(`${field} must be a valid MongoDB ObjectId`);
  }

  /**
   * Creates a validation chain for pagination limit
   */
  static paginationLimit(min: number = 1, max: number = 100): ValidationChain {
    return query('limit')
      .optional()
      .isInt({ min, max })
      .withMessage(`Limit must be an integer between ${min} and ${max}`)
      .toInt();
  }

  /**
   * Creates a validation chain for pagination offset
   */
  static paginationOffset(): ValidationChain {
    return query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a non-negative integer')
      .toInt();
  }

  /**
   * Creates a validation chain for sort order
   */
  static sortOrder(): ValidationChain {
    return query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be either "asc" or "desc"');
  }

  /**
   * Creates a validation chain for date fields
   */
  static dateField(fieldName: string, required: boolean = false): ValidationChain {
    const chain = required ? body(fieldName) : body(fieldName).optional();
    
    return chain
      .isISO8601()
      .withMessage(`${fieldName} must be a valid ISO 8601 date`)
      .toDate();
  }

  /**
   * Creates a validation chain for boolean fields
   */
  static booleanField(fieldName: string, required: boolean = false): ValidationChain {
    const chain = required ? body(fieldName) : body(fieldName).optional();
    
    return chain
      .isBoolean()
      .withMessage(`${fieldName} must be a boolean`)
      .toBoolean();
  }

  /**
   * Creates a validation chain for numeric fields with range
   */
  static numericField(
    fieldName: string,
    options: {
      required?: boolean;
      min?: number;
      max?: number;
      integer?: boolean;
    } = {}
  ): ValidationChain {
    const { required = false, min, max, integer = false } = options;
    const chain = required ? body(fieldName) : body(fieldName).optional();
    
    if (integer) {
      const intOptions: any = {};
      if (min !== undefined) intOptions.min = min;
      if (max !== undefined) intOptions.max = max;
      
      return chain
        .isInt(intOptions)
        .withMessage(`${fieldName} must be an integer${min !== undefined ? ` >= ${min}` : ''}${max !== undefined ? ` <= ${max}` : ''}`)
        .toInt();
    } else {
      const floatOptions: any = {};
      if (min !== undefined) floatOptions.min = min;
      if (max !== undefined) floatOptions.max = max;
      
      return chain
        .isFloat(floatOptions)
        .withMessage(`${fieldName} must be a number${min !== undefined ? ` >= ${min}` : ''}${max !== undefined ? ` <= ${max}` : ''}`)
        .toFloat();
    }
  }

  /**
   * Creates a validation chain for string fields with length constraints
   */
  static stringField(
    fieldName: string,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      trim?: boolean;
      escape?: boolean;
      pattern?: RegExp;
      patternMessage?: string;
    } = {}
  ): ValidationChain {
    const {
      required = false,
      minLength,
      maxLength,
      trim = true,
      escape = false,
      pattern,
      patternMessage
    } = options;
    
    let chain = required ? body(fieldName) : body(fieldName).optional();
    
    chain = chain
      .isString()
      .withMessage(`${fieldName} must be a string`);
    
    if (required) {
      chain = chain
        .notEmpty()
        .withMessage(`${fieldName} is required`);
    }
    
    if (minLength !== undefined || maxLength !== undefined) {
      const lengthOptions: any = {};
      if (minLength !== undefined) lengthOptions.min = minLength;
      if (maxLength !== undefined) lengthOptions.max = maxLength;
      
      chain = chain
        .isLength(lengthOptions)
        .withMessage(`${fieldName} must be between ${minLength || 0} and ${maxLength || 'unlimited'} characters`);
    }
    
    if (trim) {
      chain = chain.trim();
    }
    
    if (escape) {
      chain = chain.escape();
    }
    
    if (pattern) {
      chain = chain
        .matches(pattern)
        .withMessage(patternMessage || `${fieldName} format is invalid`);
    }
    
    return chain;
  }

  /**
   * Creates a validation chain for enum fields
   */
  static enumField(
    fieldName: string,
    allowedValues: string[],
    required: boolean = false
  ): ValidationChain {
    const chain = required ? body(fieldName) : body(fieldName).optional();
    
    return chain
      .isIn(allowedValues)
      .withMessage(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }

  /**
   * Creates a validation chain for array fields
   */
  static arrayField(
    fieldName: string,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      itemValidator?: ValidationChain;
    } = {}
  ): ValidationChain {
    const { required = false, minLength, maxLength } = options;
    const chain = required ? body(fieldName) : body(fieldName).optional();
    
    let validationChain = chain
      .isArray()
      .withMessage(`${fieldName} must be an array`);
    
    if (minLength !== undefined || maxLength !== undefined) {
      const lengthOptions: any = {};
      if (minLength !== undefined) lengthOptions.min = minLength;
      if (maxLength !== undefined) lengthOptions.max = maxLength;
      
      validationChain = validationChain
        .isLength(lengthOptions)
        .withMessage(`${fieldName} must contain between ${minLength || 0} and ${maxLength || 'unlimited'} items`);
    }
    
    return validationChain;
  }

  /**
   * Creates a custom validation chain for file uploads
   */
  static fileField(
    fieldName: string,
    options: {
      required?: boolean;
      allowedMimeTypes?: string[];
      maxSize?: number; // in bytes
    } = {}
  ): ValidationChain {
    const { required = false, allowedMimeTypes, maxSize } = options;
    const chain = required ? body(fieldName) : body(fieldName).optional();
    
    return chain.custom((value, { req }) => {
      const file = (req as any).files?.[fieldName];
      
      if (!file && required) {
        throw new Error(`${fieldName} is required`);
      }
      
      if (file) {
        if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
          throw new Error(`${fieldName} must be one of the following types: ${allowedMimeTypes.join(', ')}`);
        }
        
        if (maxSize && file.size > maxSize) {
          throw new Error(`${fieldName} must be smaller than ${maxSize} bytes`);
        }
      }
      
      return true;
    });
  }
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  // Strong password: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  
  // Medium password: at least 6 chars, 1 uppercase, 1 lowercase, 1 number
  MEDIUM_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  
  // Phone number (international format)
  PHONE_INTERNATIONAL: /^\+[1-9]\d{1,14}$/,
  
  // Phone number (US format)
  PHONE_US: /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  
  // URL
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // Alphanumeric with spaces
  ALPHANUMERIC_SPACES: /^[a-zA-Z0-9\s]+$/,
  
  // Alphanumeric only
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  
  // Letters only
  LETTERS_ONLY: /^[a-zA-Z]+$/,
  
  // Numbers only
  NUMBERS_ONLY: /^[0-9]+$/
};

/**
 * Pre-built validation chains for common use cases
 */
export const CommonValidations = {
  pagination: [
    ValidationUtils.paginationLimit(),
    ValidationUtils.paginationOffset(),
    ValidationUtils.sortOrder()
  ],
  
  search: query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
    .trim()
    .escape()
};

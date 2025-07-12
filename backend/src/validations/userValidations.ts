import { body, param, query } from 'express-validator';

/**
 * Common validation rules that can be reused
 */
export const commonValidations = {
  id: param('id')
    .isString()
    .notEmpty()
    .withMessage('ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('ID must be between 1 and 50 characters')
    .trim(),
    
  email: body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
    
  name: body('name')
    .isString()
    .withMessage('Name must be a string')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
    
  password: body('password')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  optionalEmail: body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
    
  optionalName: body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
};

/**
 * Validation for creating a new user
 */
export const createUserValidation = [
  commonValidations.email,
  commonValidations.name,
  commonValidations.password,
  
  // Additional custom validation for user creation
  body('email').custom(async (value, { req }) => {
    // In a real application, you would check against your database
    // For now, we'll simulate checking against existing mock data
    if (value === 'admin@example.com') {
      throw new Error('This email is reserved');
    }
    return true;
  }),
  
  body('name').custom((value) => {
    if (value.toLowerCase().includes('admin')) {
      throw new Error('Name cannot contain "admin"');
    }
    return true;
  })
];

/**
 * Validation for updating a user
 */
export const updateUserValidation = [
  commonValidations.id,
  commonValidations.optionalEmail,
  commonValidations.optionalName,
  
  // Ensure at least one field is provided for update
  body().custom((value, { req }) => {
    const { email, name } = req.body;
    if (!email && !name) {
      throw new Error('At least one field (email or name) must be provided for update');
    }
    return true;
  }),
  
  // Custom validation for email if provided
  body('email').if(body('email').exists()).custom(async (value, { req }) => {
    if (value === 'admin@example.com') {
      throw new Error('This email is reserved');
    }
    return true;
  })
];

/**
 * Validation for getting a user by ID
 */
export const getUserValidation = [
  commonValidations.id
];

/**
 * Validation for deleting a user
 */
export const deleteUserValidation = [
  commonValidations.id,
  
  // Custom validation to prevent deletion of admin users
  param('id').custom((value) => {
    if (value === '1') {
      throw new Error('Cannot delete the admin user');
    }
    return true;
  })
];

/**
 * Validation for user query parameters
 */
export const getUsersQueryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
    .toInt(),
    
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
    .trim()
    .escape(),
    
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'createdAt', 'updatedAt'])
    .withMessage('SortBy must be one of: name, email, createdAt, updatedAt'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either asc or desc')
];

/**
 * Allowed fields for user operations (for sanitization)
 */
export const userAllowedFields = {
  create: ['email', 'name', 'password'],
  update: ['email', 'name']
};

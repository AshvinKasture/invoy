import { body, param, query } from 'express-validator';

/**
 * Common product validation rules
 */
export const productValidations = {
  id: param('id')
    .isString()
    .notEmpty()
    .withMessage('Product ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Product ID must be between 1 and 50 characters')
    .trim(),
    
  name: body('name')
    .isString()
    .withMessage('Product name must be a string')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters')
    .trim()
    .escape(),
    
  description: body('description')
    .isString()
    .withMessage('Description must be a string')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim()
    .escape(),
    
  price: body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0')
    .toFloat(),
    
  category: body('category')
    .isString()
    .withMessage('Category must be a string')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters')
    .trim()
    .escape(),
    
  // Optional versions for updates
  optionalName: body('name')
    .optional()
    .isString()
    .withMessage('Product name must be a string')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters')
    .trim()
    .escape(),
    
  optionalDescription: body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim()
    .escape(),
    
  optionalPrice: body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0')
    .toFloat(),
    
  optionalCategory: body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters')
    .trim()
    .escape()
};

/**
 * Validation for creating a new product
 */
export const createProductValidation = [
  productValidations.name,
  productValidations.description,
  productValidations.price,
  productValidations.category,
  
  // Custom validation for product name uniqueness
  body('name').custom(async (value, { req }) => {
    // In a real application, you would check against your database
    // For now, we'll simulate some business rules
    if (value.toLowerCase().includes('test product')) {
      throw new Error('Product name cannot contain "test product"');
    }
    return true;
  }),
  
  // Custom validation for category
  body('category').custom((value) => {
    const allowedCategories = [
      'Electronics',
      'Clothing',
      'Home & Kitchen',
      'Books',
      'Sports',
      'Beauty',
      'Automotive',
      'Tools',
      'Food',
      'Other'
    ];
    
    if (!allowedCategories.includes(value)) {
      throw new Error(`Category must be one of: ${allowedCategories.join(', ')}`);
    }
    return true;
  }),
  
  // Price validation with context
  body('price').custom((value, { req }) => {
    const { category } = req.body;
    
    // Different price limits for different categories
    if (category === 'Electronics' && value < 10) {
      throw new Error('Electronics products must be priced at least $10');
    }
    
    if (value > 100000) {
      throw new Error('Price cannot exceed $100,000');
    }
    
    return true;
  })
];

/**
 * Validation for updating a product
 */
export const updateProductValidation = [
  productValidations.id,
  productValidations.optionalName,
  productValidations.optionalDescription,
  productValidations.optionalPrice,
  productValidations.optionalCategory,
  
  // Ensure at least one field is provided for update
  body().custom((value, { req }) => {
    const { name, description, price, category } = req.body;
    if (!name && !description && price === undefined && !category) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  }),
  
  // Custom validation for category if provided
  body('category').if(body('category').exists()).custom((value) => {
    const allowedCategories = [
      'Electronics',
      'Clothing',
      'Home & Kitchen',
      'Books',
      'Sports',
      'Beauty',
      'Automotive',
      'Tools',
      'Food',
      'Other'
    ];
    
    if (!allowedCategories.includes(value)) {
      throw new Error(`Category must be one of: ${allowedCategories.join(', ')}`);
    }
    return true;
  }),
  
  // Price validation with context if provided
  body('price').if(body('price').exists()).custom((value, { req }) => {
    if (value > 100000) {
      throw new Error('Price cannot exceed $100,000');
    }
    return true;
  })
];

/**
 * Validation for getting a product by ID
 */
export const getProductValidation = [
  productValidations.id
];

/**
 * Validation for deleting a product
 */
export const deleteProductValidation = [
  productValidations.id
];

/**
 * Validation for product query parameters
 */
export const getProductsQueryValidation = [
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
    
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters')
    .trim()
    .escape(),
    
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number')
    .toFloat(),
    
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number')
    .toFloat(),
    
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
    .isIn(['name', 'price', 'category', 'createdAt', 'updatedAt'])
    .withMessage('SortBy must be one of: name, price, category, createdAt, updatedAt'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either asc or desc'),
    
  // Custom validation to ensure maxPrice is greater than minPrice
  query('maxPrice').custom((value, { req }) => {
    const minPriceStr = req.query?.minPrice;
    if (minPriceStr && typeof minPriceStr === 'string') {
      const minPrice = parseFloat(minPriceStr);
      if (minPrice && value && value <= minPrice) {
        throw new Error('Maximum price must be greater than minimum price');
      }
    }
    return true;
  })
];

/**
 * Allowed fields for product operations (for sanitization)
 */
export const productAllowedFields = {
  create: ['name', 'description', 'price', 'category'],
  update: ['name', 'description', 'price', 'category']
};

/**
 * Product category constants
 */
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Kitchen',
  'Books',
  'Sports',
  'Beauty',
  'Automotive',
  'Tools',
  'Food',
  'Other'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import { validate, sanitizeRequest } from '../validations';
import {
  createProductValidation,
  updateProductValidation,
  getProductValidation,
  deleteProductValidation,
  getProductsQueryValidation,
  productAllowedFields
} from '../validations/productValidations';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with optional filters, pagination, and search
 * @access  Public
 * @query   category, minPrice, maxPrice, limit, offset, search, sortBy, sortOrder
 */
router.get('/', 
  validate(getProductsQueryValidation), 
  getAllProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', 
  validate(getProductValidation), 
  getProductById
);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Public
 */
router.post('/', 
  sanitizeRequest(productAllowedFields.create),
  validate(createProductValidation), 
  createProduct
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product by ID
 * @access  Public
 */
router.put('/:id', 
  sanitizeRequest(productAllowedFields.update),
  validate(updateProductValidation), 
  updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product by ID
 * @access  Public
 */
router.delete('/:id', 
  validate(deleteProductValidation), 
  deleteProduct
);

export default router;

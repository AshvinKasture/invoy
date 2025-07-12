import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { validate, sanitizeRequest } from '../validations';
import {
  createUserValidation,
  updateUserValidation,
  getUserValidation,
  deleteUserValidation,
  getUsersQueryValidation,
  userAllowedFields
} from '../validations/userValidations';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users with optional pagination and search
 * @access  Public
 */
router.get('/', 
  validate(getUsersQueryValidation), 
  getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', 
  validate(getUserValidation), 
  getUserById
);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', 
  sanitizeRequest(userAllowedFields.create),
  validate(createUserValidation), 
  createUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Public
 */
router.put('/:id', 
  sanitizeRequest(userAllowedFields.update),
  validate(updateUserValidation), 
  updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Public
 */
router.delete('/:id', 
  validate(deleteUserValidation), 
  deleteUser
);

export default router;

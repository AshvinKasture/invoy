import { Request, Response } from 'express';
import { sendSuccess, sendError, sendNotFound, sendBadRequest } from '../utils/response';
import { User, CreateUserDto, UpdateUserDto, TypedRequest } from '../types';

// Mock data (replace with actual database operations)
let users: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      limit = 10, 
      offset = 0, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    let filteredUsers = [...users];
    
    // Apply search filter
    if (search && typeof search === 'string') {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply sorting
    filteredUsers.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // Apply pagination
    const total = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(
      Number(offset), 
      Number(offset) + Number(limit)
    );
    
    sendSuccess(res, {
      users: paginatedUsers,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total
      }
    }, 'Users fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch users', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }
    
    sendSuccess(res, user, 'User fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch user', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: TypedRequest<CreateUserDto>, res: Response): Promise<void> => {
  try {
    const { email, name, password } = req.body;
    
    // Validation
    if (!email || !name || !password) {
      sendBadRequest(res, 'Email, name, and password are required');
      return;
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      sendBadRequest(res, 'User with this email already exists');
      return;
    }
    
    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(newUser);
    sendSuccess(res, newUser, 'User created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create user', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Update user by ID
 */
export const updateUser = async (req: TypedRequest<UpdateUserDto>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      sendNotFound(res, 'User not found');
      return;
    }
    
    // Update user
    const user = users[userIndex];
    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }
    
    if (email) user.email = email;
    if (name) user.name = name;
    user.updatedAt = new Date();
    
    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update user', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Delete user by ID
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      sendNotFound(res, 'User not found');
      return;
    }
    
    users.splice(userIndex, 1);
    sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete user', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

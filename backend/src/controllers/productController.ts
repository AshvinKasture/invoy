import { Request, Response } from 'express';
import { sendSuccess, sendError, sendNotFound, sendBadRequest } from '../utils/response';
import { Product, CreateProductDto, UpdateProductDto, TypedRequest } from '../types';

// Mock data (replace with actual database operations)
let products: Product[] = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'Electronics',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Coffee Mug',
    description: 'Ceramic coffee mug with custom design',
    price: 15.99,
    category: 'Home & Kitchen',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Get all products
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      limit = 10, 
      offset = 0, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    let filteredProducts = [...products];
    
    // Filter by category
    if (category && typeof category === 'string') {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Filter by price range
    if (minPrice && typeof minPrice === 'string') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        filteredProducts = filteredProducts.filter(p => p.price >= min);
      }
    }
    
    if (maxPrice && typeof maxPrice === 'string') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        filteredProducts = filteredProducts.filter(p => p.price <= max);
      }
    }
    
    // Apply search filter
    if (search && typeof search === 'string') {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
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
    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(
      Number(offset), 
      Number(offset) + Number(limit)
    );
    
    sendSuccess(res, {
      products: paginatedProducts,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + Number(limit) < total
      },
      filters: {
        category: category || null,
        minPrice: minPrice ? parseFloat(minPrice as string) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : null,
        search: search || null
      }
    }, 'Products fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch products', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = products.find(p => p.id === id);
    
    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }
    
    sendSuccess(res, product, 'Product fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch product', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Create a new product
 */
export const createProduct = async (req: TypedRequest<CreateProductDto>, res: Response): Promise<void> => {
  try {
    const { name, description, price, category } = req.body;
    
    // Validation
    if (!name || !description || price === undefined || !category) {
      sendBadRequest(res, 'Name, description, price, and category are required');
      return;
    }
    
    if (price < 0) {
      sendBadRequest(res, 'Price must be a positive number');
      return;
    }
    
    // Create new product
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      name,
      description,
      price,
      category,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    products.push(newProduct);
    sendSuccess(res, newProduct, 'Product created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create product', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Update product by ID
 */
export const updateProduct = async (req: TypedRequest<UpdateProductDto>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      sendNotFound(res, 'Product not found');
      return;
    }
    
    const product = products[productIndex];
    if (!product) {
      sendNotFound(res, 'Product not found');
      return;
    }
    
    // Validate price if provided
    if (price !== undefined && price < 0) {
      sendBadRequest(res, 'Price must be a positive number');
      return;
    }
    
    // Update product
    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    product.updatedAt = new Date();
    
    sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update product', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

/**
 * Delete product by ID
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      sendNotFound(res, 'Product not found');
      return;
    }
    
    products.splice(productIndex, 1);
    sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete product', 500, error instanceof Error ? error.message : 'Unknown error');
  }
};

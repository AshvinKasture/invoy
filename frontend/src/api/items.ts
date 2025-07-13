/**
 * Items API Service
 * Handles all API operations related to items/products
 */

import apiHelper from './apiHelper';
import type { ApiResponse, QueryParams, PaginatedResponse } from './apiHelper';

export interface Item {
  id: string;
  name: string;
  description?: string;
  uom: string; // Unit of Measurement
  basePrice: number;
  taxPercent?: number;
  category?: string;
  sku?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  name: string;
  description?: string;
  uom: string;
  basePrice: number;
  taxPercent?: number;
  category?: string;
  sku?: string;
  isActive?: boolean;
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

export interface ItemQueryParams extends QueryParams {
  category?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  uom?: string;
}

export const itemsApi = {
  /**
   * Get all items with optional filtering and pagination
   */
  getItems: async (params?: ItemQueryParams): Promise<ApiResponse<PaginatedResponse<Item>>> => {
    return apiHelper.get<PaginatedResponse<Item>>('/items', params);
  },

  /**
   * Get a single item by ID
   */
  getItem: async (id: string): Promise<ApiResponse<Item>> => {
    return apiHelper.get<Item>(`/items/${id}`);
  },

  /**
   * Create a new item
   */
  createItem: async (data: CreateItemRequest): Promise<ApiResponse<Item>> => {
    return apiHelper.post<Item>('/items', data);
  },

  /**
   * Update an existing item
   */
  updateItem: async (id: string, data: UpdateItemRequest): Promise<ApiResponse<Item>> => {
    return apiHelper.put<Item>(`/items/${id}`, data);
  },

  /**
   * Delete an item
   */
  deleteItem: async (id: string): Promise<ApiResponse<void>> => {
    return apiHelper.delete<void>(`/items/${id}`);
  },

  /**
   * Search items by name or SKU
   */
  searchItems: async (query: string): Promise<ApiResponse<Item[]>> => {
    return apiHelper.get<Item[]>('/items/search', { search: query });
  },

  /**
   * Get item categories
   */
  getCategories: async (): Promise<ApiResponse<string[]>> => {
    return apiHelper.get<string[]>('/items/categories');
  },

  /**
   * Get available units of measurement
   */
  getUnitTypes: async (): Promise<ApiResponse<string[]>> => {
    return apiHelper.get<string[]>('/items/units');
  },

  /**
   * Bulk update items
   */
  bulkUpdateItems: async (updates: Array<{ id: string; data: UpdateItemRequest }>): Promise<ApiResponse<Item[]>> => {
    return apiHelper.post<Item[]>('/items/bulk-update', { updates });
  },
};

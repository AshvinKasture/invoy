/**
 * Parties API Service
 * Handles all API operations related to parties (customers/vendors)
 */

import apiHelper from './apiHelper';
import type { ApiResponse, QueryParams, PaginatedResponse } from './apiHelper';

export interface Party {
  id: string;
  name: string;
  partyType: 'customer' | 'vendor' | 'both';
  gstNumber?: string;
  panNumber?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartyRequest {
  name: string;
  partyType: 'customer' | 'vendor' | 'both';
  gstNumber?: string;
  panNumber?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdatePartyRequest extends Partial<CreatePartyRequest> {}

export interface PartyQueryParams extends QueryParams {
  partyType?: 'customer' | 'vendor' | 'both';
  city?: string;
  state?: string;
}

export const partiesApi = {
  /**
   * Get all parties with optional filtering and pagination
   */
  getParties: async (params?: PartyQueryParams): Promise<ApiResponse<PaginatedResponse<Party>>> => {
    return apiHelper.get<PaginatedResponse<Party>>('/parties', params);
  },

  /**
   * Get a single party by ID
   */
  getParty: async (id: string): Promise<ApiResponse<Party>> => {
    return apiHelper.get<Party>(`/parties/${id}`);
  },

  /**
   * Create a new party
   */
  createParty: async (data: CreatePartyRequest): Promise<ApiResponse<Party>> => {
    return apiHelper.post<Party>('/parties', data);
  },

  /**
   * Update an existing party
   */
  updateParty: async (id: string, data: UpdatePartyRequest): Promise<ApiResponse<Party>> => {
    return apiHelper.put<Party>(`/parties/${id}`, data);
  },

  /**
   * Delete a party
   */
  deleteParty: async (id: string): Promise<ApiResponse<void>> => {
    return apiHelper.delete<void>(`/parties/${id}`);
  },

  /**
   * Search parties by name
   */
  searchParties: async (query: string): Promise<ApiResponse<Party[]>> => {
    return apiHelper.get<Party[]>('/parties/search', { search: query });
  },

  /**
   * Get party statistics
   */
  getPartyStats: async (): Promise<ApiResponse<{
    totalCustomers: number;
    totalVendors: number;
    totalBoth: number;
  }>> => {
    return apiHelper.get('/parties/stats');
  },
};

/**
 * Invoices API Service
 * Handles all API operations related to invoices
 */

import apiHelper from './apiHelper';
import type { ApiResponse, QueryParams, PaginatedResponse } from './apiHelper';

export interface InvoiceItem {
  itemId: string;
  itemName: string;
  quantity: number;
  rate: number;
  taxPercent: number;
  amount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'sale' | 'purchase';
  partyId: string;
  partyName: string;
  invoiceDate: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  invoiceType: 'sale' | 'purchase';
  partyId: string;
  invoiceDate: string;
  dueDate?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    rate: number;
  }>;
  notes?: string;
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export interface InvoiceQueryParams extends QueryParams {
  invoiceType?: 'sale' | 'purchase';
  partyId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const invoicesApi = {
  /**
   * Get all invoices with optional filtering and pagination
   */
  getInvoices: async (params?: InvoiceQueryParams): Promise<ApiResponse<PaginatedResponse<Invoice>>> => {
    return apiHelper.get<PaginatedResponse<Invoice>>('/invoices', params);
  },

  /**
   * Get a single invoice by ID
   */
  getInvoice: async (id: string): Promise<ApiResponse<Invoice>> => {
    return apiHelper.get<Invoice>(`/invoices/${id}`);
  },

  /**
   * Create a new invoice
   */
  createInvoice: async (data: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> => {
    return apiHelper.post<Invoice>('/invoices', data);
  },

  /**
   * Update an existing invoice
   */
  updateInvoice: async (id: string, data: UpdateInvoiceRequest): Promise<ApiResponse<Invoice>> => {
    return apiHelper.put<Invoice>(`/invoices/${id}`, data);
  },

  /**
   * Delete an invoice
   */
  deleteInvoice: async (id: string): Promise<ApiResponse<void>> => {
    return apiHelper.delete<void>(`/invoices/${id}`);
  },

  /**
   * Update invoice status
   */
  updateInvoiceStatus: async (id: string, status: Invoice['status']): Promise<ApiResponse<Invoice>> => {
    return apiHelper.patch<Invoice>(`/invoices/${id}/status`, { status });
  },

  /**
   * Generate invoice PDF
   */
  generatePDF: async (id: string): Promise<void> => {
    return apiHelper.download(`/invoices/${id}/pdf`, `invoice-${id}.pdf`);
  },

  /**
   * Send invoice via email
   */
  sendInvoice: async (id: string, email: string): Promise<ApiResponse<void>> => {
    return apiHelper.post<void>(`/invoices/${id}/send`, { email });
  },

  /**
   * Get invoice statistics
   */
  getInvoiceStats: async (): Promise<ApiResponse<{
    totalSales: number;
    totalPurchases: number;
    outstanding: number;
    overdue: number;
  }>> => {
    return apiHelper.get('/invoices/stats');
  },

  /**
   * Duplicate an invoice
   */
  duplicateInvoice: async (id: string): Promise<ApiResponse<Invoice>> => {
    return apiHelper.post<Invoice>(`/invoices/${id}/duplicate`);
  },
};

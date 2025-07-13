/**
 * App Store Types
 * Defines all the types used in the global application store
 */

import type { User } from '@/api/auth';
import type { Party } from '@/api/parties';
import type { Item } from '@/api/items';
import type { Invoice } from '@/api/invoices';

// Auth State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// UI State
export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isLoading: boolean;
  notifications: Notification[];
  modal: {
    isOpen: boolean;
    type: string | null;
    data: any;
  };
}

// Data State
export interface DataState {
  parties: {
    items: Party[];
    loading: boolean;
    error: string | null;
    lastFetch: number | null;
  };
  items: {
    items: Item[];
    loading: boolean;
    error: string | null;
    lastFetch: number | null;
  };
  invoices: {
    items: Invoice[];
    loading: boolean;
    error: string | null;
    lastFetch: number | null;
  };
}

// Notification
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  autoClose?: boolean;
  duration?: number;
}

// Complete App State
export interface AppState {
  auth: AuthState;
  ui: UIState;
  data: DataState;
}

// Action Types
export type AuthAction =
  | { type: 'AUTH_LOGIN_START' }
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: User }
  | { type: 'AUTH_LOGIN_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

export type UIAction =
  | { type: 'UI_SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'UI_TOGGLE_SIDEBAR' }
  | { type: 'UI_SET_SIDEBAR'; payload: boolean }
  | { type: 'UI_SET_LOADING'; payload: boolean }
  | { type: 'UI_ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UI_REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UI_CLEAR_NOTIFICATIONS' }
  | { type: 'UI_OPEN_MODAL'; payload: { type: string; data?: any } }
  | { type: 'UI_CLOSE_MODAL' };

export type DataAction =
  | { type: 'DATA_PARTIES_LOADING' }
  | { type: 'DATA_PARTIES_SUCCESS'; payload: Party[] }
  | { type: 'DATA_PARTIES_FAILURE'; payload: string }
  | { type: 'DATA_PARTIES_ADD'; payload: Party }
  | { type: 'DATA_PARTIES_UPDATE'; payload: Party }
  | { type: 'DATA_PARTIES_DELETE'; payload: string }
  | { type: 'DATA_ITEMS_LOADING' }
  | { type: 'DATA_ITEMS_SUCCESS'; payload: Item[] }
  | { type: 'DATA_ITEMS_FAILURE'; payload: string }
  | { type: 'DATA_ITEMS_ADD'; payload: Item }
  | { type: 'DATA_ITEMS_UPDATE'; payload: Item }
  | { type: 'DATA_ITEMS_DELETE'; payload: string }
  | { type: 'DATA_INVOICES_LOADING' }
  | { type: 'DATA_INVOICES_SUCCESS'; payload: Invoice[] }
  | { type: 'DATA_INVOICES_FAILURE'; payload: string }
  | { type: 'DATA_INVOICES_ADD'; payload: Invoice }
  | { type: 'DATA_INVOICES_UPDATE'; payload: Invoice }
  | { type: 'DATA_INVOICES_DELETE'; payload: string };

export type AppAction = AuthAction | UIAction | DataAction;

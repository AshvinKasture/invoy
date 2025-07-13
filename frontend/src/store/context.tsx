/**
 * Store Context
 * React Context implementation for global state management
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ReactNode } from 'react';
import { appReducer, initialAppState } from './reducers';
import type { AppState, AppAction, Notification } from './types';
import type { User } from '@/api/auth';
import type { Party } from '@/api/parties';
import type { Item } from '@/api/items';
import type { Invoice } from '@/api/invoices';

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Auth actions
  loginStart: () => void;
  loginSuccess: (user: User) => void;
  loginFailure: (error: string) => void;
  logout: () => void;
  clearAuthError: () => void;
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  // Data actions
  setPartiesLoading: () => void;
  setPartiesSuccess: (parties: Party[]) => void;
  setPartiesFailure: (error: string) => void;
  addParty: (party: Party) => void;
  updateParty: (party: Party) => void;
  deleteParty: (id: string) => void;
  setItemsLoading: () => void;
  setItemsSuccess: (items: Item[]) => void;
  setItemsFailure: (error: string) => void;
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  setInvoicesLoading: () => void;
  setInvoicesSuccess: (invoices: Invoice[]) => void;
  setInvoicesFailure: (error: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
}

// Create context
const AppContext = createContext<AppContextType | null>(null);

// Hook to use context
export function useAppStore(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}

// Provider props
interface AppProviderProps {
  children: ReactNode;
}

// Utility function to generate unique IDs
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Provider component
export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // Auth actions
  const loginStart = useCallback(() => {
    dispatch({ type: 'AUTH_LOGIN_START' });
  }, []);

  const loginSuccess = useCallback((user: User) => {
    dispatch({ type: 'AUTH_LOGIN_SUCCESS', payload: user });
  }, []);

  const loginFailure = useCallback((error: string) => {
    dispatch({ type: 'AUTH_LOGIN_FAILURE', payload: error });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'AUTH_LOGOUT' });
  }, []);

  const clearAuthError = useCallback(() => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  }, []);

  // UI actions
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    dispatch({ type: 'UI_SET_THEME', payload: theme });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'UI_TOGGLE_SIDEBAR' });
  }, []);

  const setSidebar = useCallback((open: boolean) => {
    dispatch({ type: 'UI_SET_SIDEBAR', payload: open });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'UI_SET_LOADING', payload: loading });
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const fullNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: Date.now(),
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000,
    };
    dispatch({ type: 'UI_ADD_NOTIFICATION', payload: fullNotification });

    // Auto-remove notification if autoClose is enabled
    if (fullNotification.autoClose) {
      setTimeout(() => {
        dispatch({ type: 'UI_REMOVE_NOTIFICATION', payload: fullNotification.id });
      }, fullNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'UI_REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'UI_CLEAR_NOTIFICATIONS' });
  }, []);

  const openModal = useCallback((type: string, data?: any) => {
    dispatch({ type: 'UI_OPEN_MODAL', payload: { type, data } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'UI_CLOSE_MODAL' });
  }, []);

  // Data actions - Parties
  const setPartiesLoading = useCallback(() => {
    dispatch({ type: 'DATA_PARTIES_LOADING' });
  }, []);

  const setPartiesSuccess = useCallback((parties: Party[]) => {
    dispatch({ type: 'DATA_PARTIES_SUCCESS', payload: parties });
  }, []);

  const setPartiesFailure = useCallback((error: string) => {
    dispatch({ type: 'DATA_PARTIES_FAILURE', payload: error });
  }, []);

  const addParty = useCallback((party: Party) => {
    dispatch({ type: 'DATA_PARTIES_ADD', payload: party });
  }, []);

  const updateParty = useCallback((party: Party) => {
    dispatch({ type: 'DATA_PARTIES_UPDATE', payload: party });
  }, []);

  const deleteParty = useCallback((id: string) => {
    dispatch({ type: 'DATA_PARTIES_DELETE', payload: id });
  }, []);

  // Data actions - Items
  const setItemsLoading = useCallback(() => {
    dispatch({ type: 'DATA_ITEMS_LOADING' });
  }, []);

  const setItemsSuccess = useCallback((items: Item[]) => {
    dispatch({ type: 'DATA_ITEMS_SUCCESS', payload: items });
  }, []);

  const setItemsFailure = useCallback((error: string) => {
    dispatch({ type: 'DATA_ITEMS_FAILURE', payload: error });
  }, []);

  const addItem = useCallback((item: Item) => {
    dispatch({ type: 'DATA_ITEMS_ADD', payload: item });
  }, []);

  const updateItem = useCallback((item: Item) => {
    dispatch({ type: 'DATA_ITEMS_UPDATE', payload: item });
  }, []);

  const deleteItem = useCallback((id: string) => {
    dispatch({ type: 'DATA_ITEMS_DELETE', payload: id });
  }, []);

  // Data actions - Invoices
  const setInvoicesLoading = useCallback(() => {
    dispatch({ type: 'DATA_INVOICES_LOADING' });
  }, []);

  const setInvoicesSuccess = useCallback((invoices: Invoice[]) => {
    dispatch({ type: 'DATA_INVOICES_SUCCESS', payload: invoices });
  }, []);

  const setInvoicesFailure = useCallback((error: string) => {
    dispatch({ type: 'DATA_INVOICES_FAILURE', payload: error });
  }, []);

  const addInvoice = useCallback((invoice: Invoice) => {
    dispatch({ type: 'DATA_INVOICES_ADD', payload: invoice });
  }, []);

  const updateInvoice = useCallback((invoice: Invoice) => {
    dispatch({ type: 'DATA_INVOICES_UPDATE', payload: invoice });
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    dispatch({ type: 'DATA_INVOICES_DELETE', payload: id });
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    // Auth actions
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    clearAuthError,
    // UI actions
    setTheme,
    toggleSidebar,
    setSidebar,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    // Data actions
    setPartiesLoading,
    setPartiesSuccess,
    setPartiesFailure,
    addParty,
    updateParty,
    deleteParty,
    setItemsLoading,
    setItemsSuccess,
    setItemsFailure,
    addItem,
    updateItem,
    deleteItem,
    setInvoicesLoading,
    setInvoicesSuccess,
    setInvoicesFailure,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

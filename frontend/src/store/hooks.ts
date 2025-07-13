/**
 * Store Hooks
 * Custom hooks for accessing specific parts of the store
 */

import { useAppStore } from './context';

// Auth hooks
export function useAuth() {
  const { state, loginStart, loginSuccess, loginFailure, logout, clearAuthError } = useAppStore();
  
  return {
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    error: state.auth.error,
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    clearAuthError,
  };
}

// UI hooks
export function useUI() {
  const {
    state,
    setTheme,
    toggleSidebar,
    setSidebar,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
  } = useAppStore();
  
  return {
    theme: state.ui.theme,
    sidebarOpen: state.ui.sidebarOpen,
    isLoading: state.ui.isLoading,
    notifications: state.ui.notifications,
    modal: state.ui.modal,
    setTheme,
    toggleSidebar,
    setSidebar,
    setLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
  };
}

// Data hooks
export function useParties() {
  const {
    state,
    setPartiesLoading,
    setPartiesSuccess,
    setPartiesFailure,
    addParty,
    updateParty,
    deleteParty,
  } = useAppStore();
  
  return {
    parties: state.data.parties.items,
    loading: state.data.parties.loading,
    error: state.data.parties.error,
    lastFetch: state.data.parties.lastFetch,
    setLoading: setPartiesLoading,
    setSuccess: setPartiesSuccess,
    setFailure: setPartiesFailure,
    add: addParty,
    update: updateParty,
    delete: deleteParty,
  };
}

export function useItems() {
  const {
    state,
    setItemsLoading,
    setItemsSuccess,
    setItemsFailure,
    addItem,
    updateItem,
    deleteItem,
  } = useAppStore();
  
  return {
    items: state.data.items.items,
    loading: state.data.items.loading,
    error: state.data.items.error,
    lastFetch: state.data.items.lastFetch,
    setLoading: setItemsLoading,
    setSuccess: setItemsSuccess,
    setFailure: setItemsFailure,
    add: addItem,
    update: updateItem,
    delete: deleteItem,
  };
}

export function useInvoices() {
  const {
    state,
    setInvoicesLoading,
    setInvoicesSuccess,
    setInvoicesFailure,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  } = useAppStore();
  
  return {
    invoices: state.data.invoices.items,
    loading: state.data.invoices.loading,
    error: state.data.invoices.error,
    lastFetch: state.data.invoices.lastFetch,
    setLoading: setInvoicesLoading,
    setSuccess: setInvoicesSuccess,
    setFailure: setInvoicesFailure,
    add: addInvoice,
    update: updateInvoice,
    delete: deleteInvoice,
  };
}

// Notification helpers
export function useNotifications() {
  const { addNotification, removeNotification, clearNotifications } = useUI();
  
  const showSuccess = (title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      autoClose: true,
      duration: 3000,
    });
  };

  const showError = (title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      autoClose: true,
      duration: 5000,
    });
  };

  const showWarning = (title: string, message: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      autoClose: true,
      duration: 4000,
    });
  };

  const showInfo = (title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      autoClose: true,
      duration: 3000,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    remove: removeNotification,
    clearAll: clearNotifications,
  };
}

// Modal helpers
export function useModal() {
  const { modal, openModal, closeModal } = useUI();
  
  return {
    isOpen: modal.isOpen,
    type: modal.type,
    data: modal.data,
    open: openModal,
    close: closeModal,
  };
}

// Theme helpers
export function useTheme() {
  const { theme, setTheme } = useUI();
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}

/**
 * Store Reducers
 * Handles all state mutations for the application
 */

import type {
  AppState,
  AuthState,
  UIState,
  DataState,
  AuthAction,
  UIAction,
  DataAction
} from './types';

// Initial States
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const initialUIState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  isLoading: false,
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
};

export const initialDataState: DataState = {
  parties: {
    items: [],
    loading: false,
    error: null,
    lastFetch: null,
  },
  items: {
    items: [],
    loading: false,
    error: null,
    lastFetch: null,
  },
  invoices: {
    items: [],
    loading: false,
    error: null,
    lastFetch: null,
  },
};

export const initialAppState: AppState = {
  auth: initialAuthState,
  ui: initialUIState,
  data: initialDataState,
};

// Auth Reducer
export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'AUTH_LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialAuthState,
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// UI Reducer
export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'UI_SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'UI_TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case 'UI_SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.payload,
      };

    case 'UI_SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'UI_ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case 'UI_REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'UI_CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'UI_OPEN_MODAL':
      return {
        ...state,
        modal: {
          isOpen: true,
          type: action.payload.type,
          data: action.payload.data,
        },
      };

    case 'UI_CLOSE_MODAL':
      return {
        ...state,
        modal: {
          isOpen: false,
          type: null,
          data: null,
        },
      };

    default:
      return state;
  }
}

// Data Reducer
export function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    // Parties
    case 'DATA_PARTIES_LOADING':
      return {
        ...state,
        parties: {
          ...state.parties,
          loading: true,
          error: null,
        },
      };

    case 'DATA_PARTIES_SUCCESS':
      return {
        ...state,
        parties: {
          items: action.payload,
          loading: false,
          error: null,
          lastFetch: Date.now(),
        },
      };

    case 'DATA_PARTIES_FAILURE':
      return {
        ...state,
        parties: {
          ...state.parties,
          loading: false,
          error: action.payload,
        },
      };

    case 'DATA_PARTIES_ADD':
      return {
        ...state,
        parties: {
          ...state.parties,
          items: [...state.parties.items, action.payload],
        },
      };

    case 'DATA_PARTIES_UPDATE':
      return {
        ...state,
        parties: {
          ...state.parties,
          items: state.parties.items.map(item =>
            item.id === action.payload.id ? action.payload : item
          ),
        },
      };

    case 'DATA_PARTIES_DELETE':
      return {
        ...state,
        parties: {
          ...state.parties,
          items: state.parties.items.filter(item => item.id !== action.payload),
        },
      };

    // Items
    case 'DATA_ITEMS_LOADING':
      return {
        ...state,
        items: {
          ...state.items,
          loading: true,
          error: null,
        },
      };

    case 'DATA_ITEMS_SUCCESS':
      return {
        ...state,
        items: {
          items: action.payload,
          loading: false,
          error: null,
          lastFetch: Date.now(),
        },
      };

    case 'DATA_ITEMS_FAILURE':
      return {
        ...state,
        items: {
          ...state.items,
          loading: false,
          error: action.payload,
        },
      };

    case 'DATA_ITEMS_ADD':
      return {
        ...state,
        items: {
          ...state.items,
          items: [...state.items.items, action.payload],
        },
      };

    case 'DATA_ITEMS_UPDATE':
      return {
        ...state,
        items: {
          ...state.items,
          items: state.items.items.map(item =>
            item.id === action.payload.id ? action.payload : item
          ),
        },
      };

    case 'DATA_ITEMS_DELETE':
      return {
        ...state,
        items: {
          ...state.items,
          items: state.items.items.filter(item => item.id !== action.payload),
        },
      };

    // Invoices
    case 'DATA_INVOICES_LOADING':
      return {
        ...state,
        invoices: {
          ...state.invoices,
          loading: true,
          error: null,
        },
      };

    case 'DATA_INVOICES_SUCCESS':
      return {
        ...state,
        invoices: {
          items: action.payload,
          loading: false,
          error: null,
          lastFetch: Date.now(),
        },
      };

    case 'DATA_INVOICES_FAILURE':
      return {
        ...state,
        invoices: {
          ...state.invoices,
          loading: false,
          error: action.payload,
        },
      };

    case 'DATA_INVOICES_ADD':
      return {
        ...state,
        invoices: {
          ...state.invoices,
          items: [...state.invoices.items, action.payload],
        },
      };

    case 'DATA_INVOICES_UPDATE':
      return {
        ...state,
        invoices: {
          ...state.invoices,
          items: state.invoices.items.map(item =>
            item.id === action.payload.id ? action.payload : item
          ),
        },
      };

    case 'DATA_INVOICES_DELETE':
      return {
        ...state,
        invoices: {
          ...state.invoices,
          items: state.invoices.items.filter(item => item.id !== action.payload),
        },
      };

    default:
      return state;
  }
}

// Root Reducer
export function appReducer(state: AppState, action: any): AppState {
  return {
    auth: authReducer(state.auth, action),
    ui: uiReducer(state.ui, action),
    data: dataReducer(state.data, action),
  };
}

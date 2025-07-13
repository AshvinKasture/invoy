/**
 * Store Index
 * Main entry point for the store
 */

// Export types
export type {
  AppState,
  AuthState,
  UIState,
  DataState,
  AuthAction,
  UIAction,
  DataAction,
  AppAction,
  Notification,
} from './types';

// Export reducers and initial states
export {
  appReducer,
  authReducer,
  uiReducer,
  dataReducer,
  initialAppState,
  initialAuthState,
  initialUIState,
  initialDataState,
} from './reducers';

// Export context and provider
export { AppProvider, useAppStore } from './context';

// Export custom hooks
export {
  useAuth,
  useUI,
  useParties,
  useItems,
  useInvoices,
  useNotifications,
  useModal,
  useTheme,
} from './hooks';

# Global Store Documentation

This document explains how to use the global store implementation in the Invoy frontend application.

## Overview

The store is implemented using React Context API with TypeScript for type safety. It provides centralized state management for:
- Authentication state
- UI state (theme, sidebar, notifications, modals)
- Application data (parties, items, invoices)

## Architecture

```
/src/store/
├── types.ts       # TypeScript interfaces and types
├── reducers.ts    # State reducers and initial states
├── context.tsx    # React Context implementation
├── hooks.ts       # Custom hooks for accessing store
└── index.ts       # Main exports
```

## Usage

### 1. Provider Setup

The store provider is already configured in `src/main.tsx`:

```tsx
import { AppProvider } from './store';

<AppProvider>
  <App />
</AppProvider>
```

### 2. Using Store Hooks

#### Authentication

```tsx
import { useAuth } from '@/store';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use authentication state and actions
}
```

#### Notifications

```tsx
import { useNotifications } from '@/store';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  
  const handleSuccess = () => {
    showSuccess('Success!', 'Operation completed successfully');
  };
}
```

#### Theme Management

```tsx
import { useTheme } from '@/store';

function MyComponent() {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

#### Data Management

```tsx
import { useParties, useItems, useInvoices } from '@/store';

function PartiesComponent() {
  const { parties, loading, error, add, update, delete: deleteParty } = useParties();
  
  // Use parties data and actions
}
```

#### Modal Management

```tsx
import { useModal } from '@/store';

function MyComponent() {
  const { isOpen, type, data, open, close } = useModal();
  
  const openTestModal = () => {
    open('test-modal', { message: 'Hello World' });
  };
}
```

### 3. Direct Store Access

For complex operations, you can access the store directly:

```tsx
import { useAppStore } from '@/store';

function AdvancedComponent() {
  const { state, dispatch } = useAppStore();
  
  // Access full state and dispatch actions
}
```

## State Structure

### Auth State
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### UI State
```typescript
interface UIState {
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
```

### Data State
```typescript
interface DataState {
  parties: {
    items: Party[];
    loading: boolean;
    error: string | null;
    lastFetch: number | null;
  };
  items: { /* similar structure */ };
  invoices: { /* similar structure */ };
}
```

## Actions

### Auth Actions
- `AUTH_LOGIN_START`
- `AUTH_LOGIN_SUCCESS`
- `AUTH_LOGIN_FAILURE`
- `AUTH_LOGOUT`
- `AUTH_CLEAR_ERROR`

### UI Actions
- `UI_SET_THEME`
- `UI_TOGGLE_SIDEBAR`
- `UI_SET_SIDEBAR`
- `UI_SET_LOADING`
- `UI_ADD_NOTIFICATION`
- `UI_REMOVE_NOTIFICATION`
- `UI_CLEAR_NOTIFICATIONS`
- `UI_OPEN_MODAL`
- `UI_CLOSE_MODAL`

### Data Actions
- `DATA_PARTIES_LOADING`
- `DATA_PARTIES_SUCCESS`
- `DATA_PARTIES_FAILURE`
- `DATA_PARTIES_ADD`
- `DATA_PARTIES_UPDATE`
- `DATA_PARTIES_DELETE`
- Similar actions for items and invoices

## Best Practices

1. **Use Specific Hooks**: Use `useAuth()`, `useUI()`, etc. instead of `useAppStore()` when possible
2. **Type Safety**: All actions and state are fully typed
3. **Immutability**: All state updates are immutable
4. **Error Handling**: Each data section has its own error state
5. **Loading States**: Track loading for better UX
6. **Notifications**: Use the notification system for user feedback

## Examples

### Login Flow

```tsx
import { useAuth, useNotifications } from '@/store';

function LoginForm() {
  const { login, loading, error } = useAuth();
  const { showSuccess, showError } = useNotifications();
  
  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      showSuccess('Welcome!', 'Login successful');
    } else {
      showError('Login Failed', result.error);
    }
  };
}
```

### Data Fetching

```tsx
import { useParties, useNotifications } from '@/store';
import { partiesApi } from '@/api/parties';

function PartiesList() {
  const parties = useParties();
  const { showError } = useNotifications();
  
  const loadParties = async () => {
    try {
      parties.setLoading();
      const response = await partiesApi.getAll();
      if (response.success) {
        parties.setSuccess(response.data);
      } else {
        parties.setFailure(response.message);
      }
    } catch (error) {
      parties.setFailure('Failed to load parties');
      showError('Error', 'Failed to load parties');
    }
  };
  
  useEffect(() => {
    loadParties();
  }, []);
}
```

## Components

### NotificationContainer

Automatically displays notifications from the store. Already included in the main App component.

### StoreExample

A demonstration component showing how to use various store features. Available on the Dashboard page.

## Integration

The store is fully integrated with:
- Authentication system (useAuth hook)
- API layer (ApiHelper)
- Routing (PrivateRoute)
- UI components (notifications, modals)

This store provides a solid foundation for managing global state in the Invoy application with full TypeScript support and best practices.

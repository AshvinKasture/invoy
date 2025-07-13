# API Helper Documentation

This document explains how to use the ApiHelper utility for making API calls in the Invoy frontend application.

## Overview

The `ApiHelper` utility provides a comprehensive abstraction layer over axios with built-in error handling, request/response transformation, and convenient methods for common API operations.

## Key Features

- **Standardized Response Format**: All API responses are transformed to a consistent format
- **Enhanced Error Handling**: Detailed error information with type checking
- **Automatic Logging**: Request/response logging in development mode
- **Type Safety**: Full TypeScript support with proper typing
- **File Operations**: Built-in support for file uploads and downloads
- **Batch Requests**: Execute multiple requests in parallel
- **Query Parameters**: Automatic query string building and filtering

## Basic Usage

### Import the ApiHelper

```typescript
import apiHelper from '@/api/apiHelper';
```

### Making Basic Requests

```typescript
// GET request
const response = await apiHelper.get<User[]>('/users');

// POST request
const newUser = await apiHelper.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updatedUser = await apiHelper.put<User>('/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await apiHelper.delete('/users/123');
```

### Working with Query Parameters

```typescript
// Simple query parameters
const users = await apiHelper.get<PaginatedResponse<User>>('/users', {
  page: 1,
  limit: 10,
  search: 'john'
});

// Complex filtering
const filteredItems = await apiHelper.get<Item[]>('/items', {
  category: 'Electronics',
  minPrice: 100,
  maxPrice: 1000,
  sortBy: 'price',
  sortOrder: 'asc'
});
```

## Response Format

All API responses follow this standardized format:

```typescript
interface ApiResponse<T> {
  data: T;              // The actual response data
  message?: string;     // Optional message from server
  success: boolean;     // Request success status
  status: number;       // HTTP status code
}
```

## Error Handling

### Error Format

```typescript
interface ApiError {
  message: string;                    // Error message
  status?: number;                   // HTTP status code
  errors?: Record<string, string[]>; // Validation errors
  code?: string;                     // Error code
}
```

### Error Handling Example

```typescript
try {
  const user = await apiHelper.get<User>('/users/123');
  console.log(user.data);
} catch (error: ApiError) {
  // Check error type
  if (apiHelper.isErrorType(error, 'validation')) {
    console.log('Validation error:', apiHelper.formatError(error));
  } else if (apiHelper.isErrorType(error, 'authentication')) {
    console.log('Please log in again');
  } else {
    console.log('General error:', error.message);
  }
}
```

## Advanced Features

### File Upload

```typescript
// Single file upload
const file = document.getElementById('fileInput').files[0];
const response = await apiHelper.upload<{url: string}>('/upload', file);

// Multiple files upload
const files = Array.from(document.getElementById('filesInput').files);
const response = await apiHelper.upload<{urls: string[]}>('/upload-multiple', files);

// Upload with additional data
const response = await apiHelper.upload('/upload', file, {
  category: 'documents',
  description: 'Invoice PDF'
});
```

### File Download

```typescript
// Download a file
await apiHelper.download('/invoices/123/pdf', 'invoice-123.pdf');
```

### Batch Requests

```typescript
// Execute multiple requests in parallel
const batchRequests = [
  () => apiHelper.get<User>('/users/1'),
  () => apiHelper.get<User>('/users/2'),
  () => apiHelper.get<User>('/users/3')
];

const results = await apiHelper.batch<User>(batchRequests);
console.log(results.data); // Array of user data
```

## Using Specific API Services

Instead of using the generic ApiHelper directly, use the specific API services:

```typescript
import { partiesApi, itemsApi, invoicesApi } from '@/api';

// Using the parties API
const parties = await partiesApi.getParties({
  partyType: 'customer',
  page: 1,
  limit: 10
});

// Using the items API
const newItem = await itemsApi.createItem({
  name: 'Laptop',
  basePrice: 50000,
  uom: 'piece',
  category: 'Electronics'
});

// Using the invoices API
const invoice = await invoicesApi.getInvoice('inv-123');
```

## Configuration and Debugging

### Get Current Configuration

```typescript
const config = apiHelper.getConfig();
console.log('API Config:', config);
```

### Health Check

```typescript
const health = await apiHelper.healthCheck();
console.log('API Health:', health.data);
```

## Best Practices

### 1. Use Specific API Services

```typescript
// ✅ Good - Use specific API service
const parties = await partiesApi.getParties();

// ❌ Avoid - Generic API calls
const parties = await apiHelper.get('/parties');
```

### 2. Handle Errors Appropriately

```typescript
// ✅ Good - Proper error handling
try {
  const user = await authApi.login(credentials);
  // Handle success
} catch (error) {
  if (apiHelper.isErrorType(error, 'authentication')) {
    setError('Invalid credentials');
  } else {
    setError(apiHelper.formatError(error));
  }
}
```

### 3. Use TypeScript Types

```typescript
// ✅ Good - Proper typing
const response = await apiHelper.get<PaginatedResponse<Item>>('/items');

// ❌ Avoid - No typing
const response = await apiHelper.get('/items');
```

### 4. Leverage Query Parameters

```typescript
// ✅ Good - Use query parameters object
const items = await itemsApi.getItems({
  category: 'Electronics',
  isActive: true,
  page: 1,
  limit: 20
});

// ❌ Avoid - Manual query string building
const items = await apiHelper.get('/items?category=Electronics&isActive=true&page=1&limit=20');
```

## Environment Configuration

The ApiHelper automatically uses environment variables:

- `VITE_API_URL` - Base URL for API requests
- `VITE_API_TIMEOUT` - Request timeout
- `VITE_ENABLE_LOGGING` - Enable request logging
- `VITE_DEBUG_MODE` - Enable detailed debug logging

## Common Patterns

### Pagination

```typescript
const [page, setPage] = useState(1);
const [items, setItems] = useState<Item[]>([]);

const loadItems = async () => {
  try {
    const response = await itemsApi.getItems({ page, limit: 10 });
    setItems(response.data.data);
  } catch (error) {
    console.error('Failed to load items:', error);
  }
};
```

### Search with Debouncing

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [searchResults, setSearchResults] = useState<Party[]>([]);

useEffect(() => {
  const timer = setTimeout(async () => {
    if (searchTerm) {
      try {
        const response = await partiesApi.searchParties(searchTerm);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]);
```

This ApiHelper utility provides a robust foundation for all API interactions in the Invoy application!

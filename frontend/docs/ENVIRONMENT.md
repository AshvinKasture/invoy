# Environment Configuration

This document explains how environment variables are managed in the Invoy frontend application.

## Environment Helper Utility

The `EnvironmentHelper` utility (`src/utils/environment.ts`) provides a centralized way to access environment variables in the Vite-based frontend application.

### Key Features

- **Vite-compatible**: Uses `import.meta.env` instead of `process.env`
- **Type-safe**: Provides TypeScript interfaces for configuration
- **Validation**: Validates required environment variables
- **Logging**: Logs configuration in development mode
- **Fallbacks**: Provides sensible defaults for all variables

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the client-side code.

#### API Configuration
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:8000/api`)
- `VITE_API_TIMEOUT` - API request timeout in milliseconds (default: `10000`)

#### Application Configuration
- `VITE_APP_NAME` - Application name (default: `Invoy`)
- `VITE_APP_VERSION` - Application version (default: `1.0.0`)

#### Development Configuration
- `VITE_ENABLE_LOGGING` - Enable console logging (default: `true` in dev)
- `VITE_DEBUG_MODE` - Enable debug mode with detailed logging (default: `true` in dev)

### Usage Examples

```typescript
import envHelper from '@/utils/environment';

// Get API URL
const apiUrl = envHelper.getApiUrl();

// Check environment
if (envHelper.isDev()) {
  console.log('Running in development mode');
}

// Get complete configuration
const config = envHelper.getConfig();
```

### Environment Files

- `.env` - Development environment variables
- `.env.example` - Template file with all available variables
- `.env.local` - Local overrides (gitignored)
- `.env.production` - Production environment variables

### Best Practices

1. **Never commit sensitive data** to `.env` files in version control
2. **Always provide defaults** for non-sensitive variables
3. **Use the EnvironmentHelper** instead of accessing `import.meta.env` directly
4. **Validate required variables** on application startup
5. **Prefix all variables** with `VITE_` for client-side access

### Migration from Create React App

If migrating from Create React App:
- Change `REACT_APP_*` prefixes to `VITE_*`
- Replace `process.env` with `import.meta.env`
- Use the EnvironmentHelper utility for type safety

### Troubleshooting

1. **Variable not accessible**: Ensure it's prefixed with `VITE_`
2. **Undefined in production**: Check that the variable is set in your deployment environment
3. **Type errors**: Use the EnvironmentHelper methods for type-safe access

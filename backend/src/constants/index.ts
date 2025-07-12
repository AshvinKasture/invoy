// API Configuration
export const API_CONFIG = {
  VERSION: '1.0.0',
  NAME: 'Invoy API',
  DESCRIPTION: 'RESTful API with Express and TypeScript',
  DEFAULT_PORT: 8000,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  REQUEST_SIZE_LIMIT: '10mb'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Environment Variables
export const NODE_ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
} as const;

// API Routes
export const API_ROUTES = {
  ROOT: '/',
  API: '/api',
  HEALTH: '/api/health',
  USERS: '/api/users',
  PRODUCTS: '/api/products'
} as const;

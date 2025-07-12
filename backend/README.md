# Invoy Backend API

A RESTful API built with Express.js and TypeScript, featuring a clean architecture with controllers, routes, and middleware.

## 🚀 Features

- **TypeScript** - Type-safe development
- **Express.js** - Fast web framework
- **Express-Validator** - Robust request validation and sanitization
- **Clean Architecture** - Organized codebase with separation of concerns
- **Input Validation** - Comprehensive request validation middleware
- **Error Handling** - Global error handling and consistent API responses
- **CORS Support** - Cross-origin resource sharing
- **Request Logging** - Automatic request logging
- **Health Checks** - API health monitoring
- **Pagination & Filtering** - Built-in pagination and search capabilities

## 📁 Project Structure

```
src/
├── controllers/        # Business logic and request handlers
│   ├── userController.ts
│   └── productController.ts
├── routes/            # API route definitions
│   ├── index.ts
│   ├── userRoutes.ts
│   └── productRoutes.ts
├── middleware/        # Custom middleware functions
│   ├── common.ts
│   └── errorHandler.ts
├── validations/       # Express-validator validation framework
│   ├── index.ts
│   ├── userValidations.ts
│   ├── productValidations.ts
│   ├── utils.ts
│   └── README.md
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   └── response.ts
├── constants/        # Application constants
│   └── index.ts
└── index.ts          # Application entry point
```

## 🛠️ Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update environment variables in `.env` file

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Other Scripts
```bash
npm run clean    # Remove dist folder
npm test         # Run tests (when implemented)
```

## 📚 API Endpoints

### Base URL
```
http://localhost:8000
```

### Health Check
- **GET** `/api/health` - API health status

### Users
- **GET** `/api/users` - Get all users (with pagination, search, sorting)
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

#### Query Parameters for GET /api/users:
- `limit` (1-100) - Number of users per page
- `offset` (≥0) - Number of users to skip
- `search` - Search in name and email
- `sortBy` - Sort by: name, email, createdAt, updatedAt
- `sortOrder` - asc or desc

### Products
- **GET** `/api/products` - Get all products (with filters, pagination, search, sorting)
- **GET** `/api/products/:id` - Get product by ID
- **POST** `/api/products` - Create new product
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product

#### Query Parameters for GET /api/products:
- `limit` (1-100) - Number of products per page
- `offset` (≥0) - Number of products to skip
- `category` - Filter by category
- `minPrice` (≥0) - Minimum price filter
- `maxPrice` (≥0) - Maximum price filter (must be > minPrice)
- `search` - Search in name, description, and category
- `sortBy` - Sort by: name, price, category, createdAt, updatedAt
- `sortOrder` - asc or desc

## 🔧 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-07-12T18:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)",
  "timestamp": "2025-07-12T18:00:00.000Z"
}
```

## 📝 Example API Calls

### Create User
```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }'
```

### Get Products with Filters and Pagination
```bash
curl "http://localhost:8000/api/products?category=Electronics&minPrice=100&maxPrice=2000&limit=5&offset=0&sortBy=price&sortOrder=asc"
```

### Get Users with Search and Pagination
```bash
curl "http://localhost:8000/api/users?search=john&limit=10&offset=0&sortBy=name&sortOrder=asc"
```

## 🔧 Environment Variables

```bash
# Server Configuration
PORT=8000
NODE_ENV=development

# Database (when implemented)
# DATABASE_URL=

# Authentication (when implemented)
# JWT_SECRET=
```

## 🛡️ Validation Framework

The API uses a robust validation framework built on `express-validator`:

### Features
- **Type-safe validation** with comprehensive error messages
- **Request sanitization** to prevent unwanted fields
- **Custom validators** for business logic
- **Pagination and filtering** validation
- **Conditional validation** based on request context

### Validation Rules

#### User Validation
- **Email**: Valid email format, normalized, max 255 chars
- **Name**: 2-100 characters, trimmed, no "admin" allowed
- **Password**: 6-128 chars, must contain uppercase, lowercase, and number

#### Product Validation
- **Name**: 2-200 characters, no "test product" allowed
- **Description**: 10-1000 characters
- **Price**: Positive number, Electronics ≥ $10, max $100,000
- **Category**: Must be from predefined list (Electronics, Clothing, etc.)

### Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Validation errors: email: Must be a valid email address, price: Price must be a positive number",
  "timestamp": "2025-07-12T18:00:00.000Z"
}
```

For detailed validation documentation, see [`src/validations/README.md`](src/validations/README.md).

## 🏗️ Architecture Features

### Controllers
- Handle business logic
- Process requests and responses
- Implement CRUD operations
- Error handling with try-catch

### Routes
- Define API endpoints
- Apply middleware
- Route organization by feature

### Middleware
- Input validation
- Request logging
- CORS handling
- Error management
- Request timeout

### Types
- TypeScript interfaces
- Type definitions for requests/responses
- Data models

### Utils
- Response helpers
- Common utility functions
- Reusable code

## 🚀 Next Steps

1. **Database Integration** - Add MongoDB/PostgreSQL
2. **Authentication** - JWT-based auth system
3. **Testing** - Unit and integration tests
4. **Documentation** - Swagger/OpenAPI docs
5. **Logging** - Winston or similar logging library
6. **Rate Limiting** - API rate limiting
7. **Caching** - Redis caching layer

## 📄 License

MIT License

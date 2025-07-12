# Invoy Backend API

A robust RESTful API built with Express.js, TypeScript, and a multi-database framework supporting PostgreSQL and MSSQL.

## 🚀 Features

- **TypeScript** - Type-safe development with comprehensive interfaces
- **Express.js** - Fast, minimal web framework
- **Multi-Database Support** - PostgreSQL (primary) and MSSQL (secondary) with database-agnostic abstraction
- **Enterprise Database Framework** - Advanced connection pooling, health monitoring, and retry logic
- **Express-Validator** - Robust request validation and sanitization
- **Clean Architecture** - Organized codebase with separation of concerns
- **Advanced Migration System** - Schema management with rollback support and checksum validation
- **Connection Pooling** - Optimized database connections with monitoring
- **Health Checks** - API and database health monitoring with metrics
- **Error Handling** - Global error handling and consistent API responses
- **Security** - SSL/TLS support, connection encryption, and secure authentication

## 📁 Project Structure

```
src/
├── database/              # Database framework and abstraction layer
│   ├── core/             # Core interfaces and configuration
│   │   ├── interfaces.ts # TypeScript interfaces and types
│   │   └── config.ts     # Configuration management
│   ├── drivers/          # Database-specific implementations
│   │   ├── postgresql.ts # PostgreSQL driver (primary)
│   │   ├── mssql.ts      # MSSQL driver (secondary)
│   │   └── factory.ts    # Connection factory
│   ├── services/         # Database-agnostic service layer
│   │   └── database.ts   # Service abstraction
│   ├── migration/        # Migration system
│   │   └── manager.ts    # Migration manager
│   ├── main.ts          # Database manager (main entry point)
│   ├── index.ts         # Public exports
│   ├── schema.sql       # MSSQL schema
│   └── schema-postgres.sql # PostgreSQL schema
├── services/          # Database service layer
│   └── database.ts    # Base service classes
├── controllers/       # Business logic and request handlers
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

### Prerequisites
- Node.js 18+ and npm
- Azure subscription
- Azure SQL Database
- Azure CLI (for deployment)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Configure your `.env` file with your database connection string. You have several options:

#### Option 1: SQL Server LocalDB (Recommended for Development)
Perfect for local development with Visual Studio:
```env
DB_CONNECTION_STRING=Server=(localdb)\\MSSQLLocalDB;Database=InvoyDB;Trusted_Connection=true;TrustServerCertificate=true;
```

#### Option 2: Azure SQL Database (Production)
For cloud deployment:
```env
DB_CONNECTION_STRING=Server=your-server-name.database.windows.net;Database=your-database-name;User Id=your-username;Password=your-password;Encrypt=true;TrustServerCertificate=false;
```

#### Option 3: SQL Server Express (Local)
For a full local SQL Server installation:
```env
DB_CONNECTION_STRING=Server=localhost\\SQLEXPRESS;Database=InvoyDB;Trusted_Connection=true;TrustServerCertificate=true;
```

For detailed LocalDB setup instructions, see `src/database/LocalDB-Setup.md`.

### 3. Database Setup

See `src/database/README.md` for detailed Azure SQL Database setup instructions.

Initialize your database schema:
```bash
npm run migrate init
```

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
npm run build        # Build TypeScript to JavaScript
npm run clean        # Remove dist folder
npm run migrate init # Initialize database schema
npm run migrate status # Check migration status
npm test            # Run tests (when implemented)
```

## 🗄️ Database

This API supports multiple database options for different environments:

- **SQL Server LocalDB** (recommended for local development with Visual Studio)
- **Azure SQL Database** (for cloud deployment)
- **SQL Server Express** (for local development)
- **Docker SQL Server** (for cross-platform development)

### Database Features
- Connection pooling with retry logic
- Automated migrations and schema management
- Health monitoring and diagnostics
- Transaction support
- Parameterized queries for security
- Windows Authentication support for LocalDB

### Database Setup

See the comprehensive database documentation in the [`docs/database/`](../docs/database/) folder:

- **[Quick Start Guide](../docs/database/quick-start.md)** - Get up and running quickly
- **[Architecture Overview](../docs/database/architecture.md)** - Understanding the framework design  
- **[Configuration Guide](../docs/database/configuration.md)** - Detailed configuration options
- **[PostgreSQL Setup](../docs/database/postgresql.md)** - PostgreSQL-specific setup
- **[MSSQL Setup](../docs/database/mssql.md)** - SQL Server and Azure SQL setup
- **[Migration System](../docs/database/migrations.md)** - Schema management
- **[Troubleshooting](../docs/database/troubleshooting.md)** - Common issues and solutions

## 📚 API Endpoints

### Base URL
```
http://localhost:8000
```

### Health Check
- **GET** `/api/health` - API and database health status

Response includes:
- Application uptime and version
- Database connection status
- Environment information
- Timestamp

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

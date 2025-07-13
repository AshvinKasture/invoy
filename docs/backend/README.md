# Backend Documentation

This folder contains documentation for the Invoy backend application built with Node.js, Express, and TypeScript, featuring a robust multi-database framework.

## 📋 Available Documentation

### 🗃️ Database Framework
The backend features a comprehensive database abstraction framework that supports multiple database engines:

- **[Database Overview](./database/README.md)** - Framework overview and features
- **[Architecture](./database/architecture.md)** - Framework design and components  
- **[Quick Start](./database/quick-start.md)** - Get up and running quickly
- **[Configuration](./database/configuration.md)** - Detailed configuration options
- **[PostgreSQL Setup](./database/postgresql.md)** - PostgreSQL configuration (Primary)
- **[MSSQL Setup](./database/mssql.md)** - SQL Server configuration (Secondary)
- **[Migration System](./database/migrations.md)** - Schema management and migrations
- **[Troubleshooting](./database/troubleshooting.md)** - Common issues and solutions

## 🚀 Quick Start

1. **Database Setup**: Start with [Database Quick Start](./database/quick-start.md)
2. **Choose Database**: Select [PostgreSQL](./database/postgresql.md) or [MSSQL](./database/mssql.md)
3. **Run Migrations**: Follow [Migration System](./database/migrations.md) guide
4. **Troubleshooting**: Check [Troubleshooting](./database/troubleshooting.md) if needed

## 🏗️ Architecture Overview

The backend follows a modular, scalable architecture:

```
src/
├── controllers/        # Request handlers
├── database/          # Database framework
│   ├── core/         # Core database abstractions
│   ├── drivers/      # Database-specific drivers
│   ├── migration/    # Migration system
│   └── services/     # Database services
├── middleware/        # Express middleware
├── routes/           # API route definitions
├── services/         # Business logic services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── validations/      # Input validation schemas
```

## 🎯 Key Features

### Multi-Database Support
- **PostgreSQL** - Primary database engine
- **MSSQL** - Secondary database engine
- **Unified API** - Same interface for all databases
- **Dynamic Switching** - Runtime database selection

### Migration System
- **Schema Versioning** - Track database changes
- **Rollback Support** - Undo migrations safely
- **Multi-Database** - Consistent schema across engines
- **Development Tools** - Easy migration management

### Type Safety
- **TypeScript First** - Full type coverage
- **Schema Validation** - Runtime type checking
- **API Contracts** - Strongly typed interfaces
- **Database Models** - Type-safe data access

## 📚 Related Documentation

- [Frontend Documentation](../frontend/) - Client-side documentation
- [Main Documentation](../README.md) - Project overview

## 🛠️ Development Setup

1. Install dependencies: `npm install`
2. Configure database: See database documentation
3. Run migrations: `npm run migrate`
4. Start development server: `npm run dev`

For detailed setup instructions, refer to the [Database Quick Start](./database/quick-start.md) guide.

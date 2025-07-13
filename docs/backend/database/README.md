# Invoy Database Framework Documentation

This directory contains comprehensive documentation for the Invoy application's robust database framework.

## 📁 Documentation Structure

### Core Framework
- **[Database Architecture](./architecture.md)** - Overview of the database abstraction layer
- **[Quick Start Guide](./quick-start.md)** - Get up and running quickly
- **[Configuration Guide](./configuration.md)** - Environment setup and configuration options

### Database-Specific Guides
- **[PostgreSQL Setup](./postgresql.md)** - PostgreSQL setup and configuration (Primary database)
- **[MSSQL Setup](./mssql.md)** - MSSQL setup and configuration (Secondary database)

### Advanced Topics
- **[Migration System](./migrations.md)** - Database schema migration and management
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions

## 🏗️ Database Framework Features

### Primary Database: PostgreSQL
- ✅ **Modern PostgreSQL features** (JSONB, UUID, triggers)
- ✅ **Advanced connection pooling** with retry logic
- ✅ **SSL/TLS support** for secure connections
- ✅ **Prepared statements** for performance optimization
- ✅ **Health monitoring** and automatic reconnection

### Secondary Database: MSSQL
- ✅ **Azure SQL Database support** with managed identity
- ✅ **SQL Server LocalDB** for local development
- ✅ **Windows Authentication** and SQL authentication
- ✅ **Bulk operations** for high-performance data loading
- ✅ **Stored procedure support** for legacy compatibility

### Framework Capabilities
- 🔄 **Database-agnostic service layer** - Write once, run on both databases
- 🏭 **Factory pattern** for connection creation and management
- 📊 **Comprehensive health monitoring** with metrics and alerts
- 🛡️ **Built-in error handling** with retry logic and circuit breakers
- 🔧 **Advanced migration system** with rollback support
- 📈 **Connection pool statistics** and performance monitoring

## 🚀 Quick Start

1. **Choose your database type** (PostgreSQL recommended):
   ```bash
   # PostgreSQL (Primary - Recommended)
   DB_TYPE=postgres
   DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/invoydb
   
   # MSSQL (Secondary)
   DB_TYPE=mssql
   DB_CONNECTION_STRING=Server=localhost;Database=InvoyDB;Trusted_Connection=true;
   ```

2. **Initialize the database**:
   ```bash
   npm run migrate init
   ```

3. **Start using the framework**:
   ```typescript
   import { databaseManager, getDatabaseService } from './database';
   
   // Initialize
   await databaseManager.initialize();
   
   // Use the service layer
   const db = getDatabaseService();
   const users = await db.findAll('users');
   ```

## 🔗 Related Documentation

- [Backend API Documentation](../../backend/README.md)
- [Environment Configuration](../../backend/.env.example)
- [API Health Endpoints](../api/health.md)

## 📞 Support

For database-related issues:
1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the [Configuration Guide](./configuration.md)
3. Examine application logs for detailed error messages
4. Test database connectivity using the health endpoints

---

*This documentation is part of the Invoy application framework. For the latest updates, please refer to the main repository.*

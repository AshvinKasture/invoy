# Invoy Documentation

Welcome to the comprehensive documentation for the Invoy application.

## 📁 Documentation Structure

This documentation is organized into frontend and backend sections for better organization:

### 🎨 Frontend Documentation
Complete documentation for the React frontend application:

- **[Store Management](./frontend/store.md)** - Global state management with React Context API
- **[API Helper](./frontend/API_HELPER.md)** - API abstraction layer and utilities
- **[Environment Configuration](./frontend/ENVIRONMENT.md)** - Environment variables and configuration

### ⚙️ Backend Documentation
Complete documentation for the Node.js backend and database framework:

- **[Database Overview](./backend/database/README.md)** - Framework overview and features
- **[Architecture](./backend/database/architecture.md)** - Framework design and components
- **[Quick Start](./backend/database/quick-start.md)** - Get up and running quickly
- **[Configuration](./backend/database/configuration.md)** - Detailed configuration options
- **[PostgreSQL Setup](./backend/database/postgresql.md)** - PostgreSQL configuration (Primary)
- **[MSSQL Setup](./backend/database/mssql.md)** - SQL Server configuration (Secondary)
- **[Migration System](./backend/database/migrations.md)** - Schema management and migrations
- **[Troubleshooting](./backend/database/troubleshooting.md)** - Common issues and solutions

## 🚀 Quick Navigation

### For Frontend Developers
- **New to the frontend?** Start with [Store Management](./frontend/store.md)
- **Working with APIs?** Check [API Helper](./frontend/API_HELPER.md)
- **Setting up environment?** See [Environment Configuration](./frontend/ENVIRONMENT.md)

### For Backend Developers
- **New to the project?** Start with [Database Quick Start](./backend/database/quick-start.md)
- **Setting up development environment?** See [PostgreSQL Setup](./backend/database/postgresql.md) or [MSSQL Setup](./backend/database/mssql.md)
- **Need to run migrations?** Check [Migration System](./backend/database/migrations.md)
- **Having issues?** Check [Troubleshooting](./backend/database/troubleshooting.md)

### For DevOps/Infrastructure
- **Understanding the architecture?** Read [Database Architecture](./backend/database/architecture.md)
- **Configuring for production?** See [Configuration Guide](./backend/database/configuration.md)
- **Setting up CI/CD?** Check [Migration System](./backend/database/migrations.md)

### For Database Administrators
- **PostgreSQL setup?** See [PostgreSQL Setup](./database/postgresql.md)
- **SQL Server setup?** See [MSSQL Setup](./database/mssql.md)
- **Performance tuning?** Check [Configuration Guide](./database/configuration.md)
- **Monitoring and troubleshooting?** See [Troubleshooting](./database/troubleshooting.md)

## 🎯 Key Features

### Multi-Database Support
- ✅ **PostgreSQL** (Primary) - Modern features, JSONB, advanced indexing
- ✅ **MSSQL** (Secondary) - Azure SQL, LocalDB, Windows authentication
- ✅ **Database-agnostic** service layer for seamless switching

### Enterprise-Grade Framework
- 🏭 **Factory pattern** for connection management
- 📊 **Health monitoring** with metrics and alerts
- 🔄 **Connection pooling** with retry logic
- 🛡️ **SSL/TLS security** for encrypted connections
- 🔧 **Advanced migrations** with rollback support

### Developer Experience
- 📝 **TypeScript** interfaces throughout
- 🚀 **Quick setup** with Docker support
- 📋 **Comprehensive CLI** for migrations
- 🔍 **Detailed logging** and debugging tools
- 📚 **Extensive documentation** with examples

## 🛠️ Common Commands

### Database Operations
```bash
# Initialize database schema
npm run migrate init

# Check migration status
npm run migrate status

# Apply pending migrations
npm run migrate up

# Test database connectivity
npm run test-db
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📊 Framework Overview

The Invoy database framework provides a robust abstraction layer that supports both PostgreSQL and MSSQL databases with the same API:

```typescript
// Works with both PostgreSQL and MSSQL
import { getDatabaseService } from './src/database';

const db = getDatabaseService();

// Database-agnostic operations
const users = await db.findAll('users');
const user = await db.findById('users', '123');
await db.create('users', { name: 'John', email: 'john@example.com' });
```

## 🔗 External Resources

### PostgreSQL
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/)

### MSSQL
- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/sql-server/)
- [Azure SQL Database](https://docs.microsoft.com/en-us/azure/azure-sql/)
- [SQL Server LocalDB](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb)

### Development Tools
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)

---

**Ready to get started?** Jump to the [Database Quick Start Guide](./database/quick-start.md)! 🚀

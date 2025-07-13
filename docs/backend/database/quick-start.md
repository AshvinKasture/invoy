# Quick Start Guide

Get up and running with the Invoy database framework in minutes.

## 🚀 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+ **OR** SQL Server/Azure SQL Database
- Basic knowledge of TypeScript and databases

## ⚡ Quick Setup

### 1. Choose Your Database

**Option A: PostgreSQL (Recommended)**
```bash
# Install PostgreSQL locally or use Docker
docker run --name invoy-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=invoydb -p 5432:5432 -d postgres:15
```

**Option B: MSSQL (Alternative)**
```bash
# Use SQL Server LocalDB or Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" -p 1433:1433 --name invoy-mssql -d mcr.microsoft.com/mssql/server:2019-latest
```

### 2. Configure Environment

Create or update your `.env` file:

```env
# PostgreSQL (Primary - Recommended)
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://postgres:yourpassword@localhost:5432/invoydb

# OR MSSQL (Secondary)
# DB_TYPE=mssql
# DB_CONNECTION_STRING=Server=localhost,1433;Database=InvoyDB;User Id=sa;Password=YourPassword123!;Encrypt=false;TrustServerCertificate=true;

# Optional: Pool Configuration
DB_POOL_MIN=0
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=15000
DB_REQUEST_TIMEOUT=15000
```

### 3. Initialize Database

```bash
# Install dependencies (if not already done)
npm install

# Initialize database schema
npm run migrate init

# Verify setup
npm run test-db
```

### 4. Start Using the Framework

```typescript
import { databaseManager, getDatabaseService } from './src/database';

// Initialize the database
await databaseManager.initialize();

// Get the service layer
const db = getDatabaseService();

// Start using database operations
const users = await db.findAll('users');
console.log(`Found ${users.length} users`);
```

## 📝 Basic Usage Examples

### Using the Service Layer (Recommended)

```typescript
import { getDatabaseService } from './src/database';

const db = getDatabaseService();

// Create a new user
const newUser = await db.create('users', {
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1-555-0123'
});

// Find user by ID
const user = await db.findById('users', newUser.id);

// Update user
const updatedUser = await db.update('users', user.id, {
  phone: '+1-555-9999'
});

// Find all active users
const activeUsers = await db.findAll('users', {
  where: 'is_active = :active',
  parameters: { active: true },
  orderBy: 'created_at DESC',
  limit: 10
});

// Delete user
const deleted = await db.delete('users', user.id);
```

### Using Direct Queries

```typescript
import { getDatabase } from './src/database';

const connection = getDatabase();

// Raw SQL query
const result = await connection.query(
  'SELECT * FROM users WHERE email = $1',
  ['john@example.com']
);

// With transactions
const transaction = await connection.beginTransaction();
try {
  await transaction.query('INSERT INTO users ...');
  await transaction.query('INSERT INTO user_profiles ...');
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### Health Monitoring

```typescript
import { getDatabaseHealth, databaseManager } from './src/database';

// Check database health
const health = await getDatabaseHealth();
console.log(`Database status: ${health.status}`);

// Get connection pool stats
const poolStats = databaseManager.getPoolStats();
console.log(`Active connections: ${poolStats?.acquired}`);
```

## 🔄 Switching Between Databases

The framework is designed to be database-agnostic. To switch from PostgreSQL to MSSQL (or vice versa):

1. **Update environment variable**:
   ```env
   # Change from postgres to mssql
   DB_TYPE=mssql
   DB_CONNECTION_STRING=Server=localhost;Database=InvoyDB;Trusted_Connection=true;
   ```

2. **Reinitialize schema**:
   ```bash
   npm run migrate init
   ```

3. **No code changes required** - the service layer handles database differences automatically!

## 📊 Development Commands

```bash
# Database operations
npm run migrate init          # Initialize database schema
npm run migrate status        # Show migration status
npm run test-db              # Test database connectivity

# Development
npm run dev                  # Start development server
npm run build               # Build the application
npm run test                # Run tests
```

## 🏥 Health Check Endpoints

Once your application is running, check these endpoints:

```bash
# Overall application health
curl http://localhost:8000/api/health

# Database-specific health
curl http://localhost:8000/api/health/database
```

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "type": "postgres",
    "latency": 12
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Common Configuration Examples

### Local Development with Docker

**PostgreSQL:**
```bash
# Start PostgreSQL
docker run --name invoy-postgres \
  -e POSTGRES_PASSWORD=devpass123 \
  -e POSTGRES_DB=invoydb \
  -p 5432:5432 -d postgres:15

# Environment
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://postgres:devpass123@localhost:5432/invoydb
```

**MSSQL:**
```bash
# Start SQL Server
docker run --name invoy-mssql \
  -e "ACCEPT_EULA=Y" \
  -e "SA_PASSWORD=DevPass123!" \
  -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest

# Environment
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=localhost,1433;Database=InvoyDB;User Id=sa;Password=DevPass123!;Encrypt=false;TrustServerCertificate=true;
```

### Cloud Deployment

**Azure Database for PostgreSQL:**
```env
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://invoyuser@servername:password@servername.postgres.database.azure.com:5432/invoydb?sslmode=require
```

**Azure SQL Database:**
```env
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=servername.database.windows.net;Database=invoydb;User Id=invoyuser;Password=SecurePass123!;Encrypt=true;TrustServerCertificate=false;
```

## 🛠️ Troubleshooting Quick Fixes

### Connection Issues
```bash
# Test database connectivity
npm run test-db

# Check configuration
node -e "console.log(require('./src/database/core/config').loadDatabaseConfig())"
```

### Permission Issues (PostgreSQL)
```sql
-- Grant permissions to application user
GRANT ALL PRIVILEGES ON DATABASE invoydb TO invoyuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO invoyuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO invoyuser;
```

### Permission Issues (MSSQL)
```sql
-- Create database user and grant permissions
CREATE LOGIN invoyuser WITH PASSWORD = 'SecurePass123!';
USE InvoyDB;
CREATE USER invoyuser FOR LOGIN invoyuser;
ALTER ROLE db_owner ADD MEMBER invoyuser;
```

## 📚 Next Steps

1. **[Configuration Guide](./configuration.md)** - Detailed configuration options
2. **[Architecture Overview](./architecture.md)** - Understanding the framework design
3. **[PostgreSQL Setup](./postgresql.md)** - Advanced PostgreSQL configuration
4. **[MSSQL Setup](./mssql.md)** - Advanced MSSQL configuration
5. **[Migration System](./migrations.md)** - Schema management and migrations

## 💡 Pro Tips

- **Use PostgreSQL for new projects** - it's the primary database with the most features
- **Enable SSL in production** - always use encrypted connections for cloud deployments
- **Monitor connection pools** - check pool statistics regularly in production
- **Use transactions for multi-step operations** - ensure data consistency
- **Test both database types** - if you might switch later, test with both PostgreSQL and MSSQL

---

You're now ready to build robust, database-driven applications with the Invoy framework! 🎉

# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for the Invoy backend application, including local development and cloud deployment options.

## Prerequisites

1. PostgreSQL installed locally OR access to cloud PostgreSQL service
2. Node.js and npm installed
3. Basic knowledge of PostgreSQL

## Setup Options

### Option 1: Local PostgreSQL Installation

#### Windows
1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. PostgreSQL will be installed with default port `5432`

#### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Create a database user (optional)
createuser --interactive
```

#### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Switch to postgres user and create database
sudo -i -u postgres
psql
```

### Option 2: Docker PostgreSQL (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name postgres-invoy \
  -e POSTGRES_DB=invoydb \
  -e POSTGRES_USER=invoyuser \
  -e POSTGRES_PASSWORD=your-secure-password \
  -p 5432:5432 \
  -d postgres:15

# Verify container is running
docker ps

# Access PostgreSQL shell
docker exec -it postgres-invoy psql -U invoyuser -d invoydb
```

### Option 3: Azure Database for PostgreSQL

#### Using Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" > "Databases" > "Azure Database for PostgreSQL"
3. Choose deployment option:
   - **Single Server** (legacy, but simpler)
   - **Flexible Server** (recommended)
4. Fill in the details:
   - **Resource Group**: Create new or use existing
   - **Server Name**: `invoy-postgres-server`
   - **Region**: Choose closest to your location
   - **PostgreSQL Version**: 15 (recommended)
   - **Compute + Storage**: Burstable B1ms for development
   - **Admin Username**: `invoyuser`
   - **Password**: Choose a secure password

#### Using Azure CLI
```bash
# Create resource group
az group create --name rg-invoy --location eastus

# Create PostgreSQL server
az postgres flexible-server create \
    --resource-group rg-invoy \
    --name invoy-postgres-server \
    --location eastus \
    --admin-user invoyuser \
    --admin-password YourSecurePassword123! \
    --version 15 \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32

# Create database
az postgres flexible-server db create \
    --resource-group rg-invoy \
    --server-name invoy-postgres-server \
    --database-name invoydb
```

## Configuration

### Environment Variables

Create a `.env` file in your backend directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
DB_TYPE=postgres

# PostgreSQL Connection String Options:

# Option 1: Local PostgreSQL
DB_CONNECTION_STRING=postgresql://postgres:your-password@localhost:5432/invoydb

# Option 2: Docker PostgreSQL
DB_CONNECTION_STRING=postgresql://invoyuser:your-secure-password@localhost:5432/invoydb

# Option 3: Azure Database for PostgreSQL
DB_CONNECTION_STRING=postgresql://invoyuser:YourSecurePassword123!@invoy-postgres-server.postgres.database.azure.com:5432/invoydb?sslmode=require

# Alternative: Individual Parameters
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432
# POSTGRES_DATABASE=invoydb
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=your-password
# POSTGRES_SSL=false

# Database Pool Configuration
DB_POOL_MIN=0
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=15000
DB_REQUEST_TIMEOUT=15000
```

## Database Schema Setup

### Option A: Using Migration Tool (Recommended)

```bash
# Initialize database schema
npm run migrate init

# Check migration status
npm run migrate status
```

### Option B: Manual Schema Creation

1. Connect to your PostgreSQL instance:
```bash
# Local PostgreSQL
psql -U postgres -d invoydb

# Docker PostgreSQL
docker exec -it postgres-invoy psql -U invoyuser -d invoydb

# Azure PostgreSQL (requires psql client)
psql "host=invoy-postgres-server.postgres.database.azure.com port=5432 dbname=invoydb user=invoyuser password=YourSecurePassword123! sslmode=require"
```

2. Run the schema script:
```sql
-- Copy and paste the contents from src/database/schema-postgres.sql
-- Or load the file if you have access to the filesystem
\i /path/to/src/database/schema-postgres.sql
```

## Testing the Connection

### Health Check
```bash
# Start your application
npm run dev

# Test the health endpoint
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "healthy",
  "timestamp": "2025-01-13T...",
  "type": "postgres"
}
```

### Database Query Test
```bash
# Connect to your database and test
psql -U your-username -d invoydb -c "SELECT version();"
```

## Performance Tuning

### Connection Pooling
PostgreSQL handles connections differently than SQL Server. Adjust these settings in your `.env`:

```env
# For light usage (development)
DB_POOL_MIN=2
DB_POOL_MAX=10

# For moderate usage (staging)
DB_POOL_MIN=5
DB_POOL_MAX=20

# For heavy usage (production)
DB_POOL_MIN=10
DB_POOL_MAX=50
```

### PostgreSQL-Specific Optimizations
1. **Indexes**: Add indexes for frequently queried columns
2. **VACUUM**: PostgreSQL automatically handles this, but monitor usage
3. **Connection Limits**: PostgreSQL default is 100 connections
4. **SSL**: Always use SSL in production (`sslmode=require`)

## Security Best Practices

### Local Development
1. **Use dedicated user**: Don't use the `postgres` superuser for applications
2. **Strong passwords**: Use complex passwords even for local development
3. **Limited permissions**: Grant only necessary database permissions

### Production/Cloud
1. **SSL Encryption**: Always use `sslmode=require` for cloud databases
2. **Firewall Rules**: Restrict access to your application servers only
3. **Regular Updates**: Keep PostgreSQL version updated
4. **Backup Strategy**: Implement automated backups
5. **Connection Limits**: Monitor and set appropriate connection limits
6. **Audit Logging**: Enable audit logging for production systems

## Migration from MSSQL

If you're migrating from MSSQL to PostgreSQL:

### Data Type Mappings
- `NVARCHAR` → `VARCHAR` or `TEXT`
- `UNIQUEIDENTIFIER` → `UUID`
- `DATETIME` → `TIMESTAMP`
- `BIT` → `BOOLEAN`
- `IDENTITY(1,1)` → `SERIAL` or `GENERATED ALWAYS AS IDENTITY`

### Query Differences
- **Case Sensitivity**: PostgreSQL is case-sensitive for identifiers
- **String Concatenation**: Use `||` instead of `+`
- **TOP**: Use `LIMIT` instead of `TOP`
- **Parameters**: Use `$1, $2` instead of `@param1, @param2`

### Migration Tools
1. **pg_dump/pg_restore**: For PostgreSQL to PostgreSQL
2. **pgloader**: For migrating from other databases
3. **AWS DMS**: For cloud-based migrations
4. **Manual export/import**: For small datasets

## Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS
docker ps | grep postgres  # Docker

# Check port availability
netstat -an | grep 5432
telnet localhost 5432
```

### Authentication Issues
1. **Check pg_hba.conf**: Ensure authentication method is correct
2. **User permissions**: Verify user has access to the database
3. **SSL requirements**: Check if SSL is required/configured properly

### Performance Issues
1. **Connection pooling**: Monitor active connections
2. **Query performance**: Use `EXPLAIN ANALYZE` to analyze slow queries
3. **Resource usage**: Monitor CPU, memory, and disk I/O

### Common Error Messages

#### "password authentication failed"
- Check username and password
- Verify user exists: `SELECT * FROM pg_user;`
- Check authentication method in pg_hba.conf

#### "database does not exist"
- Create the database: `CREATE DATABASE invoydb;`
- Check database name spelling

#### "connection refused"
- PostgreSQL not running
- Wrong host/port configuration
- Firewall blocking connection

## Additional Resources

### Tools
- **pgAdmin**: Web-based PostgreSQL administration
- **DBeaver**: Universal database tool
- **psql**: Command-line PostgreSQL client
- **VS Code Extensions**: PostgreSQL extension for VS Code

### Documentation
- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)

### Cloud Providers
- **Azure Database for PostgreSQL**: Managed PostgreSQL service
- **AWS RDS PostgreSQL**: Amazon's managed PostgreSQL
- **Google Cloud SQL PostgreSQL**: Google's managed PostgreSQL
- **DigitalOcean Managed Databases**: Simple managed PostgreSQL

## Quick Reference

### Connection String Formats
```bash
# Basic format
postgresql://username:password@host:port/database

# With SSL
postgresql://username:password@host:port/database?sslmode=require

# Local development
postgresql://postgres:password@localhost:5432/invoydb

# Azure with SSL
postgresql://user:pass@server.postgres.database.azure.com:5432/db?sslmode=require
```

### Common Commands
```sql
-- List databases
\l

-- Connect to database
\c invoydb

-- List tables
\dt

-- Describe table
\d table_name

-- Show table data
SELECT * FROM table_name LIMIT 10;

-- Exit psql
\q
```

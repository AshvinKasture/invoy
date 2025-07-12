# Troubleshooting Guide

Common issues and solutions for the Invoy database framework.

## ✅ RESOLVED ISSUE: PostgreSQL Authentication Failed → FIXED

**Problem:** Environment variables loading correctly, but PostgreSQL authentication was failing when using manual configuration parsing.

**Root Cause:** The PostgreSQL driver was parsing the connection string into individual config parameters, but this introduced authentication issues. Raw connection string worked fine.

**Solution:** Modified the PostgreSQL driver to use the connection string directly when available instead of parsing it into individual parameters.

**Fix Applied:** Updated `src/database/drivers/postgresql.ts` to prioritize `connectionString` over manual config.

**Status:** ✅ **COMPLETELY RESOLVED**
- Migration system working: `npm run migrate init` ✅
- Database tests passing: `npm run test-db` ✅  
- Schema deployed successfully ✅

---

## 🚨 Connection Issues

### Cannot Connect to Database

**Symptoms:**
- Connection timeout errors
- "Connection refused" messages
- Authentication failures

**PostgreSQL Solutions:**

```bash
# 1. Check if PostgreSQL is running
# Windows
services.msc # Look for PostgreSQL service

# Linux/macOS
sudo systemctl status postgresql
# or
brew services list | grep postgres

# 2. Test connection manually
psql -h localhost -p 5432 -U postgres -d invoydb

# 3. Check PostgreSQL configuration
# Edit postgresql.conf
listen_addresses = 'localhost'  # or '*' for all
port = 5432

# Edit pg_hba.conf
local   all   all                trust
host    all   all   127.0.0.1/32 md5
```

**MSSQL Solutions:**

```bash
# 1. Check if SQL Server is running
# Windows - Check services for SQL Server

# 2. Test connection
sqlcmd -S localhost -d InvoyDB -E  # Windows auth
sqlcmd -S localhost -d InvoyDB -U sa -P password  # SQL auth

# 3. Enable TCP/IP in SQL Server Configuration Manager
# Start → SQL Server Configuration Manager
# SQL Server Network Configuration → Protocols → TCP/IP → Enable
```

### Authentication Errors

**"Login failed for user":**

```sql
-- MSSQL: Create database user
USE InvoyDB;
CREATE LOGIN invoyuser WITH PASSWORD = 'SecurePass123!';
CREATE USER invoyuser FOR LOGIN invoyuser;
ALTER ROLE db_owner ADD MEMBER invoyuser;
```

**PostgreSQL "authentication failed":**

```sql
-- Create PostgreSQL user
CREATE USER invoyuser WITH PASSWORD 'SecurePass123!';
GRANT ALL PRIVILEGES ON DATABASE invoydb TO invoyuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO invoyuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO invoyuser;
```

## 🔧 Configuration Issues

### Environment Variables Not Loading

**Check .env file location:**
```bash
# .env file should be in backend/ directory
backend/
├── .env              # ← Here
├── src/
└── package.json
```

**Verify .env format:**
```env
# ✅ Correct format
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/db

# ❌ Incorrect (spaces around =)
DB_TYPE = postgres
DB_CONNECTION_STRING = postgresql://...
```

**Debug configuration loading:**
```typescript
// Add this to test configuration
import { loadDatabaseConfig } from './src/database/core/config';

console.log('Loaded config:', loadDatabaseConfig());
```

### Invalid Connection Strings

**PostgreSQL connection string issues:**

```env
# ✅ Correct formats
postgresql://user:pass@localhost:5432/db
postgresql://user:pass@host:5432/db?sslmode=require

# ❌ Common mistakes
postgres://user:pass@localhost:5432/db  # Wrong protocol
postgresql://user@localhost:5432/db     # Missing password
postgresql://localhost:5432/db          # Missing user
```

**MSSQL connection string issues:**

```env
# ✅ Correct formats
Server=localhost;Database=InvoyDB;Trusted_Connection=true;
Server=localhost,1433;Database=InvoyDB;User Id=sa;Password=pass;Encrypt=false;

# ❌ Common mistakes
Server=localhost:1433;...               # Wrong port format
Server=localhost;Database=InvoyDB;      # Missing auth
...Encrypt=true;TrustServerCertificate=false;  # SSL issues on LocalDB
```

## 🗃️ Migration Issues

### Migration Failed

**Check migration status:**
```bash
npm run migrate status
```

**Common migration failures:**

1. **Syntax Errors:**
```sql
-- ❌ MSSQL syntax in PostgreSQL
CREATE TABLE test (
    id BIGINT IDENTITY(1,1) PRIMARY KEY  -- MSSQL syntax
);

-- ✅ Correct PostgreSQL syntax
CREATE TABLE test (
    id BIGSERIAL PRIMARY KEY
);
```

2. **Permission Issues:**
```bash
# Check database user permissions
# PostgreSQL
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='schema_migrations';

# MSSQL
SELECT dp.permission_name, dp.state_desc
FROM sys.database_permissions dp
JOIN sys.database_principals pr ON dp.grantee_principal_id = pr.principal_id
WHERE pr.name = 'invoyuser';
```

3. **Foreign Key Conflicts:**
```sql
-- Check for orphaned records before adding FK
SELECT * FROM child_table c
LEFT JOIN parent_table p ON c.parent_id = p.id
WHERE p.id IS NULL;
```

### Migration Checksum Mismatch

**Symptoms:**
```bash
npm run migrate status
# Output: ❌ 002_add_profiles.sql (checksum mismatch)
```

**Solutions:**

1. **Revert file changes:**
```bash
git checkout HEAD -- src/database/migrations/002_add_profiles.sql
```

2. **Create new migration:**
```bash
npm run migrate create "fix_add_profiles"
# Make changes in the new migration file
```

3. **Force update (DANGEROUS - dev only):**
```sql
-- Update checksum in database (dev environments only!)
UPDATE schema_migrations 
SET checksum = 'new_checksum_here' 
WHERE version = '002';
```

### Cannot Drop Database Objects

**Table in use:**
```sql
-- Check for active connections
-- PostgreSQL
SELECT pid, usename, application_name, state 
FROM pg_stat_activity 
WHERE datname = 'invoydb';

-- MSSQL
SELECT session_id, login_name, program_name, status
FROM sys.dm_exec_sessions
WHERE database_id = DB_ID('InvoyDB');
```

**Foreign key constraints:**
```sql
-- Find dependent foreign keys
-- PostgreSQL
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE confrelid = 'users'::regclass;

-- MSSQL
SELECT name, OBJECT_NAME(parent_object_id) AS table_name
FROM sys.foreign_keys
WHERE referenced_object_id = OBJECT_ID('users');
```

## ⚡ Performance Issues

### Slow Queries

**Enable query logging:**
```env
DB_ENABLE_QUERY_LOGGING=true
DB_LOG_SLOW_QUERIES=500  # Log queries > 500ms
```

**Common slow query causes:**

1. **Missing indexes:**
```sql
-- PostgreSQL: Check table scans
SELECT schemaname, tablename, seq_scan, seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 1000;

-- MSSQL: Check missing indexes
SELECT 
    migs.avg_total_user_cost * (migs.avg_user_impact / 100.0) * (migs.user_seeks + migs.user_scans) AS improvement_measure,
    'CREATE INDEX [IX_' + OBJECT_NAME(mid.object_id) + '_' + REPLACE(REPLACE(REPLACE(ISNULL(mid.equality_columns,''),', ','_'),'[',''),']','') + ']'
    + ' ON ' + mid.statement + ' (' + ISNULL (mid.equality_columns,'')
    + CASE WHEN mid.equality_columns IS NOT NULL AND mid.inequality_columns IS NOT NULL THEN ',' ELSE '' END
    + ISNULL (mid.inequality_columns, '') + ')' AS create_index_statement
FROM sys.dm_db_missing_index_groups mig
INNER JOIN sys.dm_db_missing_index_group_stats migs ON migs.group_handle = mig.index_group_handle
INNER JOIN sys.dm_db_missing_index_details mid ON mig.index_handle = mid.index_handle
ORDER BY migs.avg_total_user_cost * migs.avg_user_impact * (migs.user_seeks + migs.user_scans) DESC;
```

2. **Large result sets:**
```typescript
// ❌ Don't load all records
const allUsers = await db.findAll('users');

// ✅ Use pagination
const users = await db.findAll('users', {
  limit: 50,
  offset: 0
});
```

### Connection Pool Exhaustion

**Symptoms:**
- "Cannot acquire connection" errors
- Application hanging on database calls

**Solutions:**

```env
# Increase pool size
DB_POOL_MAX=20

# Decrease idle timeout
DB_POOL_IDLE_TIMEOUT=10000

# Set acquire timeout
DB_POOL_ACQUIRE_TIMEOUT=30000
```

**Debug connection pool:**
```typescript
import { databaseManager } from './src/database';

// Check pool statistics
const stats = databaseManager.getPoolStats();
console.log('Pool stats:', {
  acquired: stats.acquired,
  available: stats.available,
  pending: stats.pending
});
```

### Memory Issues

**Large query results:**
```typescript
// ❌ Memory-intensive
const result = await connection.query('SELECT * FROM large_table');

// ✅ Stream results (PostgreSQL)
const stream = connection.query(new QueryStream('SELECT * FROM large_table'));
stream.on('data', (row) => {
  // Process row
});

// ✅ Use cursor (for very large datasets)
const cursor = connection.query('DECLARE cur CURSOR FOR SELECT * FROM large_table');
```

## 🔒 SSL/Security Issues

### SSL Connection Failures

**PostgreSQL SSL issues:**

```env
# Common SSL modes
DB_SSL_MODE=disable    # No SSL (dev only)
DB_SSL_MODE=prefer     # Try SSL, fallback to non-SSL
DB_SSL_MODE=require    # Require SSL

# Self-signed certificates
DB_CONNECTION_STRING=postgresql://user:pass@host:5432/db?sslmode=require&sslcert=client.crt&sslkey=client.key&sslrootcert=ca.crt
```

**MSSQL SSL issues:**

```env
# Local development
Encrypt=false;TrustServerCertificate=true;

# Production
Encrypt=true;TrustServerCertificate=false;

# Azure SQL
Encrypt=true;TrustServerCertificate=false;
```

### Certificate Problems

**Self-signed certificate errors:**

```bash
# PostgreSQL: Add to connection string
sslmode=require&sslcert=client.crt&sslkey=client.key&sslrootcert=ca.crt

# MSSQL: Trust server certificate for development
TrustServerCertificate=true
```

**Azure SQL certificate issues:**
```env
# For Azure SQL Database
Server=server.database.windows.net;Database=db;User Id=user;Password=pass;Encrypt=true;TrustServerCertificate=false;
```

## 🐛 Common Error Messages

### "relation does not exist" (PostgreSQL)

```sql
-- Check if table exists
SELECT tablename FROM pg_tables WHERE tablename = 'users';

-- Check current schema
SELECT current_schema();

-- List all tables
\dt
```

### "Invalid object name" (MSSQL)

```sql
-- Check if table exists
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users';

-- Check current database
SELECT DB_NAME();

-- List all tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
```

### "Connection pool timeout"

```typescript
// Increase timeouts
const config = {
  pool: {
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false
  }
};
```

### "Transaction deadlock"

```sql
-- MSSQL: Check for deadlocks
SELECT 
    session_id,
    blocking_session_id,
    wait_type,
    wait_time,
    wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id > 0;

-- PostgreSQL: Check for locks
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

## 🔧 Debug Tools

### Connection Testing

**Quick connection test:**
```typescript
// Create: test-connection.js
import { databaseManager } from './src/database';

async function testConnection() {
  try {
    await databaseManager.initialize();
    console.log('✅ Database connection successful');
    
    const health = await databaseManager.getHealth();
    console.log('Health check:', health);
    
    const stats = databaseManager.getPoolStats();
    console.log('Pool stats:', stats);
    
    await databaseManager.cleanup();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();
```

```bash
node test-connection.js
```

### Query Debugging

**Log all queries:**
```env
DB_ENABLE_QUERY_LOGGING=true
```

**Custom query logger:**
```typescript
import { getDatabase } from './src/database';

const db = getDatabase();

// Wrap query method to log
const originalQuery = db.query.bind(db);
db.query = async (sql, params) => {
  console.log('SQL:', sql);
  console.log('Params:', params);
  const start = Date.now();
  try {
    const result = await originalQuery(sql, params);
    console.log('Duration:', Date.now() - start, 'ms');
    console.log('Rows:', result.rows?.length || 0);
    return result;
  } catch (error) {
    console.error('Query failed:', error.message);
    throw error;
  }
};
```

### Health Monitoring

```typescript
// Create: health-monitor.js
import { getDatabaseHealth } from './src/database';

async function monitor() {
  setInterval(async () => {
    try {
      const health = await getDatabaseHealth();
      console.log(`[${new Date().toISOString()}] Database health:`, health);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Health check failed:`, error.message);
    }
  }, 30000); // Every 30 seconds
}

monitor();
```

## 📞 Getting Help

### Log Collection

When reporting issues, collect these logs:

```bash
# 1. Application logs
npm run dev 2>&1 | tee app.log

# 2. Database connection test
npm run test-db 2>&1 | tee db-test.log

# 3. Migration status
npm run migrate status 2>&1 | tee migration.log

# 4. Configuration dump
node -e "console.log(require('./src/database/core/config').loadDatabaseConfig())" 2>&1 | tee config.log
```

### Environment Information

```bash
# System info
node --version
npm --version
echo $DB_TYPE
echo $NODE_ENV

# Database version
# PostgreSQL
psql --version

# MSSQL
sqlcmd -Q "SELECT @@VERSION"
```

### Common Support Scenarios

1. **"It works locally but not in production"**
   - Check environment variables
   - Verify SSL settings
   - Check firewall rules
   - Compare database versions

2. **"Migrations work on PostgreSQL but fail on MSSQL"**
   - Check SQL syntax differences
   - Verify data type compatibility
   - Check constraint naming

3. **"Random connection timeouts"**
   - Monitor connection pool
   - Check network stability
   - Review timeout settings
   - Look for long-running queries

4. **"Database performance degraded after migration"**
   - Check query execution plans
   - Verify indexes were created
   - Review migration execution times
   - Check for table locks

---

Still having issues? Create an issue with detailed logs and environment information! 🆘

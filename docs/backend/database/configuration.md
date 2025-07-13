# Configuration Guide

Comprehensive configuration options for the Invoy database framework.

## 🔧 Configuration Overview

The framework supports both PostgreSQL and MSSQL databases with extensive configuration options for connection pooling, security, and performance optimization.

## 📄 Environment Variables

### Core Database Configuration

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_TYPE` | ✅ | Database type: `postgres` or `mssql` | - |
| `DB_CONNECTION_STRING` | ✅ | Full database connection string | - |
| `NODE_ENV` | ❌ | Environment: `development`, `production`, `test` | `development` |

### Connection Pool Settings

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_POOL_MIN` | ❌ | Minimum connections in pool | `0` |
| `DB_POOL_MAX` | ❌ | Maximum connections in pool | `10` |
| `DB_POOL_IDLE_TIMEOUT` | ❌ | Idle connection timeout (ms) | `30000` |
| `DB_POOL_ACQUIRE_TIMEOUT` | ❌ | Connection acquire timeout (ms) | `60000` |

### Query & Connection Timeouts

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_CONNECTION_TIMEOUT` | ❌ | Connection establishment timeout (ms) | `15000` |
| `DB_REQUEST_TIMEOUT` | ❌ | Query execution timeout (ms) | `15000` |
| `DB_COMMAND_TIMEOUT` | ❌ | Command timeout (ms) | `30000` |

### Security & SSL

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_SSL_MODE` | ❌ | SSL mode: `require`, `prefer`, `disable` | `prefer` |
| `DB_SSL_CERT_PATH` | ❌ | Path to SSL certificate file | - |
| `DB_SSL_KEY_PATH` | ❌ | Path to SSL private key file | - |
| `DB_SSL_CA_PATH` | ❌ | Path to SSL CA certificate file | - |

### Health & Monitoring

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_HEALTH_CHECK_INTERVAL` | ❌ | Health check interval (ms) | `30000` |
| `DB_ENABLE_QUERY_LOGGING` | ❌ | Enable query logging: `true`, `false` | `false` |
| `DB_LOG_SLOW_QUERIES` | ❌ | Log slow queries threshold (ms) | `1000` |

## 🐘 PostgreSQL Configuration

### Basic Connection String Examples

**Local Development:**
```env
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://postgres:password@localhost:5432/invoydb
```

**With Connection Options:**
```env
DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/invoydb?sslmode=require&pool_max=20&pool_min=2
```

**Cloud (Azure Database for PostgreSQL):**
```env
DB_CONNECTION_STRING=postgresql://invoyuser%40servername:password@servername.postgres.database.azure.com:5432/invoydb?sslmode=require
```

**Cloud (AWS RDS PostgreSQL):**
```env
DB_CONNECTION_STRING=postgresql://invoyuser:password@invoy-db.cluster-xyz.us-east-1.rds.amazonaws.com:5432/invoydb?sslmode=require
```

### Advanced PostgreSQL Configuration

**Complete Example (.env):**
```env
# Database Configuration
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://invoyuser:SecurePass123!@localhost:5432/invoydb

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_ACQUIRE_TIMEOUT=60000

# Timeouts
DB_CONNECTION_TIMEOUT=15000
DB_REQUEST_TIMEOUT=30000
DB_COMMAND_TIMEOUT=30000

# SSL Configuration
DB_SSL_MODE=require
DB_SSL_CERT_PATH=/path/to/client-cert.pem
DB_SSL_KEY_PATH=/path/to/client-key.pem
DB_SSL_CA_PATH=/path/to/ca-cert.pem

# Monitoring
DB_HEALTH_CHECK_INTERVAL=30000
DB_ENABLE_QUERY_LOGGING=true
DB_LOG_SLOW_QUERIES=500

# Environment
NODE_ENV=production
```

### PostgreSQL Connection String Parameters

You can include these parameters directly in the connection string:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `sslmode` | SSL connection mode | `require`, `prefer`, `disable` |
| `connect_timeout` | Connection timeout (seconds) | `connect_timeout=10` |
| `application_name` | Application identifier | `application_name=Invoy` |
| `pool_max` | Maximum pool connections | `pool_max=20` |
| `pool_min` | Minimum pool connections | `pool_min=2` |

**Example with Parameters:**
```env
DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/invoydb?sslmode=require&connect_timeout=10&application_name=Invoy&pool_max=20
```

## 🗃️ MSSQL Configuration

### Basic Connection String Examples

**Local Development (Windows Authentication):**
```env
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=localhost;Database=InvoyDB;Trusted_Connection=true;Encrypt=false;TrustServerCertificate=true;
```

**Local Development (SQL Authentication):**
```env
DB_CONNECTION_STRING=Server=localhost,1433;Database=InvoyDB;User Id=sa;Password=DevPass123!;Encrypt=false;TrustServerCertificate=true;
```

**Azure SQL Database:**
```env
DB_CONNECTION_STRING=Server=invoy-server.database.windows.net;Database=invoydb;User Id=invoyuser;Password=SecurePass123!;Encrypt=true;TrustServerCertificate=false;
```

**SQL Server Express LocalDB:**
```env
DB_CONNECTION_STRING=Server=(localdb)\mssqllocaldb;Database=InvoyDB;Trusted_Connection=true;
```

### Advanced MSSQL Configuration

**Complete Example (.env):**
```env
# Database Configuration
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=localhost,1433;Database=InvoyDB;User Id=invoyuser;Password=SecurePass123!;Encrypt=true;TrustServerCertificate=false;

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_ACQUIRE_TIMEOUT=60000

# Timeouts
DB_CONNECTION_TIMEOUT=15000
DB_REQUEST_TIMEOUT=30000
DB_COMMAND_TIMEOUT=30000

# Monitoring
DB_HEALTH_CHECK_INTERVAL=30000
DB_ENABLE_QUERY_LOGGING=true
DB_LOG_SLOW_QUERIES=1000

# Environment
NODE_ENV=production
```

### MSSQL Connection String Parameters

| Parameter | Description | Values/Example |
|-----------|-------------|---------------|
| `Server` | Server address and port | `localhost,1433` or `server.database.windows.net` |
| `Database` | Database name | `InvoyDB` |
| `User Id` | Username for SQL authentication | `invoyuser` |
| `Password` | Password for SQL authentication | `SecurePass123!` |
| `Trusted_Connection` | Use Windows authentication | `true` or `false` |
| `Encrypt` | Enable encryption | `true` or `false` |
| `TrustServerCertificate` | Trust server certificate | `true` or `false` |
| `ConnectTimeout` | Connection timeout (seconds) | `15` |
| `RequestTimeout` | Request timeout (seconds) | `15` |
| `Pool` | Connection pooling options | `{min: 2, max: 20}` |

## 🏭 Environment-Specific Configurations

### Development Environment

**PostgreSQL Development:**
```env
NODE_ENV=development
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://postgres:devpass@localhost:5432/invoydb_dev
DB_POOL_MIN=1
DB_POOL_MAX=5
DB_ENABLE_QUERY_LOGGING=true
DB_LOG_SLOW_QUERIES=100
DB_SSL_MODE=disable
```

**MSSQL Development:**
```env
NODE_ENV=development
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=(localdb)\mssqllocaldb;Database=InvoyDB_Dev;Trusted_Connection=true;
DB_POOL_MIN=1
DB_POOL_MAX=5
DB_ENABLE_QUERY_LOGGING=true
DB_LOG_SLOW_QUERIES=100
```

### Testing Environment

**PostgreSQL Testing:**
```env
NODE_ENV=test
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://postgres:testpass@localhost:5432/invoydb_test
DB_POOL_MIN=1
DB_POOL_MAX=3
DB_CONNECTION_TIMEOUT=5000
DB_REQUEST_TIMEOUT=5000
DB_ENABLE_QUERY_LOGGING=false
```

**MSSQL Testing:**
```env
NODE_ENV=test
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=(localdb)\mssqllocaldb;Database=InvoyDB_Test;Trusted_Connection=true;
DB_POOL_MIN=1
DB_POOL_MAX=3
DB_CONNECTION_TIMEOUT=5000
DB_REQUEST_TIMEOUT=5000
DB_ENABLE_QUERY_LOGGING=false
```

### Production Environment

**PostgreSQL Production:**
```env
NODE_ENV=production
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://invoyuser:${DB_PASSWORD}@prod-cluster.xyz.rds.amazonaws.com:5432/invoydb?sslmode=require
DB_POOL_MIN=5
DB_POOL_MAX=50
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=15000
DB_REQUEST_TIMEOUT=30000
DB_SSL_MODE=require
DB_HEALTH_CHECK_INTERVAL=30000
DB_ENABLE_QUERY_LOGGING=false
DB_LOG_SLOW_QUERIES=2000
```

**MSSQL Production:**
```env
NODE_ENV=production
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=prod-server.database.windows.net;Database=invoydb;User Id=invoyuser;Password=${DB_PASSWORD};Encrypt=true;TrustServerCertificate=false;
DB_POOL_MIN=5
DB_POOL_MAX=50
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=15000
DB_REQUEST_TIMEOUT=30000
DB_HEALTH_CHECK_INTERVAL=30000
DB_ENABLE_QUERY_LOGGING=false
DB_LOG_SLOW_QUERIES=2000
```

## 🔄 Configuration Loading

The framework loads configuration in this order (later sources override earlier ones):

1. **Default values** (built into the framework)
2. **Environment variables** (from process.env)
3. **.env file** (loaded via dotenv)
4. **Runtime configuration** (programmatic overrides)

### Programmatic Configuration

You can also configure the database programmatically:

```typescript
import { databaseManager } from './src/database';

// Override configuration at runtime
await databaseManager.initialize({
  type: 'postgres',
  connectionString: 'postgresql://...',
  pool: {
    min: 2,
    max: 20,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000
  },
  connection: {
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    requestTimeoutMillis: 15000
  },
  ssl: {
    mode: 'require',
    rejectUnauthorized: true
  },
  healthCheck: {
    enabled: true,
    intervalMs: 30000
  },
  logging: {
    enabled: true,
    slowQueryThresholdMs: 1000
  }
});
```

## 🛡️ Security Best Practices

### Environment Variables Security

1. **Never commit credentials** to version control
2. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
3. **Rotate passwords regularly** (every 90 days for production)
4. **Use environment-specific credentials** (different for dev/test/prod)

### SSL/TLS Configuration

**PostgreSQL SSL:**
```env
# Require SSL with certificate verification
DB_SSL_MODE=require
DB_CONNECTION_STRING=postgresql://user:pass@host:5432/db?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem&sslrootcert=ca-cert.pem
```

**MSSQL SSL:**
```env
# Force encryption with certificate verification
DB_CONNECTION_STRING=Server=host;Database=db;User Id=user;Password=pass;Encrypt=true;TrustServerCertificate=false;
```

### Connection Security

1. **Limit connection pool size** to prevent resource exhaustion
2. **Set connection timeouts** to prevent hanging connections
3. **Use least privilege principle** for database users
4. **Enable query logging** only in development/debugging

## 📊 Performance Tuning

### Connection Pool Optimization

**Light Load (< 100 concurrent users):**
```env
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
```

**Medium Load (100-1000 concurrent users):**
```env
DB_POOL_MIN=5
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
```

**Heavy Load (1000+ concurrent users):**
```env
DB_POOL_MIN=10
DB_POOL_MAX=50
DB_POOL_IDLE_TIMEOUT=60000
```

### Query Performance

**Development/Debug:**
```env
DB_ENABLE_QUERY_LOGGING=true
DB_LOG_SLOW_QUERIES=100  # Log queries > 100ms
```

**Production:**
```env
DB_ENABLE_QUERY_LOGGING=false
DB_LOG_SLOW_QUERIES=2000  # Log queries > 2s
```

## 🔧 Configuration Validation

The framework automatically validates configuration and provides helpful error messages:

```typescript
// Configuration validation errors
DatabaseConfigurationError: Invalid database type 'mysql'. Supported types: postgres, mssql
DatabaseConfigurationError: Connection string is required when DB_CONNECTION_STRING is not set
DatabaseConfigurationError: Pool max (5) must be greater than pool min (10)
DatabaseConfigurationError: SSL mode 'invalid' is not supported. Use: require, prefer, disable
```

## 📋 Configuration Checklist

Before deploying to production:

- [ ] ✅ Database type is set (`DB_TYPE`)
- [ ] ✅ Connection string is properly formatted
- [ ] ✅ SSL is enabled and properly configured
- [ ] ✅ Connection pool sizes are appropriate for load
- [ ] ✅ Timeouts are set for your network conditions
- [ ] ✅ Query logging is disabled in production
- [ ] ✅ Health checks are enabled
- [ ] ✅ Credentials are stored securely (not in code)
- [ ] ✅ Environment-specific databases are used
- [ ] ✅ Database user has minimal required permissions

---

Your database is now configured for optimal performance and security! 🔒

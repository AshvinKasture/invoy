# Database Architecture

The Invoy application uses a robust, multi-database architecture that supports both PostgreSQL (primary) and MSSQL (secondary) databases with a unified abstraction layer.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  (Controllers, Services, Business Logic)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Database Service Layer                       │
│  • findById(), findAll(), create(), update(), delete()     │
│  • executeQuery(), executeTransaction()                    │
│  • Database-agnostic CRUD operations                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Database Manager                             │
│  • Connection lifecycle management                         │
│  • Health monitoring and reconnection                      │
│  • Configuration management                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Database Factory                             │
│  • Connection creation based on configuration              │
│  • Database type detection and validation                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │  Configuration  │
              │   (DB_TYPE)     │
              └───────┬────────┘
                      │
        ┌─────────────▼──────────────┐
        │                           │
┌───────▼────────┐       ┌──────────▼─────────┐
│   PostgreSQL    │       │      MSSQL         │
│   Connection    │       │   Connection       │
│   (Primary)     │       │   (Secondary)      │
└────────────────┘       └────────────────────┘
```

## 🧩 Core Components

### 1. Database Manager (`DatabaseManager`)
**Central orchestrator for all database operations**

- **Singleton Pattern**: Ensures single point of database access
- **Connection Lifecycle**: Manages initialization, health checks, and cleanup
- **Error Recovery**: Automatic reconnection and retry logic
- **Monitoring**: Health status and connection pool statistics

```typescript
export class DatabaseManager {
  async initialize(): Promise<void>
  getConnection(): IDatabaseConnection
  getService(): DatabaseService
  async getHealth(): Promise<HealthCheckResult>
  async close(): Promise<void>
}
```

### 2. Database Factory (`DatabaseFactory`)
**Creates appropriate database connections based on configuration**

- **Factory Pattern**: Creates PostgreSQL or MSSQL connections
- **Configuration Validation**: Ensures valid database settings
- **Connection Testing**: Pre-validates connections before use

```typescript
export class DatabaseFactory {
  createConnection(config: DatabaseConfig): IDatabaseConnection
  validateConfig(config: DatabaseConfig): void
  async testConnection(config: DatabaseConfig): Promise<boolean>
}
```

### 3. Database Service (`DatabaseService`)
**High-level database operations abstraction**

- **Database Agnostic**: Works with both PostgreSQL and MSSQL
- **CRUD Operations**: Standard create, read, update, delete operations
- **Query Building**: Automatic parameter conversion for different databases
- **Transaction Support**: Multi-query transactions with rollback

```typescript
export class DatabaseService {
  async findById<T>(table: string, id: string | number): Promise<T | null>
  async findAll<T>(table: string, options?: QueryOptions): Promise<T[]>
  async create<T>(table: string, data: Partial<T>): Promise<T>
  async update<T>(table: string, id: string | number, data: Partial<T>): Promise<T | null>
  async delete(table: string, id: string | number): Promise<boolean>
  async executeTransaction<T>(queries: Array<{sql: string, parameters?: any}>): Promise<QueryResult<T>[]>
}
```

### 4. Database Connections
**Database-specific implementations**

#### PostgreSQL Connection (`PostgreSQLConnection`)
- **Primary Database**: Recommended for new deployments
- **Advanced Features**: JSONB, UUID, triggers, advanced indexing
- **Connection Pooling**: Built-in connection pool with retry logic
- **SSL Support**: Secure connections for production deployments

#### MSSQL Connection (`MSSQLConnection`)
- **Secondary Database**: Legacy and enterprise support
- **Windows Authentication**: Trusted connections for enterprise environments
- **Azure SQL Support**: Cloud-native Azure SQL Database integration
- **Bulk Operations**: High-performance bulk insert capabilities

## 🔄 Data Flow

### 1. Application Request
```typescript
// Business logic makes database request
const users = await userService.getAllUsers();
```

### 2. Service Layer Processing
```typescript
// DatabaseService converts to database-agnostic query
async getAllUsers() {
  return this.db.findAll('users', {
    where: 'is_active = :active',
    parameters: { active: true },
    orderBy: 'created_at DESC'
  });
}
```

### 3. Query Translation
```typescript
// PostgreSQL: SELECT * FROM users WHERE is_active = $1 ORDER BY created_at DESC
// MSSQL:      SELECT * FROM users WHERE is_active = @active ORDER BY created_at DESC
```

### 4. Connection Execution
```typescript
// Database-specific connection executes the query
const result = await connection.query(sql, parameters);
```

### 5. Result Processing
```typescript
// Service layer returns standardized results
return result.rows;
```

## 🛡️ Error Handling & Resilience

### Connection Retry Logic
- **Initial Connection**: 3 retry attempts with exponential backoff
- **Health Checks**: Continuous monitoring with automatic recovery
- **Circuit Breaker**: Prevents cascading failures

### Transaction Management
- **ACID Compliance**: Full transaction support for both databases
- **Automatic Rollback**: Failed transactions are automatically rolled back
- **Deadlock Detection**: Handles database-specific deadlock scenarios

### Error Categorization
- **Connection Errors**: Network, authentication, configuration issues
- **Query Errors**: SQL syntax, constraint violations, timeouts
- **Data Errors**: Type mismatches, validation failures

## 📊 Performance Optimization

### Connection Pooling
```typescript
pool: {
  min: 0,          // Minimum connections
  max: 10,         // Maximum connections
  idleTimeoutMillis: 30000,  // Idle timeout
}
```

### Query Optimization
- **Prepared Statements**: For frequently executed queries (PostgreSQL)
- **Bulk Operations**: Optimized batch inserts (MSSQL)
- **Query Monitoring**: Slow query detection and logging

### Caching Strategy
- **Connection Reuse**: Efficient connection pool management
- **Query Result Caching**: Application-level caching for repeated queries
- **Schema Caching**: Database schema information caching

## 🔧 Configuration Management

### Environment-Based Configuration
```typescript
// PostgreSQL (Primary)
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://user:pass@host:5432/db

// MSSQL (Secondary)
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=host;Database=db;User Id=user;Password=pass;
```

### Dynamic Configuration
- **Runtime Switching**: Change database types without code changes
- **Environment Detection**: Automatic configuration based on environment
- **Validation**: Comprehensive configuration validation

## 🚀 Deployment Patterns

### Development Environment
```typescript
// Local PostgreSQL with Docker
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://invoyuser:password@localhost:5432/invoydb

// SQL Server LocalDB
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=(localdb)\\MSSQLLocalDB;Database=InvoyDB;Trusted_Connection=true;
```

### Production Environment
```typescript
// Azure Database for PostgreSQL
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://user@server:pass@server.postgres.database.azure.com:5432/db?sslmode=require

// Azure SQL Database
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=server.database.windows.net;Database=db;User Id=user;Password=pass;Encrypt=true;
```

## 🔍 Monitoring & Observability

### Health Checks
```typescript
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  type: DatabaseType;
  latency?: number;
  error?: string;
  timestamp: Date;
}
```

### Metrics Collection
- **Connection Pool Statistics**: Active, idle, waiting connections
- **Query Performance**: Execution times, slow query detection
- **Error Rates**: Connection failures, query errors, timeouts

### Logging
- **Structured Logging**: JSON-formatted logs for easier parsing
- **Error Context**: Full error context including query and parameters
- **Performance Metrics**: Query execution times and optimization suggestions

---

This architecture provides a solid foundation for scalable, maintainable database operations while supporting both PostgreSQL and MSSQL databases with minimal application code changes.

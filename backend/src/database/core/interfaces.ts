/**
 * Core database interfaces and types for the Invoy application
 * Provides a unified abstraction layer supporting PostgreSQL (primary) and MSSQL (secondary)
 */

export type DatabaseType = 'postgres' | 'mssql';

/**
 * Base database configuration interface
 */
export interface BaseDatabaseConfig {
  type: DatabaseType;
  connectionTimeout?: number;
  requestTimeout?: number;
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
  };
}

/**
 * PostgreSQL specific configuration (Primary database)
 */
export interface PostgreSQLConfig extends BaseDatabaseConfig {
  type: 'postgres';
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | object;
  connectionString?: string;
}

/**
 * MSSQL specific configuration (Secondary database)
 */
export interface MSSQLConfig extends BaseDatabaseConfig {
  type: 'mssql';
  server: string;
  port?: number;
  database: string;
  authentication: {
    type: 'sql' | 'ntlm';
    options: {
      userName?: string;
      password?: string;
    };
  };
  options: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
    enableArithAbort?: boolean;
    trustedConnection?: boolean;
  };
}

export type DatabaseConfig = PostgreSQLConfig | MSSQLConfig;

/**
 * Query result interface for consistent return types
 */
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  fields?: any[];
}

/**
 * Transaction interface for database operations
 */
export interface DatabaseTransaction {
  query<T = any>(sql: string, parameters?: any): Promise<QueryResult<T>>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  type: DatabaseType;
  latency?: number;
  error?: string;
  timestamp: Date;
}

/**
 * Base database connection interface
 * All database implementations must implement this interface
 */
export interface IDatabaseConnection {
  /**
   * Connect to the database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  disconnect(): Promise<void>;

  /**
   * Test database connection
   */
  testConnection(): Promise<boolean>;

  /**
   * Execute a query with parameters
   */
  query<T = any>(sql: string, parameters?: any): Promise<QueryResult<T>>;

  /**
   * Begin a database transaction
   */
  beginTransaction(): Promise<DatabaseTransaction>;

  /**
   * Execute multiple queries in a transaction
   */
  executeTransaction<T = any>(
    queries: Array<{ sql: string; parameters?: any }>
  ): Promise<QueryResult<T>[]>;

  /**
   * Get database health status
   */
  getHealth(): Promise<HealthCheckResult>;

  /**
   * Get database type
   */
  getType(): DatabaseType;

  /**
   * Get current configuration
   */
  getConfig(): DatabaseConfig;
}

/**
 * Database factory interface for creating connections
 */
export interface IDatabaseFactory {
  createConnection(config: DatabaseConfig): IDatabaseConnection;
  validateConfig(config: DatabaseConfig): void;
}

/**
 * Query builder interface for database-agnostic queries
 */
export interface IQueryBuilder {
  select(columns?: string[]): this;
  from(table: string): this;
  where(condition: string, parameters?: any): this;
  orderBy(column: string, direction?: 'ASC' | 'DESC'): this;
  limit(count: number): this;
  offset(count: number): this;
  build(): { sql: string; parameters: any };
}

/**
 * Migration interface for schema management
 */
export interface IMigration {
  name: string;
  version: string;
  up(): Promise<void>;
  down(): Promise<void>;
}

/**
 * Database service interface for business logic
 */
export interface IDatabaseService {
  findById<T>(table: string, id: string | number, idColumn?: string): Promise<T | null>;
  findAll<T>(table: string, options?: QueryOptions): Promise<T[]>;
  create<T>(table: string, data: Partial<T>): Promise<T>;
  update<T>(table: string, id: string | number, data: Partial<T>, idColumn?: string): Promise<T | null>;
  delete(table: string, id: string | number, idColumn?: string): Promise<boolean>;
  count(table: string, whereClause?: string, parameters?: any): Promise<number>;
  exists(table: string, whereClause: string, parameters?: any): Promise<boolean>;
}

/**
 * Query options for database operations
 */
export interface QueryOptions {
  where?: string;
  parameters?: any;
  orderBy?: string;
  limit?: number;
  offset?: number;
  select?: string[];
}

/**
 * Connection pool statistics
 */
export interface PoolStats {
  total: number;
  idle: number;
  waiting: number;
  acquired: number;
}

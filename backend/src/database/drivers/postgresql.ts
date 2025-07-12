/**
 * PostgreSQL database connection implementation (Primary database)
 * Provides robust connection management with retry logic and health monitoring
 */

import { Pool, Client, PoolClient, QueryResult as PgQueryResult } from 'pg';
import { 
  IDatabaseConnection, 
  PostgreSQLConfig, 
  DatabaseTransaction, 
  HealthCheckResult,
  QueryResult,
  DatabaseType
} from '../core/interfaces';

/**
 * PostgreSQL transaction implementation
 */
class PostgreSQLTransaction implements DatabaseTransaction {
  constructor(private client: PoolClient) {}

  async query<T = any>(sql: string, parameters?: any): Promise<QueryResult<T>> {
    const result = await this.client.query(sql, Array.isArray(parameters) ? parameters : []);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount || 0,
      fields: result.fields,
    };
  }

  async commit(): Promise<void> {
    await this.client.query('COMMIT');
    this.client.release();
  }

  async rollback(): Promise<void> {
    await this.client.query('ROLLBACK');
    this.client.release();
  }
}

/**
 * PostgreSQL connection class with advanced features
 */
export class PostgreSQLConnection implements IDatabaseConnection {
  private pool: Pool | null = null;
  private isConnected = false;
  private readonly retryAttempts = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(private config: PostgreSQLConfig) {
    this.validateConfig();
  }

  /**
   * Validate PostgreSQL configuration
   */
  private validateConfig(): void {
    if (!this.config.host || !this.config.database || !this.config.user || !this.config.password) {
      throw new Error('PostgreSQL configuration is incomplete');
    }
  }

  /**
   * Connect to PostgreSQL database with retry logic
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔄 Attempting PostgreSQL connection (${attempt}/${this.retryAttempts})...`);
        
        // Use connection string if available (more reliable)
        const poolConfig = this.config.connectionString ? {
          connectionString: this.config.connectionString,
          ssl: this.config.ssl,
          connectionTimeoutMillis: this.config.connectionTimeout || 15000,
          idleTimeoutMillis: this.config.pool?.idleTimeoutMillis || 30000,
          max: this.config.pool?.max || 10,
          min: this.config.pool?.min || 0,
          statement_timeout: this.config.requestTimeout || 15000,
          query_timeout: this.config.requestTimeout || 15000,
          application_name: 'Invoy-Backend',
        } : {
          host: this.config.host,
          port: this.config.port,
          database: this.config.database,
          user: this.config.user,
          password: this.config.password,
          ssl: this.config.ssl,
          connectionTimeoutMillis: this.config.connectionTimeout || 15000,
          idleTimeoutMillis: this.config.pool?.idleTimeoutMillis || 30000,
          max: this.config.pool?.max || 10,
          min: this.config.pool?.min || 0,
          statement_timeout: this.config.requestTimeout || 15000,
          query_timeout: this.config.requestTimeout || 15000,
          application_name: 'Invoy-Backend',
        };

        this.pool = new Pool(poolConfig);

        // Test the connection
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();

        this.isConnected = true;
        console.log('✅ PostgreSQL connection established successfully');
        
        // Set up error handlers
        this.setupErrorHandlers();
        return;

      } catch (error) {
        lastError = error as Error;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ PostgreSQL connection attempt ${attempt} failed:`, errorMessage);
        
        if (this.pool) {
          await this.pool.end();
          this.pool = null;
        }

        if (attempt < this.retryAttempts) {
          console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    throw new Error(`Failed to connect to PostgreSQL after ${this.retryAttempts} attempts: ${lastError?.message}`);
  }

  /**
   * Set up error handlers for the connection pool
   */
  private setupErrorHandlers(): void {
    if (!this.pool) return;

    this.pool.on('error', (err) => {
      console.error('🔥 PostgreSQL pool error:', err);
      this.isConnected = false;
    });

    this.pool.on('connect', () => {
      console.log('🔗 New PostgreSQL client connected');
    });

    this.pool.on('remove', () => {
      console.log('🗑️ PostgreSQL client removed from pool');
    });
  }

  /**
   * Disconnect from PostgreSQL database
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      console.log('🔌 Closing PostgreSQL connections...');
      await this.pool.end();
      this.pool = null;
      this.isConnected = false;
      console.log('✅ PostgreSQL connections closed');
    }
  }

  /**
   * Test database connection health
   */
  async testConnection(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const startTime = Date.now();
      const client = await this.pool.connect();
      await client.query('SELECT 1 as health_check');
      client.release();
      
      const latency = Date.now() - startTime;
      console.log(`💓 PostgreSQL health check passed (${latency}ms)`);
      return true;
    } catch (error) {
      console.error('💔 PostgreSQL health check failed:', error);
      return false;
    }
  }

  /**
   * Execute a query with parameters
   */
  async query<T = any>(sql: string, parameters?: any): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('PostgreSQL connection not established');
    }

    const startTime = Date.now();
    
    try {
      // Convert named parameters to positional if needed
      const { processedSql, processedParams } = this.processParameters(sql, parameters);
      
      const result: PgQueryResult = await this.pool.query(processedSql, processedParams);
      
      const executionTime = Date.now() - startTime;
      
      if (executionTime > 1000) {
        console.warn(`⚠️ Slow PostgreSQL query detected (${executionTime}ms):`, processedSql.substring(0, 100));
      }

      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || 0,
        fields: result.fields,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ PostgreSQL query failed (${executionTime}ms):`, errorMessage);
      console.error('Query:', sql);
      console.error('Parameters:', parameters);
      throw error;
    }
  }

  /**
   * Begin a database transaction
   */
  async beginTransaction(): Promise<DatabaseTransaction> {
    if (!this.pool) {
      throw new Error('PostgreSQL connection not established');
    }

    const client = await this.pool.connect();
    await client.query('BEGIN');
    return new PostgreSQLTransaction(client);
  }

  /**
   * Execute multiple queries in a transaction
   */
  async executeTransaction<T = any>(
    queries: Array<{ sql: string; parameters?: any }>
  ): Promise<QueryResult<T>[]> {
    const transaction = await this.beginTransaction();
    const results: QueryResult<T>[] = [];

    try {
      for (const query of queries) {
        const result = await transaction.query<T>(query.sql, query.parameters);
        results.push(result);
      }

      await transaction.commit();
      return results;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get database health status
   */
  async getHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await this.testConnection();
      const latency = Date.now() - startTime;

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        type: 'postgres',
        latency,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        type: 'postgres',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get database type
   */
  getType(): DatabaseType {
    return 'postgres';
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): PostgreSQLConfig {
    return {
      ...this.config,
      password: '***', // Hide password for security
    };
  }

  /**
   * Process parameters for PostgreSQL positional format
   */
  private processParameters(sql: string, parameters?: any): { processedSql: string; processedParams: any[] } {
    if (!parameters) {
      return { processedSql: sql, processedParams: [] };
    }

    // If parameters is already an array, return as-is
    if (Array.isArray(parameters)) {
      return { processedSql: sql, processedParams: parameters };
    }

    // Convert named parameters to positional
    let processedSql = sql;
    const processedParams: any[] = [];
    let paramIndex = 1;

    Object.entries(parameters).forEach(([key, value]) => {
      processedSql = processedSql.replace(
        new RegExp(`@${key}\\b`, 'g'),
        `$${paramIndex}`
      );
      processedParams.push(value);
      paramIndex++;
    });

    return { processedSql, processedParams };
  }

  /**
   * Get connection pool statistics
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      acquired: this.pool.totalCount - this.pool.idleCount,
    };
  }

  /**
   * Execute a prepared statement (PostgreSQL-specific optimization)
   */
  async executePrepared<T = any>(name: string, sql: string, parameters?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('PostgreSQL connection not established');
    }

    const client = await this.pool.connect();
    
    try {
      // Prepare the statement
      await client.query(`PREPARE ${name} AS ${sql}`);
      
      // Execute the prepared statement
      const result = await client.query(`EXECUTE ${name}`, parameters);
      
      // Deallocate the prepared statement
      await client.query(`DEALLOCATE ${name}`);
      
      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || 0,
        fields: result.fields,
      };
    } finally {
      client.release();
    }
  }
}

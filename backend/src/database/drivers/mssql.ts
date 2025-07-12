/**
 * MSSQL database connection implementation (Secondary database)
 * Provides robust connection management with retry logic and health monitoring
 */

import * as sql from 'mssql';
import { 
  IDatabaseConnection, 
  MSSQLConfig, 
  DatabaseTransaction, 
  HealthCheckResult,
  QueryResult,
  DatabaseType
} from '../core/interfaces';

/**
 * MSSQL transaction implementation
 */
class MSSQLTransaction implements DatabaseTransaction {
  constructor(private transaction: sql.Transaction) {}

  async query<T = any>(sqlQuery: string, parameters?: any): Promise<QueryResult<T>> {
    const request = this.transaction.request();
    
    // Add parameters if provided
    if (parameters) {
      Object.entries(parameters).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    const result = await request.query(sqlQuery);
    
    return {
      rows: result.recordset as T[],
      rowCount: result.rowsAffected[0] || 0,
      fields: result.recordset ? Object.keys(result.recordset[0] || {}) : [],
    };
  }

  async commit(): Promise<void> {
    await this.transaction.commit();
  }

  async rollback(): Promise<void> {
    await this.transaction.rollback();
  }
}

/**
 * MSSQL connection class with advanced features
 */
export class MSSQLConnection implements IDatabaseConnection {
  private pool: sql.ConnectionPool | null = null;
  private isConnected = false;
  private readonly retryAttempts = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(private config: MSSQLConfig) {
    this.validateConfig();
  }

  /**
   * Validate MSSQL configuration
   */
  private validateConfig(): void {
    if (!this.config.server || !this.config.database) {
      throw new Error('MSSQL configuration is incomplete');
    }

    if (!this.config.options.trustedConnection && 
        (!this.config.authentication.options?.userName || 
         !this.config.authentication.options?.password)) {
      throw new Error('MSSQL authentication credentials are required when not using trusted connection');
    }
  }

  /**
   * Connect to MSSQL database with retry logic
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`🔄 Attempting MSSQL connection (${attempt}/${this.retryAttempts})...`);
        
        const poolConfig: sql.config = {
          server: this.config.server,
          port: this.config.port || 1433,
          database: this.config.database,
          user: this.config.authentication.options?.userName,
          password: this.config.authentication.options?.password,
          pool: {
            max: this.config.pool?.max || 10,
            min: this.config.pool?.min || 0,
            idleTimeoutMillis: this.config.pool?.idleTimeoutMillis || 30000,
          },
          options: {
            encrypt: this.config.options.encrypt || false,
            trustServerCertificate: this.config.options.trustServerCertificate || false,
            enableArithAbort: this.config.options.enableArithAbort || true,
            trustedConnection: this.config.options.trustedConnection || false,
          },
          connectionTimeout: this.config.connectionTimeout || 15000,
          requestTimeout: this.config.requestTimeout || 15000,
          // Advanced MSSQL-specific options
          parseJSON: true,
          arrayRowMode: false,
        };

        this.pool = new sql.ConnectionPool(poolConfig);

        // Set up error handlers before connecting
        this.setupErrorHandlers();

        // Connect to the pool
        await this.pool.connect();

        // Test the connection
        const request = this.pool.request();
        await request.query('SELECT 1 as test');

        this.isConnected = true;
        console.log('✅ MSSQL connection established successfully');
        return;

      } catch (error) {
        lastError = error as Error;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ MSSQL connection attempt ${attempt} failed:`, errorMessage);
        
        if (this.pool) {
          try {
            await this.pool.close();
          } catch (closeError) {
            console.error('Error closing failed pool:', closeError);
          }
          this.pool = null;
        }

        if (attempt < this.retryAttempts) {
          console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        }
      }
    }

    throw new Error(`Failed to connect to MSSQL after ${this.retryAttempts} attempts: ${lastError?.message}`);
  }

  /**
   * Set up error handlers for the connection pool
   */
  private setupErrorHandlers(): void {
    if (!this.pool) return;

    this.pool.on('error', (err) => {
      console.error('🔥 MSSQL pool error:', err);
      this.isConnected = false;
    });

    this.pool.on('connect', () => {
      console.log('🔗 New MSSQL client connected');
    });

    this.pool.on('close', () => {
      console.log('🗑️ MSSQL connection closed');
      this.isConnected = false;
    });
  }

  /**
   * Disconnect from MSSQL database
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      console.log('🔌 Closing MSSQL connections...');
      await this.pool.close();
      this.pool = null;
      this.isConnected = false;
      console.log('✅ MSSQL connections closed');
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
      const request = this.pool.request();
      await request.query('SELECT 1 as health_check');
      
      const latency = Date.now() - startTime;
      console.log(`💓 MSSQL health check passed (${latency}ms)`);
      return true;
    } catch (error) {
      console.error('💔 MSSQL health check failed:', error);
      return false;
    }
  }

  /**
   * Execute a query with parameters
   */
  async query<T = any>(sqlQuery: string, parameters?: any): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('MSSQL connection not established');
    }

    const startTime = Date.now();
    
    try {
      const request = this.pool.request();
      
      // Add parameters if provided
      if (parameters) {
        if (Array.isArray(parameters)) {
          // Handle positional parameters by converting to named
          parameters.forEach((value, index) => {
            request.input(`param${index + 1}`, value);
          });
        } else {
          // Handle named parameters
          Object.entries(parameters).forEach(([key, value]) => {
            request.input(key, value);
          });
        }
      }

      const result = await request.query(sqlQuery);
      
      const executionTime = Date.now() - startTime;
      
      if (executionTime > 1000) {
        console.warn(`⚠️ Slow MSSQL query detected (${executionTime}ms):`, sqlQuery.substring(0, 100));
      }

      return {
        rows: result.recordset as T[],
        rowCount: result.rowsAffected[0] || 0,
        fields: result.recordset ? Object.keys(result.recordset[0] || {}) : [],
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ MSSQL query failed (${executionTime}ms):`, errorMessage);
      console.error('Query:', sqlQuery);
      console.error('Parameters:', parameters);
      throw error;
    }
  }

  /**
   * Begin a database transaction
   */
  async beginTransaction(): Promise<DatabaseTransaction> {
    if (!this.pool) {
      throw new Error('MSSQL connection not established');
    }

    const transaction = new sql.Transaction(this.pool);
    await transaction.begin();
    return new MSSQLTransaction(transaction);
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
        type: 'mssql',
        latency,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        type: 'mssql',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get database type
   */
  getType(): DatabaseType {
    return 'mssql';
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): MSSQLConfig {
    return {
      ...this.config,
      authentication: {
        ...this.config.authentication,
        options: {
          ...this.config.authentication.options,
          password: '***', // Hide password for security
        },
      },
    };
  }

  /**
   * Execute a stored procedure (MSSQL-specific feature)
   */
  async executeProcedure<T = any>(
    procedureName: string, 
    parameters?: Record<string, any>
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('MSSQL connection not established');
    }

    const startTime = Date.now();
    
    try {
      const request = this.pool.request();
      
      // Add parameters if provided
      if (parameters) {
        Object.entries(parameters).forEach(([key, value]) => {
          request.input(key, value);
        });
      }

      const result = await request.execute(procedureName);
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ MSSQL stored procedure '${procedureName}' executed (${executionTime}ms)`);

      return {
        rows: result.recordset as T[],
        rowCount: result.rowsAffected[0] || 0,
        fields: result.recordset ? Object.keys(result.recordset[0] || {}) : [],
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ MSSQL stored procedure '${procedureName}' failed (${executionTime}ms):`, errorMessage);
      throw error;
    }
  }

  /**
   * Get connection pool statistics
   */
  getPoolStats() {
    if (!this.pool) {
      return null;
    }

    return {
      total: this.pool.size,
      idle: this.pool.available,
      waiting: this.pool.pending,
      acquired: this.pool.size - this.pool.available,
    };
  }

  /**
   * Execute bulk insert operation (MSSQL-specific optimization)
   */
  async bulkInsert<T = any>(
    tableName: string, 
    data: T[], 
    options?: sql.IBulkOptions
  ): Promise<void> {
    if (!this.pool) {
      throw new Error('MSSQL connection not established');
    }

    const table = new sql.Table(tableName);
    
    if (data.length === 0) {
      throw new Error('No data provided for bulk insert');
    }

    // Define columns based on first record
    const firstRecord = data[0] as any;
    Object.keys(firstRecord).forEach(key => {
      const value = firstRecord[key];
      
      // Auto-detect SQL type based on value with proper typing
      if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          table.columns.add(key, sql.Int);
        } else {
          table.columns.add(key, sql.Decimal(18, 2));
        }
      } else if (typeof value === 'boolean') {
        table.columns.add(key, sql.Bit);
      } else if (value instanceof Date) {
        table.columns.add(key, sql.DateTime2(7));
      } else if (typeof value === 'string' && value.length > 4000) {
        table.columns.add(key, sql.NText);
      } else {
        table.columns.add(key, sql.NVarChar(sql.MAX));
      }
    });

    // Add rows with proper type casting
    data.forEach(record => {
      const values = Object.values(record as any).map(value => {
        // Handle null/undefined values
        if (value === null || value === undefined) {
          return null;
        }
        // Ensure proper types for MSSQL
        if (typeof value === 'string' || typeof value === 'number' || 
            typeof value === 'boolean' || value instanceof Date) {
          return value;
        }
        // Convert other types to string
        return String(value);
      });
      table.rows.add(...values);
    });

    const request = this.pool.request();
    await request.bulk(table, options || {});
    
    console.log(`✅ MSSQL bulk insert completed: ${data.length} records inserted into ${tableName}`);
  }
}

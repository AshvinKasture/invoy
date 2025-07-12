import sql from 'mssql';
import { Pool, PoolClient, PoolConfig } from 'pg';

/**
 * Base database configuration interface
 */
export interface BaseConfig {
  type: 'mssql' | 'postgres';
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
  options: {
    connectTimeout: number;
    requestTimeout: number;
  };
}

/**
 * MSSQL database configuration interface
 */
export interface MSSQLConfig extends BaseConfig {
  type: 'mssql';
  server: string;
  database: string;
  port: number;
  authentication: {
    type: 'sql';
    options: {
      userName: string;
      password: string;
    };
  };
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    connectTimeout: number;
    requestTimeout: number;
    enableArithAbort: boolean;
    trustedConnection?: boolean;
  };
}

/**
 * PostgreSQL database configuration interface
 */
export interface PostgreSQLConfig extends BaseConfig {
  type: 'postgres';
  host: string;
  database: string;
  port: number;
  user: string;
  password: string;
  ssl: boolean;
}

/**
 * Union type for all database configurations
 */
export type DatabaseConfig = MSSQLConfig | PostgreSQLConfig;

/**
 * Abstract base database connection class
 */
export abstract class BaseDatabaseConnection {
  protected config: DatabaseConfig;
  protected isConnected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  abstract connect(retryAttempts?: number): Promise<any>;
  abstract close(): Promise<void>;
  abstract query<T = any>(queryText: string, parameters?: Record<string, any>): Promise<T[]>;
  abstract isConnectionActive(): boolean;
  abstract testConnection(): Promise<boolean>;

  /**
   * Sleep utility for retry delays
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * MSSQL database connection class with retry logic and error handling
 */
export class MSSQLConnection extends BaseDatabaseConnection {
  private pool: sql.ConnectionPool | null = null;
  private connectionPromise: Promise<sql.ConnectionPool> | null = null;

  constructor(config: MSSQLConfig) {
    super(config);
  }

  /**
   * Connect to MSSQL database with retry logic
   */
  public async connect(retryAttempts: number = 3): Promise<sql.ConnectionPool> {
    // Return existing connection if already connected
    if (this.isConnected && this.pool) {
      return this.pool;
    }

    // Return existing connection promise if connection is in progress
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.establishConnection(retryAttempts);
    return this.connectionPromise;
  }

  /**
   * Establish MSSQL database connection with exponential backoff retry
   */
  private async establishConnection(retryAttempts: number): Promise<sql.ConnectionPool> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`🔄 Attempting MSSQL database connection (${attempt}/${retryAttempts})...`);
        
        const sqlConfig = await this.buildSqlConfig();
        this.pool = new sql.ConnectionPool(sqlConfig);
        
        // Add event listeners for connection monitoring
        this.pool.on('connect', () => {
          console.log('✅ MSSQL Database connected successfully');
          this.isConnected = true;
        });

        this.pool.on('close', () => {
          console.log('⚠️ MSSQL Database connection closed');
          this.isConnected = false;
        });

        this.pool.on('error', (err) => {
          console.error('❌ MSSQL Database connection error:', err);
          this.isConnected = false;
        });

        await this.pool.connect();
        return this.pool;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ MSSQL Database connection attempt ${attempt} failed:`, error);
        
        if (attempt < retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    this.connectionPromise = null;
    throw new Error(`Failed to connect to MSSQL database after ${retryAttempts} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Build SQL Server configuration based on authentication type
   */
  private async buildSqlConfig(): Promise<sql.config> {
    const mssqlConfig = this.config as MSSQLConfig;
    
    const baseConfig: sql.config = {
      server: mssqlConfig.server,
      database: mssqlConfig.database,
      port: mssqlConfig.port,
      pool: {
        max: mssqlConfig.pool.max,
        min: mssqlConfig.pool.min,
        idleTimeoutMillis: mssqlConfig.pool.idleTimeoutMillis,
      },
      options: {
        encrypt: mssqlConfig.options.encrypt,
        trustServerCertificate: mssqlConfig.options.trustServerCertificate,
        connectTimeout: mssqlConfig.options.connectTimeout,
        requestTimeout: mssqlConfig.options.requestTimeout,
        enableArithAbort: mssqlConfig.options.enableArithAbort,
      },
    };

    // Check if using Windows Authentication (Trusted Connection)
    if (mssqlConfig.options.trustedConnection) {
      return {
        ...baseConfig,
        authentication: {
          type: 'ntlm',
          options: {
            domain: '', // Use current Windows domain
            userName: '', // Use current Windows user
            password: '',
          },
        },
      };
    } else {
      return {
        ...baseConfig,
        user: mssqlConfig.authentication.options.userName,
        password: mssqlConfig.authentication.options.password,
      };
    }
  }

  /**
   * Execute a query with proper error handling and logging
   */
  public async query<T = any>(queryText: string, parameters?: Record<string, any>): Promise<T[]> {
    try {
      const pool = await this.connect();
      const request = pool.request();

      // Add parameters if provided
      if (parameters) {
        Object.entries(parameters).forEach(([key, value]) => {
          request.input(key, value);
        });
      }

      console.log('🔍 Executing MSSQL query:', queryText.substring(0, 100) + (queryText.length > 100 ? '...' : ''));
      const result = await request.query(queryText);
      console.log(`✅ MSSQL Query executed successfully, returned ${result.recordset?.length || 0} rows`);
      
      return result.recordset || [];
    } catch (error) {
      console.error('❌ MSSQL Query execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute a stored procedure
   */
  public async executeProcedure<T = any>(procedureName: string, parameters?: Record<string, any>): Promise<sql.IProcedureResult<T>> {
    try {
      const pool = await this.connect();
      const request = pool.request();

      // Add parameters if provided
      if (parameters) {
        Object.entries(parameters).forEach(([key, value]) => {
          request.input(key, value);
        });
      }

      console.log('🔍 Executing MSSQL procedure:', procedureName);
      const result = await request.execute(procedureName);
      console.log(`✅ MSSQL Procedure executed successfully`);
      
      return result;
    } catch (error) {
      console.error('❌ MSSQL Procedure execution failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
        this.isConnected = false;
        this.connectionPromise = null;
        console.log('✅ MSSQL Database connection closed successfully');
      }
    } catch (error) {
      console.error('❌ Error closing MSSQL database connection:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public isConnectionActive(): boolean {
    return this.isConnected && this.pool !== null;
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('❌ MSSQL Database connection test failed:', error);
      return false;
    }
  }
}

/**
 * PostgreSQL database connection class with retry logic and error handling
 */
export class PostgreSQLConnection extends BaseDatabaseConnection {
  private pool: Pool | null = null;
  private connectionPromise: Promise<Pool> | null = null;

  constructor(config: PostgreSQLConfig) {
    super(config);
  }

  /**
   * Connect to PostgreSQL database with retry logic
   */
  public async connect(retryAttempts: number = 3): Promise<Pool> {
    // Return existing connection if already connected
    if (this.isConnected && this.pool) {
      return this.pool;
    }

    // Return existing connection promise if connection is in progress
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.establishConnection(retryAttempts);
    return this.connectionPromise;
  }

  /**
   * Establish PostgreSQL database connection with exponential backoff retry
   */
  private async establishConnection(retryAttempts: number): Promise<Pool> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`🔄 Attempting PostgreSQL database connection (${attempt}/${retryAttempts})...`);
        
        const pgConfig = this.buildPgConfig();
        this.pool = new Pool(pgConfig);
        
        // Add event listeners for connection monitoring
        this.pool.on('connect', () => {
          console.log('✅ PostgreSQL Database connected successfully');
          this.isConnected = true;
        });

        this.pool.on('remove', () => {
          console.log('⚠️ PostgreSQL Database connection closed');
          this.isConnected = false;
        });

        this.pool.on('error', (err) => {
          console.error('❌ PostgreSQL Database connection error:', err);
          this.isConnected = false;
        });

        // Test the connection
        const client = await this.pool.connect();
        client.release();
        this.isConnected = true;
        
        return this.pool;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ PostgreSQL Database connection attempt ${attempt} failed:`, error);
        
        if (attempt < retryAttempts) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    this.connectionPromise = null;
    throw new Error(`Failed to connect to PostgreSQL database after ${retryAttempts} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Build PostgreSQL configuration
   */
  private buildPgConfig(): PoolConfig {
    const pgConfig = this.config as PostgreSQLConfig;
    
    return {
      host: pgConfig.host,
      port: pgConfig.port,
      database: pgConfig.database,
      user: pgConfig.user,
      password: pgConfig.password,
      ssl: pgConfig.ssl,
      max: pgConfig.pool.max,
      min: pgConfig.pool.min,
      idleTimeoutMillis: pgConfig.pool.idleTimeoutMillis,
      connectionTimeoutMillis: pgConfig.options.connectTimeout,
      query_timeout: pgConfig.options.requestTimeout,
    };
  }

  /**
   * Execute a query with proper error handling and logging
   */
  public async query<T = any>(queryText: string, parameters?: Record<string, any>): Promise<T[]> {
    try {
      const pool = await this.connect();
      
      // Convert named parameters to positional parameters for PostgreSQL
      let processedQuery = queryText;
      const values: any[] = [];
      
      if (parameters) {
        let paramIndex = 1;
        Object.entries(parameters).forEach(([key, value]) => {
          // Replace @paramName or :paramName with $1, $2, etc.
          processedQuery = processedQuery.replace(
            new RegExp(`[@:]${key}\\b`, 'g'),
            `$${paramIndex}`
          );
          values.push(value);
          paramIndex++;
        });
      }

      console.log('🔍 Executing PostgreSQL query:', processedQuery.substring(0, 100) + (processedQuery.length > 100 ? '...' : ''));
      const result = await pool.query(processedQuery, values);
      console.log(`✅ PostgreSQL Query executed successfully, returned ${result.rows?.length || 0} rows`);
      
      return result.rows || [];
    } catch (error) {
      console.error('❌ PostgreSQL Query execution failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
        this.isConnected = false;
        this.connectionPromise = null;
        console.log('✅ PostgreSQL Database connection closed successfully');
      }
    } catch (error) {
      console.error('❌ Error closing PostgreSQL database connection:', error);
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public isConnectionActive(): boolean {
    return this.isConnected && this.pool !== null;
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('❌ PostgreSQL Database connection test failed:', error);
      return false;
    }
  }
}

/**
 * Database connection factory
 */
export class DatabaseConnectionFactory {
  private static instance: BaseDatabaseConnection | null = null;

  /**
   * Get singleton instance of database connection based on configuration
   */
  public static getInstance(config?: DatabaseConfig): BaseDatabaseConnection {
    if (!DatabaseConnectionFactory.instance) {
      if (!config) {
        throw new Error('Database configuration is required for the first initialization');
      }
      
      if (config.type === 'mssql') {
        DatabaseConnectionFactory.instance = new MSSQLConnection(config as MSSQLConfig);
      } else if (config.type === 'postgres') {
        DatabaseConnectionFactory.instance = new PostgreSQLConnection(config as PostgreSQLConfig);
      } else {
        throw new Error(`Unsupported database type: ${(config as any).type}`);
      }
    }
    return DatabaseConnectionFactory.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    DatabaseConnectionFactory.instance = null;
  }
}

// Export SQL types for use in other modules
export { sql };
export default DatabaseConnectionFactory;

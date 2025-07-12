/**
 * Database factory for creating database connections
 * Supports PostgreSQL (primary) and MSSQL (secondary) databases
 */

import { 
  IDatabaseFactory, 
  IDatabaseConnection, 
  DatabaseConfig, 
  PostgreSQLConfig, 
  MSSQLConfig 
} from '../core/interfaces';
import { PostgreSQLConnection } from './postgresql';
import { MSSQLConnection } from './mssql';

/**
 * Factory class for creating database connections
 */
export class DatabaseFactory implements IDatabaseFactory {
  /**
   * Create a database connection based on configuration
   */
  createConnection(config: DatabaseConfig): IDatabaseConnection {
    this.validateConfig(config);

    switch (config.type) {
      case 'postgres':
        console.log('🐘 Creating PostgreSQL connection (Primary database)');
        return new PostgreSQLConnection(config as PostgreSQLConfig);
      
      case 'mssql':
        console.log('🏢 Creating MSSQL connection (Secondary database)');
        return new MSSQLConnection(config as MSSQLConfig);
      
      default:
        throw new Error(`Unsupported database type: ${(config as any).type}`);
    }
  }

  /**
   * Validate database configuration
   */
  validateConfig(config: DatabaseConfig): void {
    if (!config) {
      throw new Error('Database configuration is required');
    }

    if (!config.type) {
      throw new Error('Database type is required');
    }

    if (!['postgres', 'mssql'].includes(config.type)) {
      throw new Error(`Invalid database type: ${config.type}. Supported types: postgres, mssql`);
    }

    // Type-specific validation
    if (config.type === 'postgres') {
      this.validatePostgreSQLConfig(config as PostgreSQLConfig);
    } else if (config.type === 'mssql') {
      this.validateMSSQLConfig(config as MSSQLConfig);
    }
  }

  /**
   * Validate PostgreSQL configuration
   */
  private validatePostgreSQLConfig(config: PostgreSQLConfig): void {
    const errors: string[] = [];

    if (!config.host) {
      errors.push('PostgreSQL host is required');
    }

    if (!config.database) {
      errors.push('PostgreSQL database name is required');
    }

    if (!config.user) {
      errors.push('PostgreSQL user is required');
    }

    if (!config.password && !config.connectionString) {
      errors.push('PostgreSQL password or connection string is required');
    }

    if (config.port && (config.port < 1 || config.port > 65535)) {
      errors.push('PostgreSQL port must be between 1 and 65535');
    }

    if (config.pool) {
      if (config.pool.min && config.pool.min < 0) {
        errors.push('PostgreSQL pool minimum connections must be >= 0');
      }

      if (config.pool.max && config.pool.max < 1) {
        errors.push('PostgreSQL pool maximum connections must be >= 1');
      }

      if (config.pool.min && config.pool.max && config.pool.min > config.pool.max) {
        errors.push('PostgreSQL pool minimum connections cannot exceed maximum');
      }
    }

    if (errors.length > 0) {
      throw new Error(`PostgreSQL configuration validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Validate MSSQL configuration
   */
  private validateMSSQLConfig(config: MSSQLConfig): void {
    const errors: string[] = [];

    if (!config.server) {
      errors.push('MSSQL server is required');
    }

    if (!config.database) {
      errors.push('MSSQL database name is required');
    }

    if (!config.options.trustedConnection) {
      if (!config.authentication.options?.userName) {
        errors.push('MSSQL username is required for SQL authentication');
      }
      if (!config.authentication.options?.password) {
        errors.push('MSSQL password is required for SQL authentication');
      }
    }

    if (config.port && (config.port < 1 || config.port > 65535)) {
      errors.push('MSSQL port must be between 1 and 65535');
    }

    if (config.pool) {
      if (config.pool.min && config.pool.min < 0) {
        errors.push('MSSQL pool minimum connections must be >= 0');
      }

      if (config.pool.max && config.pool.max < 1) {
        errors.push('MSSQL pool maximum connections must be >= 1');
      }

      if (config.pool.min && config.pool.max && config.pool.min > config.pool.max) {
        errors.push('MSSQL pool minimum connections cannot exceed maximum');
      }
    }

    if (errors.length > 0) {
      throw new Error(`MSSQL configuration validation failed:\n${errors.join('\n')}`);
    }
  }

  /**
   * Get supported database types
   */
  getSupportedTypes(): string[] {
    return ['postgres', 'mssql'];
  }

  /**
   * Get recommended database type (PostgreSQL as primary)
   */
  getRecommendedType(): string {
    return 'postgres';
  }

  /**
   * Create connection with automatic retry logic
   */
  async createConnectionWithRetry(
    config: DatabaseConfig, 
    maxRetries: number = 3, 
    retryDelay: number = 1000
  ): Promise<IDatabaseConnection> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Creating database connection (attempt ${attempt}/${maxRetries})...`);
        
        const connection = this.createConnection(config);
        await connection.connect();
        
        console.log('✅ Database connection created successfully');
        return connection;
        
      } catch (error) {
        lastError = error as Error;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Connection attempt ${attempt} failed:`, errorMessage);
        
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw new Error(`Failed to create database connection after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Test connection without creating a persistent connection
   */
  async testConnection(config: DatabaseConfig): Promise<boolean> {
    try {
      const connection = this.createConnection(config);
      await connection.connect();
      const isHealthy = await connection.testConnection();
      await connection.disconnect();
      return isHealthy;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseFactory = new DatabaseFactory();

/**
 * Main database manager for the Invoy application
 * Provides a unified interface for database operations with PostgreSQL (primary) and MSSQL (secondary) support
 */

import { IDatabaseConnection, HealthCheckResult } from './core/interfaces';
import { loadDatabaseConfig, getDatabaseType } from './core/config';
import { databaseFactory } from './drivers/factory';
import { DatabaseService } from './services/database';
import { getEnvValue } from '../utils/environment';

/**
 * Database manager class
 */
export class DatabaseManager {
  private connection: IDatabaseConnection | null = null;
  private service: DatabaseService | null = null;
  private isInitialized = false;

  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('ℹ️ Database already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing database manager...');
      
      const config = loadDatabaseConfig();
      const dbType = getDatabaseType();
      
      console.log(`📊 Database type: ${dbType.toUpperCase()}`);
      console.log(`🌍 Environment: ${getEnvValue('NODE_ENV')}`);
      
      // Create connection with retry logic
      this.connection = await databaseFactory.createConnectionWithRetry(config, 3, 2000);
      
      // Create service layer
      this.service = new DatabaseService(this.connection, dbType);
      
      // Verify connection health
      const health = await this.connection.getHealth();
      if (health.status !== 'healthy') {
        throw new Error(`Database health check failed: ${health.error}`);
      }
      
      this.isInitialized = true;
      console.log('✅ Database manager initialized successfully');
      console.log(`📈 Connection latency: ${health.latency}ms`);
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Get database connection
   */
  getConnection(): IDatabaseConnection {
    this.ensureInitialized();
    return this.connection!;
  }

  /**
   * Get database service
   */
  getService(): DatabaseService {
    this.ensureInitialized();
    return this.service!;
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.connection) {
        return false;
      }
      return await this.connection.testConnection();
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database health status
   */
  async getHealth(): Promise<HealthCheckResult> {
    try {
      if (!this.connection) {
        return {
          status: 'unhealthy',
          type: getDatabaseType(),
          error: 'Database not initialized',
          timestamp: new Date(),
        };
      }
      
      return await this.connection.getHealth();
    } catch (error) {
      return {
        status: 'unhealthy',
        type: getDatabaseType(),
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get database type
   */
  getDatabaseType() {
    return getDatabaseType();
  }

  /**
   * Get connection pool statistics (if available)
   */
  getPoolStats() {
    if (!this.connection) {
      return null;
    }

    const conn = this.connection as any;
    if (conn.getPoolStats) {
      return conn.getPoolStats();
    }

    return null;
  }

  /**
   * Gracefully close database connections
   */
  async close(): Promise<void> {
    console.log('🔌 Closing database connections...');
    
    try {
      await this.cleanup();
      console.log('✅ Database connections closed successfully');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
      throw error;
    }
  }

  /**
   * Ensure database is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized || !this.connection || !this.service) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
  }

  /**
   * Clean up resources
   */
  private async cleanup(): Promise<void> {
    if (this.connection) {
      await this.connection.disconnect();
      this.connection = null;
    }
    
    this.service = null;
    this.isInitialized = false;
  }

  /**
   * Reconnect to database (useful for handling connection drops)
   */
  async reconnect(): Promise<void> {
    console.log('🔄 Reconnecting to database...');
    
    await this.cleanup();
    await this.initialize();
    
    console.log('✅ Database reconnection successful');
  }

  /**
   * Check if database is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.connection !== null && this.service !== null;
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();

// Convenience exports for backwards compatibility and ease of use
export async function initializeDatabase(): Promise<void> {
  return databaseManager.initialize();
}

export function getDatabase(): IDatabaseConnection {
  return databaseManager.getConnection();
}

export function getDatabaseService(): DatabaseService {
  return databaseManager.getService();
}

export async function closeDatabase(): Promise<void> {
  return databaseManager.close();
}

export async function testDatabaseConnection(): Promise<boolean> {
  return databaseManager.testConnection();
}

export async function getDatabaseHealth(): Promise<HealthCheckResult> {
  return databaseManager.getHealth();
}

// Export database type for external use
export { getDatabaseType } from './core/config';

// Export interfaces and types
export * from './core/interfaces';
export { DatabaseService } from './services/database';

// Backwards compatibility exports (to be deprecated)
export function checkDatabaseHealth() {
  return databaseManager.getHealth().then(health => ({
    status: health.status,
    message: health.error || 'Database is healthy',
    timestamp: health.timestamp.toISOString(),
  }));
}

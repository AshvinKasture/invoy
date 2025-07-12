/**
 * Database migration system for the robust database framework
 * Supports PostgreSQL (primary) and MSSQL (secondary) databases
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { loadEnvironment } from '../../utils/environment';
import { IDatabaseConnection, DatabaseType } from '../core/interfaces';
import { databaseManager, getDatabaseType } from '../main';

/**
 * Migration record interface
 */
interface MigrationRecord {
  id?: number;
  migration_name: string;
  executed_at: Date;
  execution_time_ms: number;
  checksum: string;
}

/**
 * Advanced database migration manager
 */
export class MigrationManager {
  private connection: IDatabaseConnection;
  private dbType: DatabaseType;

  constructor(connection?: IDatabaseConnection) {
    this.connection = connection || databaseManager.getConnection();
    this.dbType = this.connection.getType();
  }

  /**
   * Initialize database schema
   */
  async initializeSchema(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🔄 Initializing database schema...');
      
      // Ensure migrations table exists
      await this.ensureMigrationsTable();

      // Check if initial schema migration has been run
      const schemaExecuted = await this.isMigrationExecuted('initial_schema');
      
      if (!schemaExecuted) {
        // Use different schema files for different database types
        const schemaFile = this.dbType === 'postgres' ? 'schema-postgres.sql' : 'schema.sql';
        const schemaPath = join(__dirname, '..', schemaFile);
        
        if (!existsSync(schemaPath)) {
          throw new Error(`Schema file not found: ${schemaPath}`);
        }
        
        await this.executeSchemaFile(schemaPath);
        
        const executionTime = Date.now() - startTime;
        await this.recordMigration('initial_schema', executionTime, 'initial');
        
        console.log(`✅ Initial schema migration completed in ${executionTime}ms`);
      } else {
        console.log('ℹ️ Initial schema migration already executed');
      }
      
    } catch (error) {
      console.error('❌ Schema initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute a SQL schema file
   */
  async executeSchemaFile(filePath: string): Promise<void> {
    try {
      console.log(`📜 Executing schema file: ${filePath}`);
      
      const schemaContent = readFileSync(filePath, 'utf8');
      
      if (this.dbType === 'postgres') {
        // PostgreSQL can handle multiple statements in one query
        await this.connection.query(schemaContent);
      } else {
        // MSSQL needs to split statements
        const statements = this.splitMSSQLStatements(schemaContent);
        
        for (const statement of statements) {
          if (statement.trim()) {
            await this.connection.query(statement);
          }
        }
      }
      
      console.log('✅ Schema file executed successfully');
    } catch (error) {
      console.error('❌ Failed to execute schema file:', error);
      throw error;
    }
  }

  /**
   * Run a specific migration file
   */
  async runMigration(migrationPath: string, migrationName?: string): Promise<void> {
    const name = migrationName || this.extractMigrationName(migrationPath);
    
    if (await this.isMigrationExecuted(name)) {
      console.log(`ℹ️ Migration '${name}' already executed`);
      return;
    }

    const startTime = Date.now();
    
    try {
      console.log(`🔄 Running migration: ${name}`);
      
      await this.executeSchemaFile(migrationPath);
      
      const executionTime = Date.now() - startTime;
      const checksum = this.calculateChecksum(migrationPath);
      
      await this.recordMigration(name, executionTime, checksum);
      
      console.log(`✅ Migration '${name}' completed in ${executionTime}ms`);
    } catch (error) {
      console.error(`❌ Migration '${name}' failed:`, error);
      throw error;
    }
  }

  /**
   * Get list of executed migrations
   */
  async getExecutedMigrations(): Promise<MigrationRecord[]> {
    const tableName = this.dbType === 'postgres' ? 'database_migrations' : 'DatabaseMigrations';
    
    try {
      const result = await this.connection.query<MigrationRecord>(
        `SELECT * FROM ${tableName} ORDER BY executed_at ASC`
      );
      
      return result.rows;
    } catch (error) {
      console.error('❌ Failed to fetch migration records:', error);
      return [];
    }
  }

  /**
   * Check migration status
   */
  async getMigrationStatus(): Promise<{
    totalMigrations: number;
    lastMigration?: MigrationRecord;
    tableName: string;
    dbType: DatabaseType;
  }> {
    const migrations = await this.getExecutedMigrations();
    const tableName = this.dbType === 'postgres' ? 'database_migrations' : 'DatabaseMigrations';
    
    return {
      totalMigrations: migrations.length,
      lastMigration: migrations[migrations.length - 1],
      tableName,
      dbType: this.dbType,
    };
  }

  /**
   * Ensure migrations table exists
   */
  private async ensureMigrationsTable(): Promise<void> {
    const tableExists = await this.checkMigrationsTable();
    
    if (!tableExists) {
      await this.createMigrationsTable();
    }
  }

  /**
   * Check if migrations table exists
   */
  private async checkMigrationsTable(): Promise<boolean> {
    try {
      let query: string;
      
      if (this.dbType === 'postgres') {
        query = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = 'database_migrations'
          ) as table_exists
        `;
      } else {
        query = `
          SELECT CASE WHEN EXISTS (
            SELECT * FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'DatabaseMigrations'
          ) THEN 1 ELSE 0 END as table_exists
        `;
      }
      
      const result = await this.connection.query<{ table_exists: boolean | number }>(query);
      
      if (this.dbType === 'postgres') {
        return result.rows[0]?.table_exists === true;
      } else {
        return result.rows[0]?.table_exists === 1;
      }
    } catch (error) {
      console.error('❌ Error checking migrations table:', error);
      return false;
    }
  }

  /**
   * Create migrations table
   */
  private async createMigrationsTable(): Promise<void> {
    let createTableSQL: string;
    
    if (this.dbType === 'postgres') {
      createTableSQL = `
        CREATE TABLE database_migrations (
          id SERIAL PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          execution_time_ms INTEGER,
          checksum VARCHAR(64)
        );
        
        CREATE INDEX idx_migrations_name ON database_migrations(migration_name);
        CREATE INDEX idx_migrations_executed_at ON database_migrations(executed_at);
      `;
    } else {
      createTableSQL = `
        CREATE TABLE DatabaseMigrations (
          id INT IDENTITY(1,1) PRIMARY KEY,
          migration_name NVARCHAR(255) NOT NULL UNIQUE,
          executed_at DATETIME2 DEFAULT GETUTCDATE(),
          execution_time_ms INT,
          checksum NVARCHAR(64)
        );
        
        CREATE INDEX IX_Migrations_Name ON DatabaseMigrations(migration_name);
        CREATE INDEX IX_Migrations_ExecutedAt ON DatabaseMigrations(executed_at);
      `;
    }

    try {
      await this.connection.query(createTableSQL);
      console.log('✅ Database migrations table created');
    } catch (error) {
      console.error('❌ Failed to create migrations table:', error);
      throw error;
    }
  }

  /**
   * Record migration execution
   */
  private async recordMigration(
    migrationName: string, 
    executionTimeMs: number, 
    checksum: string
  ): Promise<void> {
    if (this.dbType === 'postgres') {
      await this.connection.query(
        `INSERT INTO database_migrations (migration_name, execution_time_ms, checksum)
         VALUES ($1, $2, $3)`,
        [migrationName, executionTimeMs, checksum]
      );
    } else {
      await this.connection.query(
        `INSERT INTO DatabaseMigrations (migration_name, execution_time_ms, checksum)
         VALUES (@migrationName, @executionTimeMs, @checksum)`,
        { migrationName, executionTimeMs, checksum }
      );
    }
  }

  /**
   * Check if migration has been executed
   */
  private async isMigrationExecuted(migrationName: string): Promise<boolean> {
    const tableName = this.dbType === 'postgres' ? 'database_migrations' : 'DatabaseMigrations';
    
    try {
      let query: string;
      let params: any;
      
      if (this.dbType === 'postgres') {
        query = `SELECT COUNT(*) as count FROM ${tableName} WHERE migration_name = $1`;
        params = [migrationName];
      } else {
        query = `SELECT COUNT(*) as count FROM ${tableName} WHERE migration_name = @migrationName`;
        params = { migrationName };
      }
      
      const result = await this.connection.query<{ count: number }>(query, params);
      return Number(result.rows[0]?.count || 0) > 0;
    } catch (error) {
      console.error('❌ Error checking migration execution:', error);
      return false;
    }
  }

  /**
   * Split MSSQL statements (simple implementation)
   */
  private splitMSSQLStatements(content: string): string[] {
    // Split by 'GO' statements (MSSQL batch separator)
    return content
      .split(/^\s*GO\s*$/gim)
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
  }

  /**
   * Extract migration name from file path
   */
  private extractMigrationName(filePath: string): string {
    const fileName = filePath.split(/[\\/]/).pop() || filePath;
    return fileName.replace(/\.(sql|js|ts)$/i, '');
  }

  /**
   * Calculate checksum for a file (simple implementation)
   */
  private calculateChecksum(filePath: string): string {
    try {
      const content = readFileSync(filePath, 'utf8');
      // Simple hash based on content length and a few characters
      const hash = content.length.toString() + content.slice(0, 100);
      return Buffer.from(hash).toString('base64').substring(0, 32);
    } catch {
      return 'unknown';
    }
  }
}

/**
 * CLI tool for running migrations
 */
export async function runMigrationCLI(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    console.log('⚙️ Loading environment configuration...');
    await loadEnvironment();
    
    console.log('🔄 Initializing database...');
    await databaseManager.initialize();
    
    const migration = new MigrationManager();

    switch (command) {
      case 'init':
        await migration.initializeSchema();
        break;
        
      case 'status':
        const status = await migration.getMigrationStatus();
        console.log('\n📋 Migration Status:');
        console.log(`  Database Type: ${status.dbType.toUpperCase()}`);
        console.log(`  Migrations Table: ${status.tableName}`);
        console.log(`  Total Migrations: ${status.totalMigrations}`);
        if (status.lastMigration) {
          console.log(`  Last Migration: ${status.lastMigration.migration_name}`);
          console.log(`  Executed At: ${status.lastMigration.executed_at}`);
        }
        break;
        
      case 'run':
        const migrationPath = args[1];
        if (!migrationPath) {
          console.error('❌ Migration file path is required');
          process.exit(1);
        }
        await migration.runMigration(migrationPath);
        break;
        
      default:
        console.log('Usage: npm run migrate <command>');
        console.log('Commands:');
        console.log('  init              - Initialize database schema');
        console.log('  status            - Show migration status');
        console.log('  run <file>        - Run specific migration file');
        break;
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await databaseManager.close();
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  runMigrationCLI();
}

export default MigrationManager;

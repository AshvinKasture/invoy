/**
 * Environment Helper Utility
 * Centralized environment variable management for the Invoy application
 * Loads and validates all environment variables at application startup
 */

import dotenv from 'dotenv';
import { join } from 'path';

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  // Application Settings
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  
  // Database Configuration
  DB_TYPE: 'postgres' | 'mssql';
  DB_CONNECTION_STRING: string;
  DB_CONNECTION_TIMEOUT: number;
  DB_REQUEST_TIMEOUT: number;
  DB_POOL_MIN: number;
  DB_POOL_MAX: number;
  DB_POOL_IDLE_TIMEOUT: number;
  DB_ENABLE_QUERY_LOGGING: boolean;
  DB_LOG_SLOW_QUERIES: number;
  
  // PostgreSQL Specific (optional fallbacks)
  POSTGRES_HOST?: string;
  POSTGRES_PORT?: number;
  POSTGRES_DATABASE?: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_SSL?: boolean;
  
  // Security & API
  JWT_SECRET?: string;
  API_RATE_LIMIT?: number;
  CORS_ORIGIN?: string;
  
  // Logging
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  LOG_FILE?: string;
  
  // External Services (future expansion)
  EMAIL_SERVICE_URL?: string;
  EMAIL_API_KEY?: string;
  STORAGE_PROVIDER?: 'local' | 'aws' | 'azure';
  
  // Development/Debug
  DEBUG_MODE: boolean;
  ENABLE_METRICS: boolean;
}

/**
 * Environment validation errors
 */
export class EnvironmentError extends Error {
  constructor(message: string, public missingVars?: string[]) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

/**
 * Environment Helper Class
 * Singleton pattern to ensure single instance across the application
 */
class EnvironmentHelper {
  private static instance: EnvironmentHelper;
  private config: EnvironmentConfig | null = null;
  private isLoaded = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): EnvironmentHelper {
    if (!EnvironmentHelper.instance) {
      EnvironmentHelper.instance = new EnvironmentHelper();
    }
    return EnvironmentHelper.instance;
  }

  /**
   * Load and validate environment variables
   * Should be called once at application startup
   */
  public load(envPath?: string): EnvironmentConfig {
    if (this.isLoaded && this.config) {
      return this.config;
    }

    // Load .env file
    const result = dotenv.config({ 
      path: envPath || join(process.cwd(), '.env'),
      override: false // Don't override existing env vars
    });

    if (result.error && !process.env.NODE_ENV) {
      console.warn('⚠️ No .env file found, using system environment variables');
    }

    try {
      this.config = this.parseAndValidate();
      this.isLoaded = true;
      
      console.log('✅ Environment configuration loaded successfully');
      console.log(`📊 Environment: ${this.config.NODE_ENV}`);
      console.log(`🗄️ Database: ${this.config.DB_TYPE.toUpperCase()}`);
      
      return this.config;
    } catch (error) {
      console.error('❌ Environment configuration failed:', error);
      throw error;
    }
  }

  /**
   * Get the loaded configuration
   * Throws error if not loaded yet
   */
  public getConfig(): EnvironmentConfig {
    if (!this.isLoaded || !this.config) {
      throw new EnvironmentError('Environment not loaded. Call load() first.');
    }
    return this.config;
  }

  /**
   * Get a specific configuration value
   */
  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.getConfig()[key];
  }

  /**
   * Check if environment is production
   */
  public isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if environment is development
   */
  public isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Check if environment is test
   */
  public isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Get database configuration object
   */
  public getDatabaseConfig() {
    const config = this.getConfig();
    return {
      type: config.DB_TYPE,
      connectionString: config.DB_CONNECTION_STRING,
      connectionTimeout: config.DB_CONNECTION_TIMEOUT,
      requestTimeout: config.DB_REQUEST_TIMEOUT,
      pool: {
        min: config.DB_POOL_MIN,
        max: config.DB_POOL_MAX,
        idleTimeoutMillis: config.DB_POOL_IDLE_TIMEOUT,
      },
      logging: {
        enabled: config.DB_ENABLE_QUERY_LOGGING,
        slowQueryThreshold: config.DB_LOG_SLOW_QUERIES,
      },
      // PostgreSQL fallback settings
      postgres: {
        host: config.POSTGRES_HOST,
        port: config.POSTGRES_PORT,
        database: config.POSTGRES_DATABASE,
        user: config.POSTGRES_USER,
        password: config.POSTGRES_PASSWORD,
        ssl: config.POSTGRES_SSL,
      },
    };
  }

  /**
   * Reload configuration (useful for tests)
   */
  public reload(envPath?: string): EnvironmentConfig {
    this.isLoaded = false;
    this.config = null;
    return this.load(envPath);
  }

  /**
   * Parse and validate environment variables
   */
  private parseAndValidate(): EnvironmentConfig {
    const requiredVars = [
      'DB_TYPE',
      'DB_CONNECTION_STRING',
    ];

    const missingVars: string[] = [];
    
    // Check required variables
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      throw new EnvironmentError(
        `Missing required environment variables: ${missingVars.join(', ')}`,
        missingVars
      );
    }

    // Parse and validate values
    const config: EnvironmentConfig = {
      // Application Settings
      NODE_ENV: this.parseEnum(
        'NODE_ENV', 
        ['development', 'production', 'test'], 
        'development'
      ) as 'development' | 'production' | 'test',
      PORT: this.parseInt('PORT', 8000),

      // Database Configuration
      DB_TYPE: this.parseEnum(
        'DB_TYPE', 
        ['postgres', 'mssql'], 
        'postgres'
      ) as 'postgres' | 'mssql',
      DB_CONNECTION_STRING: this.parseString('DB_CONNECTION_STRING'),
      DB_CONNECTION_TIMEOUT: this.parseInt('DB_CONNECTION_TIMEOUT', 15000),
      DB_REQUEST_TIMEOUT: this.parseInt('DB_REQUEST_TIMEOUT', 15000),
      DB_POOL_MIN: this.parseInt('DB_POOL_MIN', 0),
      DB_POOL_MAX: this.parseInt('DB_POOL_MAX', 10),
      DB_POOL_IDLE_TIMEOUT: this.parseInt('DB_POOL_IDLE_TIMEOUT', 30000),
      DB_ENABLE_QUERY_LOGGING: this.parseBoolean('DB_ENABLE_QUERY_LOGGING', false),
      DB_LOG_SLOW_QUERIES: this.parseInt('DB_LOG_SLOW_QUERIES', 1000),

      // PostgreSQL Specific
      POSTGRES_HOST: this.parseOptionalString('POSTGRES_HOST'),
      POSTGRES_PORT: this.parseOptionalInt('POSTGRES_PORT'),
      POSTGRES_DATABASE: this.parseOptionalString('POSTGRES_DATABASE'),
      POSTGRES_USER: this.parseOptionalString('POSTGRES_USER'),
      POSTGRES_PASSWORD: this.parseOptionalString('POSTGRES_PASSWORD'),
      POSTGRES_SSL: this.parseOptionalBoolean('POSTGRES_SSL'),

      // Security & API
      JWT_SECRET: this.parseOptionalString('JWT_SECRET'),
      API_RATE_LIMIT: this.parseOptionalInt('API_RATE_LIMIT'),
      CORS_ORIGIN: this.parseOptionalString('CORS_ORIGIN'),

      // Logging
      LOG_LEVEL: this.parseEnum(
        'LOG_LEVEL', 
        ['error', 'warn', 'info', 'debug'], 
        'info'
      ) as 'error' | 'warn' | 'info' | 'debug',
      LOG_FILE: this.parseOptionalString('LOG_FILE'),

      // External Services
      EMAIL_SERVICE_URL: this.parseOptionalString('EMAIL_SERVICE_URL'),
      EMAIL_API_KEY: this.parseOptionalString('EMAIL_API_KEY'),
      STORAGE_PROVIDER: this.parseOptionalEnum(
        'STORAGE_PROVIDER', 
        ['local', 'aws', 'azure']
      ) as 'local' | 'aws' | 'azure' | undefined,

      // Development/Debug
      DEBUG_MODE: this.parseBoolean('DEBUG_MODE', false),
      ENABLE_METRICS: this.parseBoolean('ENABLE_METRICS', true),
    };

    // Additional validations
    this.validateDatabaseConfig(config);

    return config;
  }

  /**
   * Validate database-specific configuration
   */
  private validateDatabaseConfig(config: EnvironmentConfig): void {
    // Validate connection string format
    if (config.DB_TYPE === 'postgres') {
      if (!config.DB_CONNECTION_STRING.startsWith('postgresql://') && 
          !config.DB_CONNECTION_STRING.startsWith('postgres://')) {
        throw new EnvironmentError('PostgreSQL connection string must start with postgresql:// or postgres://');
      }
    } else if (config.DB_TYPE === 'mssql') {
      if (!config.DB_CONNECTION_STRING.includes('Server=')) {
        throw new EnvironmentError('MSSQL connection string must contain Server= parameter');
      }
    }

    // Validate pool settings
    if (config.DB_POOL_MIN < 0 || config.DB_POOL_MAX < 1) {
      throw new EnvironmentError('Invalid database pool configuration');
    }

    if (config.DB_POOL_MIN > config.DB_POOL_MAX) {
      throw new EnvironmentError('DB_POOL_MIN cannot be greater than DB_POOL_MAX');
    }
  }

  /**
   * Parse string value
   */
  private parseString(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new EnvironmentError(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Parse optional string value
   */
  private parseOptionalString(key: string): string | undefined {
    return process.env[key] || undefined;
  }

  /**
   * Parse integer value
   */
  private parseInt(key: string, defaultValue?: number): number {
    const value = process.env[key];
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new EnvironmentError(`Required environment variable ${key} is not set`);
    }
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new EnvironmentError(`Environment variable ${key} must be a valid integer`);
    }
    return parsed;
  }

  /**
   * Parse optional integer value
   */
  private parseOptionalInt(key: string): number | undefined {
    const value = process.env[key];
    if (!value) return undefined;
    
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new EnvironmentError(`Environment variable ${key} must be a valid integer`);
    }
    return parsed;
  }

  /**
   * Parse boolean value
   */
  private parseBoolean(key: string, defaultValue?: boolean): boolean {
    const value = process.env[key];
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new EnvironmentError(`Required environment variable ${key} is not set`);
    }
    return value.toLowerCase() === 'true';
  }

  /**
   * Parse optional boolean value
   */
  private parseOptionalBoolean(key: string): boolean | undefined {
    const value = process.env[key];
    if (!value) return undefined;
    return value.toLowerCase() === 'true';
  }

  /**
   * Parse enum value
   */
  private parseEnum(key: string, allowedValues: string[], defaultValue?: string): string {
    const value = process.env[key];
    if (!value) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new EnvironmentError(`Required environment variable ${key} is not set`);
    }
    
    if (!allowedValues.includes(value)) {
      throw new EnvironmentError(
        `Environment variable ${key} must be one of: ${allowedValues.join(', ')}`
      );
    }
    return value;
  }

  /**
   * Parse optional enum value
   */
  private parseOptionalEnum(key: string, allowedValues: string[]): string | undefined {
    const value = process.env[key];
    if (!value) return undefined;
    
    if (!allowedValues.includes(value)) {
      throw new EnvironmentError(
        `Environment variable ${key} must be one of: ${allowedValues.join(', ')}`
      );
    }
    return value;
  }
}

// Export singleton instance
export const environmentHelper = EnvironmentHelper.getInstance();

// Export convenience functions
export const loadEnvironment = (envPath?: string) => environmentHelper.load(envPath);
export const getEnvironment = () => environmentHelper.getConfig();
export const getEnvValue = <K extends keyof EnvironmentConfig>(key: K) => environmentHelper.get(key);
export const isProduction = () => environmentHelper.isProduction();
export const isDevelopment = () => environmentHelper.isDevelopment();
export const isTest = () => environmentHelper.isTest();
export const getDatabaseConfig = () => environmentHelper.getDatabaseConfig();

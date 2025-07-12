/**
 * Database configuration management with environment validation
 * Supports both PostgreSQL (primary) and MSSQL (secondary) databases
 */

import { DatabaseConfig, PostgreSQLConfig, MSSQLConfig, DatabaseType } from './interfaces';
import { getDatabaseConfig as getEnvDatabaseConfig, getEnvValue } from '../../utils/environment';

/**
 * Database configuration errors
 */
export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(`Database Configuration Error: ${message}`);
    this.name = 'DatabaseConfigError';
  }
}

/**
 * Get database type from environment
 */
export function getDatabaseType(): DatabaseType {
  return getEnvValue('DB_TYPE');
}

/**
 * Load and validate database configuration from environment helper
 */
export function loadDatabaseConfig(): DatabaseConfig {
  const envDbConfig = getEnvDatabaseConfig();
  const dbType = envDbConfig.type;
  
  console.log(`🔧 Loading ${dbType.toUpperCase()} database configuration...`);
  
  if (dbType === 'postgres') {
    return loadPostgreSQLConfig(envDbConfig);
  } else {
    return loadMSSQLConfig(envDbConfig);
  }
}

/**
 * Load PostgreSQL configuration (Primary database)
 */
function loadPostgreSQLConfig(envDbConfig: any): PostgreSQLConfig {
  const connectionString = envDbConfig.connectionString;
  
  if (connectionString) {
    return parsePostgreSQLConnectionString(connectionString, envDbConfig);
  }
  
  // Alternative: individual environment variables from environment helper
  const host = envDbConfig.postgres.host || 'localhost';
  const port = envDbConfig.postgres.port || 5432;
  const database = envDbConfig.postgres.database || 'invoydb';
  const user = envDbConfig.postgres.user || 'postgres';
  const password = envDbConfig.postgres.password;
  const ssl = envDbConfig.postgres.ssl || false;
  
  if (!password) {
    throw new DatabaseConfigError('PostgreSQL password is required (POSTGRES_PASSWORD or connection string)');
  }
  
  return {
    type: 'postgres',
    host,
    port,
    database,
    user,
    password,
    ssl,
    connectionTimeout: envDbConfig.connectionTimeout,
    requestTimeout: envDbConfig.requestTimeout,
    pool: envDbConfig.pool,
  };
}

/**
 * Load MSSQL configuration (Secondary database)
 */
function loadMSSQLConfig(envDbConfig: any): MSSQLConfig {
  const connectionString = envDbConfig.connectionString;
  
  if (!connectionString) {
    throw new DatabaseConfigError('DB_CONNECTION_STRING environment variable is required for MSSQL');
  }
  
  return parseMSSQLConnectionString(connectionString, envDbConfig);
}

/**
 * Parse PostgreSQL connection string
 * Supports postgresql:// and postgres:// formats
 */
function parsePostgreSQLConnectionString(connectionString: string, envDbConfig: any): PostgreSQLConfig {
  try {
    const url = new URL(connectionString);
    
    if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
      throw new Error('Invalid PostgreSQL connection string protocol');
    }
    
    const host = url.hostname;
    const port = parseInt(url.port || '5432', 10);
    const database = url.pathname.substring(1); // Remove leading slash
    const user = url.username;
    const password = url.password;
    
    if (!host || !database || !user || !password) {
      throw new Error('Missing required connection parameters');
    }
    
    // Parse SSL settings from query parameters
    const ssl = url.searchParams.get('sslmode') === 'require' || 
                url.searchParams.get('ssl') === 'true';
    
    return {
      type: 'postgres',
      host,
      port,
      database,
      user,
      password,
      ssl,
      connectionString,
      connectionTimeout: envDbConfig.connectionTimeout,
      requestTimeout: envDbConfig.requestTimeout,
      pool: envDbConfig.pool,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseConfigError(`Invalid PostgreSQL connection string: ${errorMessage}`);
  }
}

/**
 * Parse MSSQL connection string
 * Supports various MSSQL connection string formats
 */
function parseMSSQLConnectionString(connectionString: string, envDbConfig: any): MSSQLConfig {
  try {
    // Parse MSSQL connection string into components
    const parts = connectionString.split(';').reduce((acc, part) => {
      const [key, value] = part.split('=');
      if (key && value) {
        acc[key.trim().toLowerCase()] = value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const server = parts['server'] || parts['data source'];
    const database = parts['database'] || parts['initial catalog'];
    const userId = parts['user id'] || parts['uid'];
    const password = parts['password'] || parts['pwd'];
    const trustedConnection = parts['trusted_connection'] === 'true' || 
                             parts['integrated security'] === 'true' ||
                             parts['integrated security'] === 'sspi';

    if (!server || !database) {
      throw new Error('Server and Database are required in MSSQL connection string');
    }

    // Determine authentication type
    const authType = trustedConnection ? 'ntlm' : 'sql';
    
    if (authType === 'sql' && (!userId || !password)) {
      throw new Error('User ID and Password are required for SQL authentication');
    }

    // Parse server and port
    const [serverName, portStr] = server.split(',');
    const port = portStr ? parseInt(portStr, 10) : 1433;

    if (!serverName) {
      throw new Error('Invalid server name in connection string');
    }

    return {
      type: 'mssql',
      server: serverName,
      port,
      database,
      authentication: {
        type: authType,
        options: {
          userName: userId,
          password: password,
        },
      },
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection,
      },
      connectionTimeout: envDbConfig.connectionTimeout,
      requestTimeout: envDbConfig.requestTimeout,
      pool: envDbConfig.pool,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseConfigError(`Invalid MSSQL connection string: ${errorMessage}`);
  }
}

/**
 * Validate database configuration
 */
export function validateDatabaseConfig(config: DatabaseConfig): void {
  if (config.type === 'postgres') {
    const pgConfig = config as PostgreSQLConfig;
    if (!pgConfig.host || !pgConfig.database || !pgConfig.user || !pgConfig.password) {
      throw new DatabaseConfigError('PostgreSQL configuration is incomplete');
    }
  } else if (config.type === 'mssql') {
    const msConfig = config as MSSQLConfig;
    if (!msConfig.server || !msConfig.database) {
      throw new DatabaseConfigError('MSSQL configuration is incomplete');
    }
    
    if (msConfig.authentication.type === 'sql') {
      const options = msConfig.authentication.options;
      if (!options.userName || !options.password) {
        throw new DatabaseConfigError('MSSQL SQL authentication requires username and password');
      }
    }
  }
}

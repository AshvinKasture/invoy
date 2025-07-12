/**
 * Database service layer providing high-level database operations
 * Database-agnostic implementation supporting both PostgreSQL and MSSQL
 */

import { 
  IDatabaseService, 
  IDatabaseConnection, 
  QueryOptions, 
  QueryResult,
  DatabaseType 
} from '../core/interfaces';

/**
 * Base database service with common CRUD operations
 */
export class DatabaseService implements IDatabaseService {
  constructor(
    private connection: IDatabaseConnection,
    private dbType: DatabaseType = connection.getType()
  ) {}

  /**
   * Find a record by ID
   */
  async findById<T>(
    table: string, 
    id: string | number, 
    idColumn: string = 'id'
  ): Promise<T | null> {
    const { sql, params } = this.buildParameterizedQuery(
      `SELECT * FROM ${table} WHERE ${idColumn} = :id`,
      { id }
    );

    const result = await this.connection.query<T>(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Find all records with optional filtering
   */
  async findAll<T>(table: string, options?: QueryOptions): Promise<T[]> {
    let sql = `SELECT ${options?.select?.join(', ') || '*'} FROM ${table}`;
    let params: any = {};

    if (options?.where) {
      sql += ` WHERE ${options.where}`;
      params = { ...params, ...options.parameters };
    }

    if (options?.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    if (options?.limit) {
      if (this.dbType === 'postgres') {
        sql += ` LIMIT :limit`;
        params.limit = options.limit;
      } else {
        sql = sql.replace('SELECT', `SELECT TOP (:limit)`);
        params.limit = options.limit;
      }
    }

    if (options?.offset && this.dbType === 'postgres') {
      sql += ` OFFSET :offset`;
      params.offset = options.offset;
    }

    const { sql: processedSql, params: processedParams } = this.buildParameterizedQuery(sql, params);
    const result = await this.connection.query<T>(processedSql, processedParams);
    
    return result.rows;
  }

  /**
   * Create a new record
   */
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const columns = Object.keys(data);
    const placeholders = columns.map((_, index) => 
      this.dbType === 'postgres' ? `$${index + 1}` : `@param${index}`
    );

    let sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    
    // Handle returning clause for different databases
    if (this.dbType === 'postgres') {
      sql += ' RETURNING *';
    } else {
      // MSSQL uses OUTPUT clause
      sql = `INSERT INTO ${table} (${columns.join(', ')}) OUTPUT INSERTED.* VALUES (${placeholders.join(', ')})`;
    }

    const values = Object.values(data);
    const params = this.dbType === 'postgres' ? values : this.convertToNamedParams(values);

    const result = await this.connection.query<T>(sql, params);
    
    if (!result.rows[0]) {
      throw new Error(`Failed to create record in ${table}`);
    }
    
    return result.rows[0];
  }

  /**
   * Update a record by ID
   */
  async update<T>(
    table: string, 
    id: string | number, 
    data: Partial<T>, 
    idColumn: string = 'id'
  ): Promise<T | null> {
    const columns = Object.keys(data);
    const setClause = columns.map((col, index) => 
      this.dbType === 'postgres' ? `${col} = $${index + 1}` : `${col} = @param${index}`
    ).join(', ');

    const values = Object.values(data);
    const idParamIndex = values.length;
    
    let sql = `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = `;
    sql += this.dbType === 'postgres' ? `$${idParamIndex + 1}` : `@id`;

    // Handle returning clause for different databases
    if (this.dbType === 'postgres') {
      sql += ' RETURNING *';
    } else {
      // MSSQL uses OUTPUT clause
      sql = `UPDATE ${table} SET ${setClause} OUTPUT INSERTED.* WHERE ${idColumn} = @id`;
    }

    const allValues = [...values, id];
    const params = this.dbType === 'postgres' ? allValues : { ...this.convertToNamedParams(values), id };

    const result = await this.connection.query<T>(sql, params);
    return result.rows[0] || null;
  }

  /**
   * Delete a record by ID
   */
  async delete(
    table: string, 
    id: string | number, 
    idColumn: string = 'id'
  ): Promise<boolean> {
    const { sql, params } = this.buildParameterizedQuery(
      `DELETE FROM ${table} WHERE ${idColumn} = :id`,
      { id }
    );

    const result = await this.connection.query(sql, params);
    return result.rowCount > 0;
  }

  /**
   * Count records in a table
   */
  async count(
    table: string, 
    whereClause?: string, 
    parameters?: any
  ): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }

    const { sql: processedSql, params } = this.buildParameterizedQuery(sql, parameters || {});
    const result = await this.connection.query<{ count: number }>(processedSql, params);
    
    return Number(result.rows[0]?.count || 0);
  }

  /**
   * Check if a record exists
   */
  async exists(
    table: string, 
    whereClause: string, 
    parameters?: any
  ): Promise<boolean> {
    const count = await this.count(table, whereClause, parameters);
    return count > 0;
  }

  /**
   * Execute a raw SQL query
   */
  async executeQuery<T = any>(sql: string, parameters?: any): Promise<QueryResult<T>> {
    const { sql: processedSql, params } = this.buildParameterizedQuery(sql, parameters || {});
    return this.connection.query<T>(processedSql, params);
  }

  /**
   * Execute multiple queries in a transaction
   */
  async executeTransaction<T = any>(
    queries: Array<{ sql: string; parameters?: any }>
  ): Promise<QueryResult<T>[]> {
    // Process each query for the specific database type
    const processedQueries = queries.map(query => {
      const { sql, params } = this.buildParameterizedQuery(query.sql, query.parameters || {});
      return { sql, parameters: params };
    });

    return this.connection.executeTransaction<T>(processedQueries);
  }

  /**
   * Get database health status
   */
  async getHealth() {
    return this.connection.getHealth();
  }

  /**
   * Get database type
   */
  getDatabaseType(): DatabaseType {
    return this.dbType;
  }

  /**
   * Build parameterized query for the specific database type
   */
  private buildParameterizedQuery(sql: string, parameters: Record<string, any>): { sql: string; params: any } {
    if (this.dbType === 'postgres') {
      return this.convertToPostgreSQLParams(sql, parameters);
    } else {
      return this.convertToMSSQLParams(sql, parameters);
    }
  }

  /**
   * Convert named parameters to PostgreSQL positional format ($1, $2, etc.)
   */
  private convertToPostgreSQLParams(sql: string, parameters: Record<string, any>): { sql: string; params: any[] } {
    let processedSql = sql;
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(parameters).forEach(([key, value]) => {
      processedSql = processedSql.replace(
        new RegExp(`:${key}\\b`, 'g'),
        `$${paramIndex}`
      );
      values.push(value);
      paramIndex++;
    });

    return { sql: processedSql, params: values };
  }

  /**
   * Convert named parameters to MSSQL format (@param)
   */
  private convertToMSSQLParams(sql: string, parameters: Record<string, any>): { sql: string; params: Record<string, any> } {
    let processedSql = sql;
    const params: Record<string, any> = {};

    Object.entries(parameters).forEach(([key, value]) => {
      processedSql = processedSql.replace(
        new RegExp(`:${key}\\b`, 'g'),
        `@${key}`
      );
      params[key] = value;
    });

    return { sql: processedSql, params };
  }

  /**
   * Convert array values to named parameters object
   */
  private convertToNamedParams(values: any[]): Record<string, any> {
    const params: Record<string, any> = {};
    values.forEach((value, index) => {
      params[`param${index}`] = value;
    });
    return params;
  }

  /**
   * Bulk insert operation (optimized for each database type)
   */
  async bulkInsert<T>(table: string, data: T[]): Promise<void> {
    if (data.length === 0) {
      return;
    }

    if (this.dbType === 'mssql') {
      // Use MSSQL-specific bulk insert
      const mssqlConnection = this.connection as any;
      if (mssqlConnection.bulkInsert) {
        await mssqlConnection.bulkInsert(table, data);
        return;
      }
    }

    // Fallback to batch inserts for PostgreSQL or if bulk insert not available
    const batchSize = 1000;
    const batches = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const queries = batch.map(record => ({
        sql: this.buildInsertQuery(table, record as any),
        parameters: record,
      }));

      await this.executeTransaction(queries);
    }
  }

  /**
   * Build insert query for a single record
   */
  private buildInsertQuery(table: string, data: Record<string, any>): string {
    const columns = Object.keys(data);
    const placeholders = columns.map(col => `:${col}`);
    
    return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
  }

  /**
   * Get table schema information (database-specific)
   */
  async getTableSchema(table: string): Promise<any[]> {
    let sql: string;
    
    if (this.dbType === 'postgres') {
      sql = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = :table
        ORDER BY ordinal_position
      `;
    } else {
      sql = `
        SELECT 
          COLUMN_NAME as column_name,
          DATA_TYPE as data_type,
          IS_NULLABLE as is_nullable,
          COLUMN_DEFAULT as column_default,
          CHARACTER_MAXIMUM_LENGTH as character_maximum_length
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = :table
        ORDER BY ORDINAL_POSITION
      `;
    }

    const { sql: processedSql, params } = this.buildParameterizedQuery(sql, { table });
    const result = await this.connection.query(processedSql, params);
    
    return result.rows;
  }

  /**
   * Check if table exists
   */
  async tableExists(table: string): Promise<boolean> {
    let sql: string;
    
    if (this.dbType === 'postgres') {
      sql = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = :table
        ) as exists
      `;
    } else {
      sql = `
        SELECT CASE WHEN EXISTS (
          SELECT * FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = :table
        ) THEN 1 ELSE 0 END as exists
      `;
    }

    const { sql: processedSql, params } = this.buildParameterizedQuery(sql, { table });
    const result = await this.connection.query<{ exists: boolean | number }>(processedSql, params);
    
    return Boolean(result.rows[0]?.exists);
  }
}

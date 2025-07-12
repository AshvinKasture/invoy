import { getDatabase, getDatabaseType } from '../database';

/**
 * Base database service class with common operations
 */
export abstract class BaseService {
  protected db = getDatabase();
  protected dbType = getDatabaseType();

  /**
   * Execute a parameterized query safely
   */
  protected async executeQuery<T = any>(
    query: string,
    parameters?: Record<string, any>
  ): Promise<T[]> {
    const result = await this.db.query<T>(query, parameters);
    return result.rows;
  }

  /**
   * Execute a stored procedure (MSSQL only)
   */
  protected async executeProcedure<T = any>(
    procedureName: string,
    parameters?: Record<string, any>
  ): Promise<any> {
    if (this.dbType !== 'mssql') {
      throw new Error('Stored procedures are only supported with MSSQL');
    }
    
    const mssqlConnection = this.db as any; // Type assertion for MSSQL-specific methods
    return mssqlConnection.executeProcedure(procedureName, parameters);
  }

  /**
   * Get parameter placeholder based on database type
   */
  protected getParameterPlaceholder(paramName: string, index?: number): string {
    if (this.dbType === 'postgres') {
      return `$${index || 1}`;
    } else {
      return `@${paramName}`;
    }
  }

  /**
   * Build query with database-specific syntax
   */
  protected buildQuery(baseQuery: string, parameters?: Record<string, any>): { query: string; params: any } {
    if (this.dbType === 'postgres' && parameters) {
      // Convert named parameters to positional for PostgreSQL
      let processedQuery = baseQuery;
      const values: any[] = [];
      let paramIndex = 1;
      
      Object.entries(parameters).forEach(([key, value]) => {
        processedQuery = processedQuery.replace(
          new RegExp(`@${key}\\b`, 'g'),
          `$${paramIndex}`
        );
        values.push(value);
        paramIndex++;
      });
      
      return { query: processedQuery, params: values };
    }
    
    return { query: baseQuery, params: parameters };
  }

  /**
   * Get a single record by ID
   */
  protected async findById<T = any>(
    tableName: string,
    id: string | number,
    idColumn: string = 'id'
  ): Promise<T | null> {
    const query = `
      SELECT * FROM ${tableName} 
      WHERE ${idColumn} = ${this.getParameterPlaceholder('id', 1)}
    `;
    
    const result = await this.executeQuery<T>(query, { id });
    return result[0] || null;
  }

  /**
   * Get all records from a table with optional filtering
   */
  protected async findAll<T = any>(
    tableName: string,
    whereClause?: string,
    parameters?: Record<string, any>,
    orderBy?: string,
    limit?: number,
    offset?: number
  ): Promise<T[]> {
    let query = `SELECT * FROM ${tableName}`;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    if (limit) {
      if (this.dbType === 'postgres') {
        query += ` LIMIT ${limit}`;
        if (offset) {
          query += ` OFFSET ${offset}`;
        }
      } else {
        query += ` OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`;
      }
    }
    
    const result = await this.executeQuery<T>(query, parameters);
    return result;
  }

  /**
   * Insert a new record
   */
  protected async insert<T = any>(
    tableName: string,
    data: Record<string, any>
  ): Promise<T> {
    const columns = Object.keys(data);
    let query: string;
    
    if (this.dbType === 'postgres') {
      const placeholders = columns.map((_, index) => `$${index + 1}`);
      query = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;
    } else {
      const placeholders = columns.map(col => `@${col}`);
      query = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        OUTPUT INSERTED.*
        VALUES (${placeholders.join(', ')})
      `;
    }
    
    const result = await this.executeQuery<T>(query, data);
    if (!result || result.length === 0) {
      throw new Error('Failed to insert record');
    }
    return result[0] as T;
  }

  /**
   * Update a record by ID
   */
  protected async update<T = any>(
    tableName: string,
    id: string | number,
    data: Record<string, any>,
    idColumn: string = 'id'
  ): Promise<T | null> {
    const columns = Object.keys(data);
    let setClause: string;
    let query: string;
    
    if (this.dbType === 'postgres') {
      setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
      query = `
        UPDATE ${tableName} 
        SET ${setClause}
        WHERE ${idColumn} = $${columns.length + 1}
        RETURNING *
      `;
      const values = [...Object.values(data), id];
      const result = await this.executeQuery<T>(query, values);
      return result[0] || null;
    } else {
      setClause = columns.map(col => `${col} = @${col}`).join(', ');
      query = `
        UPDATE ${tableName} 
        SET ${setClause}
        OUTPUT INSERTED.*
        WHERE ${idColumn} = @id
      `;
      const parameters = { ...data, id };
      const result = await this.executeQuery<T>(query, parameters);
      return (result as any).recordset[0] || null;
    }
  }

  /**
   * Delete a record by ID
   */
  protected async delete(
    tableName: string,
    id: string | number,
    idColumn: string = 'id'
  ): Promise<boolean> {
    let query: string;
    
    if (this.dbType === 'postgres') {
      query = `DELETE FROM ${tableName} WHERE ${idColumn} = $1`;
      const result = await this.executeQuery(query, [id]);
      return result.length > 0;
    } else {
      query = `DELETE FROM ${tableName} WHERE ${idColumn} = @id`;
      const result = await this.executeQuery(query, { id });
      return ((result as any).rowsAffected?.[0] || 0) > 0;
    }
  }

  /**
   * Check if a record exists
   */
  protected async exists(
    tableName: string,
    whereClause: string,
    parameters?: Record<string, any>
  ): Promise<boolean> {
    let query: string;
    
    if (this.dbType === 'postgres') {
      query = `
        SELECT CASE WHEN EXISTS (
          SELECT 1 FROM ${tableName} WHERE ${whereClause}
        ) THEN 1 ELSE 0 END as record_exists
      `;
      const result = await this.executeQuery<{ record_exists: number }>(query, parameters);
      return result[0]?.record_exists === 1;
    } else {
      query = `
        SELECT CASE WHEN EXISTS (
          SELECT 1 FROM ${tableName} WHERE ${whereClause}
        ) THEN 1 ELSE 0 END as record_exists
      `;
      const result = await this.executeQuery<{ record_exists: number }>(query, parameters);
      return (result as any).recordset[0]?.record_exists === 1;
    }
  }

  /**
   * Get record count
   */
  protected async count(
    tableName: string,
    whereClause?: string,
    parameters?: Record<string, any>
  ): Promise<number> {
    let query = `SELECT COUNT(*) as total FROM ${tableName}`;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    if (this.dbType === 'postgres') {
      const result = await this.executeQuery<{ total: number }>(query, parameters);
      return result[0]?.total || 0;
    } else {
      const result = await this.executeQuery<{ total: number }>(query, parameters);
      return (result as any).recordset[0]?.total || 0;
    }
  }

  /**
   * Execute a transaction (MSSQL only for now)
   * TODO: Implement PostgreSQL transaction support
   */
  protected async executeTransaction<T>(
    operations: () => Promise<T>
  ): Promise<T> {
    if (this.dbType === 'postgres') {
      // For PostgreSQL, we'll need to implement proper transaction support
      // For now, just execute the operations without transaction
      console.warn('⚠️ Transaction support not yet implemented for PostgreSQL. Executing without transaction.');
      return await operations();
    } else {
      // MSSQL transaction support
      await this.executeQuery('BEGIN TRANSACTION');
      try {
        const result = await operations();
        await this.executeQuery('COMMIT TRANSACTION');
        return result;
      } catch (error) {
        await this.executeQuery('ROLLBACK TRANSACTION');
        throw error;
      }
    }
  }
}

/**
 * Example service implementation
 */
export class UserService extends BaseService {
  private readonly tableName = 'Users';

  async getAllUsers() {
    return this.findAll(this.tableName, undefined, undefined, 'created_at DESC');
  }

  async getUserById(id: string) {
    return this.findById(this.tableName, id);
  }

  async createUser(userData: Record<string, any>) {
    return this.insert(this.tableName, userData);
  }

  async updateUser(id: string, userData: Record<string, any>) {
    return this.update(this.tableName, id, userData);
  }

  async deleteUser(id: string) {
    return this.delete(this.tableName, id);
  }

  async getUserByEmail(email: string) {
    const result = await this.findAll(this.tableName, 'email = @email', { email });
    return result[0] || null;
  }

  async userExists(email: string) {
    return this.exists(this.tableName, 'email = @email', { email });
  }
}

/**
 * Example service implementation for products
 */
export class ProductService extends BaseService {
  private readonly tableName = 'Products';

  async getAllProducts(limit?: number, offset?: number) {
    return this.findAll(this.tableName, undefined, undefined, 'created_at DESC', limit, offset);
  }

  async getProductById(id: string) {
    return this.findById(this.tableName, id);
  }

  async createProduct(productData: Record<string, any>) {
    return this.insert(this.tableName, productData);
  }

  async updateProduct(id: string, productData: Record<string, any>) {
    return this.update(this.tableName, id, productData);
  }

  async deleteProduct(id: string) {
    return this.delete(this.tableName, id);
  }

  async getProductsByCategory(category: string) {
    return this.findAll(this.tableName, 'category = @category', { category });
  }

  async searchProducts(searchTerm: string) {
    const whereClause = 'name LIKE @searchTerm OR description LIKE @searchTerm';
    const parameters = { searchTerm: `%${searchTerm}%` };
    return this.findAll(this.tableName, whereClause, parameters);
  }
}

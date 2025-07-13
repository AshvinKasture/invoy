# Migration System Guide

Comprehensive guide to database migrations and schema management in the Invoy database framework.

## 🔄 Migration Overview

The migration system provides robust database schema management with:

- ✅ **Multi-database support** (PostgreSQL and MSSQL)
- ✅ **Automatic rollback** capabilities
- ✅ **Checksum validation** for migration integrity
- ✅ **Migration history tracking**
- ✅ **CLI interface** for easy management
- ✅ **Development and production** support

## 📁 Migration File Structure

```
backend/src/database/
├── migration/
│   ├── manager.ts          # Migration manager core
│   └── migrations/         # Migration files
│       ├── 001_initial_schema.sql
│       ├── 002_add_user_profiles.sql
│       └── 003_add_product_categories.sql
├── schema.sql              # MSSQL initial schema
└── schema-postgres.sql     # PostgreSQL initial schema
```

## 🚀 Quick Start

### Initialize Database Schema

```bash
# First-time setup - creates migration table and applies initial schema
npm run migrate init

# Check current migration status
npm run migrate status

# Apply all pending migrations
npm run migrate up

# Rollback last migration
npm run migrate down
```

### Create New Migration

```bash
# Create a new migration file
npm run migrate create "add_user_profiles"

# This creates: migrations/004_add_user_profiles.sql
```

## 📋 CLI Commands

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize database schema | `npm run migrate init` |
| `status` | Show migration status | `npm run migrate status` |
| `up` | Apply pending migrations | `npm run migrate up` |
| `down` | Rollback last migration | `npm run migrate down` |
| `create` | Create new migration file | `npm run migrate create "description"` |
| `reset` | Reset database (dev only) | `npm run migrate reset` |

### Command Examples

```bash
# Initialize fresh database
npm run migrate init

# Check what migrations need to be applied
npm run migrate status
# Output:
# Migration Status:
# ✅ 001_initial_schema.sql (applied)
# ✅ 002_add_user_profiles.sql (applied)
# ⏳ 003_add_product_categories.sql (pending)

# Apply all pending migrations
npm run migrate up

# Create new migration
npm run migrate create "add_order_tracking"
# Creates: migrations/004_add_order_tracking.sql

# Rollback last migration
npm run migrate down
```

## 📝 Writing Migrations

### Migration File Format

Migration files follow this naming convention:
```
{version}_{description}.sql
```

Examples:
- `001_initial_schema.sql`
- `002_add_user_profiles.sql`
- `003_create_order_system.sql`

### Basic Migration Structure

```sql
-- Migration: Add user profiles table
-- Description: Creates user_profiles table with foreign key to users

-- UP: Apply migration
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    bio NVARCHAR(500),
    avatar_url NVARCHAR(255),
    preferences NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_user_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IX_user_profiles_user_id ON user_profiles(user_id);

-- DOWN: Rollback migration
-- DROP INDEX IX_user_profiles_user_id ON user_profiles;
-- DROP TABLE user_profiles;
```

### PostgreSQL vs MSSQL Differences

**PostgreSQL Migration:**
```sql
-- PostgreSQL syntax
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(255),
    preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_user_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

**MSSQL Migration:**
```sql
-- MSSQL syntax
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id BIGINT NOT NULL,
    bio NVARCHAR(500),
    avatar_url NVARCHAR(255),
    preferences NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    
    CONSTRAINT FK_user_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IX_user_profiles_user_id ON user_profiles(user_id);
```

## 🔧 Migration Management

### Migration Tracking

The system automatically tracks:
- **Migration version** and filename
- **Applied timestamp**
- **Checksum** for integrity verification
- **Rollback information**

Migration tracking table schema:
```sql
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    filename VARCHAR(500) NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER
);
```

### Checksum Validation

Every migration file has its checksum calculated and stored. If a migration file is modified after being applied, the system will detect the change:

```bash
npm run migrate status
# Output:
# ❌ 002_add_user_profiles.sql (checksum mismatch - file was modified!)
```

### Migration Rollbacks

Rollback support with DOWN sections:

```sql
-- UP: Apply changes
CREATE TABLE new_feature (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255)
);

-- DOWN: Rollback changes (commented for safety)
-- DROP TABLE new_feature;
```

To enable rollbacks, uncomment the DOWN section:
```bash
npm run migrate down  # Rolls back the last migration
```

## 🏗️ Schema Files

### Initial Schema Setup

The framework includes two initial schema files:

**`schema.sql` (MSSQL):**
- Creates users, products, orders tables
- Includes proper indexes and constraints
- Uses MSSQL-specific data types (BIGINT IDENTITY, NVARCHAR, DATETIME2)

**`schema-postgres.sql` (PostgreSQL):**
- Same structure adapted for PostgreSQL
- Uses PostgreSQL data types (BIGSERIAL, TEXT, TIMESTAMPTZ)
- Includes JSONB columns for flexible data

### Switching Between Databases

When changing database types, the migration system handles differences:

```bash
# Switch from MSSQL to PostgreSQL
# 1. Update .env file
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://...

# 2. Initialize with PostgreSQL schema
npm run migrate init

# 3. Migrations are automatically adapted
npm run migrate up
```

## 💾 Data Migrations

### Simple Data Migrations

```sql
-- Migration: Update user email domains
-- UP
UPDATE users 
SET email = REPLACE(email, '@oldcompany.com', '@newcompany.com')
WHERE email LIKE '%@oldcompany.com';

-- DOWN
-- UPDATE users 
-- SET email = REPLACE(email, '@newcompany.com', '@oldcompany.com')
-- WHERE email LIKE '%@newcompany.com';
```

### Complex Data Transformations

```sql
-- Migration: Normalize user names
-- UP
UPDATE users 
SET 
    first_name = TRIM(SUBSTRING(full_name, 1, CHARINDEX(' ', full_name + ' ') - 1)),
    last_name = TRIM(SUBSTRING(full_name, CHARINDEX(' ', full_name + ' ') + 1, LEN(full_name)))
WHERE first_name IS NULL AND last_name IS NULL AND full_name IS NOT NULL;
```

## 🔄 Environment-Specific Migrations

### Development vs Production

**Development migrations:**
```sql
-- Safe for dev: can drop and recreate
DROP TABLE IF EXISTS temp_table;
CREATE TABLE temp_table (id INT);
```

**Production migrations:**
```sql
-- Production-safe: only add columns
ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);
-- Never: ALTER TABLE users DROP COLUMN old_column; (data loss!)
```

### Conditional Migrations

```sql
-- Check if column exists before adding (MSSQL)
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'middle_name'
)
BEGIN
    ALTER TABLE users ADD middle_name NVARCHAR(100);
END
```

```sql
-- Check if column exists before adding (PostgreSQL)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'middle_name'
    ) THEN
        ALTER TABLE users ADD COLUMN middle_name VARCHAR(100);
    END IF;
END $$;
```

## 🚨 Troubleshooting

### Common Issues

**Migration Failed Midway:**
```bash
# Check status
npm run migrate status

# Manually fix the issue in database, then mark migration as applied
# (Advanced users only)
```

**Checksum Mismatch:**
```bash
# A migration file was modified after being applied
# Either revert the file or create a new migration with the changes
npm run migrate create "fix_previous_migration"
```

**Connection Issues:**
```bash
# Test database connectivity first
npm run test-db

# Check configuration
node -e "console.log(require('./src/database/core/config').loadDatabaseConfig())"
```

### Recovery Procedures

**Reset Development Database:**
```bash
# WARNING: This will destroy all data!
npm run migrate reset
npm run migrate init
npm run migrate up
```

**Manual Migration Table Fix:**
```sql
-- View current migration state
SELECT * FROM schema_migrations ORDER BY applied_at;

-- Remove problematic migration (if needed)
DELETE FROM schema_migrations WHERE version = '003';
```

## 📊 Best Practices

### Migration Development

1. **Test migrations locally** before deploying
2. **Keep migrations small** and focused
3. **Always include rollback instructions** (even if commented)
4. **Use descriptive names** for migration files
5. **Never modify applied migrations** - create new ones instead

### Production Deployment

1. **Backup database** before applying migrations
2. **Test migrations on staging** environment first
3. **Apply migrations during maintenance windows**
4. **Monitor migration execution time**
5. **Have rollback plan ready**

### Schema Design

1. **Use consistent naming conventions**
2. **Add proper indexes** for performance
3. **Include foreign key constraints** for data integrity
4. **Use appropriate data types** for each database
5. **Document complex migrations**

## 🔗 Integration with CI/CD

### GitHub Actions Example

```yaml
name: Database Migration
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run migrations
        run: npm run migrate up
        env:
          DB_CONNECTION_STRING: ${{ secrets.DB_CONNECTION_STRING }}
          DB_TYPE: postgres
```

### Azure DevOps Pipeline

```yaml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'

- script: npm ci
  displayName: 'Install dependencies'

- script: npm run migrate up
  displayName: 'Apply database migrations'
  env:
    DB_CONNECTION_STRING: $(DB_CONNECTION_STRING)
    DB_TYPE: postgres
```

## 📈 Monitoring & Logging

The migration system provides detailed logging:

```typescript
// Migration execution logs
[2024-01-15 10:30:15] INFO: Starting migration 003_add_product_categories.sql
[2024-01-15 10:30:15] INFO: Calculating migration checksum...
[2024-01-15 10:30:16] INFO: Executing migration SQL...
[2024-01-15 10:30:18] INFO: Migration completed in 2.3s
[2024-01-15 10:30:18] INFO: Recording migration in schema_migrations table
```

### Performance Tracking

```sql
-- View migration performance
SELECT 
    version,
    filename,
    execution_time_ms,
    applied_at
FROM schema_migrations 
ORDER BY execution_time_ms DESC;
```

---

Your database schema is now under complete version control! 🗃️

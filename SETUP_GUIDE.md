# 🚀 Invoice Application Setup Guide

## Step-by-Step Database Setup and Testing

### Option 1: PostgreSQL with Docker (Recommended for Quick Start)

**1. Start PostgreSQL with Docker:**
```bash
# Pull and run PostgreSQL container
docker run --name invoy-postgres \
  -e POSTGRES_DB=invoydb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Verify container is running
docker ps
```

**2. Verify Database Connection:**
```bash
# Connect to PostgreSQL using docker exec
docker exec -it invoy-postgres psql -U postgres -d invoydb

# Or if you have psql installed locally
psql -h localhost -p 5432 -U postgres -d invoydb
```

### Option 2: Local PostgreSQL Installation

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for postgres user
4. PostgreSQL will run on port 5432

**macOS:**
```bash
brew install postgresql
brew services start postgresql
createdb invoydb
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb invoydb
```

### Option 3: MSSQL Alternative

**SQL Server LocalDB (Windows):**
```bash
# Update .env file:
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=(localdb)\\mssqllocaldb;Database=InvoyDB;Trusted_Connection=true;
```

## 🔧 Application Setup

**1. Install Dependencies:**
```bash
cd backend
npm install
```

**2. Configure Environment:**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
# For PostgreSQL (default):
DB_TYPE=postgres
DB_CONNECTION_STRING=postgresql://postgres:password@localhost:5432/invoydb

# For MSSQL:
DB_TYPE=mssql
DB_CONNECTION_STRING=Server=(localdb)\\mssqllocaldb;Database=InvoyDB;Trusted_Connection=true;
```

**3. Initialize Database:**
```bash
# Initialize database schema
npm run migrate init

# Check migration status
npm run migrate status
```

**4. Test Database Connection:**
```bash
# Test database connectivity
npm run test-db
```

**5. Start Application:**
```bash
# Development mode with auto-reload
npm run dev

# Or build and run
npm run build
npm start
```

## 🧪 Testing Commands

```bash
# Test database connection
npm run test-db

# Check migration status
npm run migrate status

# Apply pending migrations
npm run migrate up

# Create new migration
npm run migrate create "description"

# Build TypeScript
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

## 🔍 Verification Steps

**1. Database Connection Test:**
```bash
npm run test-db
```
Expected output:
```
✅ Database connection successful
✅ Health check passed
✅ Query execution working
✅ Database framework ready!
```

**2. Migration Status:**
```bash
npm run migrate status
```
Expected output:
```
Migration Status:
✅ 001_initial_invoice_schema.sql (applied)
```

**3. Application Health Check:**
```bash
# Start the application
npm run dev

# In another terminal, test the health endpoint
curl http://localhost:3000/api/health
```

## 🎯 Next Steps After Setup

**1. Test the Invoice Schema:**
```sql
-- Connect to your database and verify tables
\dt  -- PostgreSQL: List tables
SELECT name FROM sys.tables;  -- MSSQL: List tables

-- Insert test data
INSERT INTO users (email, password_hash, role) 
VALUES ('admin@invoy.com', 'hashed_password_here', 'admin');

INSERT INTO parties (name, party_type, email) 
VALUES ('Test Customer', 'customer', 'customer@test.com');

INSERT INTO items (code, name, unit_of_measure, base_price) 
VALUES ('ITEM001', 'Test Item', 'pcs', 100.00);
```

**2. API Development:**
- Create controllers for users, parties, items, invoices, transactions
- Implement authentication and authorization
- Add validation for invoice business logic
- Create API endpoints for CRUD operations

**3. Frontend Integration:**
- Connect React frontend to backend APIs
- Implement invoice creation/editing forms
- Add transaction management interface
- Create reporting and analytics views

## 🚨 Troubleshooting

**Database Connection Issues:**
```bash
# Check if PostgreSQL is running
docker ps  # For Docker
sudo systemctl status postgresql  # For Linux
services.msc  # For Windows (look for PostgreSQL)

# Test connection manually
psql -h localhost -p 5432 -U postgres -d invoydb
sqlcmd -S localhost -d InvoyDB -E  # For MSSQL
```

**Migration Issues:**
```bash
# Reset database (DEVELOPMENT ONLY!)
npm run migrate reset
npm run migrate init

# Check for syntax errors in migration files
npm run build
```

**TypeScript Compilation Issues:**
```bash
# Clear compiled files and rebuild
npm run clean
npm run build
```

## 📊 Database Schema Overview

Your invoice application includes these tables:
- **users**: Application users (admin, manager roles)
- **parties**: Customers and vendors
- **items**: Products/services catalog
- **banks**: Bank account information
- **invoices**: Purchase and sale invoices
- **invoice_items**: Line items for invoices
- **transactions**: Bank transactions
- **invoice_transaction_links**: Links transactions to invoices

The schema supports:
- ✅ Multi-role user management
- ✅ Customer and vendor management
- ✅ Product/service catalog
- ✅ Purchase and sale invoices
- ✅ Invoice line items with quantities and rates
- ✅ Bank transaction tracking
- ✅ Transaction-to-invoice linking for payments
- ✅ Comprehensive indexing for performance
- ✅ Foreign key constraints for data integrity

Ready to build your invoice management system! 🎉

# Local Development with SQL Server LocalDB

This guide explains how to set up SQL Server LocalDB for local development with the Invoy backend application.

## What is SQL Server LocalDB?

SQL Server LocalDB is a lightweight version of SQL Server Express that's designed for developers. It comes with Visual Studio and SQL Server Express installations and provides a simple way to create and work with SQL Server databases locally.

## Prerequisites

### Option 1: Visual Studio (Recommended)
- Visual Studio 2019 or later (Community, Professional, or Enterprise)
- LocalDB is included by default with Visual Studio

### Option 2: SQL Server Express
- Download and install [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- Make sure to include LocalDB during installation

### Option 3: Standalone LocalDB
- Download [SQL Server Express LocalDB](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/sql-server-express-localdb)

## Setup Instructions

### 1. Verify LocalDB Installation

Open Command Prompt or PowerShell and run:

```cmd
sqllocaldb info
```

You should see output like:
```
MSSQLLocalDB
v11.0
v12.0
v13.0
v14.0
v15.0
```

### 2. Start LocalDB Instance

```cmd
sqllocaldb start MSSQLLocalDB
```

### 3. Get Instance Information

```cmd
sqllocaldb info MSSQLLocalDB
```

This will show you the instance details including the server name (usually `(localdb)\\MSSQLLocalDB`).

### 4. Configure Your Environment

Create a `.env` file in your backend directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration - LocalDB
DB_CONNECTION_STRING=Server=(localdb)\\MSSQLLocalDB;Database=InvoyDB;Trusted_Connection=true;TrustServerCertificate=true;

# Database Pool Configuration
DB_POOL_MIN=0
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=15000
DB_REQUEST_TIMEOUT=15000
```

### 5. Create the Database

You have several options to create the database:

#### Option A: Using the Migration Tool (Recommended)

```bash
npm run migrate init
```

#### Option B: Using SQL Server Management Studio (SSMS)

1. Open SSMS
2. Connect to `(localdb)\\MSSQLLocalDB`
3. Right-click "Databases" → "New Database"
4. Name it "InvoyDB"
5. Run the schema script from `src/database/schema.sql`

#### Option C: Using Command Line

```cmd
sqlcmd -S "(localdb)\\MSSQLLocalDB" -Q "CREATE DATABASE InvoyDB"
sqlcmd -S "(localdb)\\MSSQLLocalDB" -d InvoyDB -i "src\\database\\schema.sql"
```

### 6. Test the Connection

```bash
npm run dev
```

Then check the health endpoint:
```bash
curl http://localhost:8000/api/health
```

## Alternative Local Database Options

### SQL Server Express (Full Installation)

If you prefer a full SQL Server Express installation:

```env
# For SQL Server Express with Windows Authentication
DB_CONNECTION_STRING=Server=localhost\\SQLEXPRESS;Database=InvoyDB;Trusted_Connection=true;TrustServerCertificate=true;

# For SQL Server Express with SQL Authentication
DB_CONNECTION_STRING=Server=localhost\\SQLEXPRESS;Database=InvoyDB;User Id=sa;Password=YourPassword123!;Encrypt=false;TrustServerCertificate=true;
```

### Docker SQL Server (Cross-Platform)

For Mac/Linux developers or if you prefer Docker:

```bash
# Run SQL Server in Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
   -p 1433:1433 --name sql-server \
   -d mcr.microsoft.com/mssql/server:2022-latest

# Connection string for Docker
DB_CONNECTION_STRING=Server=localhost,1433;Database=InvoyDB;User Id=sa;Password=YourPassword123!;Encrypt=false;TrustServerCertificate=true;
```

## Troubleshooting

### LocalDB Instance Not Found

```cmd
# Create a new instance
sqllocaldb create MSSQLLocalDB

# Start the instance
sqllocaldb start MSSQLLocalDB
```

### Connection Timeout Issues

- Increase the connection timeout in your `.env` file:
```env
DB_CONNECTION_TIMEOUT=30000
DB_REQUEST_TIMEOUT=30000
```

### Database Doesn't Exist

The application will try to connect to the database specified in the connection string. Make sure:

1. The database name matches what's in your connection string
2. The database has been created
3. You have proper permissions

### Windows Authentication Issues

If you're having issues with `Trusted_Connection=true`, try:

1. Run your development environment as Administrator
2. Check that your Windows user has access to LocalDB
3. Try using SQL Authentication instead:

```env
# Create a SQL user first, then use:
DB_CONNECTION_STRING=Server=(localdb)\\MSSQLLocalDB;Database=InvoyDB;User Id=testuser;Password=testpass123!;Encrypt=false;TrustServerCertificate=true;
```

## Database Management Tools

### Visual Studio
- Built-in SQL Server Object Explorer
- Can connect directly to LocalDB instances

### SQL Server Management Studio (SSMS)
- Full-featured database management
- Free download from Microsoft
- Connect to: `(localdb)\\MSSQLLocalDB`

### Azure Data Studio
- Cross-platform database tool
- Modern interface
- Good for queries and basic management

### VS Code Extensions
- **SQL Server (mssql)** - Query and manage databases
- **SQLTools** - Multi-database support

## Performance Tips

1. **Database Size**: LocalDB databases can grow up to 10GB by default
2. **Connections**: LocalDB supports up to 3 concurrent connections
3. **Performance**: Good for development but not for production use
4. **File Location**: Databases are stored in your user profile by default

## Migration Path

When you're ready to move from LocalDB to Azure SQL Database:

1. Export your schema and data from LocalDB
2. Create Azure SQL Database
3. Update your connection string
4. Import schema and data

The application code doesn't need to change - just the connection string!

## Quick Reference

### Common LocalDB Commands

```cmd
# List all instances
sqllocaldb info

# Start instance
sqllocaldb start MSSQLLocalDB

# Stop instance
sqllocaldb stop MSSQLLocalDB

# Delete instance
sqllocaldb delete MSSQLLocalDB

# Get instance info
sqllocaldb info MSSQLLocalDB
```

### Connection String Examples

```env
# LocalDB with Windows Auth (recommended for development)
DB_CONNECTION_STRING=Server=(localdb)\\MSSQLLocalDB;Database=InvoyDB;Trusted_Connection=true;TrustServerCertificate=true;

# LocalDB with SQL Auth
DB_CONNECTION_STRING=Server=(localdb)\\MSSQLLocalDB;Database=InvoyDB;User Id=testuser;Password=testpass123!;Encrypt=false;TrustServerCertificate=true;

# SQL Server Express
DB_CONNECTION_STRING=Server=localhost\\SQLEXPRESS;Database=InvoyDB;Trusted_Connection=true;TrustServerCertificate=true;

# Docker SQL Server
DB_CONNECTION_STRING=Server=localhost,1433;Database=InvoyDB;User Id=sa;Password=YourPassword123!;Encrypt=false;TrustServerCertificate=true;
```

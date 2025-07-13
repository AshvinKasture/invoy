-- Database setup script for Invoy application
-- Run this in PostgreSQL to create the database and user

-- Connect as superuser (postgres) to create database and user
-- You can run this using psql or pgAdmin

-- Create database
CREATE DATABASE invoydb
  WITH 
  OWNER = postgres
  ENCODING = 'UTF8'
  LC_COLLATE = 'English_United States.1252'
  LC_CTYPE = 'English_United States.1252'
  TABLESPACE = pg_default
  CONNECTION LIMIT = -1;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE invoydb TO postgres;

-- Connect to the new database to verify
\c invoydb;

-- Show current database
SELECT current_database();

-- Database initialization script for Radio Script API
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (PostgreSQL creates it automatically from environment variables)
-- The database is created by the POSTGRES_DB environment variable

-- You can add any additional initialization SQL here if needed
-- For example, creating extensions, setting up initial data, etc.

-- Example: Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Example: Create initial admin user (if needed)
-- INSERT INTO users (email, password, role) VALUES ('admin@example.com', 'hashed_password', 'admin');

-- Note: Most of the database setup will be handled by your NestJS application's migrations/entities 
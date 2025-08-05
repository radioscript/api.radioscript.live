# Docker Compose Setup for Radio Script API

This Docker Compose configuration sets up a complete development environment for the Radio Script API with PostgreSQL database.

## Prerequisites

- Docker
- Docker Compose
- Git

## Quick Start

1. **Navigate to the radio-script directory**:

   ```bash
   cd apps/radio-script
   ```

2. **Set up environment variables**:

   ```bash
   # Copy the sample environment file
   cp env.development.sample .env.development

   # Edit the environment file with your specific values
   nano .env.development
   ```

3. **Start the services**:

   ```bash
   # Start all services
   docker-compose up -d

   # Or start with logs
   docker-compose up
   ```

4. **Access the application**:
   - API: http://localhost:3001
   - Swagger Documentation: http://localhost:3001/api (if configured)
   - Database: localhost:5432

## Services

### PostgreSQL Database

- **Container**: `radio-script-postgres`
- **Port**: 5432 (configurable via `DATABASE_PORT`)
- **Database**: `radioscript` (configurable via `DATABASE_NAME`)
- **User**: `postgres` (configurable via `DATABASE_USER`)
- **Password**: `password` (configurable via `DATABASE_PASSWORD`)

### Radio Script API

- **Container**: `radio-script-app`
- **Port**: 3001 (configurable via `APP_PORT`)
- **Health Check**: http://localhost:3001/health

## Environment Variables

The Docker Compose setup uses the following environment variables (with defaults):

### Required Variables

- `DATABASE_NAME`: Database name (default: `radioscript`)
- `DATABASE_USER`: Database user (default: `postgres`)
- `DATABASE_PASSWORD`: Database password (default: `password`)
- `JWT_SECRET_KEY`: JWT secret for authentication
- `ENCRYPT_SECRET_KEY`: Encryption secret key

### Optional Variables

- `APP_PORT`: Application port (default: `3001`)
- `NODE_ENV`: Environment (default: `development`)
- `S3_*`: S3 configuration for file uploads
- `SMTP_*`: Email configuration
- `GOOGLE_*`: Google OAuth configuration
- `GH_*`: GitHub OAuth configuration
- `SMS_*`: SMS service configuration

## Useful Commands

```bash
# Navigate to the radio-script directory first
cd apps/radio-script

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f radio-script

# Rebuild and start
docker-compose up -d --build

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d radioscript

# Access application container
docker-compose exec radio-script sh

# Check service status
docker-compose ps
```

## Development Workflow

1. **First time setup**:

   ```bash
   cd apps/radio-script
   cp env.development.sample .env.development
   # Edit .env.development with your values
   docker-compose up -d
   ```

2. **Making changes**:

   ```bash
   # After making code changes, rebuild the application
   docker-compose up -d --build
   ```

3. **Database migrations**:
   - The application will handle database migrations automatically on startup
   - You can also run migrations manually inside the container:
   ```bash
   docker-compose exec radio-script npx nx run radio-script:migrate
   ```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`
- Verify environment variables in `.env.development`

### Application Issues

- Check application logs: `docker-compose logs radio-script`
- Verify the application is healthy: `curl http://localhost:3001/health`
- Check if the application can connect to the database

### Port Conflicts

- If port 3001 is already in use, change `APP_PORT` in `.env.development`
- If port 5432 is already in use, change `DATABASE_PORT` in `.env.development`

### Volume Issues

- If you need to reset the database, run: `docker-compose down -v && docker-compose up -d`

## Production Considerations

For production deployment:

1. **Security**:

   - Change all default passwords
   - Use strong JWT and encryption secrets
   - Configure proper CORS settings
   - Use environment-specific configuration

2. **Performance**:

   - Use PostgreSQL with proper resource limits
   - Configure application with production settings
   - Set up proper logging and monitoring

3. **Data Persistence**:
   - Configure proper volume mounts for data persistence
   - Set up database backups
   - Use external database services if needed

## File Structure

```
apps/radio-script/
├── docker-compose.yml          # Docker Compose configuration
├── env.development.sample      # Sample environment variables
├── init-db.sql                # Database initialization script
├── Dockerfile                 # Application Dockerfile
└── DOCKER_README.md           # This file
```

## Important Notes

- The Docker Compose file is now located in `apps/radio-script/`
- The build context is set to `../..` (two levels up) to access the root of the Nx workspace
- All Docker commands should be run from the `apps/radio-script/` directory
- The environment file should be created in the `apps/radio-script/` directory

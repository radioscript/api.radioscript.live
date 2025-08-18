# Docker Compose Setup for Radio Script API

This Docker Compose configuration sets up a complete development environment for the Radio Script API with PostgreSQL database and Redis cache.

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
   # Start all services (PostgreSQL, Redis, and Application)
   docker-compose up -d

   # Or start with logs
   docker-compose up
   ```

4. **Access the application**:
   - API: http://localhost:3001
   - Swagger Documentation: http://localhost:3001/api (if configured)
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Services

### PostgreSQL Database

- **Container**: `radio-script-postgres`
- **Port**: 5432 (configurable via `DATABASE_PORT`)
- **Database**: `radioscript` (configurable via `DATABASE_NAME`)
- **User**: `postgres` (configurable via `DATABASE_USER`)
- **Password**: `password` (configurable via `DATABASE_PASSWORD`)
- **Health Check**: Automatically checks database readiness

### Redis Cache

- **Container**: `radio-script-redis`
- **Port**: 6379 (configurable via `REDIS_PORT`)
- **Persistence**: Enabled with append-only file
- **Health Check**: Automatically checks Redis connectivity

### Radio Script API

- **Container**: `radio-script-app`
- **Port**: 3001 (configurable via `APP_PORT`)
- **Health Check**: http://localhost:3001/health
- **Dependencies**: Waits for PostgreSQL and Redis to be healthy before starting

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
- `DATABASE_PORT`: PostgreSQL port (default: `5432`)
- `REDIS_PORT`: Redis port (default: `6379`)
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

# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f radio-script
docker-compose logs -f postgres
docker-compose logs -f redis

# Rebuild and start
docker-compose up -d --build

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d radioscript

# Access Redis CLI
docker-compose exec redis redis-cli

# Access application container
docker-compose exec radio-script sh

# Check service status
docker-compose ps

# Check service health
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
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

## Production Deployment

**IMPORTANT**: For production environments, it's recommended to run PostgreSQL and Redis as standalone services rather than using Docker Compose. This provides better security, performance, and manageability.

### Production Database Setup

1. **PostgreSQL Production Setup**:

   - Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, Azure Database)
   - Or install PostgreSQL directly on a dedicated server
   - Configure proper backup strategies
   - Set up connection pooling
   - Use strong passwords and SSL connections

2. **Redis Production Setup**:

   - Use a managed Redis service (AWS ElastiCache, Google Cloud Memorystore, Azure Cache)
   - Or install Redis directly on a dedicated server
   - Configure Redis persistence and replication
   - Set up proper security and access controls

3. **Application Deployment**:
   - Deploy the application container separately
   - Use environment variables to connect to external database services
   - Configure proper logging and monitoring
   - Set up load balancing and auto-scaling

### Production Environment Variables

```bash
# Database Configuration
DATABASE_HOST=your-production-postgres-host
DATABASE_PORT=5432
DATABASE_NAME=radioscript_prod
DATABASE_USER=radioscript_user
DATABASE_PASSWORD=strong_production_password
DATABASE_SSL=true

# Redis Configuration
REDIS_HOST=your-production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=strong_redis_password
REDIS_SSL=true

# Application Configuration
NODE_ENV=production
APP_PORT=3001
JWT_SECRET_KEY=your_very_strong_jwt_secret
ENCRYPT_SECRET_KEY=your_very_strong_encryption_key
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`
- Verify environment variables in `.env.development`
- Test database connectivity: `docker-compose exec postgres pg_isready -U postgres`

### Redis Connection Issues

- Ensure Redis is running: `docker-compose ps`
- Check Redis logs: `docker-compose logs redis`
- Test Redis connectivity: `docker-compose exec redis redis-cli ping`

### Application Issues

- Check application logs: `docker-compose logs radio-script`
- Verify the application is healthy: `curl http://localhost:3001/health`
- Check if the application can connect to the database and Redis
- Ensure all services are healthy: `docker-compose ps`

### Port Conflicts

- If port 3001 is already in use, change `APP_PORT` in `.env.development`
- If port 5432 is already in use, change `DATABASE_PORT` in `.env.development`
- If port 6379 is already in use, change `REDIS_PORT` in `.env.development`

### Volume Issues

- If you need to reset the database, run: `docker-compose down -v && docker-compose up -d`
- Check volume usage: `docker volume ls`

## Security Considerations

### Development Environment

- Use strong passwords even in development
- Don't commit sensitive environment variables to version control
- Use `.env.development` for local development settings

### Production Environment

- Use managed database services with built-in security
- Enable SSL/TLS for all database connections
- Use strong, unique passwords for each service
- Implement proper network security and firewalls
- Regular security updates and patches
- Monitor access logs and set up alerts

## File Structure

```
apps/radio-script/
├── docker-compose.yml          # Docker Compose configuration (development only)
├── env.development.sample      # Sample environment variables
├── init-db.sql                # Database initialization script
├── Dockerfile                 # Application Dockerfile
└── DOCKER_README.md           # This file
```

## Important Notes

- The Docker Compose file is configured for **development only**
- For production, use managed database services or dedicated servers
- All Docker commands should be run from the `apps/radio-script/` directory
- The environment file should be created in the `apps/radio-script/` directory
- The application waits for both PostgreSQL and Redis to be healthy before starting
- Data persistence is configured for both PostgreSQL and Redis volumes

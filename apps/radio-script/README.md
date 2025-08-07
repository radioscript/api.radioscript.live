# Radio Script Docker Setup

This directory contains Docker Compose configurations for running the Radio Script API and PostgreSQL database separately.

## Files

- `docker-compose.yml` - Main application (radio-script API only)
- `docker-compose.postgres.yml` - PostgreSQL database only
- `.env.development` - Environment variables for both services

## Services

### Radio Script API

- **File**: `docker-compose.yml`
- **Port**: 3001
- **Endpoint**: `http://localhost:3001/api/v1`
- **Health Check**: `http://localhost:3001/api/v1/health`

### PostgreSQL Database

- **File**: `docker-compose.postgres.yml`
- **Port**: 5432
- **Database**: `radio_script`
- **User**: `postgres`
- **Password**: `password`

## Usage

### Using npm scripts (from project root)

#### Radio Script API

```bash
# Start the API
npm run docker:up

# Stop the API
npm run docker:down

# View logs
npm run docker:logs

# Rebuild and start
npm run docker:rebuild

# Check status
npm run docker:status
```

#### PostgreSQL Database

```bash
# Start PostgreSQL
npm run docker:postgres:up

# Stop PostgreSQL
npm run docker:postgres:down

# View logs
npm run docker:postgres:logs

# Check status
npm run docker:postgres:status
```

### Using Docker Compose directly

#### Radio Script API

```bash
cd apps/radio-script

# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

#### PostgreSQL Database

```bash
cd apps/radio-script

# Start
docker-compose -f docker-compose.postgres.yml up -d

# Stop
docker-compose -f docker-compose.postgres.yml down

# View logs
docker-compose -f docker-compose.postgres.yml logs -f
```

## Environment Variables

Both services use the `.env.development` file. Key variables:

```env
# Database Configuration
DATABASE_HOST=postgres  # or localhost if running separately
DATABASE_PORT=5432
DATABASE_NAME=radio_script
DATABASE_USER=postgres
DATABASE_PASSWORD=password

# App Configuration
APP_PORT=3001
NODE_ENV=development
```

## Scenarios

### Development with Local Database

1. Start PostgreSQL: `npm run docker:postgres:up`
2. Update `.env.development`: `DATABASE_HOST=localhost`
3. Start API: `npm run docker:up`

### Development with Container Database

1. Start PostgreSQL: `npm run docker:postgres:up`
2. Keep `.env.development`: `DATABASE_HOST=postgres`
3. Start API: `npm run docker:up`

### Production-like Setup

1. Use external database
2. Update `.env.development` with production credentials
3. Start API: `npm run docker:up`

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `npm run docker:postgres:status`
- Check database logs: `npm run docker:postgres:logs`
- Verify environment variables in `.env.development`

### Application Issues

- Check application logs: `npm run docker:logs`
- Verify the application is healthy: `curl http://localhost:3001/api/v1/health`
- Check if the application can connect to the database

### Port Conflicts

- If port 3001 is already in use, change `APP_PORT` in `.env.development`
- If port 5432 is already in use, change `DATABASE_PORT` in `.env.development`

# Docker Setup & Deployment Guide

## Overview

This project uses Docker to containerize the entire Coursue application stack into 4 separate containers:

1. **Frontend** - React/Vite application served by Nginx
2. **Backend** - Node.js Express API server with Agenda job scheduler
3. **MongoDB** - Database container
4. **Network** - Docker bridge network for inter-container communication

## Prerequisites

- Docker Desktop (for Windows/Mac) or Docker Engine (for Linux)
- Docker Compose (included with Docker Desktop)
- Git
- Docker Hub account (for pushing images)

## Quick Start - Local Development

### 1. Clone and Setup

```bash
cd c:\Users\kumar\OneDrive\Documents\CODE\Coursue
```

### 2. Create Environment File

```bash
# Copy example to local .env
cp .env.example .env

# Edit .env with your actual values (Cloudinary, MongoDB Atlas, etc.)
# For local development, defaults are mostly fine
```

### 3. Build and Run Containers

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 4. Access the Application

- **Frontend**: http://localhost:80 (or http://localhost if port 80 is default)
- **Backend API**: http://localhost:4000
- **MongoDB**: localhost:27017 (internal to Docker network, not directly accessible)

## Container Details

### Backend Container

**Image**: `coursue-backend` (built from `./server/Dockerfile`)

**Purpose**: Express.js API server with Agenda job scheduler

**Features**:
- Node.js 22 Alpine (minimal, secure image)
- Multi-stage build (optimized for production)
- Non-root user execution (security)
- Health checks enabled
- Graceful shutdown handling
- Socket.IO support for real-time chat
- Agenda scheduler for class lifecycle management

**Environment Variables**:
```
NODE_ENV=development|production
PORT=4000
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Exposed Ports**: 4000

**Health Check**: HTTP GET to `http://localhost:4000/` (automatically retried 3 times)

**Volumes**:
- `/app` - Application source code
- `/app/node_modules` - Dependencies (persisted)
- `/app/uploads` - User uploads (profile pictures, etc.)

### Frontend Container

**Image**: `coursue-frontend` (built from `./Dockerfile`)

**Purpose**: React/Vite application served by Nginx

**Features**:
- Node.js 22 Alpine for build stage
- Nginx Alpine for serving (minimal, fast)
- Multi-stage build (build artifacts only in final image)
- SPA routing support (all routes serve index.html)
- API proxy to backend
- Socket.IO WebSocket support
- Gzip compression enabled
- Cache control for assets

**Exposed Ports**: 80

**Health Check**: HTTP GET to `http://localhost:80/health`

**Key Nginx Features**:
- SPA routing with try_files fallback to index.html
- `/api/` routes proxied to backend container
- `/socket.io` routes proxied with WebSocket support
- Gzip compression for JavaScript/CSS
- Cache headers for static assets (1 year for versioned assets)

**Environment Variables**: None (frontend is static)

### MongoDB Container

**Image**: `mongo:7.0-alpine` (official MongoDB image)

**Purpose**: Data persistence for application

**Features**:
- Alpine Linux (minimal image size)
- Authentication enabled by default
- Health checks built-in
- Data persistence with volumes
- Configuration backup volume

**Environment Variables**:
```
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=coursue
```

**Exposed Ports**: 27017 (internal Docker network only, not exposed to host)

**Health Check**: MongoDB ping command

**Volumes**:
- `mongodb_data` - Database files
- `mongodb_config` - Configuration files

### Docker Network

**Type**: Bridge network (`coursue-network`)

**Purpose**: Allows containers to communicate using container names as hostnames

**Service Discovery**:
- `backend` → accessible as `http://backend:4000` from frontend container
- `mongodb` → accessible as `mongodb:27017` from backend container
- `frontend` → accessible as `http://frontend:80` from other containers

## Docker Compose Commands

### Building

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build with no cache
docker-compose build --no-cache

# Build and tag for Docker Hub
docker-compose build --tag myusername/coursue-backend:v1.0.0
```

### Running

```bash
# Start all services in detached mode
docker-compose up -d

# Start and show logs
docker-compose up

# Start specific service
docker-compose up -d backend

# Restart services
docker-compose restart
docker-compose restart backend

# Stop services (without removing)
docker-compose stop

# Stop and remove containers
docker-compose down

# Down with volume removal (WARNING: deletes all data)
docker-compose down -v

# Down and remove images
docker-compose down --rmi all
```

### Monitoring

```bash
# View running containers
docker-compose ps

# View all logs
docker-compose logs

# View logs for specific service (follow)
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100

# View logs with timestamps
docker-compose logs -f --timestamps
```

### Debugging

```bash
# Execute command in running container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec mongodb mongosh

# View service stats (CPU, memory usage)
docker stats coursue-backend coursue-frontend coursue-mongodb

# Inspect container
docker inspect coursue-backend

# View container events
docker events

# Test backend health
docker-compose exec backend wget -O- http://localhost:4000/

# Test MongoDB connection
docker-compose exec backend mongosh -u admin -p password123 --authenticationDatabase admin mongodb://mongodb:27017
```

### Cleaning Up

```bash
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove all unused resources (containers, images, volumes, networks)
docker system prune -a

# Remove specific image
docker rmi coursue-backend:latest

# Remove specific volume
docker volume rm coursue_mongodb_data
```

## Production Deployment

### 1. Prepare Production Environment

```bash
# Create production environment file
cp .env.production .env.prod

# Edit .env.prod with production values
# - Use strong passwords
# - Set MongoDB Atlas URI
# - Set production domain
# - Update Cloudinary credentials
```

### 2. Build for Production

```bash
# Build with production environment
docker-compose -f docker-compose.yml build

# Tag images for Docker Hub
docker tag coursue-backend:latest myusername/coursue-backend:v1.0.0
docker tag coursue-backend:latest myusername/coursue-backend:latest
docker tag coursue-frontend:latest myusername/coursue-frontend:v1.0.0
docker tag coursue-frontend:latest myusername/coursue-frontend:latest
```

### 3. Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push backend images
docker push myusername/coursue-backend:v1.0.0
docker push myusername/coursue-backend:latest

# Push frontend images
docker push myusername/coursue-frontend:v1.0.0
docker push myusername/coursue-frontend:latest
```

### 4. Deploy to Server

```bash
# On your server:
# 1. Install Docker and Docker Compose
# 2. Clone repository (or create docker-compose.yml file)
# 3. Create .env file with production credentials
# 4. Run:

docker-compose --env-file .env.prod up -d

# Or pull pre-built images from Docker Hub:
docker pull myusername/coursue-backend:v1.0.0
docker pull myusername/coursue-frontend:v1.0.0
```

## Image Sizes & Optimization

### Current Optimization Strategies

1. **Alpine Linux**: Using `node:22-alpine` and `nginx:alpine` (50-70% smaller than full images)
2. **Multi-stage Builds**: Only final artifacts go into runtime images
3. **Minimal Layers**: Combining RUN commands where possible
4. **.dockerignore**: Excluding unnecessary files from build context

### Expected Image Sizes (Approximate)

- `backend:latest` → 200-250 MB
- `frontend:latest` → 150-200 MB
- `mongodb:latest` → 300-350 MB

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Port already in use: docker-compose down; docker-compose up -d
# 2. Volume permission: Docker daemon needs permission
# 3. Missing env vars: Check .env file exists and is properly configured
```

### MongoDB Connection Failed

```bash
# Verify MongoDB is healthy
docker-compose ps  # Look for mongodb health status

# Test connection
docker-compose exec backend mongosh -u admin -p password123 mongodb://mongodb:27017

# Check MongoDB logs
docker-compose logs mongodb
```

### Frontend Not Connecting to Backend

```bash
# Verify backend is healthy
docker-compose ps

# Test from frontend container
docker-compose exec frontend wget -v http://backend:4000/

# Check nginx configuration
docker-compose exec frontend cat /etc/nginx/nginx.conf

# Check frontend logs
docker-compose logs frontend
```

### High Memory/CPU Usage

```bash
# Check stats
docker stats

# Reduce resource usage by setting limits in docker-compose.yml:
# Add to services:
#   deploy:
#     resources:
#       limits:
#         cpus: '1'
#         memory: 512M
#       reservations:
#         cpus: '0.5'
#         memory: 256M
```

## Database Backup & Restore

### Backup MongoDB

```bash
# Create backup directory
mkdir backups

# Backup database
docker-compose exec mongodb mongodump --out=/backup --username admin --password password123 --authenticationDatabase admin

# Copy from container
docker cp coursue-mongodb:/backup ./backups/mongo-backup
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp ./backups/mongo-backup coursue-mongodb:/backup

# Restore database
docker-compose exec mongodb mongorestore /backup --username admin --password password123 --authenticationDatabase admin
```

## Updating Services

### Update Backend Service

```bash
# 1. Make code changes in ./server
# 2. Rebuild
docker-compose build backend

# 3. Restart
docker-compose up -d backend

# 4. Check logs
docker-compose logs -f backend
```

### Update Frontend Service

```bash
# 1. Make code changes in ./src
# 2. Rebuild
docker-compose build frontend

# 3. Restart
docker-compose up -d frontend

# 4. Check logs
docker-compose logs -f frontend
```

## Security Best Practices

1. **Change Default Passwords**: Update MongoDB credentials in .env
2. **Use Strong JWT Secret**: Generate a long random string
3. **Environment Variables**: Never commit .env files (use .gitignore)
4. **Network Isolation**: Containers only accessible through exposed ports
5. **Regular Updates**: Keep base images updated (`docker pull mongo:latest`)
6. **Non-root Users**: Containers run as non-root where possible
7. **Health Checks**: All containers have health checks enabled
8. **Secrets Management**: Use Docker Secrets for production secrets

## Monitoring & Logging

### Docker Logs

```bash
# Centralized logging (driver: json-file by default)
docker logs coursue-backend

# With timestamp
docker logs --timestamps coursue-backend

# Follow logs
docker logs -f coursue-backend
```

### Application Metrics

Check Backend API:
```bash
GET http://localhost:4000/jobs/stats  # Agenda scheduler stats
```

### Container Resource Usage

```bash
docker stats  # Real-time stats for all containers
```

## References

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Nginx Configuration: https://nginx.org/en/docs/
- MongoDB Docker: https://hub.docker.com/_/mongo
- Node.js Docker: https://hub.docker.com/_/node

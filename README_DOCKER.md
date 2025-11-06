# Coursue - Complete Docker Setup & Deployment Guide

## Quick Overview

This document provides a complete guide to dockerizing and deploying the Coursue application using Docker containers.

**Project Structure:**
- **Frontend**: React + Vite (builds to static files served by Nginx)
- **Backend**: Express.js + Node.js (REST API + Socket.IO)
- **Database**: MongoDB (data persistence)
- **Architecture**: 4 separate Docker containers orchestrated with Docker Compose

## What Was Created

### 1. Dockerfiles

#### Backend Dockerfile (`/server/Dockerfile`)
- Multi-stage build for optimization
- Node.js 22 Alpine base image
- Installs dependencies in build stage
- Runs as non-root user (nodejs)
- Includes health checks
- Exposes port 4000

#### Frontend Dockerfile (`/Dockerfile`)
- Node.js for build stage (npm install + Vite build)
- Nginx Alpine for serving production files
- Proxies API requests to backend
- WebSocket support for Socket.IO
- Exposes port 80
- Includes health checks

### 2. Configuration Files

#### Docker Compose (`docker-compose.yml`)
- **4 Services**:
  1. **mongodb** - Official MongoDB Alpine image
  2. **backend** - Express API server (builds from Dockerfile)
  3. **frontend** - Nginx web server (builds from Dockerfile)
  4. **Docker Network** - Isolated bridge network for container communication

- **Features**:
  - Health checks for all services
  - Environment variable configuration
  - Volume persistence for MongoDB and uploads
  - Automatic container restart
  - Service dependencies

#### Nginx Configuration (`nginx.conf`)
- API proxy to backend (`/api/` → backend:4000)
- WebSocket support for Socket.IO
- SPA routing (all routes serve index.html)
- Gzip compression
- Cache control for static assets
- Health check endpoint

#### Environment Configuration
- `.env.example` - Template for local development
- `.env.production` - Production-specific settings
- Supports multiple environments (dev, staging, prod)

### 3. Deployment Scripts

#### PowerShell Script (`deploy-docker.ps1`)
For Windows developers:
```powershell
.\deploy-docker.ps1 -Version "1.0.0" -Registry "myusername" -Environment "prod" -Push
```

Features:
- Validates Docker installation
- Builds images with docker-compose
- Tags images with version and environment tags
- Pushes to Docker Hub
- Colored output with progress indicators

#### Bash Script (`deploy-docker.sh`)
For Mac/Linux servers:
```bash
./deploy-docker.sh -v 1.0.0 -r myusername -e prod -p
```

Features:
- Same functionality as PowerShell script
- Works on Linux and Mac
- POSIX-compliant shell scripting

### 4. Documentation

#### DOCKER_SETUP.md
Comprehensive guide covering:
- Container details and specifications
- Docker Compose commands (build, run, debug, clean)
- Production deployment steps
- Troubleshooting guide
- Database backup/restore procedures
- Security best practices
- Monitoring and logging

#### DOCKER_HUB.md
Step-by-step guide for:
- Docker Hub account setup
- Repository creation
- Image tagging strategy
- Local authentication
- Pushing images
- Production server deployment
- CI/CD integration with GitHub Actions

### 5. .dockerignore Files
Exclude unnecessary files from Docker builds:
- node_modules
- .git
- .env (use .env.example instead)
- Test coverage files
- Development configs

## Installation & Setup

### Step 1: Install Docker

**Windows/Mac:**
1. Download Docker Desktop from https://docker.com/products/docker-desktop
2. Run installer and follow prompts
3. Restart computer
4. Verify: `docker --version` and `docker-compose --version`

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Step 2: Prepare Environment

```bash
# Navigate to project
cd c:\Users\kumar\OneDrive\Documents\CODE\Coursue

# Create environment file from template
cp .env.example .env

# Edit .env with your values:
# - MONGO_INITDB_ROOT_PASSWORD (change from default)
# - JWT_SECRET (generate a strong random string)
# - CLOUDINARY credentials (if you have them)
```

### Step 3: Build Images

```bash
# Build all containers
docker-compose build

# Or build specific services
docker-compose build backend
docker-compose build frontend
```

### Step 4: Start Containers

```bash
# Start all services in background
docker-compose up -d

# View startup logs
docker-compose logs -f

# Check if all containers are running
docker-compose ps
```

### Step 5: Verify Setup

```bash
# Test backend API
curl http://localhost:4000/

# Test frontend
open http://localhost  # Mac
start http://localhost  # Windows
# Or use browser: http://localhost

# Check MongoDB connection
docker-compose exec backend mongosh -u admin -p password123 mongodb://mongodb:27017

# View service statistics
docker stats
```

## Common Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec mongodb mongosh

# Restart services
docker-compose restart
docker-compose restart backend

# Stop services (preserve data)
docker-compose stop

# Stop and remove (preserve data)
docker-compose down

# Stop and remove everything (WARNING: deletes data)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build backend
docker-compose up -d --build frontend

# View resource usage
docker stats
```

## Deployment to Docker Hub

### Step 1: Create Docker Hub Account

1. Visit https://hub.docker.com/signup
2. Create account and verify email
3. Create two repositories:
   - `coursue-backend`
   - `coursue-frontend`

### Step 2: Build and Push (Windows)

```powershell
# Make sure you're in project root directory
cd c:\Users\kumar\OneDrive\Documents\CODE\Coursue

# Make script executable (one time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Build, tag, and push to Docker Hub
.\deploy-docker.ps1 -Version "1.0.0" -Registry "yourusername" -Environment "prod" -Push

# When prompted, enter your Docker Hub credentials
```

### Step 3: Build and Push (Linux/Mac)

```bash
# Navigate to project
cd ~/coursue

# Make script executable
chmod +x deploy-docker.sh

# Build, tag, and push
./deploy-docker.sh -v 1.0.0 -r yourusername -e prod -p

# When prompted, enter Docker Hub credentials
```

### Step 4: Verify on Docker Hub

1. Go to https://hub.docker.com
2. Click on your username
3. You should see:
   - coursue-backend with tags: latest, 1.0.0, prod-1.0.0
   - coursue-frontend with tags: latest, 1.0.0, prod-1.0.0

## Production Deployment

### On Your Production Server

```bash
# 1. SSH into server
ssh user@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Create project directory
mkdir -p ~/coursue
cd ~/coursue

# 4. Create docker-compose.yml with pre-built images:
cat > docker-compose.yml << 'EOF'
version: '3.9'
services:
  mongodb:
    image: mongo:7.0-alpine
    # ... rest of config ...
  backend:
    image: yourusername/coursue-backend:prod-1.0.0
    # ... rest of config ...
  frontend:
    image: yourusername/coursue-frontend:prod-1.0.0
    # ... rest of config ...
EOF

# 5. Create .env file with production secrets
cat > .env << 'EOF'
NODE_ENV=production
MONGO_INITDB_ROOT_PASSWORD=your-strong-password
JWT_SECRET=your-very-strong-jwt-secret
# ... other env vars ...
EOF

# 6. Login to Docker Hub
docker login

# 7. Start services
docker-compose up -d

# 8. Verify
docker-compose ps
docker-compose logs -f backend
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Docker Host (Your Server)                       │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Docker Bridge Network (coursue-network)       │  │
│  │                                                  │  │
│  │  ┌───────────────┐  ┌───────────────────────┐  │  │
│  │  │ MongoDB       │  │ Backend API           │  │  │
│  │  │ Port: 27017   │  │ Port: 4000            │  │  │
│  │  │ (internal)    │  │ Express + Agenda      │  │  │
│  │  │ Data: volumes │  │ Socket.IO             │  │  │
│  │  └───────────────┘  └───────────────────────┘  │  │
│  │                            ▲                    │  │
│  │                            │ (backend:4000)    │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ Frontend (Nginx)                         │  │  │
│  │  │ Port: 80 → 4000 (API)                   │  │  │
│  │  │ React SPA served                         │  │  │
│  │  │ WebSocket proxying                       │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                      ▲                                 │
│          HTTP/HTTPS │ Port 80/443                     │
│                                                       │
└─────────────────────────────────────────────────────────┘
                      ▲
                      │
              External Users
```

## File Structure Created

```
Coursue/
├── server/
│   └── Dockerfile              ← Backend container
├── Dockerfile                  ← Frontend container
├── nginx.conf                  ← Nginx configuration
├── docker-compose.yml          ← Service orchestration
├── .dockerignore                ← Files to exclude from Docker
├── deploy-docker.ps1           ← Windows deployment script
├── deploy-docker.sh            ← Linux/Mac deployment script
├── .env.example                ← Environment template (local)
├── .env.production             ← Production environment template
├── DOCKER_SETUP.md             ← Setup & management guide
├── DOCKER_HUB.md               ← Docker Hub & deployment guide
└── README_DOCKER.md            ← This file
```

## Environment Variables Explained

### Backend Environment Variables

```
NODE_ENV=production              # Node environment (development|production)
PORT=4000                        # Express server port
MONGODB_URI=mongodb://...        # MongoDB connection string
JWT_SECRET=your-secret-key       # JWT signing key
CLOUDINARY_NAME=...              # Cloudinary account name
CLOUDINARY_API_KEY=...           # Cloudinary API key
CLOUDINARY_API_SECRET=...        # Cloudinary API secret
```

### Frontend Environment Variables

```
VITE_API_BASE_URL=http://localhost:4000     # Backend API URL
VITE_SOCKET_URL=http://localhost:4000       # Socket.IO server URL
```

### MongoDB Environment Variables

```
MONGO_INITDB_ROOT_USERNAME=admin                    # Root username
MONGO_INITDB_ROOT_PASSWORD=password123              # Root password
MONGO_INITDB_DATABASE=coursue                       # Database name
```

## Troubleshooting

### "Docker: command not found"
- Docker not installed or not in PATH
- Solution: Install Docker Desktop or Docker Engine
- Verify: `docker --version`

### "Port 4000 already in use"
```bash
# Kill process using port 4000 (Windows PowerShell)
taskkill /PID (Get-NetTCPConnection -LocalPort 4000).OwningProcess /F

# Kill process using port 4000 (Linux/Mac)
lsof -ti:4000 | xargs kill -9
```

### "Cannot connect to backend from frontend"
- Check backend is running: `docker-compose ps`
- Verify backend logs: `docker-compose logs backend`
- Test connection: `docker-compose exec frontend wget http://backend:4000/`

### "MongoDB authentication failed"
- Verify credentials in .env file
- Check MongoDB is healthy: `docker-compose ps` (look for mongodb status)
- View logs: `docker-compose logs mongodb`

### "Out of disk space"
```bash
# Clean up unused Docker resources
docker system prune -a

# Remove specific volumes
docker volume prune
```

## Next Steps

1. **Try Local Setup**: Run `docker-compose up -d` and verify all services work
2. **Test Functionality**: Access frontend, create classes, check real-time updates
3. **Set Up Docker Hub**: Create repositories and push images
4. **Deploy to Server**: Use production docker-compose on your server
5. **Set Up Monitoring**: Configure logging and alerts
6. **Enable HTTPS**: Use Let's Encrypt with Nginx

## Additional Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Docker Hub: https://hub.docker.com/
- Nginx: https://nginx.org/
- MongoDB Docker: https://hub.docker.com/_/mongo
- Node.js Docker: https://hub.docker.com/_/node

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f [service]`
2. Review DOCKER_SETUP.md for detailed troubleshooting
3. Check Docker Hub documentation
4. Verify environment variables are correct

---

**Created**: 2024
**Framework**: Docker & Docker Compose
**Status**: Production Ready

# Docker Hub Integration & Deployment Guide

## Overview

This guide explains how to push your Coursue application containers to Docker Hub and deploy them on production servers.

## Prerequisites

1. **Docker Hub Account**: Create free account at https://hub.docker.com
2. **Docker & Docker Compose**: Installed locally
3. **Docker CLI**: Authenticated with Docker Hub credentials
4. **Repository Access**: Created repositories on Docker Hub (or use automatic creation)

## Docker Hub Setup

### 1. Create Docker Hub Account

1. Visit https://hub.docker.com/signup
2. Sign up with email address
3. Verify email
4. Log in to dashboard

### 2. Create Repositories

#### Option A: Pre-create Repositories (Recommended)

1. Log in to Docker Hub
2. Click "Create Repository"
3. Repository name: `coursue-backend`
   - Visibility: Public (or Private if preferred)
   - Description: "Coursue Backend API Server"
   - Click Create

4. Click "Create Repository" again
5. Repository name: `coursue-frontend`
   - Visibility: Public (or Private if preferred)
   - Description: "Coursue Frontend React/Vite Application"
   - Click Create

#### Option B: Auto-create via Push

Docker Hub will automatically create repositories on first push (if your account settings allow).

### 3. Generate Access Token (Recommended for CI/CD)

1. Log in to Docker Hub
2. Click your profile icon → Account Settings
3. Click "Security" → "New Access Token"
4. Token name: `coursue-deployment`
5. Access permissions: Read & Write
6. Click Generate
7. Copy token and save securely

## Local Authentication

### Windows PowerShell

```powershell
# Login to Docker Hub
docker login

# When prompted:
# Username: your-docker-hub-username
# Password: your-password-or-access-token

# Verify login
docker info

# Logout when done
docker logout
```

### Mac/Linux Bash

```bash
# Login to Docker Hub
docker login

# When prompted:
# Username: your-docker-hub-username
# Password: your-password-or-access-token

# Verify login
docker info

# Logout when done
docker logout
```

## Building and Pushing Images

### Method 1: Using Deployment Scripts

#### Windows PowerShell

```powershell
# Build only (no push)
.\deploy-docker.ps1 -Version "1.0.0" -Registry "myusername" -Environment "dev"

# Build and push to Docker Hub
.\deploy-docker.ps1 -Version "1.0.0" -Registry "myusername" -Environment "prod" -Push

# Build and push with different environment
.\deploy-docker.ps1 -Version "2.0.0" -Registry "myusername" -Environment "staging" -Push
```

#### Mac/Linux Bash

```bash
# Build only (no push)
./deploy-docker.sh -v 1.0.0 -r myusername -e dev

# Build and push to Docker Hub
./deploy-docker.sh -v 1.0.0 -r myusername -e prod -p

# Build and push with different environment
./deploy-docker.sh -v 2.0.0 -r myusername -e staging -p
```

### Method 2: Manual Commands

```bash
# Build images
docker-compose build backend
docker-compose build frontend

# Tag for Docker Hub
docker tag coursue-backend:latest myusername/coursue-backend:latest
docker tag coursue-backend:latest myusername/coursue-backend:v1.0.0
docker tag coursue-backend:latest myusername/coursue-backend:prod-v1.0.0

docker tag coursue-frontend:latest myusername/coursue-frontend:latest
docker tag coursue-frontend:latest myusername/coursue-frontend:v1.0.0
docker tag coursue-frontend:latest myusername/coursue-frontend:prod-v1.0.0

# Push to Docker Hub
docker push myusername/coursue-backend:latest
docker push myusername/coursue-backend:v1.0.0
docker push myusername/coursue-backend:prod-v1.0.0

docker push myusername/coursue-frontend:latest
docker push myusername/coursue-frontend:v1.0.0
docker push myusername/coursue-frontend:prod-v1.0.0
```

## Image Tagging Strategy

### Tag Format

```
myusername/repository-name:tag

Examples:
- myusername/coursue-backend:latest
- myusername/coursue-backend:v1.0.0
- myusername/coursue-backend:prod-v1.0.0
- myusername/coursue-backend:staging-v1.0.0
```

### Recommended Tags

| Tag | Purpose | Usage |
|-----|---------|-------|
| `latest` | Always points to latest release | Default in docker run |
| `v1.0.0` | Semantic version tag | Specific version deployments |
| `prod-v1.0.0` | Production environment tag | Production servers |
| `staging-v1.0.0` | Staging environment tag | Staging servers |
| `dev` | Development version | Development/testing |

### Versioning Convention

```
MAJOR.MINOR.PATCH
v1.0.0 = Version 1, Release 0, Patch 0

When to increment:
- MAJOR: Breaking changes, major features
- MINOR: New features, backward compatible
- PATCH: Bug fixes, minor updates
```

## Docker Hub Dashboard Management

### View Your Repositories

1. Log in to Docker Hub
2. Click "Repositories" in sidebar
3. See all pushed images
4. Click on repository for details

### Repository Details

Shows:
- Tags and image sizes
- Last updated timestamp
- Pull count
- Star count
- Description

### Delete Old Images

1. Click on image tag
2. Click trash icon to delete old versions
3. Keep latest and important versions

## Production Deployment

### On Your Production Server

#### 1. SSH into Server

```bash
ssh user@your-server-ip
```

#### 2. Install Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Verify
docker --version
docker-compose --version
```

#### 3. Create Project Directory

```bash
mkdir -p ~/coursue
cd ~/coursue
```

#### 4. Create docker-compose.yml

```bash
# Option A: Download from repository
curl -O https://raw.githubusercontent.com/yourusername/coursue/main/docker-compose.yml

# Option B: Create manually (copy from local)
# Edit to use pre-built images instead of building
```

#### 5. Create .env File

```bash
# Create environment file
cat > .env << EOF
NODE_ENV=production
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your-strong-password
JWT_SECRET=your-very-strong-secret-key
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
VITE_API_BASE_URL=https://yourdomain.com
VITE_SOCKET_URL=https://yourdomain.com
EOF
```

#### 6. Modified docker-compose.yml for Pre-built Images

```yaml
version: '3.9'

services:
  mongodb:
    image: mongo:7.0-alpine
    container_name: coursue-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - coursue-network

  backend:
    image: myusername/coursue-backend:prod-v1.0.0  # Use pre-built image
    container_name: coursue-backend
    restart: unless-stopped
    depends_on:
      - mongodb
    environment:
      NODE_ENV: production
      PORT: 4000
      MONGODB_URI: mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/coursue?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      CLOUDINARY_NAME: ${CLOUDINARY_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
    ports:
      - "4000:4000"
    volumes:
      - backend_uploads:/app/uploads
    networks:
      - coursue-network
    restart: unless-stopped

  frontend:
    image: myusername/coursue-frontend:prod-v1.0.0  # Use pre-built image
    container_name: coursue-frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
      - VITE_SOCKET_URL=${VITE_SOCKET_URL}
    networks:
      - coursue-network
    restart: unless-stopped

networks:
  coursue-network:
    driver: bridge

volumes:
  mongodb_data:
  backend_uploads:
```

#### 7. Login to Docker Hub on Server

```bash
docker login

# Enter your Docker Hub credentials
# Username: your-docker-hub-username
# Password: your-password-or-access-token
```

#### 8. Pull and Run

```bash
# Pull latest images
docker pull myusername/coursue-backend:prod-v1.0.0
docker pull myusername/coursue-frontend:prod-v1.0.0

# Start services
docker-compose up -d

# Verify
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## CI/CD Integration (GitHub Actions Example)

### Create GitHub Actions Workflow

Create `.github/workflows/docker-deploy.yml`:

```yaml
name: Build and Push to Docker Hub

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: ./server
          push: true
          tags: |
            ${{ secrets.DOCKER_HUB_USERNAME }}/coursue-backend:latest
            ${{ secrets.DOCKER_HUB_USERNAME }}/coursue-backend:${{ github.ref_name }}
      
      - name: Build and push frontend
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_HUB_USERNAME }}/coursue-frontend:latest
            ${{ secrets.DOCKER_HUB_USERNAME }}/coursue-frontend:${{ github.ref_name }}
```

### Setup Secrets in GitHub

1. Go to repository Settings
2. Click "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add secrets:
   - `DOCKER_HUB_USERNAME`: your-docker-hub-username
   - `DOCKER_HUB_TOKEN`: your-access-token

## Updating Deployed Version

### On Server

```bash
cd ~/coursue

# Pull new images
docker pull myusername/coursue-backend:prod-v2.0.0
docker pull myusername/coursue-frontend:prod-v2.0.0

# Update docker-compose.yml with new version tags

# Restart services
docker-compose down
docker-compose up -d

# Verify
docker-compose ps
```

## Troubleshooting

### Authentication Error

```
Error response from daemon: Get "https://registry-1.docker.io/v2/": unauthorized: incorrect username or password
```

**Solution**:
```bash
docker logout
docker login
# Enter correct credentials
```

### Image Not Found

```
Error response from daemon: manifest not found
```

**Solution**:
```bash
# Verify image exists on Docker Hub
docker search myusername/coursue-backend

# Check tags
docker images | grep coursue

# Push if missing
docker push myusername/coursue-backend:tag
```

### Connection Timeout

```
Error pushing to registry: network timeout
```

**Solution**:
```bash
# Check internet connection
ping docker.io

# Retry push (Docker Hub sometimes has slow moments)
docker push myusername/coursue-backend:tag
```

## Best Practices

1. **Use Semantic Versioning**: v1.0.0, v1.1.0, v2.0.0
2. **Tag Every Release**: Always tag production releases
3. **Keep Latest Updated**: `latest` tag should point to stable release
4. **Use Access Tokens**: Better security than password
5. **Limit Public Exposure**: Set private repositories if needed
6. **Document Images**: Add descriptions on Docker Hub
7. **Regular Cleanup**: Remove old/unused images periodically
8. **Environment Separation**: Use different tags for prod/staging/dev
9. **Security Scanning**: Enable Docker Hub security scanning
10. **Version Control**: Keep track of which version is running

## References

- Docker Hub: https://hub.docker.com/
- Docker Login: https://docs.docker.com/engine/reference/commandline/login/
- Push to Docker Hub: https://docs.docker.com/docker-hub/repos/
- Access Tokens: https://docs.docker.com/docker-hub/access-tokens/
- GitHub Actions: https://docs.docker.com/ci-cd/github-actions/

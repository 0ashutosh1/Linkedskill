#!/bin/bash

# Docker Build, Tag, and Push Script for Docker Hub
# Usage: ./deploy-docker.sh -v v1.0.0 -r myusername -e prod
# Example: ./deploy-docker.sh -v 1.0.0 -r yourusername -e production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
VERSION=""
REGISTRY=""
ENVIRONMENT="dev"
PUSH=false
BUILD_ONLY=false

# Function to print header
print_header() {
    echo -e "\n${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Parse command line arguments
while getopts "v:r:e:ph" opt; do
    case $opt in
        v)
            VERSION="$OPTARG"
            ;;
        r)
            REGISTRY="$OPTARG"
            ;;
        e)
            ENVIRONMENT="$OPTARG"
            ;;
        p)
            PUSH=true
            ;;
        h)
            echo "Usage: ./deploy-docker.sh -v VERSION -r REGISTRY [-e ENVIRONMENT] [-p]"
            echo ""
            echo "Options:"
            echo "  -v  Version tag (required) - e.g., 1.0.0"
            echo "  -r  Docker Hub registry/username (required) - e.g., myusername"
            echo "  -e  Environment (optional) - dev|staging|prod (default: dev)"
            echo "  -p  Push to Docker Hub (optional)"
            echo "  -h  Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./deploy-docker.sh -v 1.0.0 -r yourusername"
            echo "  ./deploy-docker.sh -v 1.0.0 -r yourusername -e prod -p"
            exit 0
            ;;
        *)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "$VERSION" || -z "$REGISTRY" ]]; then
    print_error "Version (-v) and Registry (-r) are required"
    echo "Usage: ./deploy-docker.sh -v VERSION -r REGISTRY [-e ENVIRONMENT] [-p]"
    exit 1
fi

# Validate Docker installation
print_header "Checking Docker Installation"
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
print_success "Docker is installed: $DOCKER_VERSION"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

COMPOSE_VERSION=$(docker-compose --version)
print_success "Docker Compose is installed: $COMPOSE_VERSION"

# Display configuration
print_header "Build Configuration"
print_info "Version: $VERSION"
print_info "Registry: $REGISTRY"
print_info "Environment: $ENVIRONMENT"
print_info "Push to Docker Hub: $PUSH"

# Normalize environment
if [[ "$ENVIRONMENT" == "production" ]]; then
    ENV_TAG="prod"
else
    ENV_TAG="$ENVIRONMENT"
fi

# Define image names
BACKEND_IMAGE_REPO="$REGISTRY/coursue-backend"
FRONTEND_IMAGE_REPO="$REGISTRY/coursue-frontend"

BACKEND_TAG_LATEST="${BACKEND_IMAGE_REPO}:latest"
BACKEND_TAG_VERSION="${BACKEND_IMAGE_REPO}:${VERSION}"
BACKEND_TAG_ENV="${BACKEND_IMAGE_REPO}:${ENV_TAG}-${VERSION}"

FRONTEND_TAG_LATEST="${FRONTEND_IMAGE_REPO}:latest"
FRONTEND_TAG_VERSION="${FRONTEND_IMAGE_REPO}:${VERSION}"
FRONTEND_TAG_ENV="${FRONTEND_IMAGE_REPO}:${ENV_TAG}-${VERSION}"

echo ""
echo "Backend Images:"
print_info "Latest: $BACKEND_TAG_LATEST"
print_info "Version: $BACKEND_TAG_VERSION"
print_info "Environment: $BACKEND_TAG_ENV"

echo ""
echo "Frontend Images:"
print_info "Latest: $FRONTEND_TAG_LATEST"
print_info "Version: $FRONTEND_TAG_VERSION"
print_info "Environment: $FRONTEND_TAG_ENV"

# Build Backend
print_header "Building Backend Image"
if docker-compose build backend; then
    print_success "Backend image built successfully"
else
    print_error "Failed to build backend image"
    exit 1
fi

# Build Frontend
print_header "Building Frontend Image"
if docker-compose build frontend; then
    print_success "Frontend image built successfully"
else
    print_error "Failed to build frontend image"
    exit 1
fi

# Tag Backend
print_header "Tagging Backend Images"
docker tag coursue-backend:latest "$BACKEND_TAG_LATEST"
print_success "Tagged: $BACKEND_TAG_LATEST"

docker tag coursue-backend:latest "$BACKEND_TAG_VERSION"
print_success "Tagged: $BACKEND_TAG_VERSION"

docker tag coursue-backend:latest "$BACKEND_TAG_ENV"
print_success "Tagged: $BACKEND_TAG_ENV"

# Tag Frontend
print_header "Tagging Frontend Images"
docker tag coursue-frontend:latest "$FRONTEND_TAG_LATEST"
print_success "Tagged: $FRONTEND_TAG_LATEST"

docker tag coursue-frontend:latest "$FRONTEND_TAG_VERSION"
print_success "Tagged: $FRONTEND_TAG_VERSION"

docker tag coursue-frontend:latest "$FRONTEND_TAG_ENV"
print_success "Tagged: $FRONTEND_TAG_ENV"

if [[ "$BUILD_ONLY" == true ]]; then
    print_header "Build Complete"
    print_info "Images built and tagged. Use -p flag to push to Docker Hub."
    exit 0
fi

# Push to Docker Hub (if requested)
if [[ "$PUSH" == true ]]; then
    print_header "Logging into Docker Hub"
    print_info "Please enter your Docker Hub credentials when prompted"
    
    if docker login; then
        print_success "Successfully logged into Docker Hub"
    else
        print_error "Failed to login to Docker Hub"
        exit 1
    fi
    
    # Push Backend
    print_header "Pushing Backend Images"
    print_info "Pushing $BACKEND_TAG_LATEST..."
    docker push "$BACKEND_TAG_LATEST"
    print_success "Pushed: $BACKEND_TAG_LATEST"
    
    print_info "Pushing $BACKEND_TAG_VERSION..."
    docker push "$BACKEND_TAG_VERSION"
    print_success "Pushed: $BACKEND_TAG_VERSION"
    
    print_info "Pushing $BACKEND_TAG_ENV..."
    docker push "$BACKEND_TAG_ENV"
    print_success "Pushed: $BACKEND_TAG_ENV"
    
    # Push Frontend
    print_header "Pushing Frontend Images"
    print_info "Pushing $FRONTEND_TAG_LATEST..."
    docker push "$FRONTEND_TAG_LATEST"
    print_success "Pushed: $FRONTEND_TAG_LATEST"
    
    print_info "Pushing $FRONTEND_TAG_VERSION..."
    docker push "$FRONTEND_TAG_VERSION"
    print_success "Pushed: $FRONTEND_TAG_VERSION"
    
    print_info "Pushing $FRONTEND_TAG_ENV..."
    docker push "$FRONTEND_TAG_ENV"
    print_success "Pushed: $FRONTEND_TAG_ENV"
    
    print_header "Docker Hub Push Complete"
    print_success "All images successfully pushed to Docker Hub!"
else
    print_header "Build and Tag Complete"
    print_info "To push images to Docker Hub, run:"
    print_info "./deploy-docker.sh -v $VERSION -r $REGISTRY -e $ENVIRONMENT -p"
fi

# Summary
print_header "Summary"
echo "Backend Images:"
echo "  - $BACKEND_TAG_LATEST"
echo "  - $BACKEND_TAG_VERSION"
echo "  - $BACKEND_TAG_ENV"

echo ""
echo "Frontend Images:"
echo "  - $FRONTEND_TAG_LATEST"
echo "  - $FRONTEND_TAG_VERSION"
echo "  - $FRONTEND_TAG_ENV"

print_success "\nScript completed successfully!"

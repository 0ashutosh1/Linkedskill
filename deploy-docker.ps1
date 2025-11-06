# Docker Build, Tag, and Push Script for Docker Hub
# Usage: .\deploy-docker.ps1 -Version "v1.0.0" -Registry "myusername" -Environment "prod"
# Example: .\deploy-docker.ps1 -Version "1.0.0" -Registry "yourusername" -Environment "production"

param(
    [Parameter(Mandatory=$true)]
    [string]$Version,
    
    [Parameter(Mandatory=$true)]
    [string]$Registry,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "staging", "prod", "production")]
    [string]$Environment = "dev",
    
    [Parameter(Mandatory=$false)]
    [switch]$Push = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$BuildOnly = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Header {
    param([string]$Message)
    Write-Host "`n================================" -ForegroundColor $Cyan
    Write-Host $Message -ForegroundColor $Cyan
    Write-Host "================================`n" -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $Yellow
}

# Validate Docker installation
Write-Header "Checking Docker Installation"
try {
    $dockerVersion = docker --version
    Write-Success "Docker is installed: $dockerVersion"
} catch {
    Write-Error-Custom "Docker is not installed or not in PATH"
    exit 1
}

try {
    $composeVersion = docker-compose --version
    Write-Success "Docker Compose is installed: $composeVersion"
} catch {
    Write-Error-Custom "Docker Compose is not installed or not in PATH"
    exit 1
}

# Validate parameters
Write-Header "Build Configuration"
Write-Info "Version: $Version"
Write-Info "Registry: $Registry"
Write-Info "Environment: $Environment"
Write-Info "Push to Docker Hub: $Push"

# Normalize environment
$EnvTag = if ($Environment -eq "prod" -or $Environment -eq "production") { "prod" } else { $Environment }

# Define image names
$BackendImageRepo = "$Registry/coursue-backend"
$FrontendImageRepo = "$Registry/coursue-frontend"

$BackendTagLatest = "$BackendImageRepo:latest"
$BackendTagVersion = "$BackendImageRepo:$Version"
$BackendTagEnv = "$BackendImageRepo:$EnvTag-$Version"

$FrontendTagLatest = "$FrontendImageRepo:latest"
$FrontendTagVersion = "$FrontendImageRepo:$Version"
$FrontendTagEnv = "$FrontendImageRepo:$EnvTag-$Version"

Write-Host "`nBackend Images:"
Write-Info "Latest: $BackendTagLatest"
Write-Info "Version: $BackendTagVersion"
Write-Info "Environment: $BackendTagEnv"

Write-Host "`nFrontend Images:"
Write-Info "Latest: $FrontendTagLatest"
Write-Info "Version: $FrontendTagVersion"
Write-Info "Environment: $FrontendTagEnv"

# Build Backend
Write-Header "Building Backend Image"
try {
    docker-compose build backend
    Write-Success "Backend image built successfully"
} catch {
    Write-Error-Custom "Failed to build backend image"
    exit 1
}

# Build Frontend
Write-Header "Building Frontend Image"
try {
    docker-compose build frontend
    Write-Success "Frontend image built successfully"
} catch {
    Write-Error-Custom "Failed to build frontend image"
    exit 1
}

# Tag Backend
Write-Header "Tagging Backend Images"
try {
    docker tag coursue-backend:latest $BackendTagLatest
    Write-Success "Tagged: $BackendTagLatest"
    
    docker tag coursue-backend:latest $BackendTagVersion
    Write-Success "Tagged: $BackendTagVersion"
    
    docker tag coursue-backend:latest $BackendTagEnv
    Write-Success "Tagged: $BackendTagEnv"
} catch {
    Write-Error-Custom "Failed to tag backend images"
    exit 1
}

# Tag Frontend
Write-Header "Tagging Frontend Images"
try {
    docker tag coursue-frontend:latest $FrontendTagLatest
    Write-Success "Tagged: $FrontendTagLatest"
    
    docker tag coursue-frontend:latest $FrontendTagVersion
    Write-Success "Tagged: $FrontendTagVersion"
    
    docker tag coursue-frontend:latest $FrontendTagEnv
    Write-Success "Tagged: $FrontendTagEnv"
} catch {
    Write-Error-Custom "Failed to tag frontend images"
    exit 1
}

if ($BuildOnly) {
    Write-Header "Build Complete"
    Write-Info "Images built and tagged. Use -Push switch to push to Docker Hub."
    exit 0
}

# Push to Docker Hub (if requested)
if ($Push) {
    Write-Header "Logging into Docker Hub"
    Write-Info "Please enter your Docker Hub credentials when prompted"
    
    try {
        docker login
        Write-Success "Successfully logged into Docker Hub"
    } catch {
        Write-Error-Custom "Failed to login to Docker Hub"
        exit 1
    }
    
    # Push Backend
    Write-Header "Pushing Backend Images"
    try {
        Write-Info "Pushing $BackendTagLatest..."
        docker push $BackendTagLatest
        Write-Success "Pushed: $BackendTagLatest"
        
        Write-Info "Pushing $BackendTagVersion..."
        docker push $BackendTagVersion
        Write-Success "Pushed: $BackendTagVersion"
        
        Write-Info "Pushing $BackendTagEnv..."
        docker push $BackendTagEnv
        Write-Success "Pushed: $BackendTagEnv"
    } catch {
        Write-Error-Custom "Failed to push backend images"
        exit 1
    }
    
    # Push Frontend
    Write-Header "Pushing Frontend Images"
    try {
        Write-Info "Pushing $FrontendTagLatest..."
        docker push $FrontendTagLatest
        Write-Success "Pushed: $FrontendTagLatest"
        
        Write-Info "Pushing $FrontendTagVersion..."
        docker push $FrontendTagVersion
        Write-Success "Pushed: $FrontendTagVersion"
        
        Write-Info "Pushing $FrontendTagEnv..."
        docker push $FrontendTagEnv
        Write-Success "Pushed: $FrontendTagEnv"
    } catch {
        Write-Error-Custom "Failed to push frontend images"
        exit 1
    }
    
    Write-Header "Docker Hub Push Complete"
    Write-Success "All images successfully pushed to Docker Hub!"
} else {
    Write-Header "Build and Tag Complete"
    Write-Info "To push images to Docker Hub, run:"
    Write-Info ".\deploy-docker.ps1 -Version '$Version' -Registry '$Registry' -Environment '$Environment' -Push"
}

Write-Header "Summary"
Write-Host "Backend Images:" -ForegroundColor $Cyan
Write-Host "  - $BackendTagLatest"
Write-Host "  - $BackendTagVersion"
Write-Host "  - $BackendTagEnv"

Write-Host "`nFrontend Images:" -ForegroundColor $Cyan
Write-Host "  - $FrontendTagLatest"
Write-Host "  - $FrontendTagVersion"
Write-Host "  - $FrontendTagEnv"

Write-Success "`nScript completed successfully!"

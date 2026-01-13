# Docker Implementation of UdyogaSetu Job Application Platform

## Introduction
To ensure portability, scalability, and ease of deployment, Docker was used to containerize the UdyogaSetu job application platform. The project follows a microservices architecture, where each major component runs in an isolated container and communicates through a Docker network. Docker Compose is used to orchestrate all services.

## Project Services Containerized Using Docker
The project is divided into the following services:

### 1. Frontend Service
**a. React application served using Nginx**
- Multi-stage build for optimization
- Serves static files efficiently
- Handles job application interface, kiosk mode, and mobile uploads
- Exposes port 8080 externally

### 2. Application Service
**a. React + TypeScript application**
- Built with Vite for fast development
- Includes Clerk authentication integration
- Connects to Supabase for data storage
- Supports multiple job application channels (web, kiosk, voice, QR)

### 3. Prometheus Monitoring
**a. Metrics collection service**
- Collects application health metrics
- Monitors container performance
- Scrape interval: 15 seconds
- Exposes metrics on port 9090

### 4. Grafana Visualization
**a. Dashboard and analytics platform**
- Visualizes metrics collected by Prometheus
- Provides real-time monitoring dashboards
- Custom panels for application performance
- Accessible on port 3000

Each service runs in its own Docker container with proper isolation and networking.

## Implementation

### Frontend Dockerfile
The frontend uses a multi-stage Docker build:

**Stage 1: Build Application**
- Uses Node.js 18 Alpine image
- Installs dependencies with npm
- Builds React application with environment variables
- Optimizes for production

**Stage 2: Serve with Nginx**
- Uses lightweight Nginx Alpine image
- Copies built application from Stage 1
- Configures Nginx for static file serving
- Includes health checks

**Key steps:**
- Install dependencies (`npm install`)
- Build React application (`npm run build`)
- Copy build output to Nginx container
- Expose port 80
- Add health check endpoint

### Application Docker Configuration
**Multi-stage build process:**
```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost/health || exit 1
```

**Environment Variables:**
- VITE_SUPABASE_URL: Supabase database URL
- VITE_SUPABASE_ANON_KEY: Supabase anonymous key
- VITE_CLERK_PUBLISHABLE_KEY: Clerk authentication key
- VITE_LOCAL_IP: Local IP for mobile access

### Prometheus Docker Configuration
**Prometheus service configuration:**
- Uses official Prometheus image
- Custom configuration file mount
- Persistent data volume for metrics storage
- 200-hour data retention period

**Key features:**
- Scrapes application health endpoint
- Self-monitoring capabilities
- Web interface for query exploration
- Configurable scrape intervals

### Grafana Docker Configuration
**Grafana service setup:**
- Uses standard Grafana image
- Pre-configured admin credentials
- Persistent storage for dashboards
- Direct integration with Prometheus

**Key features:**
- Pre-configured data source
- Custom dashboard templates
- User authentication
- Plugin support

## Docker Compose Implementation
Docker Compose is used to manage multiple containers together.

### Purpose of Docker Compose
- Start all services using a single command
- Define service dependencies and health checks
- Create a shared Docker network for communication
- Simplify orchestration and scaling
- Manage persistent data volumes

### Services Defined in docker-compose.yml
The following services are defined:

**udyogasetu (Frontend)**
- Image: amogh0709/udyoga-setu:latest
- Port mapping: 8080:80
- Health check enabled
- Environment variables for build configuration

**prometheus (Monitoring)**
- Image: prom/prometheus:latest
- Port mapping: 9090:9090
- Volume mount for configuration
- Persistent data storage
- Custom command for configuration

**grafana (Visualization)**
- Image: grafana/grafana:latest
- Port mapping: 3000:3000
- Environment variables for admin setup
- Persistent storage for dashboards
- Dependency on Prometheus

### Network Configuration
**Custom bridge network:**
- Network name: monitoring
- Isolated communication between services
- Service discovery by container name
- Secure internal communication

### Volume Management
**Persistent data volumes:**
- prometheus_data: Metrics storage
- grafana_data: Dashboard and configuration storage
- Automatic backup and recovery capabilities

## Service Communication

### Internal Communication
- **udyogasetu → prometheus**: Metrics endpoint scraping
- **grafana → prometheus**: Data source queries
- **External access**: All services exposed via port mapping

### Service Discovery
- Containers communicate using service names
- Example: `http://prometheus:9090` from Grafana
- DNS resolution handled by Docker network

## Deployment Workflow

### Development Environment
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Pull latest images
docker-compose pull

# Deploy with zero downtime
docker-compose up -d

# Scale services
docker-compose up -d --scale udyogasetu=3
```

### Monitoring and Maintenance
```bash
# Check service health
docker-compose ps

# View resource usage
docker stats

# Backup data volumes
docker run --rm -v udyogasetu_prometheus_data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz -C /data .
```

## Benefits of Docker Implementation

### Portability
- Consistent environment across development, staging, and production
- No dependency conflicts between services
- Easy deployment to any Docker-compatible platform

### Scalability
- Horizontal scaling with Docker Compose
- Load balancing capabilities
- Resource isolation and management

### Maintainability
- Version-controlled infrastructure
- Easy updates and rollbacks
- Comprehensive monitoring and logging

### Security
- Container isolation
- Network segmentation
- Environment variable management

## Conclusion
The Docker implementation of UdyogaSetu provides a robust, scalable, and maintainable deployment solution. The microservices architecture ensures separation of concerns, while Docker Compose simplifies orchestration and management. The integrated monitoring stack with Prometheus and Grafana provides comprehensive visibility into application performance and health.

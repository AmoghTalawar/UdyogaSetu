# 🚀 UdyogaSetu - Complete Docker Setup Guide

## 📋 Project Overview
UdyogaSetu is a job application kiosk system with monitoring capabilities using Docker, Prometheus, and Grafana.

## 🏗️ Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UdyogaSetu    │    │   Prometheus    │    │    Grafana      │
│   (Port 8080)   │───▶│   (Port 9090)   │───▶│   (Port 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Clean Project Structure
```
UdyogaSetu/
├── src/                    # React application source
├── public/                 # Static assets
├── database/              # Database schemas
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── Dockerfile             # Multi-stage build
├── docker-compose.yml     # Container orchestration
├── prometheus.yml         # Monitoring configuration
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md              # This guide
```

## 🔧 Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
```

### 2. Build Docker Image
```bash
# Build the application image
docker build -t amogh0709/udyoga-setu:latest .

# Or pull from Docker Hub
docker pull amogh0709/udyoga-setu:latest
```

### 3. Start Complete Stack
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **UdyogaSetu App** | http://localhost:8080 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin/admin123 |

## 📊 Monitoring Setup

### Prometheus Configuration
- **Scrape Interval**: 15 seconds
- **Targets**: 
  - Prometheus self-monitoring
  - UdyogaSetu application health endpoint

### Grafana Dashboard Setup
1. Access Grafana at http://localhost:3000
2. Login with admin/admin123
3. Add Prometheus data source:
   - URL: `http://prometheus:9090`
   - Access: Server
4. Create/import dashboard

## 🔍 Verification Commands

```bash
# Check running containers
docker ps

# Check application health
curl http://localhost:8080/health

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# View container logs
docker logs udyogasetu-app
docker logs prometheus
docker logs grafana
```

## 🛠️ Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Docker Development
```bash
# Build and run
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build udyogasetu

# View real-time logs
docker-compose logs -f udyogasetu
```

## 📦 Deployment Commands

### Build and Push
```bash
# Build image
docker build -t amogh0709/udyoga-setu:latest .

# Tag for registry
docker tag amogh0709/udyoga-setu:latest amogh0709/udyoga-setu:v1.0.0

# Push to registry
docker push amogh0709/udyoga-setu:latest
docker push amogh0709/udyoga-setu:v1.0.0
```

### Production Deployment
```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale udyogasetu=3
```

## 🔧 Configuration Files

### Docker Compose Services
- **udyogasetu**: Main application (React + Nginx)
- **prometheus**: Metrics collection
- **grafana**: Visualization dashboard

### Environment Variables
```env
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key

# Optional
VITE_LOCAL_IP=192.168.1.100
VITE_TWILIO_ACCOUNT_SID=your-twilio-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-token
```

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in docker-compose.yml
2. **Environment variables**: Ensure .env file exists
3. **Build failures**: Clear cache with `docker system prune -a`

### Reset Commands
```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker rmi amogh0709/udyoga-setu:latest

# Clean system
docker system prune -a

# Fresh start
docker-compose up -d --build
```

## 📈 Monitoring Metrics

### Available Metrics
- Container health status
- Application response time
- Resource usage (CPU, Memory)
- Error rates

### Grafana Dashboards
- System Overview
- Application Performance
- Container Health

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy UdyogaSetu
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        run: |
          docker build -t amogh0709/udyoga-setu:${{ github.sha }} .
          docker push amogh0709/udyoga-setu:${{ github.sha }}
```

## 🎯 Success Indicators
- ✅ All containers running: `docker ps`
- ✅ Application accessible: http://localhost:8080
- ✅ Prometheus collecting: http://localhost:9090/targets
- ✅ Grafana dashboard: http://localhost:3000

## 📞 Support
For issues:
1. Check container logs
2. Verify environment variables
3. Check network connectivity
4. Review this guide

---

**Last Updated**: 2026-01-11  
**Version**: 2.0.0 - Clean Docker Setup

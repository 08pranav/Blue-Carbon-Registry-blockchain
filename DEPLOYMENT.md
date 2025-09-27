# Blue Carbon Registry - Deployment Guide

This document provides comprehensive instructions for deploying the Blue Carbon Registry application in production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: 18+ LTS
- **npm**: 8+
- **Docker**: 20+
- **Docker Compose**: 2.0+
- **PostgreSQL**: 15+ (for production)
- **Redis**: 7+ (for caching)
- **Nginx**: 1.20+ (for reverse proxy)

### Hardware Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD

**Recommended:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD

## Environment Configuration

### Environment Variables

Create environment-specific files:

#### Frontend (.env.production)
```env
NODE_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME="Blue Carbon Registry"
VITE_BLOCKCHAIN_NETWORK=polygon
VITE_ENABLE_PWA=true
```

#### Backend (.env.production)
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bluecarbon
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bluecarbon
DB_USER=bluecarbon_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_very_secure_jwt_secret_key_change_this
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_here
```

## Local Development

### 1. Clone Repository
```bash
git clone <repository-url>
cd blue-carbon-new-frontend
```

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Start Development Servers
```bash
# Start backend (in one terminal)
cd backend
npm run dev

# Start frontend (in another terminal)
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health: http://localhost:3001/api/health

## Production Deployment

### Option 1: Manual Deployment

#### 1. Prepare the Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Redis
sudo apt install redis-server

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Setup Database
```bash
sudo -u postgres psql
CREATE DATABASE bluecarbon;
CREATE USER bluecarbon_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bluecarbon TO bluecarbon_user;
\q
```

#### 3. Deploy Application
```bash
# Clone repository
git clone <repository-url>
cd blue-carbon-new-frontend

# Install and build frontend
npm install
npm run build

# Deploy frontend to nginx
sudo cp -r dist/* /var/www/html/

# Install and start backend
cd backend
npm install --production
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/bluecarbon

# Add configuration (see nginx.conf)

sudo ln -s /etc/nginx/sites-available/bluecarbon /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Option 2: Docker Deployment (Recommended)

#### 1. Quick Start
```bash
# Clone repository
git clone <repository-url>
cd blue-carbon-new-frontend

# Copy environment files
cp .env.example .env.production
cp backend/.env.example backend/.env.production

# Edit environment variables
nano .env.production
nano backend/.env.production

# Start services
docker-compose up -d
```

#### 2. Verify Deployment
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Health checks
curl http://localhost:3000/health
curl http://localhost:3001/api/health
```

### Option 3: Cloud Deployment

#### AWS Deployment

**Using AWS ECS:**
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com

docker build -t bluecarbon-frontend .
docker tag bluecarbon-frontend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/bluecarbon-frontend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/bluecarbon-frontend:latest

# Deploy using ECS task definition
aws ecs update-service --cluster bluecarbon --service bluecarbon-frontend --force-new-deployment
```

#### Google Cloud Deployment

**Using Cloud Run:**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/bluecarbon-frontend
gcloud run deploy --image gcr.io/PROJECT_ID/bluecarbon-frontend --platform managed
```

#### Digital Ocean Deployment

**Using App Platform:**
```yaml
# app.yaml
name: bluecarbon-registry
services:
- name: frontend
  source_dir: /
  github:
    repo: your-repo
    branch: main
  build_command: npm run build
  run_command: nginx -g 'daemon off;'
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
```

## Monitoring and Maintenance

### Health Checks
```bash
# Frontend health
curl -f http://localhost:3000/health

# Backend health
curl -f http://localhost:3001/api/health

# Database health
docker-compose exec database pg_isready -U bluecarbon_user
```

### Logging
```bash
# View application logs
docker-compose logs -f frontend
docker-compose logs -f backend

# PM2 logs (manual deployment)
pm2 logs
```

### Backup Strategy
```bash
# Database backup
docker-compose exec database pg_dump -U bluecarbon_user bluecarbon > backup_$(date +%Y%m%d).sql

# File uploads backup
docker-compose exec backend tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /app/uploads
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Update frontend
npm install
npm run build

# Update backend
cd backend
npm install --production
pm2 restart all

# Or with Docker
docker-compose down
docker-compose build
docker-compose up -d
```

## Security Considerations

### SSL/TLS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
}
```

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Database Security
```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

## Troubleshooting

### Common Issues

#### 1. Frontend Build Fails
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Backend Connection Issues
```bash
# Check environment variables
echo $DATABASE_URL
echo $REDIS_URL

# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Test Redis connection
redis-cli ping
```

#### 3. Docker Issues
```bash
# Rebuild containers
docker-compose down --volumes
docker-compose build --no-cache
docker-compose up -d

# Check container logs
docker-compose logs -f backend
```

#### 4. Performance Issues
```bash
# Monitor resource usage
docker stats

# Analyze bundle size
npm run build -- --analyze

# Check database performance
EXPLAIN ANALYZE SELECT * FROM projects;
```

### Support

For additional support:
- Create an issue in the repository
- Check the [FAQ](FAQ.md)
- Contact the development team

---

**Note**: Always test deployments in a staging environment before deploying to production. Ensure all environment variables are properly configured and secrets are kept secure.
# PCC Portal Production Deployment Guide

This guide provides comprehensive instructions for deploying the PCC Portal to a production environment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Redis Configuration](#redis-configuration)
5. [SSL/TLS Setup](#ssltls-setup)
6. [Deployment Process](#deployment-process)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to production, ensure you have:

- Node.js 18.x or higher
- MongoDB Atlas account or self-hosted MongoDB instance
- Redis server (local or cloud-hosted)
- SSL/TLS certificates (for HTTPS)
- Domain name configured with DNS
- Email service credentials (Gmail, SendGrid, etc.)
- (Optional) Twilio account for SMS notifications
- (Optional) OpenAI API key for chatbot functionality

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd pcc-portal

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### 2. Configure Environment Variables

Copy the production environment template:

```bash
cd backend
cp .env.production.example .env.production
```

Edit `.env.production` with your production values:

```bash
# Required Configuration
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcc_portal
JWT_SECRET=<generate-32-char-random-string>
JWT_REFRESH_SECRET=<generate-32-char-random-string>
SESSION_SECRET=<generate-32-char-random-string>
FRONTEND_URL=https://portal.pcc.edu.ph

# Redis Configuration
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@pcc.edu.ph
EMAIL_PASS=your-app-password

# Additional services...
```

### 3. Generate Secure Secrets

Use these commands to generate secure random strings:

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate QR encryption key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Database Configuration

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster or use existing one
   - Configure network access (whitelist your server IP)
   - Create database user with read/write permissions

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/pcc_portal?retryWrites=true&w=majority
   ```

3. **Configure Database Indexes**
   ```bash
   node scripts/migrate.js
   ```

### Self-Hosted MongoDB

If using self-hosted MongoDB:

```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database and user
mongo
> use pcc_portal
> db.createUser({
    user: "pcc_admin",
    pwd: "secure_password",
    roles: ["readWrite", "dbAdmin"]
  })
```

## Redis Configuration

### Cloud Redis (Recommended)

Use a managed Redis service like:
- Redis Labs
- AWS ElastiCache
- Azure Cache for Redis
- Google Cloud Memorystore

### Self-Hosted Redis

```bash
# Install Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password
requirepass your_redis_password

# Bind to specific IP
bind 127.0.0.1 your_server_ip

# Restart Redis
sudo systemctl restart redis
sudo systemctl enable redis

# Test connection
redis-cli
> AUTH your_redis_password
> PING
```

## SSL/TLS Setup

### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d portal.pcc.edu.ph -d api.portal.pcc.edu.ph

# Certificates will be saved to:
# /etc/letsencrypt/live/portal.pcc.edu.ph/fullchain.pem
# /etc/letsencrypt/live/portal.pcc.edu.ph/privkey.pem

# Set up auto-renewal
sudo certbot renew --dry-run
```

### Using Nginx as Reverse Proxy (Recommended)

```nginx
# /etc/nginx/sites-available/pcc-portal

# API Server
server {
    listen 443 ssl http2;
    server_name api.portal.pcc.edu.ph;

    ssl_certificate /etc/letsencrypt/live/portal.pcc.edu.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.pcc.edu.ph/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name portal.pcc.edu.ph;

    ssl_certificate /etc/letsencrypt/live/portal.pcc.edu.ph/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.pcc.edu.ph/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name portal.pcc.edu.ph api.portal.pcc.edu.ph;
    return 301 https://$server_name$request_uri;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/pcc-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Deployment Process

### 1. Run Pre-Deployment Checks

```bash
cd backend
node scripts/deploy-production.js
```

This script will:
- Validate environment variables
- Check database connectivity
- Verify Redis connection
- Run database migrations
- Create required directories
- Generate deployment report

### 2. Build Frontend

```bash
cd ..
npm run build
```

### 3. Start Backend Server

Using PM2 (Recommended):

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name pcc-api --env production

# Start frontend
cd ..
pm2 start npm --name pcc-frontend -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

Using systemd:

```bash
# Create systemd service file
sudo nano /etc/systemd/system/pcc-api.service
```

```ini
[Unit]
Description=PCC Portal API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/pcc-portal/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable pcc-api
sudo systemctl start pcc-api
sudo systemctl status pcc-api
```

### 4. Verify Deployment

```bash
# Check API health
curl https://api.portal.pcc.edu.ph/api/health

# Check frontend
curl https://portal.pcc.edu.ph

# Check logs
pm2 logs pcc-api
# or
sudo journalctl -u pcc-api -f
```

## Monitoring and Logging

### Application Logs

Logs are stored in `backend/logs/`:
- `app.log` - General application logs
- `error.log` - Error logs only

### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor processes
pm2 monit

# View process list
pm2 list

# Restart application
pm2 restart pcc-api
```

### Health Monitoring

The application provides health check endpoints:

```bash
# Basic health check
GET /api/health

# Detailed health check
GET /api/health/detailed
```

### External Monitoring (Optional)

Consider integrating:
- **Sentry** - Error tracking
- **New Relic** - Application performance monitoring
- **Datadog** - Infrastructure monitoring
- **UptimeRobot** - Uptime monitoring

## Backup and Recovery

### Database Backup

```bash
# Manual backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/pcc_portal" --out=/backups/$(date +%Y%m%d)

# Automated backup script
# Add to crontab: 0 2 * * * /path/to/backup-script.sh
```

### Restore Database

```bash
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/pcc_portal" /backups/20240103
```

### File Backup

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/uploads/

# Restore uploads
tar -xzf uploads-backup-20240103.tar.gz
```

## Troubleshooting

### Application Won't Start

1. Check environment variables:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
   ```

2. Check logs:
   ```bash
   pm2 logs pcc-api --lines 100
   ```

3. Verify database connection:
   ```bash
   node -e "require('./config/mongodb')"
   ```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart pcc-api

# Increase memory limit
pm2 start server.js --max-memory-restart 1G
```

### Database Connection Issues

1. Check MongoDB Atlas network access
2. Verify connection string
3. Check firewall rules
4. Test connection manually:
   ```bash
   mongo "mongodb+srv://cluster.mongodb.net/test" --username username
   ```

### Redis Connection Issues

1. Check Redis server status:
   ```bash
   redis-cli ping
   ```

2. Verify Redis password
3. Check firewall rules
4. Test connection:
   ```bash
   redis-cli -h host -p port -a password
   ```

### SSL Certificate Issues

```bash
# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/portal.pcc.edu.ph/fullchain.pem -noout -dates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect portal.pcc.edu.ph:443
```

## Security Checklist

- [ ] All environment variables are set and secure
- [ ] JWT secrets are at least 32 characters
- [ ] Database has strong password and network restrictions
- [ ] Redis has password authentication enabled
- [ ] SSL/TLS certificates are valid and auto-renewing
- [ ] Firewall is configured to allow only necessary ports
- [ ] Rate limiting is enabled
- [ ] CORS is configured with specific origins
- [ ] File upload size limits are set
- [ ] Regular backups are scheduled
- [ ] Monitoring and alerting are configured
- [ ] Error logs are being collected
- [ ] Security headers are enabled (Helmet)

## Performance Optimization

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Configure Caching**
   - Use Redis for session storage
   - Implement API response caching
   - Configure CDN for static assets

3. **Database Optimization**
   - Create appropriate indexes
   - Use connection pooling
   - Implement query optimization

4. **Load Balancing**
   - Use PM2 cluster mode
   - Configure Nginx load balancing
   - Consider horizontal scaling

## Support

For issues or questions:
- Check logs in `backend/logs/`
- Review deployment report in `backend/logs/deployment-*.json`
- Contact system administrator
- Refer to application documentation

## Maintenance

### Regular Tasks

- **Daily**: Monitor logs and error rates
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and rotate secrets
- **Annually**: Renew SSL certificates (if not auto-renewing)

### Updates and Patches

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Restart application
pm2 restart all
```

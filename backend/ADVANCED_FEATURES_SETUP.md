# Advanced Features Infrastructure Setup

This document outlines the setup and configuration for the advanced features infrastructure in the PCC Portal backend.

## Overview

The advanced features infrastructure includes:

- **Redis**: Caching and session management
- **Socket.IO**: Real-time communication
- **Bull Queue**: Background job processing
- **Node-Cron**: Scheduled tasks
- **OpenAI**: AI chatbot integration
- **Nodemailer**: Email notifications
- **Twilio**: SMS notifications

## Prerequisites

### 1. Redis Server

Install and start Redis server:

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# OpenAI Configuration (for AI chatbot)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=150

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@pcc.edu.ph

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
SOCKET_IO_TRANSPORTS=websocket,polling

# Background Jobs Configuration
BULL_REDIS_HOST=localhost
BULL_REDIS_PORT=6379
BULL_REDIS_PASSWORD=

# Notification Configuration
NOTIFICATION_BATCH_SIZE=100
NOTIFICATION_RETRY_ATTEMPTS=3
NOTIFICATION_RETRY_DELAY=5000

# QR Code Configuration
QR_CODE_SIZE=200
QR_CODE_MARGIN=2
QR_CODE_ERROR_CORRECTION=M
```

## Installation

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Test Infrastructure:**
   ```bash
   npm run test:infrastructure
   ```

3. **Start Server:**
   ```bash
   npm run dev
   ```

## Configuration Details

### Redis Configuration

Redis is used for:
- Session storage and caching
- Queue job storage
- Real-time data caching
- User preference caching

**Connection Settings:**
- Host: `REDIS_HOST` (default: localhost)
- Port: `REDIS_PORT` (default: 6379)
- Password: `REDIS_PASSWORD` (optional)
- Database: `REDIS_DB` (default: 0)

### OpenAI Configuration

Required for AI chatbot functionality:

1. **Get API Key:**
   - Sign up at https://platform.openai.com/
   - Generate an API key
   - Add to `OPENAI_API_KEY` environment variable

2. **Model Settings:**
   - `OPENAI_MODEL`: Model to use (default: gpt-3.5-turbo)
   - `OPENAI_MAX_TOKENS`: Maximum response length (default: 150)

### Email Configuration (Nodemailer)

For email notifications:

1. **Gmail Setup:**
   - Enable 2-factor authentication
   - Generate an app password
   - Use app password in `EMAIL_PASS`

2. **Other Providers:**
   - Update `EMAIL_HOST` and `EMAIL_PORT`
   - Configure authentication as needed

### SMS Configuration (Twilio)

For SMS notifications:

1. **Twilio Setup:**
   - Sign up at https://www.twilio.com/
   - Get Account SID and Auth Token
   - Purchase a phone number
   - Add credentials to environment variables

### Socket.IO Configuration

For real-time features:

- `SOCKET_IO_CORS_ORIGIN`: Frontend URL for CORS
- `SOCKET_IO_TRANSPORTS`: Transport methods (websocket,polling)

## Infrastructure Components

### 1. Redis Connection (`config/redis.js`)

Manages Redis connection with:
- Automatic reconnection
- Error handling
- Helper methods for common operations
- Connection pooling

### 2. Socket.IO Manager (`config/socket.js`)

Handles real-time communication:
- User authentication
- Room management
- Event broadcasting
- Connection tracking

### 3. Queue System (`config/queue.js`)

Background job processing:
- Notification queue
- Email queue
- SMS queue
- Report generation queue

### 4. Task Scheduler (`config/scheduler.js`)

Scheduled tasks:
- Daily cleanup tasks
- Event reminders
- Internship deadline reminders
- Weekly analytics
- Digital ID expiry reminders
- System health checks

### 5. Notification Service (`services/NotificationService.js`)

Unified notification system:
- Multi-channel delivery (web, email, SMS, push)
- User preference management
- Batch processing
- Scheduling support

## API Endpoints

### Health Check
- `GET /api/health` - Basic health status
- `GET /api/health/detailed` - Detailed system information
- `POST /api/health/test/redis` - Test Redis connection
- `POST /api/health/test/websocket` - Test WebSocket functionality

### Advanced Features
- `POST /api/advanced/chatbot/ask` - AI chatbot interaction
- `GET /api/advanced/events` - Event management
- `GET /api/advanced/digital-id` - Digital ID system
- `GET /api/advanced/internships` - Internship portal
- `GET /api/advanced/alumni` - Alumni network
- `GET /api/advanced/notifications` - Notification system

## Testing

### Infrastructure Test

Run the infrastructure test to verify all components:

```bash
npm run test:infrastructure
```

This test checks:
- Redis connection and operations
- Queue system functionality
- Task scheduler initialization
- Environment variable configuration

### Manual Testing

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Check health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Test Redis:**
   ```bash
   curl -X POST http://localhost:5000/api/health/test/redis
   ```

4. **Test WebSocket:**
   ```bash
   curl -X POST http://localhost:5000/api/health/test/websocket
   ```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed:**
   - Ensure Redis server is running
   - Check `REDIS_HOST` and `REDIS_PORT` settings
   - Verify firewall settings

2. **OpenAI API Errors:**
   - Verify `OPENAI_API_KEY` is correct
   - Check API usage limits
   - Ensure sufficient credits

3. **Email Sending Failed:**
   - Verify email credentials
   - Check app password for Gmail
   - Ensure SMTP settings are correct

4. **SMS Sending Failed:**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure sufficient Twilio credits

5. **WebSocket Connection Issues:**
   - Check CORS settings
   - Verify frontend URL configuration
   - Check firewall/proxy settings

### Logs

Check server logs for detailed error information:
- Redis connection logs
- Queue processing logs
- Scheduled task execution logs
- WebSocket connection logs

### Performance Monitoring

Monitor system performance:
- Redis memory usage
- Queue job processing times
- WebSocket connection counts
- Background task execution times

## Production Deployment

### Security Considerations

1. **Environment Variables:**
   - Use secure methods to manage secrets
   - Never commit sensitive data to version control

2. **Redis Security:**
   - Enable authentication
   - Use SSL/TLS connections
   - Restrict network access

3. **API Rate Limiting:**
   - Configure appropriate rate limits
   - Monitor for abuse

### Scaling Considerations

1. **Redis Clustering:**
   - Use Redis Cluster for high availability
   - Configure sentinel for failover

2. **Queue Workers:**
   - Scale queue workers based on load
   - Monitor queue lengths

3. **WebSocket Scaling:**
   - Use Redis adapter for multi-server setups
   - Configure load balancer for sticky sessions

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs
3. Run infrastructure tests
4. Contact the development team
# External Services Setup Guide

This guide provides detailed instructions for configuring all external service integrations required by the PCC Portal.

## Table of Contents

1. [OpenAI API Setup](#openai-api-setup)
2. [Email Service Setup](#email-service-setup)
3. [SMS Service Setup (Twilio)](#sms-service-setup-twilio)
4. [Push Notification Setup](#push-notification-setup)
5. [Testing Services](#testing-services)
6. [Monitoring and Usage](#monitoring-and-usage)

---

## OpenAI API Setup

The OpenAI API powers the AI chatbot functionality in the PCC Portal.

### 1. Create OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section

### 2. Generate API Key

1. Click "Create new secret key"
2. Give it a descriptive name (e.g., "PCC Portal Production")
3. Copy the API key immediately (you won't be able to see it again)

### 3. Configure Environment Variables

Add to your `.env` file:

```bash
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=150
```

### 4. Set Usage Limits (Recommended)

1. Go to [Usage Limits](https://platform.openai.com/account/limits)
2. Set monthly spending limits to prevent unexpected charges
3. Enable email notifications for usage alerts

### 5. Model Selection

**Available Models:**
- `gpt-3.5-turbo` - Fast, cost-effective (Recommended for production)
- `gpt-4` - More capable but more expensive
- `gpt-4-turbo` - Balance of capability and cost

**Cost Considerations:**
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

### 6. Best Practices

- Store API keys securely (never commit to version control)
- Implement rate limiting on chatbot endpoints
- Cache common responses to reduce API calls
- Monitor usage and costs regularly
- Set up billing alerts

---

## Email Service Setup

Email service is used for sending notifications, password resets, and system alerts.

### Option 1: Gmail (Development/Small Scale)

#### 1. Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification

#### 2. Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Enter "PCC Portal" as the name
4. Copy the generated 16-character password

#### 3. Configure Environment Variables

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=noreply@pcc.edu.ph
```

#### 4. Gmail Limitations

- 500 emails per day limit
- May be flagged as spam
- Not recommended for production

### Option 2: SendGrid (Recommended for Production)

#### 1. Create SendGrid Account

1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

#### 2. Create API Key

1. Go to Settings > API Keys
2. Click "Create API Key"
3. Choose "Full Access" or "Restricted Access"
4. Copy the API key

#### 3. Verify Sender Identity

1. Go to Settings > Sender Authentication
2. Verify a single sender email or domain
3. Follow the verification process

#### 4. Configure Environment Variables

```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@pcc.edu.ph
```

### Option 3: AWS SES (Enterprise)

#### 1. Set Up AWS SES

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Verify your domain or email address
3. Request production access (removes sandbox limitations)

#### 2. Create SMTP Credentials

1. Go to SMTP Settings
2. Click "Create My SMTP Credentials"
3. Download the credentials

#### 3. Configure Environment Variables

```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-username
EMAIL_PASS=your-smtp-password
EMAIL_FROM=noreply@pcc.edu.ph
```

### Email Templates

Create reusable email templates in `backend/templates/emails/`:

```javascript
// Example: Welcome email template
module.exports = {
  subject: 'Welcome to PCC Portal',
  html: `
    <h1>Welcome to PCC Portal!</h1>
    <p>Hello {{name}},</p>
    <p>Your account has been created successfully.</p>
    <p>Best regards,<br>PCC Portal Team</p>
  `
};
```

---

## SMS Service Setup (Twilio)

SMS service is used for sending urgent notifications and verification codes.

### 1. Create Twilio Account

1. Go to [Twilio](https://www.twilio.com/)
2. Sign up for a free trial account
3. Verify your phone number

### 2. Get Account Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Find your Account SID and Auth Token
3. Copy both values

### 3. Get Phone Number

#### Trial Account:
- Can only send to verified numbers
- Messages include trial disclaimer

#### Paid Account:
1. Go to Phone Numbers > Buy a Number
2. Select a number with SMS capabilities
3. Purchase the number

### 4. Configure Environment Variables

```bash
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### 5. Verify Test Numbers (Trial Only)

1. Go to Phone Numbers > Verified Caller IDs
2. Add phone numbers you want to test with
3. Verify each number via SMS

### 6. Upgrade to Paid Account

For production use:
1. Add payment method
2. Upgrade account
3. Remove trial limitations
4. Purchase additional phone numbers if needed

### 7. Cost Considerations

- SMS costs vary by country
- Philippines: ~$0.0395 per SMS
- Set up usage alerts
- Monitor spending at [Twilio Console](https://console.twilio.com/us1/billing)

### 8. Best Practices

- Use SMS only for critical notifications
- Implement rate limiting
- Provide opt-out mechanism
- Keep messages concise (160 characters)
- Include sender identification

---

## Push Notification Setup

Push notifications are handled by service workers for web push notifications.

### 1. Generate VAPID Keys

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

### 2. Configure Environment Variables

```bash
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:admin@pcc.edu.ph
```

### 3. Update Service Worker

Add VAPID public key to your frontend:

```javascript
// src/lib/push-notifications.ts
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
```

### 4. Request Permission

Implement permission request in your app:

```javascript
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY
    });
    // Send subscription to backend
  }
}
```

### 5. Browser Support

- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ iOS 16.4+ and macOS 13+
- Edge: ✅ Full support

---

## Testing Services

### Run Integration Tests

```bash
cd backend
npm run test:services
```

Or manually:

```bash
node scripts/test-external-services.js
```

### Test Individual Services

#### Test OpenAI:

```bash
# Set environment variable
export OPENAI_API_KEY=sk-your-key

# Run test
node -e "
const externalServices = require('./config/external-services');
externalServices.initialize().then(async () => {
  const health = await externalServices.openai.healthCheck();
  console.log(health);
});
"
```

#### Test Email:

```bash
# Set test recipient
export TEST_EMAIL_RECIPIENT=your-email@example.com

# Run test
node scripts/test-external-services.js
```

#### Test SMS:

```bash
# Set test recipient
export TEST_SMS_RECIPIENT=+1234567890

# Run test
node scripts/test-external-services.js
```

---

## Monitoring and Usage

### View Service Statistics

Access the admin dashboard:

```
GET /api/admin/services/stats
```

Response:
```json
{
  "openai": {
    "enabled": true,
    "model": "gpt-3.5-turbo",
    "requestCount": 1234,
    "errorCount": 5,
    "successRate": "99.59%"
  },
  "email": {
    "enabled": true,
    "host": "smtp.sendgrid.net",
    "sentCount": 5678,
    "errorCount": 12,
    "successRate": "99.79%"
  },
  "sms": {
    "enabled": true,
    "phoneNumber": "+1234567890",
    "sentCount": 234,
    "errorCount": 2,
    "successRate": "99.15%"
  }
}
```

### Health Check

```
GET /api/health/services
```

### Set Up Alerts

1. **OpenAI Usage Alerts**
   - Configure at [OpenAI Usage](https://platform.openai.com/usage)
   - Set monthly spending limits
   - Enable email notifications

2. **Email Delivery Monitoring**
   - SendGrid: Use Event Webhook
   - AWS SES: Use CloudWatch alarms
   - Gmail: Monitor bounce rates

3. **SMS Usage Alerts**
   - Twilio: Set up usage triggers
   - Configure budget alerts
   - Monitor delivery rates

### Cost Optimization

1. **OpenAI**
   - Cache common responses
   - Use shorter max_tokens
   - Implement request throttling
   - Consider gpt-3.5-turbo over gpt-4

2. **Email**
   - Batch notifications
   - Use templates
   - Implement unsubscribe
   - Clean inactive users

3. **SMS**
   - Use SMS only for critical alerts
   - Prefer email when possible
   - Implement opt-in/opt-out
   - Monitor delivery rates

---

## Troubleshooting

### OpenAI Issues

**Error: Invalid API Key**
- Verify API key is correct
- Check if key has been revoked
- Ensure no extra spaces in .env file

**Error: Rate Limit Exceeded**
- Implement request throttling
- Upgrade to higher tier
- Cache responses

### Email Issues

**Emails Not Sending**
- Verify SMTP credentials
- Check firewall/port blocking
- Test with telnet: `telnet smtp.gmail.com 587`

**Emails Going to Spam**
- Set up SPF records
- Configure DKIM
- Verify sender domain
- Use reputable email service

### SMS Issues

**SMS Not Delivering**
- Verify phone number format (+country code)
- Check Twilio account balance
- Verify recipient number (trial accounts)
- Check message content for spam triggers

**High Costs**
- Review message frequency
- Implement rate limiting
- Use email for non-urgent notifications
- Monitor usage dashboard

---

## Security Best Practices

1. **API Keys**
   - Never commit to version control
   - Use environment variables
   - Rotate keys regularly
   - Restrict key permissions

2. **Rate Limiting**
   - Implement per-user limits
   - Add IP-based throttling
   - Monitor for abuse

3. **Data Privacy**
   - Don't log sensitive data
   - Encrypt API keys at rest
   - Use HTTPS for all communications
   - Comply with data protection regulations

4. **Access Control**
   - Restrict admin access
   - Audit service usage
   - Monitor for anomalies
   - Set up alerts for unusual activity

---

## Support Resources

- **OpenAI**: [OpenAI Help Center](https://help.openai.com/)
- **SendGrid**: [SendGrid Support](https://support.sendgrid.com/)
- **Twilio**: [Twilio Support](https://support.twilio.com/)
- **AWS SES**: [AWS SES Documentation](https://docs.aws.amazon.com/ses/)

For PCC Portal specific issues, contact the system administrator.

# Email & SMS Configuration Guide

This guide will help you configure email and SMS services for the PCC Portal.

## Current Status
- ⚠️ Email service: Not configured
- ⚠️ SMS service: Not configured

## Quick Setup

### 1. Email Configuration (Gmail)

**Step 1:** Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled

**Step 2:** Generate App Password
1. In Security settings, click "App passwords"
2. Select "Mail" and "Other (Custom name)"
3. Enter "PCC Portal" as the name
4. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

**Step 3:** Update .env file
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=noreply@pcc.edu.ph
```

### 2. SMS Configuration (Twilio)

**Step 1:** Create Twilio Account
1. Sign up at [Twilio](https://www.twilio.com/)
2. Verify your phone number
3. Get $15 free trial credit

**Step 2:** Get Credentials
1. Go to [Twilio Console](https://console.twilio.com/)
2. Copy your Account SID and Auth Token
3. Get a phone number from Phone Numbers → Manage → Buy a number

**Step 3:** Update .env file
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

## Alternative Email Providers

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your_password
```

### Yahoo Mail
```bash
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your_app_password
```

### Custom SMTP
```bash
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your_password
```

## Testing Configuration

Run the test script to verify your setup:

```bash
# Test configuration only
node backend/test-email-sms-config.js

# Test with actual email
node backend/test-email-sms-config.js your-email@example.com

# Test with email and SMS
node backend/test-email-sms-config.js your-email@example.com +1234567890
```

## Development Mode

For development, you can disable the warning messages by setting:
```bash
NODE_ENV=development
```

The services will still be disabled, but warnings will be less intrusive.

## Production Considerations

### Email Security
- Use dedicated email service (SendGrid, Mailgun, AWS SES)
- Set up SPF, DKIM, and DMARC records
- Use environment-specific FROM addresses

### SMS Security
- Monitor usage to avoid unexpected charges
- Implement rate limiting
- Use opt-in/opt-out mechanisms
- Comply with SMS regulations (TCPA, GDPR)

### Environment Variables
- Never commit real credentials to version control
- Use different credentials for development/staging/production
- Rotate credentials regularly

## Troubleshooting

### Email Issues
- **Authentication failed**: Check username/password
- **Connection timeout**: Verify host/port settings
- **SSL/TLS errors**: Try different EMAIL_SECURE settings

### SMS Issues
- **Invalid credentials**: Verify Account SID and Auth Token
- **Phone number format**: Use E.164 format (+1234567890)
- **Insufficient funds**: Check Twilio account balance

### Common Errors
- **ENOTFOUND**: DNS resolution failed, check EMAIL_HOST
- **ECONNREFUSED**: Connection refused, check port/firewall
- **Invalid login**: Wrong credentials or 2FA not enabled

## Support

If you need help:
1. Run the test script for detailed error messages
2. Check the troubleshooting section above
3. Verify your credentials in the respective service dashboards
4. Ensure firewall/network allows outbound connections on required ports

## Security Notes

- Email passwords should be app-specific passwords, not your main account password
- Store all credentials in environment variables, never in code
- Use HTTPS for all web interfaces
- Regularly audit and rotate credentials
- Monitor service usage for unusual activity
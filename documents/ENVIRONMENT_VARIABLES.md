# Environment Variables Configuration Guide

This document describes all environment variables used in the PCC Portal application.

## Table of Contents

- [Backend Configuration](#backend-configuration)
- [Frontend Configuration](#frontend-configuration)
- [Security Configuration](#security-configuration)
- [Validation](#validation)
- [Production Checklist](#production-checklist)

## Backend Configuration

### Database Configuration

```bash
DB_HOST=localhost              # Database host
DB_PORT=5432                   # Database port
DB_NAME=pcc_portal            # Database name
DB_USER=postgres              # Database user
DB_PASS=your_password_here    # Database password
```

### JWT Configuration

```bash
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=15m                # Access token expiration (15 minutes recommended)
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=7d         # Refresh token expiration (7 days)
```

**Important:** Use long, random strings for JWT secrets. Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Server Configuration

```bash
PORT=5000                     # Server port
NODE_ENV=development          # Environment (development/production)
FRONTEND_URL=http://localhost:3000  # Frontend URL for CORS
```

### Redis Configuration

```bash
REDIS_HOST=localhost          # Redis host
REDIS_PORT=6379              # Redis port
REDIS_PASSWORD=              # Redis password (if required)
REDIS_DB=0                   # Redis database number
```

### Email Configuration

```bash
EMAIL_HOST=smtp.gmail.com     # SMTP host
EMAIL_PORT=587                # SMTP port
EMAIL_SECURE=false            # Use TLS (true for port 465)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@pcc.edu.ph
```

**Gmail Setup:**
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password in EMAIL_PASS

## Security Configuration

### Email Verification

```bash
EMAIL_VERIFICATION_EXPIRE=24h          # Token expiration time
EMAIL_VERIFICATION_TOKEN_LENGTH=32     # Token length in characters
```

**Time Format:** Use `s` (seconds), `m` (minutes), `h` (hours), or `d` (days)
- Examples: `30s`, `15m`, `24h`, `7d`

### Two-Factor Authentication

```bash
TWO_FACTOR_CODE_EXPIRE=10m            # 2FA code expiration
TWO_FACTOR_CODE_LENGTH=6              # Code length (6 digits)
TWO_FACTOR_MAX_ATTEMPTS=3             # Max failed attempts before lockout
TWO_FACTOR_LOCKOUT_DURATION=15m       # Lockout duration
TWO_FACTOR_BACKUP_CODES_COUNT=10      # Number of backup codes
```

**Recommended Values:**
- Code expiration: 5-15 minutes
- Max attempts: 3-5
- Lockout duration: 15-30 minutes

### Rate Limiting

```bash
# Registration
RATE_LIMIT_REGISTRATION_MAX=5         # Max registrations per window
RATE_LIMIT_REGISTRATION_WINDOW=1h     # Time window

# Login
RATE_LIMIT_LOGIN_MAX=5                # Max login attempts per window
RATE_LIMIT_LOGIN_WINDOW=15m           # Time window

# Email Verification
RATE_LIMIT_VERIFICATION_MAX=10        # Max verification attempts
RATE_LIMIT_VERIFICATION_WINDOW=1h     # Time window

# Resend Email
RATE_LIMIT_RESEND_MAX=3               # Max resend requests
RATE_LIMIT_RESEND_WINDOW=1h           # Time window

# 2FA
RATE_LIMIT_2FA_MAX=5                  # Max 2FA attempts
RATE_LIMIT_2FA_WINDOW=15m             # Time window
```

**Best Practices:**
- Lower limits for sensitive operations (login, 2FA)
- Higher limits for less sensitive operations (verification)
- Adjust based on your user base and security requirements

### reCAPTCHA Configuration

```bash
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_MIN_SCORE=0.5               # Minimum score (0.0-1.0)
```

**Setup:**
1. Go to https://www.google.com/recaptcha/admin
2. Register a new site
3. Choose reCAPTCHA v2 ("I'm not a robot" Checkbox)
4. Add your domains
5. Copy Site Key and Secret Key

**Score Interpretation:**
- 0.0-0.3: Likely bot
- 0.3-0.7: Suspicious
- 0.7-1.0: Likely human

### Account Security

```bash
ACCOUNT_LOCKOUT_ATTEMPTS=3            # Failed attempts before lockout
ACCOUNT_LOCKOUT_DURATION=15m          # Lockout duration
```

### Password Requirements

```bash
PASSWORD_MIN_LENGTH=8                 # Minimum password length
PASSWORD_REQUIRE_UPPERCASE=true       # Require uppercase letter
PASSWORD_REQUIRE_LOWERCASE=true       # Require lowercase letter
PASSWORD_REQUIRE_NUMBER=true          # Require number
PASSWORD_REQUIRE_SPECIAL=true         # Require special character
```

**Recommended:**
- Min length: 8-12 characters
- Enable all complexity requirements for better security

### Session Configuration

```bash
SESSION_SECRET=your_session_secret_here_make_it_long_and_random
SESSION_MAX_AGE=7d                    # Session expiration
SESSION_SECURE=false                  # Require HTTPS (true in production)
SESSION_HTTP_ONLY=true                # Prevent JavaScript access
SESSION_SAME_SITE=lax                 # CSRF protection (strict/lax/none)
```

**Production Settings:**
- `SESSION_SECURE=true` (requires HTTPS)
- `SESSION_SAME_SITE=strict` or `lax`
- Use a strong, random SESSION_SECRET

## Frontend Configuration

Create a `.env.local` file in the root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# reCAPTCHA (must match backend)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# Feature Flags
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_EMAIL_VERIFICATION=true
NEXT_PUBLIC_ENABLE_OAUTH=true

# App Configuration
NEXT_PUBLIC_APP_NAME=PCC Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Validation

### Automatic Validation

The server validates configuration on startup. If validation fails, the server will not start.

### Manual Validation

Run the validation script:

```bash
cd backend
node scripts/validate-env.js
```

This will:
- Check all required variables
- Validate configuration values
- Show warnings for potential issues
- Display security configuration summary

### Configuration Validation Rules

1. **Required Variables:** Must be set
2. **Time Formats:** Must match pattern (e.g., `15m`, `24h`)
3. **Numbers:** Must be valid integers
4. **Booleans:** Must be `true` or `false`
5. **Security:** Warnings for weak configurations

## Production Checklist

### Before Deploying to Production

- [ ] **Generate Strong Secrets**
  ```bash
  # JWT Secret
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  
  # Session Secret
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] **Update Environment**
  - [ ] Set `NODE_ENV=production`
  - [ ] Set `SESSION_SECURE=true`
  - [ ] Set `SESSION_SAME_SITE=strict` or `lax`
  - [ ] Update `FRONTEND_URL` to production URL
  - [ ] Update `NEXT_PUBLIC_API_URL` to production API

- [ ] **Configure reCAPTCHA**
  - [ ] Add production domain to reCAPTCHA settings
  - [ ] Update site key and secret key

- [ ] **Email Configuration**
  - [ ] Use production email service
  - [ ] Test email delivery
  - [ ] Configure SPF/DKIM records

- [ ] **Database**
  - [ ] Use production database
  - [ ] Enable SSL connection
  - [ ] Set strong password

- [ ] **Redis**
  - [ ] Use production Redis instance
  - [ ] Enable password authentication
  - [ ] Configure persistence

- [ ] **Security Settings**
  - [ ] Review rate limits
  - [ ] Review lockout durations
  - [ ] Review password requirements
  - [ ] Enable HTTPS

- [ ] **Validation**
  - [ ] Run `node scripts/validate-env.js`
  - [ ] Check for warnings
  - [ ] Test all features

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different secrets** for each environment
3. **Rotate secrets regularly** (every 90 days)
4. **Use environment-specific** reCAPTCHA keys
5. **Enable HTTPS** in production
6. **Monitor rate limits** and adjust as needed
7. **Review logs** for suspicious activity
8. **Keep dependencies** up to date

### Environment-Specific Settings

#### Development
```bash
NODE_ENV=development
SESSION_SECURE=false
JWT_EXPIRE=15m
RATE_LIMIT_LOGIN_MAX=10  # Higher for testing
```

#### Staging
```bash
NODE_ENV=staging
SESSION_SECURE=true
JWT_EXPIRE=15m
RATE_LIMIT_LOGIN_MAX=5
```

#### Production
```bash
NODE_ENV=production
SESSION_SECURE=true
JWT_EXPIRE=15m
RATE_LIMIT_LOGIN_MAX=5
ACCOUNT_LOCKOUT_ATTEMPTS=3
```

## Troubleshooting

### Common Issues

**1. Server won't start**
- Run validation script: `node scripts/validate-env.js`
- Check for missing required variables
- Verify time format (e.g., `15m`, not `15`)

**2. reCAPTCHA not working**
- Verify site key matches between frontend and backend
- Check domain is added to reCAPTCHA settings
- Ensure `NEXT_PUBLIC_` prefix on frontend

**3. Email not sending**
- Test SMTP credentials
- Check firewall/port access
- Verify email service allows SMTP
- For Gmail, use App Password

**4. Rate limiting too strict**
- Increase `MAX` values
- Increase `WINDOW` duration
- Check Redis connection

**5. Session issues**
- Verify SESSION_SECRET is set
- Check SESSION_SECURE matches HTTPS usage
- Verify cookie settings

### Getting Help

If you encounter issues:
1. Run validation script
2. Check server logs
3. Verify all required variables are set
4. Test with default values
5. Check documentation for specific features

## Additional Resources

- [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Redis Documentation](https://redis.io/documentation)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Updates

This configuration supports the Email Verification & Security feature set:
- Email verification with tokens
- Two-factor authentication
- Rate limiting
- Account lockout
- Password requirements
- reCAPTCHA integration
- Session management

For questions or issues, refer to the project documentation or contact the development team.

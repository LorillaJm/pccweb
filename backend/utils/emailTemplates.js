/**
 * Email templates for authentication and security notifications
 */

const appName = process.env.APP_NAME || 'PCC Portal';
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
const supportEmail = process.env.SUPPORT_EMAIL || 'support@pcc.edu.ph';

const emailTemplates = {
  /**
   * Email verification template
   */
  verification: (data) => {
    const { firstName, token, otp } = data;
    const verificationLink = `${frontendURL}/auth/verify?token=${token}`;

    return {
      subject: `Verify Your Email - ${appName}`,
      text: `Hi ${firstName},

Welcome to ${appName}! Please verify your email address to complete your registration.

Method 1: Click the link below
${verificationLink}

Method 2: Enter this code manually
Verification Code: ${otp}

This link and code will expire in 24 hours.

If you didn't create an account, please ignore this email.

Need help? Contact ${supportEmail}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; text-align: center; padding: 20px; background-color: #EEF2FF; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      <h2>Hi ${firstName},</h2>
      <p>Welcome to ${appName}! Please verify your email address to complete your registration.</p>
      
      <h3>Method 1: Click the button below</h3>
      <a href="${verificationLink}" class="button">Verify Email</a>
      
      <h3>Method 2: Enter this code manually</h3>
      <div class="code">${otp}</div>
      
      <p><strong>This link and code will expire in 24 hours.</strong></p>
      
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Need help? Contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    };
  },

  /**
   * 2FA code template
   */
  twoFactor: (data) => {
    const { firstName, code } = data;

    return {
      subject: `Your 2FA Code - ${appName}`,
      text: `Hi ${firstName},

Your two-factor authentication code is:

${code}

This code will expire in 10 minutes.

If you didn't request this code, please secure your account immediately by changing your password.

Need help? Contact ${supportEmail}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; }
    .code { font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #4F46E5; text-align: center; padding: 30px; background-color: #EEF2FF; border-radius: 5px; margin: 20px 0; }
    .warning { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      <h2>Hi ${firstName},</h2>
      <p>Your two-factor authentication code is:</p>
      
      <div class="code">${code}</div>
      
      <p><strong>This code will expire in 10 minutes.</strong></p>
      
      <div class="warning">
        <strong>⚠️ Security Alert:</strong> If you didn't request this code, please secure your account immediately by changing your password.
      </div>
    </div>
    <div class="footer">
      <p>Need help? Contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    };
  },

  /**
   * Password reset template
   */
  passwordReset: (data) => {
    const { firstName, token } = data;
    const resetLink = `${frontendURL}/auth/reset-password?token=${token}`;

    return {
      subject: `Reset Your Password - ${appName}`,
      text: `Hi ${firstName},

We received a request to reset your password for your ${appName} account.

Click the link below to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Need help? Contact ${supportEmail}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .warning { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      <h2>Hi ${firstName},</h2>
      <p>We received a request to reset your password for your ${appName} account.</p>
      
      <a href="${resetLink}" class="button">Reset Password</a>
      
      <p><strong>This link will expire in 1 hour.</strong></p>
      
      <div class="warning">
        <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      </div>
    </div>
    <div class="footer">
      <p>Need help? Contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    };
  },

  /**
   * Security alert template
   */
  securityAlert: (data) => {
    const { firstName, alertType, details, timestamp } = data;

    return {
      subject: `Security Alert - ${appName}`,
      text: `Hi ${firstName},

We detected unusual activity on your ${appName} account.

Alert Type: ${alertType}
Time: ${timestamp}
Details: ${details}

If this was you, you can safely ignore this email. If you don't recognize this activity, please:
1. Change your password immediately
2. Enable two-factor authentication
3. Review your recent account activity

Need help? Contact ${supportEmail}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9fafb; padding: 30px; }
    .alert-box { background-color: #FEF2F2; border: 2px solid #EF4444; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background-color: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Security Alert</h1>
    </div>
    <div class="content">
      <h2>Hi ${firstName},</h2>
      <p>We detected unusual activity on your ${appName} account.</p>
      
      <div class="alert-box">
        <p><strong>Alert Type:</strong> ${alertType}</p>
        <p><strong>Time:</strong> ${timestamp}</p>
        <p><strong>Details:</strong> ${details}</p>
      </div>
      
      <p>If this was you, you can safely ignore this email.</p>
      
      <p><strong>If you don't recognize this activity:</strong></p>
      <ol>
        <li>Change your password immediately</li>
        <li>Enable two-factor authentication</li>
        <li>Review your recent account activity</li>
      </ol>
      
      <a href="${frontendURL}/settings/security" class="button">Secure My Account</a>
    </div>
    <div class="footer">
      <p>Need help? Contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
      <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
    };
  }
};

module.exports = emailTemplates;

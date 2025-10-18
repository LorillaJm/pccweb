// Generate secure random secrets for deployment
const crypto = require('crypto');

console.log('\n=== SECURE SECRETS FOR DEPLOYMENT ===\n');
console.log('Copy these to your Render environment variables:\n');
console.log('SESSION_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('JWT_SECRET=' + crypto.randomBytes(32).toString('hex'));
console.log('\n=== KEEP THESE PRIVATE! ===\n');

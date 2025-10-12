# Security Testing Quick Reference

## Running Security Tests

### Quick Start

```bash
# Run all security tests
node backend/test-security-validation.js

# Expected output: 20/20 tests passed
```

### Test Categories

The security test suite includes 4 main categories:

1. **QR Code Security** (5 tests)
   - Secure QR generation
   - Legitimate QR validation
   - Tamper detection
   - Expiration checking
   - Replay attack prevention

2. **Access Control** (5 tests)
   - Role-based access control
   - Permission validation
   - Invalid permission rejection
   - Time-based restrictions
   - Security hash validation

3. **API Security** (5 tests)
   - Input validation
   - SQL injection prevention
   - XSS prevention
   - Rate limiting
   - CSRF protection

4. **Penetration Testing** (5 tests)
   - Brute force prevention
   - Session hijacking prevention
   - Privilege escalation prevention
   - Data encryption
   - API authorization

---

## Test Output

### Successful Test Run

```
=== Security Testing and Validation Suite ===

Testing Requirements: 2.7, 3.7, 3.8, 6.6

============================================================
SECURITY TEST SUMMARY
============================================================
Total Tests: 20
Passed: 20 (100.0%)
Failed: 0 (0.0%)
Duration: ~3s
============================================================

✓ All security tests passed!
```

### Failed Test Run

If any tests fail, you'll see:

```
⚠️  WARNING: X security test(s) failed!

DETAILED RESULTS BY CATEGORY:
------------------------------------------------------------
  ✗ Test Name: FAIL
```

---

## Troubleshooting

### Common Issues

1. **Redis Connection Warning**
   ```
   ⚠️  Queue connection failed, using in-memory fallback
   ```
   - This is expected if Redis is not running
   - Tests will use in-memory fallback
   - Not a test failure

2. **Module Not Found**
   ```bash
   # Install dependencies
   cd backend
   npm install
   ```

3. **Permission Errors**
   ```bash
   # Run with appropriate permissions
   node backend/test-security-validation.js
   ```

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run security tests
        run: node backend/test-security-validation.js
```

---

## Manual Testing

### Test Individual Categories

You can import and run individual test categories:

```javascript
const {
  testQRCodeSecurity,
  testAccessControl,
  testAPISecurity,
  testPenetrationScenarios
} = require('./test-security-validation');

// Run specific category
testQRCodeSecurity().then(results => {
  console.log('QR Security Results:', results);
});
```

---

## Security Test Requirements

### Requirements Coverage

- **Requirement 2.7:** QR code security and tamper detection
- **Requirement 3.7:** Access control and permission systems
- **Requirement 3.8:** Digital ID security and audit trails
- **Requirement 6.6:** API security and rate limiting

### Test Validation

Each test validates specific security features:

| Test ID | Feature | Requirement |
|---------|---------|-------------|
| 1.1-1.5 | QR Code Security | 2.7 |
| 2.1-2.5 | Access Control | 3.7, 3.8 |
| 3.1-3.5 | API Security | 6.6 |
| 4.1-4.5 | Penetration Testing | All |

---

## Pre-Deployment Checklist

Before deploying to production:

1. ✅ Run security tests: `node backend/test-security-validation.js`
2. ✅ Verify all tests pass (20/20)
3. ✅ Review security recommendations
4. ✅ Set production environment variables
5. ✅ Enable HTTPS/TLS
6. ✅ Configure rate limiting
7. ✅ Review security checklist

---

## Continuous Monitoring

### Scheduled Testing

Run security tests on a schedule:

```bash
# Daily security test (cron example)
0 2 * * * cd /path/to/project && node backend/test-security-validation.js >> /var/log/security-tests.log 2>&1
```

### Monitoring Metrics

Track these security metrics:
- Test pass rate (target: 100%)
- Test execution time (baseline: ~3s)
- Failed authentication attempts
- Rate limit triggers
- Security event frequency

---

## Additional Resources

- **Full Report:** `backend/SECURITY_TESTING_REPORT.md`
- **Checklist:** `backend/SECURITY_CHECKLIST.md`
- **Test Code:** `backend/test-security-validation.js`

---

## Support

For security concerns:
- **Email:** security@pcc.edu.ph
- **Response Time:** 24-48 hours
- **Emergency:** Contact system administrator immediately

---

**Last Updated:** January 2025

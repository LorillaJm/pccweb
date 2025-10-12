const QRCodeService = require('./services/QRCodeService');
const crypto = require('crypto');

async function runQRUnitTests() {
  console.log('🧪 Starting QR Code Unit Tests...');
  
  try {
    const qrService = new QRCodeService();

    // Test 1: QR Service instantiation
    console.log('\n📝 Test 1: QR Service instantiation');
    if (!qrService) {
      throw new Error('Failed to instantiate QRCodeService');
    }
    console.log('✅ QRCodeService instantiated successfully');

    // Test 2: Generate Secure QR Code
    console.log('\n📝 Test 2: Generate Secure QR Code');
    const ticketData = {
      ticketId: '507f1f77bcf86cd799439011',
      eventId: '507f1f77bcf86cd799439012',
      userId: '507f1f77bcf86cd799439013',
      ticketNumber: 'TEST123456',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 2 days from now
    };

    const qrResult = await qrService.generateSecureQRCode(ticketData);
    if (!qrResult.success) {
      throw new Error(`Failed to generate secure QR code: ${qrResult.error}`);
    }
    
    if (!qrResult.data.qrString || !qrResult.data.qrCodeImage || !qrResult.data.securityHash) {
      throw new Error('QR code result missing required fields');
    }
    console.log('✅ Secure QR code generated successfully');

    // Test 3: Validate Secure QR Code
    console.log('\n📝 Test 3: Validate Secure QR Code');
    const validateResult = await qrService.validateSecureQRCode(qrResult.data.qrString);
    if (!validateResult.success) {
      throw new Error(`Failed to validate secure QR code: ${validateResult.error}`);
    }
    
    if (validateResult.data.ticketId !== ticketData.ticketId ||
        validateResult.data.eventId !== ticketData.eventId ||
        validateResult.data.userId !== ticketData.userId) {
      throw new Error('Validated QR code data does not match original');
    }
    console.log('✅ Secure QR code validated successfully');

    // Test 4: Generate Offline QR Code
    console.log('\n📝 Test 4: Generate Offline QR Code');
    const offlineData = {
      eventTitle: 'Test Event',
      eventDate: new Date(),
      userName: 'Test User'
    };

    const offlineQRResult = await qrService.generateOfflineQRCode(ticketData, offlineData);
    if (!offlineQRResult.success) {
      throw new Error(`Failed to generate offline QR code: ${offlineQRResult.error}`);
    }
    
    if (!offlineQRResult.data.offlineCapable || !offlineQRResult.data.syncId) {
      throw new Error('Offline QR code missing offline capabilities');
    }
    console.log('✅ Offline QR code generated successfully');

    // Test 5: Validate Offline QR Code
    console.log('\n📝 Test 5: Validate Offline QR Code');
    const offlineContext = {
      eventId: ticketData.eventId
    };

    const offlineValidateResult = await qrService.validateOfflineQRCode(
      offlineQRResult.data.qrString,
      offlineContext
    );
    if (!offlineValidateResult.success) {
      throw new Error(`Failed to validate offline QR code: ${offlineValidateResult.error}`);
    }
    
    if (!offlineValidateResult.data.offlineValidation) {
      throw new Error('Offline validation flag not set');
    }
    console.log('✅ Offline QR code validated successfully');

    // Test 6: Test Invalid QR Code
    console.log('\n📝 Test 6: Test Invalid QR Code');
    const invalidQR = 'invalid-qr-code-data';
    const invalidResult = await qrService.validateSecureQRCode(invalidQR);
    if (invalidResult.success) {
      throw new Error('Invalid QR code should not validate successfully');
    }
    console.log('✅ Invalid QR code properly rejected');

    // Test 7: Test Tampered QR Code
    console.log('\n📝 Test 7: Test Tampered QR Code');
    const tamperedQR = qrResult.data.qrString.replace('a', 'b'); // Tamper with the data
    const tamperResult = await qrService.validateSecureQRCode(tamperedQR);
    if (tamperResult.success) {
      throw new Error('Tampered QR code should not validate successfully');
    }
    console.log('✅ Tamper detection working correctly');

    // Test 8: Prepare Offline Sync
    console.log('\n📝 Test 8: Prepare Offline Sync');
    const offlineScans = [
      {
        ticketId: ticketData.ticketId,
        eventId: ticketData.eventId,
        userId: ticketData.userId,
        scannedAt: new Date(),
        scannedBy: 'scanner-user-id',
        location: 'Main Entrance',
        deviceInfo: { deviceId: 'TEST_DEVICE', platform: 'mobile' }
      }
    ];

    const syncPrepResult = await qrService.prepareOfflineSync(offlineScans);
    if (!syncPrepResult.success) {
      throw new Error(`Failed to prepare offline sync: ${syncPrepResult.error}`);
    }
    
    if (!syncPrepResult.data.syncId || !syncPrepResult.data.scans || syncPrepResult.data.scans.length !== 1) {
      throw new Error('Offline sync data structure invalid');
    }
    console.log('✅ Offline sync data prepared successfully');

    // Test 9: Batch QR Generation
    console.log('\n📝 Test 9: Batch QR Generation');
    const batchTickets = [
      {
        ticketId: 'batch-ticket-1',
        eventId: ticketData.eventId,
        userId: ticketData.userId,
        ticketNumber: 'BATCH001',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      },
      {
        ticketId: 'batch-ticket-2',
        eventId: ticketData.eventId,
        userId: ticketData.userId,
        ticketNumber: 'BATCH002',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      }
    ];

    const batchResult = await qrService.generateBatchQRCodes(batchTickets);
    if (!batchResult.success) {
      throw new Error(`Failed to generate batch QR codes: ${batchResult.error}`);
    }
    
    if (batchResult.data.successful.length !== 2 || batchResult.data.failed.length !== 0) {
      throw new Error('Batch QR generation results unexpected');
    }
    console.log('✅ Batch QR codes generated successfully');

    // Test 10: Test Expired QR Code
    console.log('\n📝 Test 10: Test Expired QR Code');
    const expiredTicketData = {
      ...ticketData,
      expiresAt: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    };

    const expiredQRResult = await qrService.generateSecureQRCode(expiredTicketData);
    if (!expiredQRResult.success) {
      throw new Error(`Failed to generate expired QR code: ${expiredQRResult.error}`);
    }

    const expiredValidateResult = await qrService.validateSecureQRCode(expiredQRResult.data.qrString);
    if (expiredValidateResult.success) {
      throw new Error('Expired QR code should not validate successfully');
    }
    console.log('✅ Expiration detection working correctly');

    // Test 11: Test QR Code Methods Exist
    console.log('\n📝 Test 11: Test QR Code Methods Exist');
    const requiredMethods = [
      'generateSecureQRCode',
      'validateSecureQRCode',
      'generateOfflineQRCode',
      'validateOfflineQRCode',
      'prepareOfflineSync',
      'processOfflineSync',
      'generateBatchQRCodes'
    ];

    for (const method of requiredMethods) {
      if (typeof qrService[method] !== 'function') {
        throw new Error(`QRCodeService missing method: ${method}`);
      }
    }
    console.log('✅ All required QR code methods exist');

    // Test 12: Test QR Code Image Generation
    console.log('\n📝 Test 12: Test QR Code Image Generation');
    const qrImage = qrResult.data.qrCodeImage;
    if (!qrImage || !qrImage.startsWith('data:image/png;base64,')) {
      throw new Error('QR code image not generated properly');
    }
    console.log('✅ QR code image generated successfully');

    console.log('\n🎉 All QR Code Unit tests passed!');
    
  } catch (error) {
    console.error('\n❌ QR Unit test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runQRUnitTests();
}

module.exports = { runQRUnitTests };
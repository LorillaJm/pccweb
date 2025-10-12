const express = require('express');
const router = express.Router();
const DigitalID = require('../models/DigitalID');
const AccessLog = require('../models/AccessLog');
const User = require('../models/User');
const crypto = require('crypto');
const QRCode = require('qrcode');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user && !req.body.userId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

/**
 * @route POST /api/digital-id/generate
 * @desc Generate a new digital ID for a user
 * @access Private
 */
router.post('/generate', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if digital ID already exists
    let digitalId = await DigitalID.findOne({ userId });
    
    if (digitalId) {
      // Update existing digital ID
      digitalId.isActive = true;
      digitalId.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      digitalId.lastUpdated = new Date();
    } else {
      // Generate unique QR code data
      const qrData = `PCC-${userId}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
      
      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(qrData);
      
      // Determine access level based on user role
      const accessLevelMap = {
        'student': 'student',
        'faculty': 'faculty',
        'admin': 'admin',
        'super_admin': 'admin',
        'alumni': 'student',
        'company': 'visitor'
      };
      
      const accessLevel = accessLevelMap[user.role] || 'student';
      
      // Define default permissions based on access level
      const defaultPermissions = [];
      
      if (accessLevel === 'student' || accessLevel === 'alumni') {
        defaultPermissions.push(
          {
            facilityId: 'library-main',
            facilityName: 'Main Library',
            accessType: 'full'
          },
          {
            facilityId: 'cafeteria',
            facilityName: 'Cafeteria',
            accessType: 'full'
          },
          {
            facilityId: 'computer-lab',
            facilityName: 'Computer Laboratory',
            accessType: 'time_limited',
            timeRestrictions: {
              startTime: '08:00',
              endTime: '20:00',
              daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
            }
          }
        );
      } else if (accessLevel === 'faculty') {
        defaultPermissions.push(
          {
            facilityId: 'library-main',
            facilityName: 'Main Library',
            accessType: 'full'
          },
          {
            facilityId: 'faculty-lounge',
            facilityName: 'Faculty Lounge',
            accessType: 'full'
          },
          {
            facilityId: 'computer-lab',
            facilityName: 'Computer Laboratory',
            accessType: 'full'
          }
        );
      } else if (accessLevel === 'admin') {
        defaultPermissions.push(
          {
            facilityId: 'library-main',
            facilityName: 'Main Library',
            accessType: 'full'
          },
          {
            facilityId: 'faculty-lounge',
            facilityName: 'Faculty Lounge',
            accessType: 'full'
          },
          {
            facilityId: 'computer-lab',
            facilityName: 'Computer Laboratory',
            accessType: 'full'
          },
          {
            facilityId: 'admin-office',
            facilityName: 'Administrative Office',
            accessType: 'full'
          }
        );
      }
      
      // Create new digital ID
      digitalId = new DigitalID({
        userId,
        qrCode: qrData,
        qrCodeImage,
        accessLevel,
        permissions: defaultPermissions,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        metadata: {
          issuer: userId
        }
      });
    }
    
    await digitalId.save();
    
    res.json({
      success: true,
      message: 'Digital ID generated successfully',
      digitalId: {
        _id: digitalId._id,
        qrCode: digitalId.qrCode,
        qrCodeImage: digitalId.qrCodeImage,
        accessLevel: digitalId.accessLevel,
        permissions: digitalId.permissions,
        isActive: digitalId.isActive,
        expiresAt: digitalId.expiresAt
      }
    });
  } catch (error) {
    console.error('Error generating digital ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate digital ID',
      error: error.message 
    });
  }
});

/**
 * @route POST /api/digital-id/validate-access
 * @desc Validate QR code and check facility access
 * @access Public
 */
router.post('/validate-access', async (req, res) => {
  try {
    const { qrCode, facilityId, facilityName, deviceInfo } = req.body;
    
    if (!qrCode || !facilityId) {
      return res.status(400).json({ 
        success: false, 
        message: 'QR code and facility ID are required' 
      });
    }

    // Find digital ID by QR code
    const digitalId = await DigitalID.findOne({ qrCode }).populate('userId');
    
    if (!digitalId) {
      return res.status(404).json({ 
        success: false, 
        accessGranted: false,
        message: 'Invalid QR code' 
      });
    }

    // Check if digital ID is valid
    if (!digitalId.isValid) {
      await AccessLog.logAccessAttempt({
        userId: digitalId.userId._id,
        digitalIdId: digitalId._id,
        facilityId,
        facilityName: facilityName || 'Unknown Facility',
        accessResult: 'denied',
        denialReason: 'Digital ID is inactive or expired',
        deviceInfo,
        qrCodeUsed: qrCode
      });
      
      return res.json({ 
        success: true, 
        accessGranted: false,
        message: 'Digital ID is inactive or expired' 
      });
    }

    // Check facility access
    const accessCheck = digitalId.hasAccessToFacility(facilityId);
    
    // Log access attempt
    await AccessLog.logAccessAttempt({
      userId: digitalId.userId._id,
      digitalIdId: digitalId._id,
      facilityId,
      facilityName: facilityName || 'Unknown Facility',
      accessResult: accessCheck.hasAccess ? 'granted' : 'denied',
      denialReason: accessCheck.hasAccess ? null : accessCheck.reason,
      deviceInfo,
      qrCodeUsed: qrCode
    });

    // Update last access attempt
    digitalId.metadata.lastAccessAttempt = new Date();
    digitalId.metadata.totalAccessAttempts += 1;
    await digitalId.save();

    res.json({
      success: true,
      accessGranted: accessCheck.hasAccess,
      message: accessCheck.hasAccess ? 'Access granted' : accessCheck.reason,
      user: {
        name: `${digitalId.userId.firstName} ${digitalId.userId.lastName}`,
        role: digitalId.userId.role,
        accessLevel: digitalId.accessLevel
      }
    });
  } catch (error) {
    console.error('Error validating access:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate access',
      error: error.message 
    });
  }
});

/**
 * @route GET /api/digital-id/:userId
 * @desc Get digital ID for a user
 * @access Private
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const digitalId = await DigitalID.findOne({ userId }).populate('userId', 'firstName lastName email role');
    
    if (!digitalId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Digital ID not found' 
      });
    }

    res.json({
      success: true,
      digitalId
    });
  } catch (error) {
    console.error('Error fetching digital ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch digital ID',
      error: error.message 
    });
  }
});

module.exports = router;

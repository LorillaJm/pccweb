#!/usr/bin/env node

/**
 * WebSocket Integration Test Script
 * Tests the Socket.IO real-time notification functionality
 */

require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const socketManager = require('./config/socket');
const NotificationService = require('./services/NotificationService');
const User = require('./models/User');

// Test configuration
const TEST_PORT = 5001;
const TEST_JWT_SECRET = 'test_jwt_secret_for_websocket_testing';

// Test data
const testUser = {
  email: 'test.websocket@example.com',
  password: 'testpassword123',
  firstName: 'WebSocket',
  lastName: 'Test',
  role: 'student'
};

class WebSocketTester {
  constructor() {
    this.server = null;
    this.io = null;
    this.clients = [];
    this.testUser = null;
  }

  async setup() {
    try {
      // Connect to MongoDB
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pcc_portal_test';
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');

      // Create test user
      await User.deleteMany({ email: testUser.email });
      this.testUser = await User.create(testUser);
      console.log('✅ Created test user');

      // Setup Express server
      const app = express();
      this.server = http.createServer(app);
      
      // Initialize Socket.IO with test configuration
      this.io = new Server(this.server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });

      // Setup authentication middleware for testing
      this.io.use(async (socket, next) => {
        try {
          const token = socket.handshake.auth.token;
          if (!token) {
            return next(new Error('Authentication token required'));
          }

          const decoded = jwt.verify(token, TEST_JWT_SECRET);
          socket.userId = decoded.id;
          socket.userRole = decoded.role;
          
          next();
        } catch (error) {
          next(new Error('Authentication failed'));
        }
      });

      // Setup basic connection handling
      this.io.on('connection', (socket) => {
        console.log(`Test client connected: ${socket.userId}`);
        
        socket.join(`user:${socket.userId}`);
        socket.join(`role:${socket.userRole}`);

        // Handle test events
        socket.on('test:ping', (data) => {
          socket.emit('test:pong', { ...data, timestamp: new Date() });
        });

        socket.on('notification:test-receive', (data) => {
          socket.emit('notification:test-received', data);
        });

        socket.on('disconnect', () => {
          console.log(`Test client disconnected: ${socket.userId}`);
        });
      });

      // Start server
      await new Promise((resolve) => {
        this.server.listen(TEST_PORT, () => {
          console.log(`✅ Test server running on port ${TEST_PORT}`);
          resolve();
        });
      });

      return true;
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      return false;
    }
  }

  async createTestClient() {
    try {
      // Generate JWT token for test user
      const token = jwt.sign(
        { 
          id: this.testUser._id, 
          role: this.testUser.role 
        },
        TEST_JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Create client connection
      const client = Client(`http://localhost:${TEST_PORT}`, {
        auth: { token },
        transports: ['websocket']
      });

      // Wait for connection
      await new Promise((resolve, reject) => {
        client.on('connect', resolve);
        client.on('connect_error', reject);
        
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      this.clients.push(client);
      return client;
    } catch (error) {
      console.error('❌ Failed to create test client:', error.message);
      throw error;
    }
  }

  async testBasicConnection() {
    console.log('\n🔌 Testing Basic WebSocket Connection...');
    
    try {
      const client = await this.createTestClient();
      
      // Test ping-pong
      const pingData = { message: 'test ping', timestamp: Date.now() };
      
      const pongReceived = await new Promise((resolve) => {
        client.emit('test:ping', pingData);
        client.on('test:pong', (data) => {
          resolve(data.message === pingData.message);
        });
        
        setTimeout(() => resolve(false), 2000);
      });

      if (pongReceived) {
        console.log('   ✅ Basic connection and messaging working');
        return true;
      } else {
        console.log('   ❌ Basic connection test failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Connection test failed:', error.message);
      return false;
    }
  }

  async testNotificationDelivery() {
    console.log('\n📧 Testing Real-time Notification Delivery...');
    
    try {
      const client = await this.createTestClient();
      
      // Listen for notifications
      const notificationReceived = await new Promise((resolve) => {
        client.on('notification:new', (data) => {
          resolve(data);
        });

        // Send test notification via Socket.IO directly
        setTimeout(() => {
          this.io.to(`user:${this.testUser._id}`).emit('notification:new', {
            id: 'test-notification-1',
            title: 'Test Real-time Notification',
            message: 'This is a test notification',
            type: 'info',
            category: 'system',
            timestamp: new Date()
          });
        }, 100);

        setTimeout(() => resolve(null), 3000);
      });

      if (notificationReceived && notificationReceived.title === 'Test Real-time Notification') {
        console.log('   ✅ Real-time notification delivery working');
        return true;
      } else {
        console.log('   ❌ Notification delivery test failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Notification delivery test failed:', error.message);
      return false;
    }
  }

  async testNotificationInteractions() {
    console.log('\n🔄 Testing Notification Interactions...');
    
    try {
      const client = await this.createTestClient();
      
      // Test notification acknowledgment
      const ackReceived = await new Promise((resolve) => {
        client.on('notification:acknowledged', (data) => {
          resolve(data.notificationId === 'test-ack-notification');
        });

        client.emit('notification:acknowledge', { 
          notificationId: 'test-ack-notification' 
        });

        setTimeout(() => resolve(false), 2000);
      });

      if (ackReceived) {
        console.log('   ✅ Notification acknowledgment working');
      } else {
        console.log('   ❌ Notification acknowledgment failed');
      }

      // Test heartbeat
      const heartbeatReceived = await new Promise((resolve) => {
        client.on('heartbeat-ack', () => {
          resolve(true);
        });

        client.emit('heartbeat');
        setTimeout(() => resolve(false), 2000);
      });

      if (heartbeatReceived) {
        console.log('   ✅ Heartbeat mechanism working');
      } else {
        console.log('   ❌ Heartbeat mechanism failed');
      }

      return ackReceived && heartbeatReceived;
    } catch (error) {
      console.log('   ❌ Notification interactions test failed:', error.message);
      return false;
    }
  }

  async testMultipleClients() {
    console.log('\n👥 Testing Multiple Client Connections...');
    
    try {
      // Create multiple clients
      const client1 = await this.createTestClient();
      const client2 = await this.createTestClient();
      
      let client1Received = false;
      let client2Received = false;

      // Setup listeners
      client1.on('notification:broadcast-test', () => {
        client1Received = true;
      });

      client2.on('notification:broadcast-test', () => {
        client2Received = true;
      });

      // Broadcast to all clients
      setTimeout(() => {
        this.io.emit('notification:broadcast-test', {
          message: 'Broadcast test message'
        });
      }, 100);

      // Wait for responses
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (client1Received && client2Received) {
        console.log('   ✅ Multiple client broadcast working');
        return true;
      } else {
        console.log('   ❌ Multiple client broadcast failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Multiple clients test failed:', error.message);
      return false;
    }
  }

  async testConnectionRecovery() {
    console.log('\n🔄 Testing Connection Recovery...');
    
    try {
      const client = await this.createTestClient();
      
      // Simulate disconnect and reconnect
      client.disconnect();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reconnect
      client.connect();
      
      const reconnected = await new Promise((resolve) => {
        client.on('connect', () => {
          resolve(true);
        });
        
        setTimeout(() => resolve(false), 3000);
      });

      if (reconnected) {
        console.log('   ✅ Connection recovery working');
        return true;
      } else {
        console.log('   ❌ Connection recovery failed');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Connection recovery test failed:', error.message);
      return false;
    }
  }

  async cleanup() {
    try {
      // Close all client connections
      this.clients.forEach(client => {
        if (client.connected) {
          client.disconnect();
        }
      });

      // Close server
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
      }

      // Clean up test data
      if (this.testUser) {
        await User.deleteMany({ email: testUser.email });
      }

      // Disconnect from MongoDB
      await mongoose.disconnect();
      
      console.log('🧹 Cleanup completed');
    } catch (error) {
      console.error('⚠️ Cleanup error:', error.message);
    }
  }
}

async function runWebSocketTests() {
  console.log('🧪 Testing WebSocket Real-time Communication...\n');

  const tester = new WebSocketTester();
  
  try {
    // Setup test environment
    const setupSuccess = await tester.setup();
    if (!setupSuccess) {
      console.log('❌ Test setup failed');
      process.exit(1);
    }

    // Run tests
    const results = {
      basicConnection: await tester.testBasicConnection(),
      notificationDelivery: await tester.testNotificationDelivery(),
      notificationInteractions: await tester.testNotificationInteractions(),
      multipleClients: await tester.testMultipleClients(),
      connectionRecovery: await tester.testConnectionRecovery()
    };

    // Summary
    console.log('\n📋 WebSocket Test Summary:');
    console.log('==========================');

    let totalTests = 0;
    let passedTests = 0;

    Object.entries(results).forEach(([testName, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${testName}: ${status}`);
      totalTests++;
      if (passed) passedTests++;
    });

    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 All WebSocket tests passed!');
    } else {
      console.log('⚠️ Some WebSocket tests failed.');
    }

    await tester.cleanup();
    process.exit(passedTests === totalTests ? 0 : 1);

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    await tester.cleanup();
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run tests
runWebSocketTests();
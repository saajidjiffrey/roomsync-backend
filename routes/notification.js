const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get notifications for the current user
router.get('/', notificationController.getMyNotifications);

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark a specific notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Test endpoint to create and send a real notification
router.post('/test-create', async (req, res) => {
  try {
    console.log('Test notification endpoint called');
    console.log('User:', req.user);
    
    const Notification = require('../models/Notification');
    const socketService = require('../services/socketService');
    
    const tenantId = req.user.tenant_id;
    console.log('Tenant ID:', tenantId);
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'No tenant ID found in user data'
      });
    }
    
    // First, let's test if we can query the notifications table
    console.log('Testing notifications table...');
    const count = await Notification.count();
    console.log('Notifications table accessible, count:', count);
    
    // Create a test notification directly in the database
    console.log('Creating notification directly...');
    const notification = await Notification.create({
      message: 'This is a test notification created via API!',
      type: 'test_notification',
      recipient_id: tenantId,
      sender_id: tenantId, // Send to self for testing
      related_entity_type: 'test',
      related_entity_id: 1,
      metadata: { test: true, created_via: 'api' }
    });
    
    console.log('Notification created:', notification);
    
    // Send real-time notification
    console.log('Sending real-time notification...');
    socketService.sendNotificationToTenant(tenantId, {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      created_at: notification.created_at,
      metadata: notification.metadata
    });
    
    console.log('Test notification completed successfully');
    res.json({
      success: true,
      message: 'Test notification created and sent!',
      data: notification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;

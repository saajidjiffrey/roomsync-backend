const notificationService = require('../services/notificationService');

class NotificationController {
  /**
   * Get notifications for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMyNotifications(req, res) {
    try {
      const { limit = 20, offset = 0, unreadOnly = false } = req.query;
      const tenantId = req.user.tenant_id;

      const result = await notificationService.getNotificationsForTenant(
        tenantId,
        parseInt(limit),
        parseInt(offset),
        unreadOnly === 'true'
      );

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch notifications'
      });
    }
  }

  /**
   * Get unread notification count for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUnreadCount(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const count = await notificationService.getUnreadCount(tenantId);

      res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get unread count'
      });
    }
  }

  /**
   * Mark a notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const tenantId = req.user.tenant_id;

      const notification = await notificationService.markAsRead(
        parseInt(notificationId),
        tenantId
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark notification as read'
      });
    }
  }

  /**
   * Mark all notifications as read for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async markAllAsRead(req, res) {
    try {
      const tenantId = req.user.tenant_id;
      const updatedCount = await notificationService.markAllAsRead(tenantId);

      res.status(200).json({
        success: true,
        data: { updatedCount },
        message: `Marked ${updatedCount} notifications as read`
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark all notifications as read'
      });
    }
  }

  /**
   * Delete a notification
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const tenantId = req.user.tenant_id;

      const deleted = await notificationService.deleteNotification(
        parseInt(notificationId),
        tenantId
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete notification'
      });
    }
  }
}

const notificationController = new NotificationController();

// Bind all methods to preserve 'this' context
module.exports = {
  getMyNotifications: notificationController.getMyNotifications.bind(notificationController),
  getUnreadCount: notificationController.getUnreadCount.bind(notificationController),
  markAsRead: notificationController.markAsRead.bind(notificationController),
  markAllAsRead: notificationController.markAllAsRead.bind(notificationController),
  deleteNotification: notificationController.deleteNotification.bind(notificationController)
};

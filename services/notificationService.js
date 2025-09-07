const Notification = require('../models/Notification');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { Op } = require('sequelize');

class NotificationService {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @param {string} notificationData.message - Notification message
   * @param {string} notificationData.type - Notification type
   * @param {number} notificationData.recipient_id - ID of the tenant receiving the notification
   * @param {number} notificationData.sender_id - ID of the tenant sending the notification (optional)
   * @param {string} notificationData.related_entity_type - Type of related entity (optional)
   * @param {number} notificationData.related_entity_id - ID of related entity (optional)
   * @param {Object} notificationData.metadata - Additional metadata (optional)
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      console.log('Creating notification with data:', notificationData);
      const notification = await Notification.create(notificationData);
      console.log('Notification created successfully:', notification);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Get notification by ID with related data
   * @param {number} notificationId - Notification ID
   * @returns {Promise<Object>} Notification with related data
   */
  async getNotificationById(notificationId) {
    try {
      const notification = await Notification.findByPk(notificationId, {
        include: [
          {
            model: Tenant,
            as: 'sender',
            include: [
              {
                model: User,
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ]
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw new Error('Failed to fetch notification');
    }
  }

  /**
   * Get notifications for a specific tenant
   * @param {number} tenantId - Tenant ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of notifications to fetch
   * @param {number} options.offset - Offset for pagination
   * @param {boolean} options.unreadOnly - Fetch only unread notifications
   * @returns {Promise<Object>} Notifications with pagination info
   */
  async getNotificationsForTenant(tenantId, limit = 20, offset = 0, unreadOnly = false) {
    try {
      const whereClause = { recipient_id: tenantId };
      if (unreadOnly) {
        whereClause.is_read = false;
      }

      const { count, rows: notifications } = await Notification.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Tenant,
            as: 'sender',
            include: [
              {
                model: User,
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset
      });

      return {
        notifications,
        total: count,
        hasMore: offset + limit < count
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @param {number} tenantId - Tenant ID (for security)
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, tenantId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          recipient_id: tenantId
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.update({ is_read: true });
      return await this.getNotificationById(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read for a tenant
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<number>} Number of notifications marked as read
   */
  async markAllAsRead(tenantId) {
    try {
      const [updatedCount] = await Notification.update(
        { is_read: true },
        {
          where: {
            recipient_id: tenantId,
            is_read: false
          }
        }
      );

      return updatedCount;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Get unread notification count for a tenant
   * @param {number} tenantId - Tenant ID
   * @returns {Promise<number>} Unread notification count
   */
  async getUnreadCount(tenantId) {
    try {
      const count = await Notification.count({
        where: {
          recipient_id: tenantId,
          is_read: false
        }
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw new Error('Failed to get unread count');
    }
  }

  /**
   * Delete a specific notification
   * @param {number} notificationId - Notification ID
   * @param {number} tenantId - Tenant ID (for security)
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteNotification(notificationId, tenantId) {
    try {
      const deletedCount = await Notification.destroy({
        where: {
          id: notificationId,
          recipient_id: tenantId
        }
      });

      return deletedCount > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Delete old notifications (cleanup)
   * @param {number} daysOld - Delete notifications older than this many days
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const deletedCount = await Notification.destroy({
        where: {
          created_at: {
            [Op.lt]: cutoffDate
          },
          is_read: true
        }
      });

      return deletedCount;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      throw new Error('Failed to delete old notifications');
    }
  }

  // Notification creation helpers for specific events

  /**
   * Create expense created notification
   * @param {Object} expense - Expense object
   * @param {Object} group - Group object
   * @param {Object} creator - Creator tenant object
   * @returns {Promise<Object>} Created notification
   */
  async createExpenseCreatedNotification(expense, group, creator) {
    const message = `${creator.User.full_name} created a new expense "${expense.title}" in ${group.name}`;
    
    // Get all tenants in the group except the creator
    const groupTenants = await Tenant.findAll({
      where: {
        group_id: group.id,
        id: { [Op.ne]: creator.id }
      },
      include: [{ model: User }]
    });

    const notifications = [];
    for (const tenant of groupTenants) {
      const notification = await this.createNotification({
        message,
        type: 'expense_created',
        recipient_id: tenant.id,
        sender_id: creator.id,
        related_entity_type: 'expense',
        related_entity_id: expense.id,
        metadata: {
          expense_title: expense.title,
          expense_amount: expense.receipt_total,
          group_name: group.name
        }
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Create split paid notification
   * @param {Object} split - Split object
   * @param {Object} expense - Expense object
   * @param {Object} payer - Payer tenant object
   * @param {Object} expenseCreator - Expense creator tenant object
   * @returns {Promise<Object>} Created notification
   */
  async createSplitPaidNotification(split, expense, payer, expenseCreator) {
    const message = `${payer.User.full_name} paid their share of "${expense.title}"`;
    
    return await this.createNotification({
      message,
      type: 'split_paid',
      recipient_id: expenseCreator.id,
      sender_id: payer.id,
      related_entity_type: 'split',
      related_entity_id: split.id,
      metadata: {
        expense_title: expense.title,
        split_amount: split.split_amount,
        payer_name: payer.User.full_name
      }
    });
  }

  /**
   * Create property joined notification
   * @param {Object} tenant - Tenant object
   * @param {Object} property - Property object
   * @param {Object} owner - Owner object
   * @returns {Promise<Object>} Created notification
   */
  async createPropertyJoinedNotification(tenant, property, owner) {
    const message = `${tenant.User.full_name} joined your property "${property.name}"`;
    
    return await this.createNotification({
      message,
      type: 'property_joined',
      recipient_id: owner.id, // Assuming owner has a tenant record
      sender_id: tenant.id,
      related_entity_type: 'property',
      related_entity_id: property.id,
      metadata: {
        property_name: property.name,
        tenant_name: tenant.User.full_name
      }
    });
  }

  /**
   * Create property join request notification
   * @param {Object} joinRequest - Join request object
   * @param {Object} tenant - Tenant object
   * @param {Object} property - Property object
   * @param {Object} owner - Owner object
   * @returns {Promise<Object>} Created notification
   */
  async createPropertyJoinRequestNotification(joinRequest, tenant, property, owner) {
    const message = `${tenant.User.full_name} requested to join your property "${property.name}"`;
    
    return await this.createNotification({
      message,
      type: 'property_join_requested',
      recipient_id: owner.id, // Assuming owner has a tenant record
      sender_id: tenant.id,
      related_entity_type: 'property_join_request',
      related_entity_id: joinRequest.id,
      metadata: {
        property_name: property.name,
        tenant_name: tenant.User.full_name,
        move_in_date: joinRequest.move_in_date
      }
    });
  }

  /**
   * Create group joined notification
   * @param {Object} tenant - Tenant object
   * @param {Object} group - Group object
   * @param {Object} groupCreator - Group creator tenant object
   * @returns {Promise<Object>} Created notification
   */
  async createGroupJoinedNotification(tenant, group, groupCreator) {
    const message = `${tenant.User.full_name} joined your group "${group.name}"`;
    
    return await this.createNotification({
      message,
      type: 'group_joined',
      recipient_id: groupCreator.id,
      sender_id: tenant.id,
      related_entity_type: 'group',
      related_entity_id: group.id,
      metadata: {
        group_name: group.name,
        tenant_name: tenant.User.full_name
      }
    });
  }

  /**
   * Create task assigned notification
   * @param {Object} task - Task object
   * @param {Object} assignee - Assignee tenant object
   * @param {Object} assigner - Assigner tenant object
   * @returns {Promise<Object>} Created notification
   */
  async createTaskAssignedNotification(task, assignee, assigner) {
    const message = `${assigner.User.full_name} assigned you a task: "${task.title}"`;
    
    return await this.createNotification({
      message,
      type: 'task_assigned',
      recipient_id: assignee.id,
      sender_id: assigner.id,
      related_entity_type: 'task',
      related_entity_id: task.id,
      metadata: {
        task_title: task.title,
        task_priority: task.priority,
        due_date: task.due_date,
        assigner_name: assigner.User.full_name
      }
    });
  }

  /**
   * Create task reminder notification
   * @param {Object} task - Task object
   * @param {Object} assignee - Assignee tenant object
   * @returns {Promise<Object>} Created notification
   */
  async createTaskReminderNotification(task, assignee) {
    const message = `Reminder: Task "${task.title}" is due in 12 hours`;
    
    return await this.createNotification({
      message,
      type: 'task_reminder',
      recipient_id: assignee.id,
      related_entity_type: 'task',
      related_entity_id: task.id,
      metadata: {
        task_title: task.title,
        task_priority: task.priority,
        due_date: task.due_date
      }
    });
  }
}

module.exports = new NotificationService();

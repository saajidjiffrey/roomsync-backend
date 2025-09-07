const cron = require('node-cron');
const Task = require('../models/Task');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const notificationService = require('./notificationService');
const socketService = require('./socketService');

class TaskReminderService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Start the task reminder scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('Task reminder service is already running');
      return;
    }

    // Run every hour to check for tasks due in 12 hours
    this.task = cron.schedule('0 * * * *', async () => {
      await this.checkAndSendReminders();
    }, {
      scheduled: false
    });

    this.task.start();
    this.isRunning = true;
    console.log('Task reminder service started - checking every hour for tasks due in 12 hours');
  }

  /**
   * Stop the task reminder scheduler
   */
  stop() {
    if (this.task) {
      this.task.stop();
      this.task = null;
    }
    this.isRunning = false;
    console.log('Task reminder service stopped');
  }

  /**
   * Check for tasks due in 12 hours and send reminders
   */
  async checkAndSendReminders() {
    try {
      console.log('Checking for tasks due in 12 hours...');
      
      // Calculate the time 12 hours from now
      const now = new Date();
      const reminderTime = new Date(now.getTime() + (12 * 60 * 60 * 1000)); // 12 hours from now
      
      // Find tasks due in the next hour (to account for the hourly check)
      const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
      
      const tasks = await Task.findAll({
        where: {
          due_date: {
            [require('sequelize').Op.between]: [reminderTime, oneHourFromNow]
          },
          is_completed: false
        },
        include: [
          {
            model: Tenant,
            include: [{ model: User }]
          }
        ]
      });

      console.log(`Found ${tasks.length} tasks due in 12 hours`);

      for (const task of tasks) {
        await this.sendTaskReminder(task);
      }

    } catch (error) {
      console.error('Error in task reminder check:', error);
    }
  }

  /**
   * Send reminder for a specific task
   * @param {Object} task - Task object with assigned tenant
   */
  async sendTaskReminder(task) {
    try {
      if (!task.assignedTenant) {
        console.log(`Task ${task.id} has no assigned tenant, skipping reminder`);
        return;
      }

      // Check if we already sent a reminder for this task in the last 24 hours
      const recentReminder = await require('../models/Notification').findOne({
        where: {
          type: 'task_reminder',
          related_entity_id: task.id,
          recipient_id: task.assignedTenant.id,
          created_at: {
            [require('sequelize').Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (recentReminder) {
        console.log(`Reminder already sent for task ${task.id} in the last 24 hours`);
        return;
      }

      // Create notification
      const notification = await notificationService.createTaskReminderNotification(
        task,
        task.assignedTenant
      );

      // Send real-time notification
      socketService.sendNotificationToTenant(
        task.assignedTenant.id,
        {
          id: notification.id,
          message: notification.message,
          type: notification.type,
          created_at: notification.created_at,
          metadata: notification.metadata
        }
      );

      console.log(`Task reminder sent for task "${task.title}" to ${task.assignedTenant.tenantUser.full_name}`);

    } catch (error) {
      console.error(`Error sending task reminder for task ${task.id}:`, error);
    }
  }

  /**
   * Manually check and send reminders (for testing)
   */
  async manualCheck() {
    console.log('Manual task reminder check triggered');
    await this.checkAndSendReminders();
  }

  /**
   * Get status of the reminder service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCheck: this.task ? 'Every hour' : 'Not scheduled'
    };
  }
}

module.exports = new TaskReminderService();

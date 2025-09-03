const Task = require('../models/Task');
const Group = require('../models/Group');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const { Op } = require('sequelize');
const sequelize = require('../configs/database');

class TaskService {
  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @param {number} createdByTenantId - ID of tenant creating the task
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData, createdByTenantId) {
    try {
      // Verify that the creator belongs to the group
      const creator = await Tenant.findByPk(createdByTenantId);
      if (!creator || creator.group_id !== taskData.group_id) {
        throw new Error('You can only create tasks in your own group');
      }

      // Verify that the assigned tenant belongs to the same group
      const assignedTenant = await Tenant.findByPk(taskData.assigned_to);
      if (!assignedTenant || assignedTenant.group_id !== taskData.group_id) {
        throw new Error('Assigned tenant must belong to the same group');
      }

      const task = await Task.create({
        ...taskData,
        created_by: createdByTenantId
      });

      return await this.getTaskById(task.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get task by ID with related data
   * @param {number} taskId - Task ID
   * @returns {Promise<Object>} Task with related data
   */
  async getTaskById(taskId) {
    try {
      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'description']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          },
          {
            model: Tenant,
            as: 'createdByTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ]
      });

      if (!task) {
        throw new Error('Task not found');
      }

      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all tasks for a group
   * @param {number} groupId - Group ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasksByGroup(groupId, filters = {}) {
    try {
      const whereClause = { group_id: groupId };

      // Apply filters
      if (filters.is_completed !== undefined) {
        whereClause.is_completed = filters.is_completed;
      }

      if (filters.priority) {
        whereClause.priority = filters.priority;
      }

      if (filters.assigned_to) {
        whereClause.assigned_to = filters.assigned_to;
      }

      if (filters.created_by) {
        whereClause.created_by = filters.created_by;
      }

      // Date filters
      if (filters.due_date_from) {
        whereClause.due_date = {
          [Op.gte]: new Date(filters.due_date_from)
        };
      }

      if (filters.due_date_to) {
        whereClause.due_date = {
          ...whereClause.due_date,
          [Op.lte]: new Date(filters.due_date_to)
        };
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          },
          {
            model: Tenant,
            as: 'createdByTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ],
        order: [
          ['priority', 'DESC'],
          ['due_date', 'ASC'],
          ['created_at', 'DESC']
        ]
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get tasks assigned to a specific tenant
   * @param {number} tenantId - Tenant ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasksByTenant(tenantId, filters = {}) {
    try {
      const whereClause = { assigned_to: tenantId };

      // Apply filters
      if (filters.is_completed !== undefined) {
        whereClause.is_completed = filters.is_completed;
      }

      if (filters.priority) {
        whereClause.priority = filters.priority;
      }

      if (filters.group_id) {
        whereClause.group_id = filters.group_id;
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          },
          {
            model: Tenant,
            as: 'createdByTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ],
        order: [
          ['priority', 'DESC'],
          ['due_date', 'ASC'],
          ['created_at', 'DESC']
        ]
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get tasks created by a specific tenant
   * @param {number} tenantId - Tenant ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasksCreatedByTenant(tenantId, filters = {}) {
    try {
      const whereClause = { created_by: tenantId };

      // Apply filters
      if (filters.is_completed !== undefined) {
        whereClause.is_completed = filters.is_completed;
      }

      if (filters.priority) {
        whereClause.priority = filters.priority;
      }

      if (filters.group_id) {
        whereClause.group_id = filters.group_id;
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name']
          },
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          },
          {
            model: Tenant,
            as: 'createdByTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ],
        order: [
          ['priority', 'DESC'],
          ['due_date', 'ASC'],
          ['created_at', 'DESC']
        ]
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a task
   * @param {number} taskId - Task ID
   * @param {Object} updateData - Update data
   * @param {number} tenantId - Tenant ID (for authorization)
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, updateData, tenantId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Check if tenant can update this task (creator or assigned tenant)
      if (task.created_by !== tenantId && task.assigned_to !== tenantId) {
        throw new Error('You can only update tasks you created or are assigned to');
      }

      // If changing assignment, verify the new assignee belongs to the same group
      if (updateData.assigned_to && updateData.assigned_to !== task.assigned_to) {
        const newAssignee = await Tenant.findByPk(updateData.assigned_to);
        if (!newAssignee || newAssignee.group_id !== task.group_id) {
          throw new Error('New assignee must belong to the same group');
        }
      }

      await task.update(updateData);
      return await this.getTaskById(taskId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark task as completed/incomplete
   * @param {number} taskId - Task ID
   * @param {boolean} isCompleted - Completion status
   * @param {number} tenantId - Tenant ID (for authorization)
   * @returns {Promise<Object>} Updated task
   */
  async updateTaskStatus(taskId, isCompleted, tenantId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Only the assigned tenant can mark the task as completed
      if (task.assigned_to !== tenantId) {
        throw new Error('Only the assigned tenant can update task completion status');
      }

      await task.update({ is_completed: isCompleted });
      return await this.getTaskById(taskId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @param {number} tenantId - Tenant ID (for authorization)
   * @returns {Promise<boolean>} Success status
   */
  async deleteTask(taskId, tenantId) {
    try {
      const task = await Task.findByPk(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Only the creator can delete the task
      if (task.created_by !== tenantId) {
        throw new Error('Only the task creator can delete the task');
      }

      await task.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get task statistics for a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Task statistics
   */
  async getTaskStatistics(groupId) {
    try {
      const totalTasks = await Task.count({ where: { group_id: groupId } });
      const completedTasks = await Task.count({ 
        where: { 
          group_id: groupId, 
          is_completed: true 
        } 
      });
      const pendingTasks = totalTasks - completedTasks;

      const priorityStats = await Task.findAll({
        where: { group_id: groupId },
        attributes: [
          'priority',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['priority']
      });

      const overdueTasks = await Task.count({
        where: {
          group_id: groupId,
          is_completed: false,
          due_date: {
            [Op.lt]: new Date()
          }
        }
      });

      return {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        completion_rate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
        priority_breakdown: priorityStats.reduce((acc, stat) => {
          acc[stat.priority] = parseInt(stat.dataValues.count);
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get overdue tasks for a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} Array of overdue tasks
   */
  async getOverdueTasks(groupId) {
    try {
      const tasks = await Task.findAll({
        where: {
          group_id: groupId,
          is_completed: false,
          due_date: {
            [Op.lt]: new Date()
          }
        },
        include: [
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ],
        order: [
          ['due_date', 'ASC'],
          ['priority', 'DESC']
        ]
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get tasks due today for a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} Array of tasks due today
   */
  async getTasksDueToday(groupId) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const tasks = await Task.findAll({
        where: {
          group_id: groupId,
          is_completed: false,
          due_date: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          }
        },
        include: [
          {
            model: Tenant,
            as: 'assignedTenant',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ],
        order: [
          ['priority', 'DESC'],
          ['due_date', 'ASC']
        ]
      });

      return tasks;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TaskService();

const taskService = require('../services/taskService');
const { validationResult } = require('express-validator');

class TaskController {
  // Create a new task
  async createTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, priority, due_date, assigned_to, group_id } = req.body;
      
      const taskData = {
        title,
        description,
        priority,
        due_date,
        assigned_to,
        group_id
      };

      const task = await taskService.createTask(taskData, req.user.tenant_id);
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create task'
      });
    }
  }

  // Get a specific task by ID
  async getTaskById(req, res) {
    try {
      const { taskId } = req.params;
      
      const task = await taskService.getTaskById(taskId);
      
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Error getting task:', error);
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get task'
      });
    }
  }

  // Update a task
  async updateTask(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.params;
      const updateData = req.body;
      
      const task = await taskService.updateTask(taskId, updateData, req.user.tenant_id);
      
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      if (error.message.includes('can only update tasks')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update task'
      });
    }
  }

  // Delete a task
  async deleteTask(req, res) {
    try {
      const { taskId } = req.params;
      
      await taskService.deleteTask(taskId, req.user.tenant_id);
      
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      if (error.message.includes('Only the task creator')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete task'
      });
    }
  }

  // Update task completion status
  async updateTaskStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId } = req.params;
      const { is_completed } = req.body;
      
      const task = await taskService.updateTaskStatus(taskId, is_completed, req.user.tenant_id);
      
      res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: task
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      if (error.message === 'Task not found') {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      if (error.message.includes('Only the assigned tenant')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update task status'
      });
    }
  }

  // Get all tasks for a group
  async getTasksByGroup(req, res) {
    try {
      const { groupId } = req.params;
      const filters = req.query; // Optional filters from query parameters
      
      const tasks = await taskService.getTasksByGroup(groupId, filters);
      
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Error getting tasks by group:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get tasks'
      });
    }
  }

  // Get task statistics for a group
  async getTaskStatistics(req, res) {
    try {
      const { groupId } = req.params;
      
      const statistics = await taskService.getTaskStatistics(groupId);
      
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error getting task statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get task statistics'
      });
    }
  }

  // Get overdue tasks for a group
  async getOverdueTasks(req, res) {
    try {
      const { groupId } = req.params;
      
      const tasks = await taskService.getOverdueTasks(groupId);
      
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get overdue tasks'
      });
    }
  }

  // Get tasks due today for a group
  async getTasksDueToday(req, res) {
    try {
      const { groupId } = req.params;
      
      const tasks = await taskService.getTasksDueToday(groupId);
      
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Error getting tasks due today:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get tasks due today'
      });
    }
  }

  // Get tasks assigned to the current user
  async getMyTasks(req, res) {
    try {
      const filters = req.query; // Optional filters from query parameters
      
      const tasks = await taskService.getTasksByTenant(req.user.tenant_id, filters);
      
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Error getting my tasks:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get assigned tasks'
      });
    }
  }

  // Get tasks created by the current user
  async getTasksICreated(req, res) {
    try {
      const filters = req.query; // Optional filters from query parameters
      
      const tasks = await taskService.getTasksCreatedByTenant(req.user.tenant_id, filters);
      
      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error('Error getting tasks I created:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get created tasks'
      });
    }
  }
}

const taskController = new TaskController();

// Bind all methods to preserve 'this' context
module.exports = {
  createTask: taskController.createTask.bind(taskController),
  getTaskById: taskController.getTaskById.bind(taskController),
  updateTask: taskController.updateTask.bind(taskController),
  deleteTask: taskController.deleteTask.bind(taskController),
  updateTaskStatus: taskController.updateTaskStatus.bind(taskController),
  getTasksByGroup: taskController.getTasksByGroup.bind(taskController),
  getTaskStatistics: taskController.getTaskStatistics.bind(taskController),
  getOverdueTasks: taskController.getOverdueTasks.bind(taskController),
  getTasksDueToday: taskController.getTasksDueToday.bind(taskController),
  getMyTasks: taskController.getMyTasks.bind(taskController),
  getTasksICreated: taskController.getTasksICreated.bind(taskController)
};



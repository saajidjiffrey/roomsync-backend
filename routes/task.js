const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken, requireTenantForGroup } = require('../middleware/auth');
const {
  validateTask,
  validateTaskUpdate,
  validateTaskStatusUpdate,
  validateTaskId,
  validateGroupIdForTasks
} = require('../middleware/validation');

// Task CRUD routes
router.post('/', authenticateToken, requireTenantForGroup, validateTask, taskController.createTask);
router.get('/:taskId', authenticateToken, validateTaskId, taskController.getTaskById);
router.put('/:taskId', authenticateToken, requireTenantForGroup, validateTaskId, validateTaskUpdate, taskController.updateTask);
router.delete('/:taskId', authenticateToken, requireTenantForGroup, validateTaskId, taskController.deleteTask);

// Task status routes
router.patch('/:taskId/status', authenticateToken, requireTenantForGroup, validateTaskId, validateTaskStatusUpdate, taskController.updateTaskStatus);

// Group task routes
router.get('/group/:groupId', authenticateToken, validateGroupIdForTasks, taskController.getTasksByGroup);
router.get('/group/:groupId/statistics', authenticateToken, validateGroupIdForTasks, taskController.getTaskStatistics);
router.get('/group/:groupId/overdue', authenticateToken, validateGroupIdForTasks, taskController.getOverdueTasks);
router.get('/group/:groupId/due-today', authenticateToken, validateGroupIdForTasks, taskController.getTasksDueToday);

// Personal task routes
router.get('/my/assigned', authenticateToken, taskController.getMyTasks);
router.get('/my/created', authenticateToken, taskController.getTasksICreated);

module.exports = router;


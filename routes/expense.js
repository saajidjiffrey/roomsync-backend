const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticateToken, requireTenantForGroup } = require('../middleware/auth');
const {
  validateExpense,
  validateExpenseUpdate,
  validateExpenseId
} = require('../middleware/validation');

// Expense routes
router.post('/', authenticateToken, requireTenantForGroup, validateExpense, expenseController.createExpense);
router.get('/group/:groupId', authenticateToken, expenseController.getExpensesByGroup);
router.get('/:expenseId', authenticateToken, validateExpenseId, expenseController.getExpenseById);
router.put('/:expenseId', authenticateToken, requireTenantForGroup, validateExpenseId, validateExpenseUpdate, expenseController.updateExpense);
router.delete('/:expenseId', authenticateToken, requireTenantForGroup, validateExpenseId, expenseController.deleteExpense);

// Expense query routes
router.get('/group/:groupId/category/:category', authenticateToken, expenseController.getExpensesByCategory);
router.get('/group/:groupId/total', authenticateToken, expenseController.getTotalExpensesByGroup);

module.exports = router;

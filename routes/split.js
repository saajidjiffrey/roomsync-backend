const express = require('express');
const router = express.Router();
const splitController = require('../controllers/splitController');
const { authenticateToken, requireTenantForGroup } = require('../middleware/auth');
const {
  validateSplit,
  validateSplitUpdate,
  validateSplitStatusUpdate,
  validateSplitId,
  validateCreateSplits,
  validateExpenseId
} = require('../middleware/validation');

// Split routes
router.post('/', authenticateToken, requireTenantForGroup, validateSplit, splitController.createSplit);
router.post('/expense/:expenseId/bulk', authenticateToken, requireTenantForGroup, validateExpenseId, validateCreateSplits, splitController.createSplitsForExpense);
router.get('/expense/:expenseId', authenticateToken, validateExpenseId, splitController.getSplitsByExpense);
router.get('/tenant/to-pay', authenticateToken, splitController.getToPaySplits);
router.get('/tenant/to-receive', authenticateToken, splitController.getToReceiveSplits);
router.get('/tenant/history', authenticateToken, splitController.getSplitHistory);
router.get('/tenant/summary', authenticateToken, splitController.getSplitSummary);
router.get('/tenant/:tenantId', authenticateToken, splitController.getSplitsByTenant);
router.get('/:splitId', authenticateToken, validateSplitId, splitController.getSplitById);
router.put('/:splitId', authenticateToken, requireTenantForGroup, validateSplitId, validateSplitUpdate, splitController.updateSplit);
router.patch('/:splitId/status', authenticateToken, requireTenantForGroup, validateSplitId, validateSplitStatusUpdate, splitController.updateSplitStatus);
router.delete('/:splitId', authenticateToken, requireTenantForGroup, validateSplitId, splitController.deleteSplit);

// Split query routes
router.get('/expense/:expenseId/status/:status', authenticateToken, validateExpenseId, splitController.getSplitsByStatus);
router.get('/expense/:expenseId/status/:status/total', authenticateToken, validateExpenseId, splitController.getTotalSplitsByStatus);

module.exports = router;

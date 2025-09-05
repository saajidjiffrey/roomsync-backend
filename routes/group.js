const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken, requireTenantForGroup } = require('../middleware/auth');
const {
  validateGroup,
  validateGroupUpdate,
  validateGroupId,
  validateAddTenantToGroup
} = require('../middleware/validation');

// Group routes - specific routes first to avoid conflicts
router.post('/', authenticateToken, requireTenantForGroup, validateGroup, groupController.createGroup);
router.get('/property/:propertyId', authenticateToken, groupController.getGroupsByProperty);
router.get('/my-groups', authenticateToken, groupController.getMyGroups);
router.post('/join', authenticateToken, groupController.joinGroup);
router.delete('/:groupId/leave', authenticateToken, groupController.leaveGroup);
// General routes last
router.get('/:groupId', authenticateToken, validateGroupId, groupController.getGroupById);
router.put('/:groupId', authenticateToken, requireTenantForGroup, validateGroupId, validateGroupUpdate, groupController.updateGroup);
router.delete('/:groupId', authenticateToken, requireTenantForGroup, validateGroupId, groupController.deleteGroup);

// Group membership routes
router.post('/:groupId/tenants', authenticateToken, requireTenantForGroup, validateGroupId, validateAddTenantToGroup, groupController.addTenantToGroup);
router.delete('/:groupId/tenants/:tenantId', authenticateToken, requireTenantForGroup, validateGroupId, groupController.removeTenantFromGroup);
router.get('/:groupId/tenants', authenticateToken, validateGroupId, groupController.getGroupTenants);

module.exports = router;

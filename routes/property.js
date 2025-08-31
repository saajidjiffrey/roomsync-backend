const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticateToken, requireOwnerOrAdmin, requireTenantOrAdmin } = require('../middleware/auth');
const { validateProperty, validatePropertyId, validateJoinRequest, validateJoinRequestResponse } = require('../middleware/validation');

/**
 * @route   POST /api/property
 * @desc    Create a new property (owners only)
 * @access  Private
 */
router.post('/', authenticateToken, requireOwnerOrAdmin, validateProperty, propertyController.createProperty);

/**
 * @route   GET /api/property
 * @desc    Get all properties with optional filtering
 * @access  Public
 */
router.get('/', propertyController.getAllProperties);

/**
 * @route   GET /api/property/my
 * @desc    Get properties owned by current user
 * @access  Private
 */
router.get('/my', authenticateToken, propertyController.getMyProperties);

/**
 * @route   GET /api/property/:id
 * @desc    Get property by ID
 * @access  Public
 */
router.get('/:id', validatePropertyId, propertyController.getPropertyById);

/**
 * @route   PUT /api/property/:id
 * @desc    Update property (owner or admin only)
 * @access  Private
 */
router.put('/:id', authenticateToken, requireOwnerOrAdmin, validatePropertyId, validateProperty, propertyController.updateProperty);

/**
 * @route   DELETE /api/property/:id
 * @desc    Delete property (owner or admin only)
 * @access  Private
 */
router.delete('/:id', authenticateToken, requireOwnerOrAdmin, validatePropertyId, propertyController.deleteProperty);

// Join request routes (now for property ads)
/**
 * @route   POST /api/property/join-request
 * @desc    Create a property join request (tenant functionality)
 * @access  Private
 */
router.post('/join-request', authenticateToken, requireTenantOrAdmin, validateJoinRequest, propertyController.createJoinRequest);

/**
 * @route   GET /api/property/join-requests/my
 * @desc    Get current tenant's join requests
 * @access  Private
 */
router.get('/join-requests/my', authenticateToken, requireTenantOrAdmin, propertyController.getMyJoinRequests);

/**
 * @route   PUT /api/property/join-request/:requestId/respond
 * @desc    Respond to a join request (owner functionality)
 * @access  Private
 */
router.put('/join-request/:requestId/respond', authenticateToken, requireOwnerOrAdmin, validateJoinRequestResponse, propertyController.respondToJoinRequest);

/**
 * @route   DELETE /api/property/join-request/:requestId
 * @desc    Delete a join request
 * @access  Private
 */
router.delete('/join-request/:requestId', authenticateToken, propertyController.deleteJoinRequest);

module.exports = router;

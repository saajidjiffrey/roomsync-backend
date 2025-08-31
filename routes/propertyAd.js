const express = require('express');
const router = express.Router();
const propertyAdController = require('../controllers/propertyAdController');
const { authenticateToken, requireOwnerOrAdmin, requireTenantOrAdmin } = require('../middleware/auth');
const { validatePropertyAd, validatePropertyAdId } = require('../middleware/validation');

/**
 * @route   POST /api/property-ad
 * @desc    Create a new property ad (owners only)
 * @access  Private
 */
router.post('/', authenticateToken, requireOwnerOrAdmin, validatePropertyAd, propertyAdController.createPropertyAd);

/**
 * @route   GET /api/property-ad
 * @desc    Get all property ads with optional filtering
 * @access  Public
 */
router.get('/', propertyAdController.getAllPropertyAds);

/**
 * @route   GET /api/property-ad/my
 * @desc    Get property ads owned by current user
 * @access  Private
 */
router.get('/my', authenticateToken, requireOwnerOrAdmin, propertyAdController.getMyPropertyAds);

/**
 * @route   GET /api/property-ad/near
 * @desc    Get property ads near a location (tenant functionality)
 * @access  Public
 */
router.get('/near', propertyAdController.getPropertyAdsNearLocation);

/**
 * @route   GET /api/property-ad/:id
 * @desc    Get property ad by ID
 * @access  Public
 */
router.get('/:id', validatePropertyAdId, propertyAdController.getPropertyAdById);

/**
 * @route   PUT /api/property-ad/:id
 * @desc    Update property ad (owner or admin only)
 * @access  Private
 */
router.put('/:id', authenticateToken, requireOwnerOrAdmin, validatePropertyAdId, validatePropertyAd, propertyAdController.updatePropertyAd);

/**
 * @route   DELETE /api/property-ad/:id
 * @desc    Delete property ad (owner or admin only)
 * @access  Private
 */
router.delete('/:id', authenticateToken, requireOwnerOrAdmin, validatePropertyAdId, propertyAdController.deletePropertyAd);

module.exports = router;

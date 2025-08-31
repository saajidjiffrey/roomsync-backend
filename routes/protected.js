const express = require('express');
const router = express.Router();
const { 
  authenticateToken, 
  requireAdmin, 
  requireOwner, 
  requireTenant,
  requireOwnerOrAdmin,
  requireTenantOrAdmin 
} = require('../middleware/auth');

/**
 * @route   GET /api/protected/user
 * @desc    Get user data (any authenticated user)
 * @access  Private
 */
router.get('/user', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Access granted to user data',
    user: req.user
  });
});

/**
 * @route   GET /api/protected/admin
 * @desc    Admin only endpoint
 * @access  Private (Admin only)
 */
router.get('/admin', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    user: req.user
  });
});

/**
 * @route   GET /api/protected/owner
 * @desc    Owner only endpoint
 * @access  Private (Owner only)
 */
router.get('/owner', authenticateToken, requireOwner, (req, res) => {
  res.json({
    success: true,
    message: 'Owner access granted',
    user: req.user
  });
});

/**
 * @route   GET /api/protected/tenant
 * @desc    Tenant only endpoint
 * @access  Private (Tenant only)
 */
router.get('/tenant', authenticateToken, requireTenant, (req, res) => {
  res.json({
    success: true,
    message: 'Tenant access granted',
    user: req.user
  });
});

/**
 * @route   GET /api/protected/owner-admin
 * @desc    Owner or Admin endpoint
 * @access  Private (Owner or Admin)
 */
router.get('/owner-admin', authenticateToken, requireOwnerOrAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Owner or Admin access granted',
    user: req.user
  });
});

/**
 * @route   GET /api/protected/tenant-admin
 * @desc    Tenant or Admin endpoint
 * @access  Private (Tenant or Admin)
 */
router.get('/tenant-admin', authenticateToken, requireTenantOrAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Tenant or Admin access granted',
    user: req.user
  });
});

module.exports = router;

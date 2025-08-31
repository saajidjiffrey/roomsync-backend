const authService = require('../services/authService');

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Add user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {string|Array} roles - Required role(s)
 * @returns {Function} - Express middleware function
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to check if user is owner
 */
const requireOwner = requireRole('owner');

/**
 * Middleware to check if user is tenant
 */
const requireTenant = requireRole('tenant');

/**
 * Middleware to check if user is owner or admin
 */
const requireOwnerOrAdmin = requireRole(['owner', 'admin']);

/**
 * Middleware to check if user is tenant or admin
 */
const requireTenantOrAdmin = requireRole(['tenant', 'admin']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireOwner,
  requireTenant,
  requireOwnerOrAdmin,
  requireTenantOrAdmin
};

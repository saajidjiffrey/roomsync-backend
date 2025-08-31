/**
 * Validation middleware for authentication requests
 */

/**
 * Validate registration data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRegistration = (req, res, next) => {
  try {
    const { full_name, email, password, phone_no, occupation, role } = req.body;
    const errors = [];

    // Validate full_name
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Valid email is required');
    }

    // Validate password
    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    // Validate phone_no
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phone_no || !phoneRegex.test(phone_no)) {
      errors.push('Valid phone number is required');
    }

    // Validate role (optional, defaults to 'tenant')
    if (role && !['admin', 'owner', 'tenant'].includes(role)) {
      errors.push('Role must be admin, owner, or tenant');
    }

    // Validate occupation (optional)
    if (occupation && typeof occupation !== 'string') {
      errors.push('Occupation must be a string');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Sanitize data
    req.body.full_name = full_name.trim();
    req.body.email = email.toLowerCase().trim();
    req.body.phone_no = phone_no.trim();
    req.body.occupation = occupation ? occupation.trim() : null;
    req.body.role = role || 'tenant';

    next();
  } catch (error) {
    console.error('Registration validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Validate login data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = [];

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push('Valid email is required');
    }

    // Validate password
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Sanitize data
    req.body.email = email.toLowerCase().trim();

    next();
  } catch (error) {
    console.error('Login validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Validate password update data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePasswordUpdate = (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const errors = [];

    // Validate current password
    if (!currentPassword || typeof currentPassword !== 'string') {
      errors.push('Current password is required');
    }

    // Validate new password
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      errors.push('New password must be at least 6 characters long');
    }

    // Check if passwords are different
    if (currentPassword === newPassword) {
      errors.push('New password must be different from current password');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('Password update validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Validate token refresh data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateTokenRefresh = (req, res, next) => {
  try {
    const { token } = req.body;
    const errors = [];

    // Validate token
    if (!token || typeof token !== 'string') {
      errors.push('Token is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  } catch (error) {
    console.error('Token refresh validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Generic validation middleware factory
 * @param {Object} schema - Validation schema object
 * @returns {Function} - Express middleware function
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { body, params, query } = req;
      const errors = [];

      // Validate body
      if (schema.body) {
        for (const [field, rules] of Object.entries(schema.body)) {
          const value = body[field];
          
          if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            errors.push(`${field} is required`);
            continue;
          }

          if (value && rules.type && typeof value !== rules.type) {
            errors.push(`${field} must be a ${rules.type}`);
            continue;
          }

          if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters long`);
            continue;
          }

          if (value && rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
            continue;
          }

          if (value && rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${field} format is invalid`);
            continue;
          }

          if (value && rules.enum && !rules.enum.includes(value)) {
            errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
            continue;
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      next();
    } catch (error) {
      console.error('Generic validation error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordUpdate,
  validateTokenRefresh,
  validate
};

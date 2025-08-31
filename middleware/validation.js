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

/**
 * Validate property creation/update data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateProperty = (req, res, next) => {
  try {
    const { name, address, coordinates, description, space_available, property_image, tags } = req.body;
    const errors = [];

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      errors.push('Property name is required');
    }

    // Validate address
    if (!address || typeof address !== 'string' || address.trim().length < 1) {
      errors.push('Property address is required');
    }

    // Validate coordinates (optional)
    if (coordinates) {
      if (typeof coordinates !== 'object' || 
          typeof coordinates.latitude !== 'number' || 
          typeof coordinates.longitude !== 'number') {
        errors.push('Coordinates must be an object with latitude and longitude as numbers');
      }
    }

    // Validate space_available
    if (space_available !== undefined) {
      if (typeof space_available !== 'number' || space_available < 0) {
        errors.push('Space available must be a non-negative number');
      }
    }

    // Validate property_image (optional)
    if (property_image && typeof property_image !== 'string') {
      errors.push('Property image must be a string URL');
    }

    // Validate tags (optional)
    if (tags && !Array.isArray(tags)) {
      errors.push('Tags must be an array');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Sanitize data
    req.body.name = name ? name.trim() : name;
    req.body.address = address ? address.trim() : address;
    req.body.description = description ? description.trim() : description;
    req.body.space_available = space_available || 0;
    req.body.tags = tags || [];

    next();
  } catch (error) {
    console.error('Property validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Validate property ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePropertyId = (req, res, next) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    if (isNaN(propertyId) || propertyId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid property ID is required'
      });
    }

    req.propertyId = propertyId;
    next();
  } catch (error) {
    console.error('Property ID validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Validate join request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateJoinRequest = (req, res, next) => {
  try {
    const { property_ad_id, move_in_date } = req.body;
    const errors = [];

    // Validate property_ad_id
    if (!property_ad_id || isNaN(parseInt(property_ad_id))) {
      errors.push('Valid property ad ID is required');
    }

    // Validate move_in_date (optional but if provided, should be valid date)
    if (move_in_date) {
      const date = new Date(move_in_date);
      if (isNaN(date.getTime())) {
        errors.push('Move-in date must be a valid date');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Sanitize data
    req.body.property_ad_id = parseInt(property_ad_id);
    req.body.move_in_date = move_in_date ? new Date(move_in_date) : null;

    next();
  } catch (error) {
    console.error('Join request validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Validate property ad data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePropertyAd = (req, res, next) => {
  try {
    const { property_id, number_of_spaces_looking_for, is_active } = req.body;
    const errors = [];

    // Validate property_id
    if (!property_id || isNaN(parseInt(property_id))) {
      errors.push('Valid property ID is required');
    }

    // Validate number_of_spaces_looking_for
    if (!number_of_spaces_looking_for || isNaN(parseInt(number_of_spaces_looking_for)) || parseInt(number_of_spaces_looking_for) < 1) {
      errors.push('Number of spaces looking for must be a positive number');
    }

    // Validate is_active (optional, defaults to true)
    if (is_active !== undefined && typeof is_active !== 'boolean') {
      errors.push('is_active must be a boolean value');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Sanitize data
    req.body.property_id = parseInt(property_id);
    req.body.number_of_spaces_looking_for = parseInt(number_of_spaces_looking_for);
    req.body.is_active = is_active !== undefined ? is_active : true;

    next();
  } catch (error) {
    console.error('Property ad validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Validate property ad ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePropertyAdId = (req, res, next) => {
  try {
    const adId = parseInt(req.params.id);
    
    if (isNaN(adId) || adId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid property ad ID is required'
      });
    }

    req.adId = adId;
    next();
  } catch (error) {
    console.error('Property ad ID validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

/**
 * Validate join request response data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateJoinRequestResponse = (req, res, next) => {
  try {
    const { status } = req.body;
    const errors = [];

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      errors.push('Status must be approved or rejected');
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
    console.error('Join request response validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Validation error'
    });
  }
};

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordUpdate,
  validateTokenRefresh,
  validateProperty,
  validatePropertyId,
  validatePropertyAd,
  validatePropertyAdId,
  validateJoinRequest,
  validateJoinRequestResponse,
  validate
};

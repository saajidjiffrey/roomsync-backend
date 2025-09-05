/**
 * Validation middleware for authentication requests
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

/**
 * Registration validation rules
 */
const validateRegistration = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone_no')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Valid phone number is required'),
  body('role')
    .optional()
    .isIn(['admin', 'owner', 'tenant'])
    .withMessage('Role must be admin, owner, or tenant'),
  body('occupation')
    .optional()
    .isString()
    .trim()
    .withMessage('Occupation must be a string'),
  handleValidationErrors
];

/**
 * Login validation rules
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Password update validation rules
 */
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  handleValidationErrors
];

/**
 * Token refresh validation rules
 */
const validateTokenRefresh = [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
  handleValidationErrors
];

/**
 * Property validation rules
 */
const validateProperty = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Property name is required and must be between 1 and 255 characters'),
  body('address')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Property address is required'),
  body('coordinates')
    .optional()
    .isObject()
    .withMessage('Coordinates must be an object')
    .custom((value) => {
      if (value && (typeof value.latitude !== 'number' || typeof value.longitude !== 'number')) {
        throw new Error('Coordinates must have latitude and longitude as numbers');
      }
      return true;
    }),
  body('description')
    .optional()
    .isString()
    .trim()
    .withMessage('Description must be a string'),
  body('space_available')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Space available must be a non-negative integer'),
  body('property_image')
    .optional()
    .isString()
    .withMessage('Property image must be a string'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  handleValidationErrors
];

/**
 * Property ID validation rules
 */
const validatePropertyId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid property ID is required'),
  handleValidationErrors
];

/**
 * Join request validation rules
 */
const validateJoinRequest = [
  body('property_ad_id')
    .isInt({ min: 1 })
    .withMessage('Valid property ad ID is required'),
  body('move_in_date')
    .optional()
    .isISO8601()
    .withMessage('Move-in date must be a valid date'),
  handleValidationErrors
];

/**
 * Property ad validation rules
 */
const validatePropertyAd = [
  body('property_id')
    .isInt({ min: 1 })
    .withMessage('Valid property ID is required'),
  body('number_of_spaces_looking_for')
    .isInt({ min: 1 })
    .withMessage('Number of spaces looking for must be a positive integer'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  handleValidationErrors
];

/**
 * Property ad ID validation rules
 */
const validatePropertyAdId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid property ad ID is required'),
  handleValidationErrors
];

/**
 * Join request response validation rules
 */
const validateJoinRequestResponse = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
  handleValidationErrors
];

/**
 * Group validation rules
 */
const validateGroup = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Group name is required and must be between 1 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Group description is required'),
  body('group_image_url')
    .optional()
    .isString()
    .withMessage('Group image URL must be a string'),
  body('property_id')
    .isInt({ min: 1 })
    .withMessage('Valid property ID is required'),
  handleValidationErrors
];

/**
 * Group update validation rules
 */
const validateGroupUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Group name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Group description cannot be empty'),
  body('group_image_url')
    .optional()
    .isString()
    .withMessage('Group image URL must be a string'),
  handleValidationErrors
];

/**
 * Group ID validation rules
 */
const validateGroupId = [
  param('groupId')
    .isInt({ min: 1 })
    .withMessage('Valid group ID is required'),
  handleValidationErrors
];

/**
 * Add tenant to group validation rules
 */
const validateAddTenantToGroup = [
  body('tenant_id')
    .isInt({ min: 1 })
    .withMessage('Valid tenant ID is required'),
  handleValidationErrors
];

/**
 * Expense validation rules
 */
const validateExpense = [
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category is required and must be between 1 and 100 characters'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty if provided'),
  body('receipt_total')
    .isFloat({ min: 0.01 })
    .withMessage('Receipt total must be a positive number'),
  body('group_id')
    .isInt({ min: 1 })
    .withMessage('Valid group ID is required'),
  handleValidationErrors
];

/**
 * Expense update validation rules
 */
const validateExpenseUpdate = [
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty if provided'),
  body('receipt_total')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Receipt total must be a positive number'),
  handleValidationErrors
];

/**
 * Expense ID validation rules
 */
const validateExpenseId = [
  param('expenseId')
    .isInt({ min: 1 })
    .withMessage('Valid expense ID is required'),
  handleValidationErrors
];

/**
 * Split validation rules
 */
const validateSplit = [
  body('status')
    .isIn(['unpaid', 'pending', 'paid'])
    .withMessage('Status must be unpaid, pending, or paid'),
  body('split_amount')
    .isFloat({ min: 0.01 })
    .withMessage('Split amount must be a positive number'),
  body('assigned_to')
    .isInt({ min: 1 })
    .withMessage('Valid tenant ID is required'),
  body('expense_id')
    .isInt({ min: 1 })
    .withMessage('Valid expense ID is required'),
  handleValidationErrors
];

/**
 * Split update validation rules
 */
const validateSplitUpdate = [
  body('status')
    .optional()
    .isIn(['unpaid', 'pending', 'paid'])
    .withMessage('Status must be unpaid, pending, or paid'),
  body('split_amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Split amount must be a positive number'),
  body('assigned_to')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid tenant ID is required'),
  handleValidationErrors
];

/**
 * Split status update validation rules
 */
const validateSplitStatusUpdate = [
  body('status')
    .isIn(['unpaid', 'pending', 'paid'])
    .withMessage('Status must be unpaid, pending, or paid'),
  body('paid_date')
    .optional()
    .isISO8601()
    .withMessage('Paid date must be a valid date'),
  handleValidationErrors
];

/**
 * Split ID validation rules
 */
const validateSplitId = [
  param('splitId')
    .isInt({ min: 1 })
    .withMessage('Valid split ID is required'),
  handleValidationErrors
];

/**
 * Create multiple splits validation rules
 */
const validateCreateSplits = [
  body('splits')
    .isArray({ min: 1 })
    .withMessage('Splits must be a non-empty array'),
  body('splits.*.status')
    .isIn(['unpaid', 'pending', 'paid'])
    .withMessage('Status must be unpaid, pending, or paid'),
  body('splits.*.split_amount')
    .isFloat({ min: 0.01 })
    .withMessage('Split amount must be a positive number'),
  body('splits.*.assigned_to')
    .isInt({ min: 1 })
    .withMessage('Valid tenant ID is required'),
  handleValidationErrors
];

/**
 * Task validation rules
 */
const validateTask = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Task title is required and must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty if provided'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assigned_to')
    .isInt({ min: 1 })
    .withMessage('Valid tenant ID is required'),
  body('group_id')
    .isInt({ min: 1 })
    .withMessage('Valid group ID is required'),
  handleValidationErrors
];

/**
 * Task update validation rules
 */
const validateTaskUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Task title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty if provided'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assigned_to')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid tenant ID is required'),
  handleValidationErrors
];

/**
 * Task status update validation rules
 */
const validateTaskStatusUpdate = [
  body('is_completed')
    .isBoolean()
    .withMessage('is_completed must be a boolean value'),
  handleValidationErrors
];

/**
 * Task ID validation rules
 */
const validateTaskId = [
  param('taskId')
    .isInt({ min: 1 })
    .withMessage('Valid task ID is required'),
  handleValidationErrors
];

/**
 * Group ID for tasks validation rules
 */
const validateGroupIdForTasks = [
  param('groupId')
    .isInt({ min: 1 })
    .withMessage('Valid group ID is required'),
  handleValidationErrors
];

// Legacy validation functions (keeping for backward compatibility)
const validateRegistrationLegacy = (req, res, next) => {
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

const validateLoginLegacy = (req, res, next) => {
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

const validatePasswordUpdateLegacy = (req, res, next) => {
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

const validateTokenRefreshLegacy = (req, res, next) => {
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

const validatePropertyLegacy = (req, res, next) => {
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

const validatePropertyIdLegacy = (req, res, next) => {
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

const validateJoinRequestLegacy = (req, res, next) => {
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

const validatePropertyAdLegacy = (req, res, next) => {
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

const validatePropertyAdIdLegacy = (req, res, next) => {
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

const validateJoinRequestResponseLegacy = (req, res, next) => {
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
  // New express-validator based validations
  validateRegistration,
  validateLogin,
  validatePasswordUpdate,
  validateTokenRefresh,
  validateProperty,
  validatePropertyId,
  validateJoinRequest,
  validateJoinRequestResponse,
  validatePropertyAd,
  validatePropertyAdId,
  validateGroup,
  validateGroupUpdate,
  validateGroupId,
  validateAddTenantToGroup,
  validateExpense,
  validateExpenseUpdate,
  validateExpenseId,
  validateSplit,
  validateSplitUpdate,
  validateSplitStatusUpdate,
  validateSplitId,
  validateCreateSplits,
  validateTask,
  validateTaskUpdate,
  validateTaskStatusUpdate,
  validateTaskId,
  validateGroupIdForTasks,
  handleValidationErrors,
  
  // Legacy validations (for backward compatibility)
  validateRegistrationLegacy,
  validateLoginLegacy,
  validatePasswordUpdateLegacy,
  validateTokenRefreshLegacy,
  validatePropertyLegacy,
  validatePropertyIdLegacy,
  validateJoinRequestLegacy,
  validateJoinRequestResponseLegacy,
  validatePropertyAdLegacy,
  validatePropertyAdIdLegacy,
  validate
};

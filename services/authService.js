const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Owner = require('../models/Owner');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - Created user and token
   */
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          email: userData.email
        }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = await User.create(userData);
      
      // Create corresponding Tenant or Owner record based on role
      if (user.role === 'tenant') {
        await Tenant.create({
          user_id: user.id
        });
      } else if (user.role === 'owner') {
        await Owner.create({
          user_id: user.id
        });
      }
      // Note: 'admin' role doesn't need a separate record
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - User data and token
   */
  async login(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Object} - User object with profile data
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let userData = user.toJSON();

      // Include Tenant or Owner profile data based on role
      if (user.role === 'tenant') {
        const tenant = await Tenant.findOne({
          where: { user_id: userId }
        });
        if (tenant) {
          userData.tenant_profile = tenant;
        }
      } else if (user.role === 'owner') {
        const owner = await Owner.findOne({
          where: { user_id: userId }
        });
        if (owner) {
          userData.owner_profile = owner;
        }
      }

      return userData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} - Updated user
   */
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh token
   * @param {string} token - Current JWT token
   * @returns {Object} - New token and user data
   */
  async refreshToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await this.getUserById(decoded.id);
      const newToken = this.generateToken(user);
      
      return {
        user,
        token: newToken
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();

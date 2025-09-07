const jwt = require('jsonwebtoken');
const Tenant = require('../models/Tenant');
const User = require('../models/User');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // Map to store user_id -> socket_id
    this.initialized = false; // Flag to prevent multiple initializations
  }

  /**
   * Initialize Socket.IO
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    // Always clean up existing instance first
    if (this.io) {
      console.log('Cleaning up existing Socket.IO instance...');
      this.io.close();
      this.io = null;
      this.initialized = false;
    }

    const { Server } = require('socket.io');
    
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || "http://localhost:5173",
          "http://localhost:8100",
          "http://localhost:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true
      },
      allowEIO3: true, // Allow Engine.IO v3 clients
      transports: ['polling', 'websocket'],
      pingTimeout: 60000, // Increase ping timeout
      pingInterval: 25000, // Increase ping interval
      connectTimeout: 45000 // Increase connection timeout
    });

    this.initialized = true;
    this.setupMiddleware();
    this.setupEventHandlers();
    
    console.log('Socket.IO initialized');
  }

  /**
   * Clean up Socket.IO server
   */
  cleanup() {
    if (this.io) {
      console.log('Cleaning up Socket.IO server...');
      this.io.close();
      this.io = null;
      this.initialized = false;
      this.userSockets.clear();
    }
  }

  /**
   * Setup Socket.IO middleware for authentication
   */
  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        console.log('Socket connection attempt from:', socket.handshake.address);
        console.log('Socket handshake auth:', socket.handshake.auth);
        console.log('Socket handshake headers:', socket.handshake.headers);
        
        // Get token from auth or headers
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
        
        if (!token) {
          console.log('No token provided for socket connection');
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user and tenant information
        const tenant = await Tenant.findByPk(decoded.tenant_id, {
          include: [{ model: User }]
        });

        if (!tenant) {
          console.log('Tenant not found for socket connection');
          return next(new Error('Tenant not found'));
        }

        // Set socket user information
        socket.userId = tenant.user_id;
        socket.tenantId = tenant.id;
        socket.userInfo = {
          id: tenant.user_id,
          tenantId: tenant.id,
          fullName: tenant.User.full_name,
          role: tenant.User.role
        };

        console.log(`Socket connection authenticated for user: ${tenant.User.full_name} (Tenant ID: ${tenant.id})`);
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userInfo.fullName} (ID: ${socket.userId}) connected`);
      
      // Store socket connection for user
      this.userSockets.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);
      socket.join(`tenant_${socket.tenantId}`);

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userInfo.fullName} (ID: ${socket.userId}) disconnected`);
        this.userSockets.delete(socket.userId);
      });

      // Handle join room (for group notifications)
      socket.on('join_room', (roomId) => {
        socket.join(`group_${roomId}`);
        console.log(`User ${socket.userInfo.fullName} joined group room: ${roomId}`);
      });

      // Handle leave room
      socket.on('leave_room', (roomId) => {
        socket.leave(`group_${roomId}`);
        console.log(`User ${socket.userInfo.fullName} left group room: ${roomId}`);
      });
    });

    // Add error handling
    this.io.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    // Add connection attempt logging
    this.io.engine.on('connection_error', (err) => {
      console.error('Socket.IO engine connection error:', err);
    });
  }

  /**
   * Send notification to a specific user
   * @param {number} userId - User ID
   * @param {Object} notification - Notification data
   */
  sendNotificationToUser(userId, notification) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit('notification', notification);
      console.log(`Notification sent to user ${userId}:`, notification.message);
    }
  }

  /**
   * Send notification to a specific tenant
   * @param {number} tenantId - Tenant ID
   * @param {Object} notification - Notification data
   */
  sendNotificationToTenant(tenantId, notification) {
    if (this.io) {
      this.io.to(`tenant_${tenantId}`).emit('notification', notification);
      console.log(`Notification sent to tenant ${tenantId}:`, notification.message);
    }
  }

  /**
   * Send notification to all users in a group
   * @param {number} groupId - Group ID
   * @param {Object} notification - Notification data
   */
  sendNotificationToGroup(groupId, notification) {
    if (this.io) {
      this.io.to(`group_${groupId}`).emit('group_notification', notification);
      console.log(`Group notification sent to group ${groupId}:`, notification.message);
    }
  }

  /**
   * Send notification to multiple users
   * @param {Array<number>} userIds - Array of user IDs
   * @param {Object} notification - Notification data
   */
  sendNotificationToUsers(userIds, notification) {
    if (this.io) {
      userIds.forEach(userId => {
        this.io.to(`user_${userId}`).emit('notification', notification);
      });
      console.log(`Notification sent to ${userIds.length} users:`, notification.message);
    }
  }

  /**
   * Send notification to multiple tenants
   * @param {Array<number>} tenantIds - Array of tenant IDs
   * @param {Object} notification - Notification data
   */
  sendNotificationToTenants(tenantIds, notification) {
    if (this.io) {
      tenantIds.forEach(tenantId => {
        this.io.to(`tenant_${tenantId}`).emit('notification', notification);
      });
      console.log(`Notification sent to ${tenantIds.length} tenants:`, notification.message);
    }
  }

  /**
   * Broadcast notification to all connected users
   * @param {Object} notification - Notification data
   */
  broadcastNotification(notification) {
    if (this.io) {
      this.io.emit('broadcast_notification', notification);
      console.log('Broadcast notification sent:', notification.message);
    }
  }

  /**
   * Get connected users count
   * @returns {number} Number of connected users
   */
  getConnectedUsersCount() {
    return this.io ? this.io.engine.clientsCount : 0;
  }

  /**
   * Get connected users info
   * @returns {Array} Array of connected user info
   */
  getConnectedUsers() {
    const users = [];
    if (this.io) {
      this.io.sockets.sockets.forEach((socket) => {
        if (socket.userInfo) {
          users.push(socket.userInfo);
        }
      });
    }
    return users;
  }
}

module.exports = new SocketService();

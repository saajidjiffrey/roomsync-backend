const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM(
      'expense_created',
      'split_paid',
      'property_joined',
      'property_join_requested',
      'group_joined',
      'task_assigned',
      'task_reminder',
      'test_notification'
    ),
    allowNull: false,
    validate: {
      isIn: [['expense_created', 'split_paid', 'property_joined', 'property_join_requested', 'group_joined', 'task_assigned', 'task_reminder', 'test_notification']]
    }
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tenants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // Related entity IDs for context
  related_entity_type: {
    type: DataTypes.ENUM('expense', 'split', 'property', 'property_join_request', 'group', 'task', 'test'),
    allowNull: true
  },
  related_entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  // Additional metadata as JSON
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['recipient_id']
    },
    {
      fields: ['is_read']
    },
    {
      fields: ['type']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Static method to define associations
Notification.associate = function(models) {
  // Notification associations
  Notification.belongsTo(models.Tenant, { foreignKey: 'recipient_id', as: 'recipient' });
  Notification.belongsTo(models.Tenant, { foreignKey: 'sender_id', as: 'sender' });
};

module.exports = Notification;

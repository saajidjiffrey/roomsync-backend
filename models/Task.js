const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Task = sequelize.define('Task', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: [['low', 'medium', 'high']]
      }
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'tenants', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'tenants', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'groups', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['group_id']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['is_completed']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['due_date']
      }
    ]
  });

// Static method to define associations
Task.associate = function(models) {
  // Task associations
  Task.belongsTo(models.Group, { foreignKey: 'group_id' });
  Task.belongsTo(models.Tenant, { foreignKey: 'assigned_to', as: 'assignedTenant' });
  Task.belongsTo(models.Tenant, { foreignKey: 'created_by', as: 'createdByTenant' });
};

module.exports = Task;

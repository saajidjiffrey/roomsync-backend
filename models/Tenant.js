const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'properties',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'groups',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'tenants',
  timestamps: true
});

// Static method to define associations
Tenant.associate = function(models) {
  // Tenant associations
  Tenant.belongsTo(models.User, { foreignKey: 'user_id', as: 'tenantUser' });
  Tenant.belongsTo(models.Property, { foreignKey: 'property_id', as: 'tenantProperty' });
  Tenant.belongsTo(models.Group, { foreignKey: 'group_id', as: 'tenantGroup' });
  Tenant.hasMany(models.PropertyJoinRequest, { foreignKey: 'tenant_id', as: 'joinRequests' });
  Tenant.hasMany(models.Expense, { foreignKey: 'created_by', as: 'createdExpenses' });
  Tenant.hasMany(models.Split, { foreignKey: 'assigned_to', as: 'assignedSplits' });
  Tenant.hasMany(models.Split, { foreignKey: 'assigned_by', as: 'createdSplits' });
  Tenant.hasMany(models.Task, { foreignKey: 'assigned_to', as: 'assignedTasks' });
  Tenant.hasMany(models.Task, { foreignKey: 'created_by', as: 'createdTasks' });
};

module.exports = Tenant;

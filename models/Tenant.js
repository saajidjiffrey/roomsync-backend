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
  }
}, {
  tableName: 'tenants',
  timestamps: true
});

// Static method to define associations
Tenant.associate = function(models) {
  // Tenant associations
  Tenant.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Tenant.hasMany(models.PropertyJoinRequest, { foreignKey: 'tenant_id', as: 'propertyRequests' });
};

module.exports = Tenant;

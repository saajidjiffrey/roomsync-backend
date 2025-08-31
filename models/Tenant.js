const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');
const User = require('./User');

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

// Define association with User model
Tenant.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Tenant, { foreignKey: 'user_id', as: 'tenant' });

module.exports = Tenant;

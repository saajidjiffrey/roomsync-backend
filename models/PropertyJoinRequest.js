const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');
const Property = require('./Property');
const Tenant = require('./Tenant');

const PropertyJoinRequest = sequelize.define('PropertyJoinRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_ad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'property_ads',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  move_in_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'property_join_requests',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['property_ad_id', 'tenant_id']
    }
  ]
});

// Define associations
PropertyJoinRequest.belongsTo(PropertyAd, { foreignKey: 'property_ad_id', as: 'propertyAd' });
PropertyJoinRequest.belongsTo(Tenant, { foreignKey: 'tenant_id', as: 'tenant' });

PropertyAd.hasMany(PropertyJoinRequest, { foreignKey: 'property_ad_id', as: 'joinRequests' });
Tenant.hasMany(PropertyJoinRequest, { foreignKey: 'tenant_id', as: 'propertyRequests' });

module.exports = PropertyJoinRequest;

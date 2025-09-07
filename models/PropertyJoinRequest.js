const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

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

// Static method to define associations
PropertyJoinRequest.associate = function(models) {
  // PropertyJoinRequest associations
  PropertyJoinRequest.belongsTo(models.PropertyAd, { foreignKey: 'property_ad_id' });
  PropertyJoinRequest.belongsTo(models.Tenant, { foreignKey: 'tenant_id' });
};

module.exports = PropertyJoinRequest;

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const PropertyAd = sequelize.define('PropertyAd', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  property_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  number_of_spaces_looking_for: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'property_ads',
  timestamps: true,
  hooks: {
    beforeCreate: async (propertyAd) => {
      // Validate that number_of_spaces_looking_for is less than property's space_available
      const Property = require('./Property');
      const property = await Property.findByPk(propertyAd.property_id);
      if (property && propertyAd.number_of_spaces_looking_for > property.space_available) {
        throw new Error('Number of spaces looking for cannot exceed available space in property');
      }
    },
    beforeUpdate: async (propertyAd) => {
      if (propertyAd.changed('number_of_spaces_looking_for')) {
        const Property = require('./Property');
        const property = await Property.findByPk(propertyAd.property_id);
        if (property && propertyAd.number_of_spaces_looking_for > property.space_available) {
          throw new Error('Number of spaces looking for cannot exceed available space in property');
        }
      }
    }
  }
});

// Static method to define associations
PropertyAd.associate = function(models) {
  // PropertyAd associations
  PropertyAd.belongsTo(models.Property, { foreignKey: 'property_id' });
  PropertyAd.hasMany(models.PropertyJoinRequest, { foreignKey: 'property_ad_id' });
};

module.exports = PropertyAd;

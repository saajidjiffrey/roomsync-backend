const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');
const Owner = require('./Owner');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  coordinates: {
    type: DataTypes.JSON,
    allowNull: true,
    validate: {
      isValidCoordinates(value) {
        if (value && (typeof value.latitude !== 'number' || typeof value.longitude !== 'number')) {
          throw new Error('Coordinates must have latitude and longitude as numbers');
        }
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  space_available: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  property_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (value && !Array.isArray(value)) {
          throw new Error('Tags must be an array');
        }
      }
    }
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'owners',
      key: 'id'
    }
  }
}, {
  tableName: 'properties',
  timestamps: true
});

// Define association with Owner model
Property.belongsTo(Owner, { foreignKey: 'owner_id', as: 'owner' });
Owner.hasMany(Property, { foreignKey: 'owner_id', as: 'properties' });

module.exports = Property;

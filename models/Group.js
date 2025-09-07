const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Group = sequelize.define('Group', {
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
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  group_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
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
  }
}, {
  tableName: 'groups',
  timestamps: true
});

// Static method to define associations
Group.associate = function(models) {
  // Group associations
  Group.belongsTo(models.Property, { foreignKey: 'property_id' });
  Group.hasMany(models.Expense, { foreignKey: 'group_id' });
  Group.hasMany(models.Tenant, { foreignKey: 'group_id' });
  Group.hasMany(models.Task, { foreignKey: 'group_id' });
};

module.exports = Group;

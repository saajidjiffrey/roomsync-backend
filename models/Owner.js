const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Owner = sequelize.define('Owner', {
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
  tableName: 'owners',
  timestamps: true
});

// Static method to define associations
Owner.associate = function(models) {
  // Owner associations
  Owner.belongsTo(models.User, { foreignKey: 'user_id', as: 'ownerUser' });
  Owner.hasMany(models.Property, { foreignKey: 'owner_id' });
};

module.exports = Owner;

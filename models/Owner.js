const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');
const User = require('./User');

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

// Define association with User model
Owner.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(Owner, { foreignKey: 'user_id', as: 'owner' });

module.exports = Owner;

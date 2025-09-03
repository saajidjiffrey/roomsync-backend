const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receipt_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'expenses',
  timestamps: true
});

// Static method to define associations
Expense.associate = function(models) {
  // Expense associations
  Expense.belongsTo(models.Group, { foreignKey: 'group_id', as: 'group' });
  Expense.belongsTo(models.Tenant, { foreignKey: 'created_by', as: 'creator' });
  Expense.hasMany(models.Split, { foreignKey: 'expense_id', as: 'splits' });
};

module.exports = Expense;


const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Split = sequelize.define('Split', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('unpaid', 'pending', 'paid'),
    allowNull: false,
    defaultValue: 'unpaid'
  },
  split_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  paid_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expense_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'expenses',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'splits',
  timestamps: true
});

// Static method to define associations
Split.associate = function(models) {
  // Split associations
  Split.belongsTo(models.Expense, { foreignKey: 'expense_id', as: 'expense' });
  Split.belongsTo(models.Tenant, { foreignKey: 'assigned_to', as: 'assignedTenant' });
};

module.exports = Split;


'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('splits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.ENUM('unpaid', 'pending', 'paid'),
        allowNull: false,
        defaultValue: 'unpaid'
      },
      split_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      assigned_to: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      paid_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expense_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'expenses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('splits', ['expense_id']);
    await queryInterface.addIndex('splits', ['assigned_to']);
    await queryInterface.addIndex('splits', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('splits');
  }
};


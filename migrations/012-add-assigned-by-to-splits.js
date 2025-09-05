'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('splits', 'assigned_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { 
        model: 'tenants', 
        key: 'id' 
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    await queryInterface.addIndex('splits', ['assigned_by']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('splits', 'assigned_by');
  }
};

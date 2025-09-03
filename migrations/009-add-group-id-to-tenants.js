'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tenants', 'group_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add index for the new foreign key
    await queryInterface.addIndex('tenants', ['group_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('tenants', ['group_id']);
    await queryInterface.removeColumn('tenants', 'group_id');
  }
};


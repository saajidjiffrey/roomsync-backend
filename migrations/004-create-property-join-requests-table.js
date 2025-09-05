/**
 * Migration: Create property join requests table
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_join_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      property_ad_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'property_ads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      move_in_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('property_join_requests', ['property_ad_id']);
    await queryInterface.addIndex('property_join_requests', ['tenant_id']);
    await queryInterface.addIndex('property_join_requests', ['status']);
    await queryInterface.addIndex('property_join_requests', ['created_at']);
    
    // Add unique constraint to prevent duplicate requests
    await queryInterface.addIndex('property_join_requests', ['property_ad_id', 'tenant_id'], {
      unique: true,
      name: 'unique_property_ad_tenant_request'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_join_requests');
  }
};

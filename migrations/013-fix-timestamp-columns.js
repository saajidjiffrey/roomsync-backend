/**
 * Migration: Fix timestamp column names from camelCase to snake_case
 * This migration renames existing timestamp columns to match the updated schema
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if createdAt column exists and rename it to created_at
      const [createdAtExists] = await queryInterface.sequelize.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'roomsync_db' AND TABLE_NAME = 'owners' AND COLUMN_NAME = 'createdAt'"
      );
      
      if (createdAtExists.length > 0) {
        await queryInterface.renameColumn('owners', 'createdAt', 'created_at');
        await queryInterface.renameColumn('owners', 'updatedAt', 'updated_at');
        console.log('Renamed timestamp columns in owners table');
      }

      // Check and fix tenants table
      const [tenantsCreatedAtExists] = await queryInterface.sequelize.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'roomsync_db' AND TABLE_NAME = 'tenants' AND COLUMN_NAME = 'createdAt'"
      );
      
      if (tenantsCreatedAtExists.length > 0) {
        await queryInterface.renameColumn('tenants', 'createdAt', 'created_at');
        await queryInterface.renameColumn('tenants', 'updatedAt', 'updated_at');
        console.log('Renamed timestamp columns in tenants table');
      }

      // Check and fix properties table
      const [propertiesCreatedAtExists] = await queryInterface.sequelize.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'roomsync_db' AND TABLE_NAME = 'properties' AND COLUMN_NAME = 'createdAt'"
      );
      
      if (propertiesCreatedAtExists.length > 0) {
        await queryInterface.renameColumn('properties', 'createdAt', 'created_at');
        await queryInterface.renameColumn('properties', 'updatedAt', 'updated_at');
        console.log('Renamed timestamp columns in properties table');
      }

      // Check and fix property_join_requests table
      const [joinRequestsCreatedAtExists] = await queryInterface.sequelize.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'roomsync_db' AND TABLE_NAME = 'property_join_requests' AND COLUMN_NAME = 'createdAt'"
      );
      
      if (joinRequestsCreatedAtExists.length > 0) {
        await queryInterface.renameColumn('property_join_requests', 'createdAt', 'created_at');
        await queryInterface.renameColumn('property_join_requests', 'updatedAt', 'updated_at');
        console.log('Renamed timestamp columns in property_join_requests table');
      }

      // Check and fix property_ads table
      const [propertyAdsCreatedAtExists] = await queryInterface.sequelize.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'roomsync_db' AND TABLE_NAME = 'property_ads' AND COLUMN_NAME = 'createdAt'"
      );
      
      if (propertyAdsCreatedAtExists.length > 0) {
        await queryInterface.renameColumn('property_ads', 'createdAt', 'created_at');
        await queryInterface.renameColumn('property_ads', 'updatedAt', 'updated_at');
        console.log('Renamed timestamp columns in property_ads table');
      }

    } catch (error) {
      console.error('Error in timestamp column migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Reverse the changes - rename back to camelCase
      await queryInterface.renameColumn('owners', 'created_at', 'createdAt');
      await queryInterface.renameColumn('owners', 'updated_at', 'updatedAt');
      
      await queryInterface.renameColumn('tenants', 'created_at', 'createdAt');
      await queryInterface.renameColumn('tenants', 'updated_at', 'updatedAt');
      
      await queryInterface.renameColumn('properties', 'created_at', 'createdAt');
      await queryInterface.renameColumn('properties', 'updated_at', 'updatedAt');
      
      await queryInterface.renameColumn('property_join_requests', 'created_at', 'createdAt');
      await queryInterface.renameColumn('property_join_requests', 'updated_at', 'updatedAt');
      
      await queryInterface.renameColumn('property_ads', 'created_at', 'createdAt');
      await queryInterface.renameColumn('property_ads', 'updated_at', 'updatedAt');
      
      console.log('Reverted timestamp column names to camelCase');
    } catch (error) {
      console.error('Error reverting timestamp column migration:', error);
      throw error;
    }
  }
};

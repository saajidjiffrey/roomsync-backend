const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Create Sequelize instance for migrations
const sequelize = new Sequelize(
  process.env.DB_NAME || 'roomsync_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// Import migration
const createUsersTable = require('../migrations/001-create-users-table');

async function runMigrations() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Run migration
    console.log('Running migration: Create users table...');
    await createUsersTable.up(sequelize.getQueryInterface(), Sequelize);
    console.log('Migration completed successfully!');

    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Create Sequelize instance for migrations (same as database.js)
let sequelize;

// Check if DATABASE_URL is provided (Railway style)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false
  });
} else {
  // Fallback to individual parameters
  sequelize = new Sequelize(
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
}

// Import all migrations
const createUsersTable = require('../migrations/001-create-users-table');
const createOwnersTable = require('../migrations/002-create-owners-table');
const createPropertiesTable = require('../migrations/002-create-properties-table');
const createTenantsTable = require('../migrations/003-create-tenants-table');
const createPropertyJoinRequestsTable = require('../migrations/004-create-property-join-requests-table');
const createPropertyAdsTable = require('../migrations/005-create-property-ads-table');

async function runMigrations() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Run all migrations in order
    console.log('Running migrations...');
    
    console.log('Running migration: Create users table...');
    await createUsersTable.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('Running migration: Create owners table...');
    await createOwnersTable.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('Running migration: Create properties table...');
    await createPropertiesTable.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('Running migration: Create tenants table...');
    await createTenantsTable.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('Running migration: Create property join requests table...');
    await createPropertyJoinRequestsTable.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('Running migration: Create property ads table...');
    await createPropertyAdsTable.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('All migrations completed successfully!');

    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

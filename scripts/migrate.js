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
const createGroupsTable = require('../migrations/006-create-groups-table');
const createExpensesTable = require('../migrations/007-create-expenses-table');
const createSplitsTable = require('../migrations/008-create-splits-table');
const addGroupIdToTenants = require('../migrations/009-add-group-id-to-tenants');
const createTasksTable = require('../migrations/010-create-tasks-table');
const addPropertyIdToTenants = require('../migrations/011-add-property-id-to-tenants');
const addAssignedByToSplits = require('../migrations/012-add-assigned-by-to-splits');
const fixTimestampColumns = require('../migrations/013-fix-timestamp-columns');
const createNotificationsTable = require('../migrations/014-create-notifications-table');

async function runMigrations() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create SequelizeMeta table if it doesn't exist
    await sequelize.getQueryInterface().createTable('SequelizeMeta', {
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true
      }
    }, { ifNotExists: true });

    // Get completed migrations
    const [completedMigrations] = await sequelize.query('SELECT name FROM SequelizeMeta');
    const completedNames = completedMigrations.map(row => row.name);
    
    console.log('Completed migrations:', completedNames);

    // Define all migrations in order
    const migrations = [
      { name: '001-create-users-table', fn: createUsersTable },
      { name: '002-create-owners-table', fn: createOwnersTable },
      { name: '002-create-properties-table', fn: createPropertiesTable },
      { name: '003-create-tenants-table', fn: createTenantsTable },
      { name: '004-create-property-join-requests-table', fn: createPropertyJoinRequestsTable },
      { name: '005-create-property-ads-table', fn: createPropertyAdsTable },
      { name: '006-create-groups-table', fn: createGroupsTable },
      { name: '007-create-expenses-table', fn: createExpensesTable },
      { name: '008-create-splits-table', fn: createSplitsTable },
      { name: '009-add-group-id-to-tenants', fn: addGroupIdToTenants },
      { name: '010-create-tasks-table', fn: createTasksTable },
      { name: '011-add-property-id-to-tenants', fn: addPropertyIdToTenants },
      { name: '012-add-assigned-by-to-splits', fn: addAssignedByToSplits },
      { name: '013-fix-timestamp-columns', fn: fixTimestampColumns },
      { name: '014-create-notifications-table', fn: createNotificationsTable }
    ];

    // Run only pending migrations
    console.log('Running migrations...');
    let hasNewMigrations = false;
    
    for (const migration of migrations) {
      if (!completedNames.includes(migration.name)) {
        console.log(`Running migration: ${migration.name}...`);
        try {
          await migration.fn.up(sequelize.getQueryInterface(), Sequelize);
          await sequelize.query('INSERT INTO SequelizeMeta (name) VALUES (?)', {
            replacements: [migration.name]
          });
          hasNewMigrations = true;
          console.log(`Migration ${migration.name} completed successfully.`);
        } catch (error) {
          console.error(`Migration ${migration.name} failed:`, error.message);
          // Continue with other migrations
        }
      } else {
        console.log(`Migration ${migration.name} already completed, skipping.`);
      }
    }

    if (hasNewMigrations) {
      console.log('All pending migrations completed successfully!');
    } else {
      console.log('No pending migrations found. Database is up to date.');
    }

    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

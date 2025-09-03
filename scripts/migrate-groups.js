#!/usr/bin/env node

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create sequelize instance
let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
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

// Migration functions
const runMigrations = async () => {
  try {
    console.log('Starting group, expense, and split migrations...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Create groups table
    console.log('Creating groups table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS \`groups\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        group_image_url VARCHAR(500),
        property_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_groups_property_id (property_id),
        INDEX idx_groups_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Groups table created successfully.');
    
    // Create expenses table
    console.log('Creating expenses table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        receipt_total DECIMAL(10,2) NOT NULL,
        group_id INT NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (created_by) REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_expenses_group_id (group_id),
        INDEX idx_expenses_created_by (created_by),
        INDEX idx_expenses_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Expenses table created successfully.');
    
    // Create splits table
    console.log('Creating splits table...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS splits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status ENUM('unpaid', 'pending', 'paid') NOT NULL DEFAULT 'unpaid',
        split_amount DECIMAL(10,2) NOT NULL,
        assigned_to INT NOT NULL,
        paid_date TIMESTAMP NULL,
        expense_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES tenants(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_splits_expense_id (expense_id),
        INDEX idx_splits_assigned_to (assigned_to),
        INDEX idx_splits_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Splits table created successfully.');
    
    // Add group_id column to tenants table if it doesn't exist
    console.log('Checking if group_id column exists in tenants table...');
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM tenants LIKE 'group_id'
    `);
    
    if (columns.length === 0) {
      console.log('Adding group_id column to tenants table...');
      await sequelize.query(`
        ALTER TABLE tenants 
        ADD COLUMN group_id INT NULL,
        ADD CONSTRAINT fk_tenants_group_id 
        FOREIGN KEY (group_id) REFERENCES \`groups\`(id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
        ADD INDEX idx_tenants_group_id (group_id)
      `);
      console.log('group_id column added to tenants table successfully.');
    } else {
      console.log('group_id column already exists in tenants table.');
    }
    
    console.log('All migrations completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateTasks() {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'roomsync_user',
      password: process.env.DB_PASSWORD || 'roomsync_password',
      database: process.env.DB_NAME || 'roomsync_db'
    });

    console.log('Connected to database successfully');

    // Create tasks table
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS \`tasks\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`priority\` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
        \`due_date\` DATETIME,
        \`is_completed\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`assigned_to\` INT NOT NULL,
        \`created_by\` INT NOT NULL,
        \`group_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`assigned_to\`) REFERENCES \`tenants\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (\`created_by\`) REFERENCES \`tenants\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (\`group_id\`) REFERENCES \`groups\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTasksTable);
    console.log('Tasks table created successfully');

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX idx_tasks_group_id ON `tasks` (group_id)',
      'CREATE INDEX idx_tasks_assigned_to ON `tasks` (assigned_to)',
      'CREATE INDEX idx_tasks_created_by ON `tasks` (created_by)',
      'CREATE INDEX idx_tasks_is_completed ON `tasks` (is_completed)',
      'CREATE INDEX idx_tasks_priority ON `tasks` (priority)',
      'CREATE INDEX idx_tasks_due_date ON `tasks` (due_date)'
    ];

    for (const index of indexes) {
      try {
        await connection.execute(index);
        console.log(`Index created: ${index}`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`Index already exists: ${index}`);
        } else {
          throw error;
        }
      }
    }

    console.log('All indexes created successfully');
    console.log('Tasks migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run migration
migrateTasks();


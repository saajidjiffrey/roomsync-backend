const sequelize = require('./database');
const User = require('../models/User');

// Import all models here
const models = {
  User
};

// Initialize database connection and sync models
const initializeDatabase = async () => {
  const maxRetries = 10;
  const retryDelay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to connect to database (attempt ${attempt}/${maxRetries})...`);
      
      // Test the connection
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // Sync all models with database
      // In development, you might want to use { force: true } to recreate tables
      // In production, use { alter: true } or just sync() for safe updates
      const syncOptions = process.env.NODE_ENV === 'development' 
        ? { alter: true } 
        : {};
      
      await sequelize.sync(syncOptions);
      console.log('Database models synchronized successfully.');
      
      return true;
    } catch (error) {
      console.error(`Database connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('Max retries reached. Unable to connect to the database.');
        return false;
      }
      
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  return false;
};

// Close database connection
const closeDatabase = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

module.exports = {
  sequelize,
  models,
  initializeDatabase,
  closeDatabase
};

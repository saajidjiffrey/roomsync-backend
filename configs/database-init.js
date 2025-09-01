const sequelize = require('./database');
const User = require('../models/User');
const Owner = require('../models/Owner');
const Tenant = require('../models/Tenant');
const Property = require('../models/Property');
const PropertyAd = require('../models/PropertyAd');
const PropertyJoinRequest = require('../models/PropertyJoinRequest');

// Import all models here
const models = {
  User,
  Owner,
  Tenant,
  Property,
  PropertyAd,
  PropertyJoinRequest
};

// Define associations after all models are loaded
const defineAssociations = () => {
  // Call each model's associate method to define associations
  Object.values(models).forEach(model => {
    if (model.associate) {
      model.associate(models);
    }
  });
  
  console.log('Model associations defined successfully.');
};

// Initialize database connection and sync models
const initializeDatabase = async () => {
  const maxRetries = 10;
  const retryDelay = 5000;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempting to connect to database (attempt ${attempt}/${maxRetries})...`);
      
      // Test the connection
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      // Define associations
      defineAssociations();
      
      console.log('Syncing database models...');
      await sequelize.sync({ alter: true });
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

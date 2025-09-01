require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./configs/database-init');
const { errorHandler, notFound } = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/protected', require('./routes/protected'));
app.use('/api/property', require('./routes/property'));
app.use('/api/property-ad', require('./routes/propertyAd'));

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('Starting server...');
    
    // Start the server first
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    // Try to initialize database in background
    console.log('Attempting to connect to database...');
    const dbInitialized = await initializeDatabase();
    if (dbInitialized) {
      console.log('Database connected successfully!');
    } else {
      console.log('Database connection failed, but server is running. API endpoints may not work properly.');
    }
    
    // Error handling middleware (must be last)
    app.use(notFound);
    app.use(errorHandler);
    
  } catch (error) {
    console.error('Error starting server:', error);
    // Still start the server even if database fails
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (database connection failed)`);
    });
    
    // Error handling middleware (must be last)
    app.use(notFound);
    app.use(errorHandler);
  }
};

startServer();
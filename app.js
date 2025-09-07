require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { initializeDatabase } = require('./configs/database-init');
const { errorHandler, notFound } = require('./utils/errorHandler');
const socketService = require('./services/socketService');
const taskReminderService = require('./services/taskReminderService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

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

// Admin route to trigger database sync
app.post('/admin/sync-db', async (req, res) => {
  try {
    const { sequelize } = require('./configs/database-init');
    console.log('Starting database sync...');
    await sequelize.sync({ alter: true });
    console.log('Database sync completed successfully!');
    res.json({ 
      success: true, 
      message: 'Database synchronized successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database sync failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database sync failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/protected', require('./routes/protected'));
app.use('/api/property', require('./routes/property'));
app.use('/api/property-ad', require('./routes/propertyAd'));
app.use('/api/group', require('./routes/group'));
app.use('/api/expense', require('./routes/expense'));
app.use('/api/split', require('./routes/split'));
app.use('/api/task', require('./routes/task'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notification'));

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('Starting server...');
    
    // Start the server first
    server.listen(PORT, async () => {
      console.log(`Server running on port ${PORT}`);
      
      // Initialize Socket.IO and services after server is started
      socketService.initialize(server);
      taskReminderService.start();
      
      // Try to initialize database in background
      console.log('Attempting to connect to database...');
      const dbInitialized = await initializeDatabase();
      if (dbInitialized) {
        console.log('Database connected successfully!');
      } else {
        console.log('Database connection failed, but server is running. API endpoints may not work properly.');
      }
    });
    
    // Error handling middleware (must be last)
    app.use(notFound);
    app.use(errorHandler);
    
  } catch (error) {
    console.error('Error starting server:', error);
    // Still start the server even if database fails
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (database connection failed)`);
      
      // Initialize Socket.IO and services after server is started
      socketService.initialize(server);
      taskReminderService.start();
    });
    
    // Error handling middleware (must be last)
    app.use(notFound);
    app.use(errorHandler);
  }
};

startServer();
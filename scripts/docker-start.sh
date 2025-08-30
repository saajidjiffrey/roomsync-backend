#!/bin/sh

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! nc -z mysql 3306; do
  sleep 1
done
echo "MySQL is ready!"

# Run migrations
echo "Running database migrations..."
node scripts/migrate.js

# Start the application
echo "Starting the application..."
npm start

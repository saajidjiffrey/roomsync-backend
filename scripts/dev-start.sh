#!/bin/sh

echo "Starting RoomSync Backend Development Server..."

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
while ! nc -z mysql 3306; do
  sleep 1
done
echo "MySQL is ready!"

# Install dependencies if node_modules doesn't exist or package.json changed
if [ ! -d "node_modules" ] || [ package.json -nt node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run migrations
echo "Running database migrations..."
node scripts/migrate.js

# Start the development server
echo "Starting development server..."
npm run dev

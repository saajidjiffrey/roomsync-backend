# RoomSync Backend

A Node.js backend application for the RoomSync platform with MySQL database integration.

## Features

- User management with roles (admin, owner, tenant)
- MySQL database integration with Sequelize ORM
- Password hashing with bcrypt
- JWT authentication ready
- RESTful API structure

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE roomsync_db;
```

2. Copy the environment template:
```bash
cp env.example .env
```

3. Update the `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=roomsync_db
DB_USER=your_username
DB_PASSWORD=your_password
```

### 3. Run Migrations

```bash
npm run migrate
```

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Database Schema

### Users Table

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| full_name | VARCHAR(255) | NOT NULL | User's full name |
| phone_no | VARCHAR(20) | NOT NULL, UNIQUE | Phone number |
| occupation | VARCHAR(255) | NULL | User's occupation |
| profile_url | VARCHAR(500) | NULL | Profile picture URL |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email address |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM | NOT NULL, DEFAULT 'tenant' | User role (admin/owner/tenant) |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

## API Endpoints

The API will be structured as follows:

- `GET /` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run db:sync` - Sync database models

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_NAME | Database name | roomsync_db |
| DB_USER | Database username | root |
| DB_PASSWORD | Database password | (empty) |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRES_IN | JWT expiration | 7d |

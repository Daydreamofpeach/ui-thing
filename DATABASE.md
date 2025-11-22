# Database Setup Guide

This project uses Turso (SQLite) as the database with proper authentication and user management.

## 🚀 Quick Start

### 1. Environment Setup
Make sure your `.env` file contains:
```env
TURSO_DATABASE_URL=libsql://your-database-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 2. Database Commands

#### Setup Database Tables
```bash
bun run db:setup
```
Creates the necessary tables (users, sessions) in your Turso database.

#### Check Database Status
```bash
bun run db:check
```
Shows connection status, tables, and record counts.

#### Seed with Sample Data
```bash
bun run db:seed
```
Adds sample users to the database for testing.

#### Reset Database (Dangerous!)
```bash
bun run db:reset
```
⚠️ **WARNING**: This will drop all tables and recreate them with sample data.

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)
```

## 🔐 Authentication Features

- **Password Hashing**: Uses bcryptjs with 12 salt rounds
- **Email Validation**: Proper email format validation
- **Duplicate Prevention**: Unique email constraints
- **Secure Authentication**: Password comparison without storing plain text

## 🛠️ API Endpoints

### Signup
- **POST** `/api/auth/signup`
- **Body**: `{ name, email, password }`
- **Response**: `{ success, user, message }`

### Login
- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ success, user, message }`

## 📁 File Structure

```
app/
├── lib/
│   ├── database.ts      # Turso connection & table initialization
│   ├── auth.ts          # Authentication logic & user management
│   └── api.ts           # API utility functions
├── composables/
│   └── useAuth.ts       # User state management composable
├── plugins/
│   ├── database.client.ts  # Client-side DB initialization
│   └── database.server.ts  # Server-side DB initialization
└── server/api/auth/
    ├── signup.post.ts   # Signup API endpoint
    └── login.post.ts    # Login API endpoint

scripts/
├── setup-db.ts          # Database setup script
└── check-db.ts          # Database status checker
```

## 🔧 Development

### Adding New Users
Use the signup form at `/account/signup` or run the seed command.

### Testing Authentication
1. Start the dev server: `bun run dev`
2. Visit `/account/signup` to create a user
3. Visit `/account/login` to authenticate
4. Check database status: `bun run db:check`

### Sample Users (from seed)
- **john@example.com** / password123
- **jane@example.com** / password123  
- **admin@example.com** / admin123

## 🚨 Troubleshooting

### Connection Issues
1. Verify your `.env` file has correct Turso credentials
2. Check if your Turso database is active
3. Run `bun run db:check` to diagnose issues

### Type Errors
The project uses proper TypeScript types. If you see type errors:
1. Make sure all dependencies are installed: `bun install`
2. Restart the TypeScript server in your editor
3. Check that your Turso credentials are properly set

### Database Not Found
If tables don't exist:
1. Run `bun run db:setup` to create tables
2. Run `bun run db:seed` to add sample data
3. Verify with `bun run db:check`

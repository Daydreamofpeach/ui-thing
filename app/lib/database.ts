import { createClient } from '@libsql/client'

// Create database connection function
function createDatabaseConnection() {
  const config = {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  }
  
  if (!config.url || !config.authToken) {
    throw new Error('Database configuration missing. Please check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.')
  }
  
  return createClient(config)
}

// Export database instance - create new connection each time to avoid proxy issues
export const db = createDatabaseConnection()

// Test database connection
export async function testConnection() {
  try {
    await db.execute('SELECT 1 as test')
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        theme_preference TEXT DEFAULT 'zinc',
        font_preferences TEXT DEFAULT '{"heading":"Inter","body":"Inter","mono":"JetBrains Mono"}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create sessions table for authentication
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    // Create projects table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)

    console.log('✅ Database tables initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}

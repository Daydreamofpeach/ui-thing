#!/usr/bin/env bun
import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

// Database configuration
const config = {
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
}

// Create Turso client
const db = createClient(config)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...')
    
    // Test connection
    const testResult = await db.execute('SELECT 1 as test')
    console.log('✅ Database connection successful')

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
    console.log('✅ Users table created')

    // Create sessions table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `)
    console.log('✅ Sessions table created')

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
    console.log('✅ Projects table created')

    // Add new columns to existing users table if they don't exist
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN theme_preference TEXT DEFAULT 'zinc'`)
      console.log('✅ Added theme_preference column to users table')
    } catch (error) {
      // Column might already exist, which is fine
      console.log('ℹ️  theme_preference column already exists or error:', error.message)
    }

    try {
      await db.execute(`ALTER TABLE users ADD COLUMN font_preferences TEXT DEFAULT '{"heading":"Inter","body":"Inter","mono":"JetBrains Mono"}'`)
      console.log('✅ Added font_preferences column to users table')
    } catch (error) {
      // Column might already exist, which is fine
      console.log('ℹ️  font_preferences column already exists or error:', error.message)
    }

    console.log('🎉 Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...')
    
    // Check if users already exist
    const existingUsers = await db.execute('SELECT COUNT(*) as count FROM users')
    const hasUsers = existingUsers.rows[0].count > 0
    
    if (hasUsers) {
      console.log('⚠️  Database already has users, skipping user creation')
    }

    // Create sample users only if none exist
    if (!hasUsers) {
      const sampleUsers = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: 'password123'
        },
        {
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'admin123'
        }
      ]

      for (const user of sampleUsers) {
        const passwordHash = await bcrypt.hash(user.password, 12)
        
        await db.execute({
          sql: `
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
          `,
          args: [user.name, user.email, passwordHash]
        })
        
        console.log(`✅ Created user: ${user.name} (${user.email})`)
      }
    }

    // Create sample projects for the first user (only if no projects exist)
    const existingProjects = await db.execute('SELECT COUNT(*) as count FROM projects')
    const hasProjects = existingProjects.rows[0].count > 0
    
    if (!hasProjects) {
      const firstUser = await db.execute('SELECT id FROM users LIMIT 1')
      if (firstUser.rows.length > 0) {
        const userId = firstUser.rows[0].id
        
        const sampleProjects = [
          {
            name: 'E-commerce Platform',
            description: 'Modern online shopping experience with advanced features',
            image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=300&q=80'
          },
          {
            name: 'Mobile App Redesign',
            description: 'iOS and Android app overhaul with new UI/UX',
            image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80'
          },
          {
            name: 'API Gateway',
            description: 'Microservices architecture with centralized API management',
            image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80'
          }
        ]

        for (const project of sampleProjects) {
          await db.execute({
            sql: `
              INSERT INTO projects (name, description, image_url, user_id)
              VALUES (?, ?, ?, ?)
            `,
            args: [project.name, project.description, project.image_url, userId]
          })
          
          console.log(`✅ Created project: ${project.name}`)
        }
      }
    } else {
      console.log('⚠️  Database already has projects, skipping project creation')
    }

    console.log('🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  }
}

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...')
    
    // Drop tables
    await db.execute('DROP TABLE IF EXISTS sessions')
    await db.execute('DROP TABLE IF EXISTS users')
    console.log('✅ Tables dropped')

    // Recreate tables
    await setupDatabase()
    
    // Seed with sample data
    await seedDatabase()
    
    console.log('🎉 Database reset completed successfully!')
  } catch (error) {
    console.error('❌ Database reset failed:', error)
    process.exit(1)
  }
}

// Main execution
const command = process.argv[2]

switch (command) {
  case 'setup':
    await setupDatabase()
    break
  case 'seed':
    await seedDatabase()
    break
  case 'reset':
    await resetDatabase()
    break
  default:
    console.log(`
Usage: bun run scripts/setup-db.ts <command>

Commands:
  setup  - Create database tables
  seed   - Add sample data to database
  reset  - Drop and recreate tables with sample data

Examples:
  bun run scripts/setup-db.ts setup
  bun run scripts/setup-db.ts seed
  bun run scripts/setup-db.ts reset
    `)
    process.exit(1)
}

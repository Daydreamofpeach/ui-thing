#!/usr/bin/env bun
import { createClient } from '@libsql/client'

// Database configuration
const config = {
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
}

// Create Turso client
const db = createClient(config)

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and status...')
    
    // Test connection
    const testResult = await db.execute('SELECT 1 as test')
    console.log('✅ Database connection successful')

    // Check tables
    const tablesResult = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `)
    
    console.log('\n📋 Database tables:')
    if (tablesResult.rows.length === 0) {
      console.log('  No tables found')
    } else {
      for (const row of tablesResult.rows) {
        console.log(`  - ${row.name}`)
      }
    }

    // Check users count
    try {
      const usersResult = await db.execute('SELECT COUNT(*) as count FROM users')
      console.log(`\n👥 Users in database: ${usersResult.rows[0].count}`)
    } catch (error) {
      console.log('\n👥 Users table: Not found')
    }

    // Check sessions count
    try {
      const sessionsResult = await db.execute('SELECT COUNT(*) as count FROM sessions')
      console.log(`🔐 Sessions in database: ${sessionsResult.rows[0].count}`)
    } catch (error) {
      console.log('🔐 Sessions table: Not found')
    }

    // Check projects count
    try {
      const projectsResult = await db.execute('SELECT COUNT(*) as count FROM projects')
      console.log(`📁 Projects in database: ${projectsResult.rows[0].count}`)
    } catch (error) {
      console.log('📁 Projects table: Not found')
    }

    console.log('\n🎉 Database check completed!')
  } catch (error) {
    console.error('❌ Database check failed:', error)
    process.exit(1)
  }
}

// Run the check
await checkDatabase()

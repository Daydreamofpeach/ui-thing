import { testConnection, initializeDatabase } from '~/lib/database'

export default defineNuxtPlugin(async () => {
  // Initialize database on server side
  if (import.meta.server) {
    try {
      const isConnected = await testConnection()
      if (isConnected) {
        console.log('✅ Server: Database connection successful')
        
        // Initialize database tables
        await initializeDatabase()
      }
    } catch (error) {
      console.error('❌ Server: Database initialization failed:', error)
    }
  }
})

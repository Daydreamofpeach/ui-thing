import { getAvailableUsers } from '~/lib/members'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    // Get admin user ID from query
    const query = getQuery(event)
    const adminUserId = Number(query.admin_user_id)

    if (!adminUserId || isNaN(adminUserId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Admin user ID is required'
      })
    }

    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch {
      // Database may already be initialized, continue
    }

    const availableUsers = await getAvailableUsers(adminUserId)
    
    return {
      success: true,
      users: availableUsers
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch available users'
    })
  }
})

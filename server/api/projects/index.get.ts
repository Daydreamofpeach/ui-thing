import { getProjectsByUserId } from '~/lib/projects'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    // Get user ID from query or session (you might want to implement session-based auth)
    const query = getQuery(event)
    const userId = Number(query.user_id)

    if (!userId || isNaN(userId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch {
      // Database may already be initialized, continue
    }

    const projects = await getProjectsByUserId(userId)
    
    return {
      success: true,
      projects
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch projects'
    })
  }
})

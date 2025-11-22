import { getAllMembers, getMembersByAdmin } from '~/lib/members'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch {
      // Database may already be initialized, continue
    }

    // Get query parameters
    const query = getQuery(event)
    const adminUserId = query.admin_user_id ? Number(query.admin_user_id) : null

    let members
    if (adminUserId && !isNaN(adminUserId)) {
      // Get members for specific admin
      members = await getMembersByAdmin(adminUserId)
    } else {
      // Get all members (for super admin view)
      members = await getAllMembers()
    }
    
    return {
      success: true,
      members
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch members'
    })
  }
})

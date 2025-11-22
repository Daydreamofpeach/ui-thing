import { createMember } from '~/lib/members'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { user_id, added_by_user_id, role, status } = body

    if (!user_id || !added_by_user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID and admin user ID are required'
      })
    }

    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch {
      // Database may already be initialized, continue
    }

    const member = await createMember({
      user_id: Number(user_id),
      added_by_user_id: Number(added_by_user_id),
      role: role || 'member',
      status: status || 'active'
    })

    if (!member) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create member'
      })
    }

    return {
      success: true,
      member,
      message: 'Member added successfully'
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to add member'
    })
  }
})

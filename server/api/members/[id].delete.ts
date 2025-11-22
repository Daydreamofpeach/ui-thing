import { deleteMember } from '~/lib/members'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid member ID is required'
      })
    }

    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch {
      // Database may already be initialized, continue
    }

    const result = await deleteMember(id)

    if (!result.wasFound) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Member not found'
      })
    }

    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to remove member'
      })
    }

    return {
      success: true,
      message: 'Member removed successfully'
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to remove member'
    })
  }
})

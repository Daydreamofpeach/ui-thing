import { updateMember } from '~/lib/members'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    const { role, status, permissions } = body

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

    const member = await updateMember(id, {
      role,
      status,
      permissions
    })

    if (!member) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Member not found'
      })
    }

    return {
      success: true,
      member,
      message: 'Member updated successfully'
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update member'
    })
  }
})

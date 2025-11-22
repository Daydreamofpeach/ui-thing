import { updateUser } from '~/lib/users'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    const { name, email, theme_preference, font_preferences } = body

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid user ID is required'
      })
    }

    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch {
      // Database may already be initialized, continue
    }

    const user = await updateUser(id, {
      name,
      email,
      theme_preference,
      font_preferences
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Remove password hash from response
    const { password_hash, ...userResponse } = user

    return {
      success: true,
      user: userResponse,
      message: 'User updated successfully'
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update user'
    })
  }
})

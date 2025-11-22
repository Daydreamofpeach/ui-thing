import { createUser } from '~/lib/users'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, password } = body

    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, email, and password are required'
      })
    }

    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch {
      // Database may already be initialized, continue
    }

    const user = await createUser({
      name,
      email,
      password
    })

    if (!user) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create user'
      })
    }

    // Remove password hash from response
    const { password_hash, ...userResponse } = user

    return {
      success: true,
      user: userResponse,
      message: 'User created successfully'
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create user'
    })
  }
})

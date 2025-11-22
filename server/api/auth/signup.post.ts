import { createUser } from '~/lib/auth'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    // Ensure database is initialized
    await initializeDatabase()
    
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, email, and password are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Validate password length
    if (body.password.length < 8) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 8 characters long'
      })
    }

    // Create user
    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password
    })

    // Remove password hash from response
    const { password_hash, ...userResponse } = user

    return {
      success: true,
      message: 'Account created successfully',
      user: userResponse
    }
  } catch (error: any) {
    console.error('Signup error:', error)
    
    if (error.message === 'User with this email already exists') {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists'
      })
    }

    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})

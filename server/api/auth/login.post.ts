import { authenticateUser } from '~/lib/auth'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    // Ensure database is initialized
    await initializeDatabase()
    
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
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

    // Authenticate user
    const user = await authenticateUser({
      email: body.email,
      password: body.password
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password'
      })
    }

    // TODO: Create session/token here
    // For now, we'll just return the user data
    // In a production app, you'd want to create a JWT token or session

    return {
      success: true,
      message: 'Login successful',
      user: user
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

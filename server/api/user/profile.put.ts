import { readBody, createError } from 'h3'
import { db } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, name, email, theme_preference, font_preferences } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }

    if (!name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and email are required'
      })
    }

    // Check if email is already taken by another user
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ? AND id != ?',
      args: [email, id]
    })

    if (existingUser.rows.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is already taken by another user'
      })
    }

    // Update user profile
    await db.execute({
      sql: `
        UPDATE users 
        SET name = ?, email = ?, theme_preference = ?, font_preferences = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,
      args: [name, email, theme_preference || 'zinc', font_preferences || '{"heading":"Inter","body":"Inter","mono":"JetBrains Mono"}', id]
    })

    // Get updated user data
    const updatedUser = await db.execute({
      sql: 'SELECT id, name, email, theme_preference, font_preferences, created_at, updated_at FROM users WHERE id = ?',
      args: [id]
    })

    if (updatedUser.rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    return {
      success: true,
      user: updatedUser.rows[0],
      message: 'Profile updated successfully'
    }
  } catch (error: any) {
    console.error('Profile update error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile'
    })
  }
})

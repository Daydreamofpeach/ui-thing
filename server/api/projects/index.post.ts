import { createProject } from '~/lib/projects'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, description, image_url, user_id } = body

    if (!name || !user_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and user_id are required'
      })
    }

    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch (dbInitError) {
      // Database may already be initialized, continue
    }

    const project = await createProject({
      name,
      description,
      image_url,
      user_id: Number(user_id)
    })

    if (!project) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create project'
      })
    }

    return {
      success: true,
      project,
      message: 'Project created successfully'
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create project'
    })
  }
})

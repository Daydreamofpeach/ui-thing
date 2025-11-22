import { updateProject } from '~/lib/projects'
import { initializeDatabase } from '~/lib/database'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    const { name, description, image_url } = body

    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid project ID is required'
      })
    }

    // Try to initialize database, but don't fail if it's already initialized
    try {
      await initializeDatabase()
    } catch (dbInitError) {
      // Database may already be initialized, continue
    }

    const project = await updateProject(id, {
      name,
      description,
      image_url
    })

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found'
      })
    }

    return {
      success: true,
      project,
      message: 'Project updated successfully'
    }
  } catch (error: any) {
    // Return more specific error messages
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update project'
    })
  }
})

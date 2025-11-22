import { db } from './database'

export interface Project {
  id: number
  name: string
  description?: string
  image_url?: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface CreateProjectData {
  name: string
  description?: string
  image_url?: string
  user_id: number
}

export interface UpdateProjectData {
  name?: string
  description?: string
  image_url?: string
}

// Create a new project
export async function createProject(projectData: CreateProjectData): Promise<Project | null> {
  const result = await db.execute({
    sql: `
      INSERT INTO projects (name, description, image_url, user_id)
      VALUES (?, ?, ?, ?)
    `,
    args: [projectData.name, projectData.description || null, projectData.image_url || null, projectData.user_id]
  })

  // Extract the last inserted ID using multiple fallback methods
  const projectId = (result as any).meta?.last_row_id || 
                   (result as any).meta?.lastInsertRowid || 
                   (result as any).lastInsertRowid || 
                   (result as any).last_row_id

  if (!projectId) {
    throw new Error('Failed to create project - no ID returned')
  }

  // Fetch the created project
  const project = await getProjectById(Number(projectId))
  return project
}

// Get project by ID
export async function getProjectById(id: number): Promise<Project | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM projects WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as unknown as Project
  } catch {
    return null
  }
}

// Get all projects for a user
export async function getProjectsByUserId(userId: number): Promise<Project[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    })

    return result.rows as unknown as Project[]
  } catch {
    return []
  }
}

// Update a project
export async function updateProject(id: number, projectData: UpdateProjectData): Promise<Project | null> {
  try {
    const updateFields = []
    const args = []

    if (projectData.name !== undefined) {
      updateFields.push('name = ?')
      args.push(projectData.name)
    }
    if (projectData.description !== undefined) {
      updateFields.push('description = ?')
      args.push(projectData.description)
    }
    if (projectData.image_url !== undefined) {
      updateFields.push('image_url = ?')
      args.push(projectData.image_url)
    }

    if (updateFields.length === 0) {
      return await getProjectById(id)
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    args.push(id)

    await db.execute({
      sql: `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`,
      args
    })

    return await getProjectById(id)
  } catch {
    return null
  }
}

// Delete a project
export async function deleteProject(id: number): Promise<{ success: boolean; wasFound: boolean }> {
  try {
    // First check if the project exists
    const checkResult = await db.execute({
      sql: 'SELECT id FROM projects WHERE id = ?',
      args: [id]
    })

    const projectExists = checkResult.rows.length > 0

    if (!projectExists) {
      return { success: false, wasFound: false }
    }

    // Delete the project
    await db.execute({
      sql: 'DELETE FROM projects WHERE id = ?',
      args: [id]
    })

    // If we get here without error, consider it successful
    // The database operation completed without throwing an exception
    return { 
      success: true, 
      wasFound: true 
    }
  } catch {
    return { success: false, wasFound: false }
  }
}

import { db } from './database'
import bcrypt from 'bcryptjs'

export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  theme_preference: string
  font_preferences: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  theme_preference?: string
  font_preferences?: string
}

// Create a new user
export async function createUser(userData: CreateUserData): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [userData.email]
    })

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists')
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 12)

    const result = await db.execute({
      sql: `
        INSERT INTO users (name, email, password_hash, theme_preference, font_preferences)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        userData.name,
        userData.email,
        passwordHash,
        'zinc',
        '{"heading":"Inter","body":"Inter","mono":"JetBrains Mono"}'
      ]
    })

    // Extract the last inserted ID using multiple fallback methods
    const userId = (result as any).meta?.last_row_id || 
                   (result as any).meta?.lastInsertRowid || 
                   (result as any).lastInsertRowid || 
                   (result as any).last_row_id

    if (!userId) {
      throw new Error('Failed to create user - no ID returned')
    }

    // Fetch the created user
    const user = await getUserById(Number(userId))
    return user
  } catch (error) {
    throw error
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<User | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as unknown as User
  } catch {
    return null
  }
}

// Get all users
export async function getUsers(): Promise<User[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users ORDER BY created_at DESC',
      args: []
    })

    return result.rows as unknown as User[]
  } catch {
    return []
  }
}

// Update a user
export async function updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
  try {
    const updateFields = []
    const args = []

    if (userData.name !== undefined) {
      updateFields.push('name = ?')
      args.push(userData.name)
    }
    if (userData.email !== undefined) {
      updateFields.push('email = ?')
      args.push(userData.email)
    }
    if (userData.theme_preference !== undefined) {
      updateFields.push('theme_preference = ?')
      args.push(userData.theme_preference)
    }
    if (userData.font_preferences !== undefined) {
      updateFields.push('font_preferences = ?')
      args.push(userData.font_preferences)
    }

    if (updateFields.length === 0) {
      return await getUserById(id)
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    args.push(id)

    await db.execute({
      sql: `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      args
    })

    return await getUserById(id)
  } catch {
    return null
  }
}

// Delete a user
export async function deleteUser(id: number): Promise<{ success: boolean; wasFound: boolean }> {
  try {
    // First check if the user exists
    const checkResult = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [id]
    })

    const userExists = checkResult.rows.length > 0

    if (!userExists) {
      return { success: false, wasFound: false }
    }

    // Delete the user
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [id]
    })

    // If we get here without error, consider it successful
    return { 
      success: true, 
      wasFound: true 
    }
  } catch {
    return { success: false, wasFound: false }
  }
}

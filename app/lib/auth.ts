import { db } from './database'
import bcrypt from 'bcryptjs'

// User types
export interface User {
  id: number
  name: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
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

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(userData.password, saltRounds)

    // Insert new user
    const result = await db.execute({
      sql: `
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
      `,
      args: [userData.name, userData.email, passwordHash]
    })

    // Get the created user
    const newUser = await db.execute({
      sql: 'SELECT id, name, email, theme_preference, font_preferences, created_at, updated_at FROM users WHERE id = ?',
      args: [result.lastInsertRowid]
    })

    return newUser.rows[0] as unknown as User
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// Authenticate user login
export async function authenticateUser(loginData: LoginData): Promise<Omit<User, 'password_hash'> | null> {
  try {
    // Get user by email
    const result = await db.execute({
      sql: 'SELECT id, name, email, theme_preference, font_preferences, password_hash, created_at, updated_at FROM users WHERE email = ?',
      args: [loginData.email]
    })

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0] as unknown as User

    // Verify password
    const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash)
    
    if (!isValidPassword) {
      return null
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('Error authenticating user:', error)
    throw error
  }
}

// Get user by ID
export async function getUserById(id: number): Promise<Omit<User, 'password_hash'> | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, email, theme_preference, font_preferences, created_at, updated_at FROM users WHERE id = ?',
      args: [id]
    })

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as unknown as Omit<User, 'password_hash'>
  } catch (error) {
    console.error('Error getting user by ID:', error)
    throw error
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<Omit<User, 'password_hash'> | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, email, theme_preference, font_preferences, created_at, updated_at FROM users WHERE email = ?',
      args: [email]
    })

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as unknown as Omit<User, 'password_hash'>
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

import { db } from './database'

export interface Member {
  id: number
  user_id: number
  added_by_user_id: number
  role: 'admin' | 'member'
  status: 'active' | 'inactive' | 'pending'
  permissions: string
  created_at: string
  updated_at: string
  // Joined user data
  user_name?: string
  user_email?: string
  user_theme_preference?: string
  added_by_name?: string
}

export interface CreateMemberData {
  user_id: number
  added_by_user_id: number
  role?: 'admin' | 'member'
  status?: 'active' | 'inactive' | 'pending'
  permissions?: string
}

export interface UpdateMemberData {
  role?: 'admin' | 'member'
  status?: 'active' | 'inactive' | 'pending'
  permissions?: string
}

// Create a new member
export async function createMember(memberData: CreateMemberData): Promise<Member | null> {
  try {
    // Check if membership already exists
    const existingMember = await db.execute({
      sql: 'SELECT id FROM members WHERE user_id = ? AND added_by_user_id = ?',
      args: [memberData.user_id, memberData.added_by_user_id]
    })

    if (existingMember.rows.length > 0) {
      throw new Error('User is already a member')
    }

    const result = await db.execute({
      sql: `
        INSERT INTO members (user_id, added_by_user_id, role, status, permissions)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        memberData.user_id,
        memberData.added_by_user_id,
        memberData.role || 'member',
        memberData.status || 'active',
        memberData.permissions || '{}'
      ]
    })

    // Extract the last inserted ID
    const memberId = (result as any).meta?.last_row_id || 
                     (result as any).meta?.lastInsertRowid || 
                     (result as any).lastInsertRowid || 
                     (result as any).last_row_id

    if (!memberId) {
      throw new Error('Failed to create member - no ID returned')
    }

    // Fetch the created member with joined data
    const member = await getMemberById(Number(memberId))
    return member
  } catch (error) {
    throw error
  }
}

// Get member by ID with joined user data
export async function getMemberById(id: number): Promise<Member | null> {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          m.*,
          u.name as user_name,
          u.email as user_email,
          u.theme_preference as user_theme_preference,
          admin.name as added_by_name
        FROM members m
        JOIN users u ON m.user_id = u.id
        JOIN users admin ON m.added_by_user_id = admin.id
        WHERE m.id = ?
      `,
      args: [id]
    })

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as unknown as Member
  } catch {
    return null
  }
}

// Get all members for a specific admin (added_by_user_id)
export async function getMembersByAdmin(adminUserId: number): Promise<Member[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          m.*,
          u.name as user_name,
          u.email as user_email,
          u.theme_preference as user_theme_preference,
          admin.name as added_by_name
        FROM members m
        JOIN users u ON m.user_id = u.id
        JOIN users admin ON m.added_by_user_id = admin.id
        WHERE m.added_by_user_id = ?
        ORDER BY m.created_at DESC
      `,
      args: [adminUserId]
    })

    return result.rows as unknown as Member[]
  } catch {
    return []
  }
}

// Get all members (for super admin view)
export async function getAllMembers(): Promise<Member[]> {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          m.*,
          u.name as user_name,
          u.email as user_email,
          u.theme_preference as user_theme_preference,
          admin.name as added_by_name
        FROM members m
        JOIN users u ON m.user_id = u.id
        JOIN users admin ON m.added_by_user_id = admin.id
        ORDER BY m.created_at DESC
      `,
      args: []
    })

    return result.rows as unknown as Member[]
  } catch {
    return []
  }
}

// Get available users (not already members of this admin)
export async function getAvailableUsers(adminUserId: number): Promise<Array<{id: number, name: string, email: string}>> {
  try {
    const result = await db.execute({
      sql: `
        SELECT u.id, u.name, u.email
        FROM users u
        WHERE u.id NOT IN (
          SELECT user_id FROM members WHERE added_by_user_id = ?
        )
        ORDER BY u.name
      `,
      args: [adminUserId]
    })

    return result.rows as unknown as Array<{id: number, name: string, email: string}>
  } catch {
    return []
  }
}

// Update a member
export async function updateMember(id: number, memberData: UpdateMemberData): Promise<Member | null> {
  try {
    const updateFields = []
    const args = []

    if (memberData.role !== undefined) {
      updateFields.push('role = ?')
      args.push(memberData.role)
    }
    if (memberData.status !== undefined) {
      updateFields.push('status = ?')
      args.push(memberData.status)
    }
    if (memberData.permissions !== undefined) {
      updateFields.push('permissions = ?')
      args.push(memberData.permissions)
    }

    if (updateFields.length === 0) {
      return await getMemberById(id)
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    args.push(id)

    await db.execute({
      sql: `UPDATE members SET ${updateFields.join(', ')} WHERE id = ?`,
      args
    })

    return await getMemberById(id)
  } catch {
    return null
  }
}

// Delete a member
export async function deleteMember(id: number): Promise<{ success: boolean; wasFound: boolean }> {
  try {
    // First check if the member exists
    const checkResult = await db.execute({
      sql: 'SELECT id FROM members WHERE id = ?',
      args: [id]
    })

    const memberExists = checkResult.rows.length > 0

    if (!memberExists) {
      return { success: false, wasFound: false }
    }

    // Delete the member
    await db.execute({
      sql: 'DELETE FROM members WHERE id = ?',
      args: [id]
    })

    return { 
      success: true, 
      wasFound: true 
    }
  } catch {
    return { success: false, wasFound: false }
  }
}

// Check if user is admin of another user
export async function isUserAdminOf(adminUserId: number, targetUserId: number): Promise<boolean> {
  try {
    const result = await db.execute({
      sql: 'SELECT id FROM members WHERE added_by_user_id = ? AND user_id = ? AND role = "admin"',
      args: [adminUserId, targetUserId]
    })

    return result.rows.length > 0
  } catch {
    return false
  }
}

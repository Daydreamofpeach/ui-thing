/**
 * Centralized type definitions for user management, roles, permissions, and groups
 * This file serves as the single source of truth for these types across the application
 * 
 * All types are exported to be used throughout the application via:
 * import type { TypeName } from '~/composables/types/permissions.types'
 */

// Permission Types
export interface Permission {
	id: string
	name: string
	description: string
	butt: string
	action: string
	subject: string
	createdAt: string
	updatedAt: string
	deletedAt?: string
}

export interface CreatePermissionData {
	name: string
	description: string
	butt: string
	action: string
	subject: string
}

export interface UpdatePermissionData {
	name?: string
	description?: string
	action?: string
	subject?: string
}

// Permission Group Types
export interface PermissionGroup {
	id: string
	name: string
	description: string
	butt: string
	permissions: any[]
	createdAt: string
	updatedAt: string
	deletedAt?: string
}

export interface CreatePermissionGroupData {
	name: string
	description: string
	butt: string
	permissions: string[]
}

export interface UpdatePermissionGroupData {
	name?: string
	description?: string
	permissions?: string[]
}

// Role Types
export interface Role {
	id: string
	name: string
	description: string
	butt: string
	type: string
	createdAt: string
	updatedAt: string
	deletedAt?: string
}

export interface CreateRoleData {
	name: string
	description: string
	butt: string
	type: string
}

export interface UpdateRoleData {
	name?: string
	description?: string
	type?: string
}

// User Types
export interface User {
	id: string
	name: string
	email: string
	username?: string
	password?: string
	isActive: boolean
	isGithubConnected?: boolean
	githubToken?: string
	role?: {
		id: string
		name: string
		butt: string
		type: string
	}
	permissionGroups: any[]
	createdAt: string
	updatedAt: string
	deletedAt?: string
}

// Legacy User type for local storage (useUserStore)
export interface LocalUser {
	username: string
	email: string
	password: string
	isGithubConnected?: boolean
	githubToken?: string
}

export interface UserRole {
	userId: string
	roleId: string
	organizationId: string
	assignedAt: string
	assignedBy: string
}


// API Node Types for the Node Canvas System
export interface ApiEndpoint {
	id: string
	name: string
	path: string
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
	description: string
	auth: "public" | "restricted" | "secure"
	body?: any
	response?: any
	parameters?: ApiParameter[]
	headers?: ApiHeader[]
}

export interface ApiParameter {
	name: string
	type: string
	required: boolean
	description: string
	example?: any
}

export interface ApiHeader {
	name: string
	required: boolean
	description: string
	example?: string
}

export interface AuthNodeData {
	id: string
	type: "authNode"
	name: string
	description: string
	endpoint: ApiEndpoint
	position: { x: number, y: number }
	fields: NodeField[]
	connections: NodeConnection[]
	status: "idle" | "running" | "success" | "error"
	lastResult?: any
	lastError?: string
}

export interface NodeField {
	id: string
	name: string
	type: "string" | "number" | "boolean" | "object" | "array"
	value: any
	required: boolean
	description: string
	validation?: FieldValidation
}

export interface FieldValidation {
	pattern?: string
	minLength?: number
	maxLength?: number
	min?: number
	max?: number
	enum?: string[]
}

export interface NodeConnection {
	id: string
	sourceNodeId: string
	targetNodeId: string
	sourceField: string
	targetField: string
	type: "data" | "trigger" | "condition"
}

export interface AuthFlowNode {
	id: string
	type: "login" | "logout" | "register" | "verify" | "refresh" | "reset" | "createClient"
	name: string
	description: string
	endpoint: ApiEndpoint
	position: { x: number, y: number }
	fields: NodeField[]
	connections: NodeConnection[]
	status: "idle" | "running" | "success" | "error"
	lastResult?: any
	lastError?: string
}

export interface AuthFlowData {
	nodes: AuthFlowNode[]
	connections: NodeConnection[]
	globalVariables: Record<string, any>
	executionHistory: ExecutionStep[]
}

// User-specific interfaces
export interface UserNodeData {
	id: string
	name: string
	email: string
	isActive: boolean
	role?: {
		id: string
		name: string
		butt: string
		type: string
		permissions?: {
			name: string
			butt: string
			action: string
			subject: string
		}[]
	}
	permissionGroups?: {
		id: string
		name: string
		permissions: {
			name: string
			butt: string
			action: string
			subject: string
		}[]
	}[]
	createdAt: string
	updatedAt: string
}

export interface UserFlowNode {
	id: string
	type: "getUser" | "updateUser" | "deleteUser" | "getAllUsers" | "assignRole" | "removeRole" | "assignPermissions" | "removePermissions" | "getUserWithRole" | "getUserPermissions" | "inviteMember" | "magicCard" | "orbitCard"
	name: string
	description: string
	endpoint: ApiEndpoint
	position: { x: number, y: number }
	fields: NodeField[]
	connections: NodeConnection[]
	status: "idle" | "running" | "success" | "error"
	lastResult?: any
	lastError?: string
	userData?: UserNodeData
}

export interface UserFlowData {
	nodes: UserFlowNode[]
	connections: NodeConnection[]
	globalVariables: Record<string, any>
	executionHistory: ExecutionStep[]
}

// Combined flow data
export interface CombinedFlowData {
	authNodes: AuthFlowNode[]
	userNodes: UserFlowNode[]
	connections: NodeConnection[]
	globalVariables: Record<string, any>
	executionHistory: ExecutionStep[]
}

export interface ExecutionStep {
	id: string
	nodeId: string
	timestamp: Date
	status: "started" | "completed" | "failed"
	input?: any
	output?: any
	error?: string
	duration?: number
}

// Auth-specific node types
export const AUTH_NODE_TYPES = [
	{
		id: "login",
		name: "Login",
		description: "Authenticate user with email and password",
		icon: "lucide:log-in",
		color: "green",
		category: "authentication",
		endpoint: {
			method: "POST",
			path: "/auth/login",
			auth: "restricted"
		}
	},
	{
		id: "logout",
		name: "Logout",
		description: "Logout user and invalidate session",
		icon: "lucide:log-out",
		color: "red",
		category: "authentication",
		endpoint: {
			method: "POST",
			path: "/auth/logout",
			auth: "secure"
		}
	},
	{
		id: "register",
		name: "Register",
		description: "Register new user account",
		icon: "lucide:user-plus",
		color: "blue",
		category: "authentication",
		endpoint: {
			method: "POST",
			path: "/auth/register",
			auth: "public"
		}
	},
	{
		id: "verify",
		name: "Verify",
		description: "Verify user account with activation code",
		icon: "lucide:check-circle",
		color: "purple",
		category: "authentication",
		endpoint: {
			method: "GET",
			path: "/auth/verify",
			auth: "public"
		}
	},
	{
		id: "refresh",
		name: "Refresh Token",
		description: "Refresh access token using refresh token",
		icon: "lucide:refresh-cw",
		color: "orange",
		category: "authentication",
		endpoint: {
			method: "GET",
			path: "/auth/refresh",
			auth: "secure"
		}
	},
	{
		id: "reset",
		name: "Reset Password",
		description: "Reset user password",
		icon: "lucide:key",
		color: "yellow",
		category: "authentication",
		endpoint: {
			method: "POST",
			path: "/auth/reset",
			auth: "public"
		}
	},
	{
		id: "createClient",
		name: "Create Client",
		description: "Create new client instance",
		icon: "lucide:plus-circle",
		color: "indigo",
		category: "authentication",
		endpoint: {
			method: "POST",
			path: "/auth/createClient",
			auth: "restricted"
		}
	}
] as const;

export type AuthNodeType = typeof AUTH_NODE_TYPES[number]["id"];

// User-specific node types
export const USER_NODE_TYPES = [
	{
		id: "getUser",
		name: "Get User",
		description: "Retrieve user by ID",
		icon: "lucide:user",
		color: "blue",
		category: "user-management",
		endpoint: {
			method: "GET",
			path: "/users/getUser",
			auth: "secure"
		}
	},
	{
		id: "updateUser",
		name: "Update User",
		description: "Update user information",
		icon: "lucide:user-edit",
		color: "green",
		category: "user-management",
		endpoint: {
			method: "PUT",
			path: "/users/updateUser",
			auth: "secure"
		}
	},
	{
		id: "deleteUser",
		name: "Delete User",
		description: "Soft delete user",
		icon: "lucide:user-x",
		color: "red",
		category: "user-management",
		endpoint: {
			method: "DELETE",
			path: "/users/deleteUser",
			auth: "secure"
		}
	},
	{
		id: "getAllUsers",
		name: "Get All Users",
		description: "Retrieve all users",
		icon: "lucide:users",
		color: "purple",
		category: "user-management",
		endpoint: {
			method: "GET",
			path: "/users/getAllUsers",
			auth: "secure"
		}
	},
	{
		id: "assignRole",
		name: "Assign Role",
		description: "Assign role to user",
		icon: "lucide:shield-plus",
		color: "orange",
		category: "user-management",
		endpoint: {
			method: "POST",
			path: "/users/assignRoleToUser",
			auth: "secure"
		}
	},
	{
		id: "removeRole",
		name: "Remove Role",
		description: "Remove role from user",
		icon: "lucide:shield-minus",
		color: "yellow",
		category: "user-management",
		endpoint: {
			method: "DELETE",
			path: "/users/removeRoleFromUser",
			auth: "secure"
		}
	},
	{
		id: "assignPermissions",
		name: "Assign Permissions",
		description: "Assign permission groups to user",
		icon: "lucide:key-plus",
		color: "indigo",
		category: "user-management",
		endpoint: {
			method: "POST",
			path: "/users/assignPermissionGroupsToUser",
			auth: "secure"
		}
	},
	{
		id: "removePermissions",
		name: "Remove Permissions",
		description: "Remove permission groups from user",
		icon: "lucide:key-minus",
		color: "pink",
		category: "user-management",
		endpoint: {
			method: "DELETE",
			path: "/users/removePermissionGroupsFromUser",
			auth: "secure"
		}
	},
	{
		id: "getUserWithRole",
		name: "Get User with Role",
		description: "Get user with role and permissions",
		icon: "lucide:user-check",
		color: "cyan",
		category: "user-management",
		endpoint: {
			method: "GET",
			path: "/users/getUserWithRoleAndPermissions",
			auth: "secure"
		}
	},
	{
		id: "getUserPermissions",
		name: "Get User Permissions",
		description: "Get all user permissions",
		icon: "lucide:list-checks",
		color: "teal",
		category: "user-management",
		endpoint: {
			method: "GET",
			path: "/users/getUserPermissions",
			auth: "secure"
		}
	},
	{
		id: "inviteMember",
		name: "Invite Member",
		description: "Send invitation to join organization",
		icon: "lucide:user-plus",
		color: "emerald",
		category: "user-management",
		endpoint: {
			method: "POST",
			path: "/users/inviteMember",
			auth: "secure"
		}
	},
] as const;

export type UserNodeType = typeof USER_NODE_TYPES[number]["id"];


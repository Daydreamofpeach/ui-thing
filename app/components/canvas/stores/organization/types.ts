/**
 * Organization & View Types
 *
 * Defines multi-tenancy structures for organization-scoped canvases.
 * Each organization has a master canvas and multiple views with permissions.
 *
 * @phase Phase 4 - Multi-Tenancy
 * @created October 28, 2025
 */

import type { CanvasState } from "../core/types";

/**
 * Organization Context
 * Represents the multi-tenant scope for canvas state
 */
export interface OrganizationContext {
	organizationId: string
	organizationName?: string
	ownerId: string
	createdAt: number
	updatedAt: number
}

/**
 * View Definition
 * A view is a filtered/customized version of the master canvas
 */
export interface CanvasView {
	id: string
	name: string
	description?: string
	organizationId: string

	/** Master canvas or view */
	isMaster: boolean

	/** Parent view ID (if this is a sub-view) */
	parentViewId?: string

	/** Visible node IDs (null = all nodes visible) */
	visibleNodeIds?: string[]

	/** Hidden node IDs */
	hiddenNodeIds?: string[]

	/** Viewport override */
	viewportOverride?: {
		x: number
		y: number
		zoom: number
	}

	/** Permissions */
	permissions: ViewPermissions

	/** UI Customization */
	color?: string // Hex color for view layer overlay
	opacity?: number // Opacity percentage (0-100) for overlay

	/** Metadata */
	createdBy: string
	createdAt: number
	updatedAt: number
	lastAccessedAt?: number
}

/**
 * View Permissions
 * Controls who can access and modify views
 */
export interface ViewPermissions {
	/** Owner has full control */
	ownerId: string

	/** Admin user IDs (can edit view settings) */
	adminIds: string[]

	/** User group IDs with access */
	userGroupIds: string[]

	/** Individual user IDs with access */
	userIds: string[]

	/** Is public (anyone in org can view) */
	isPublic: boolean

	/** Access level */
	accessLevel: "read-only" | "read-write" | "full-control"

	/** Can users fork this view */
	allowFork: boolean
}

/**
 * View Access Check Result
 */
export interface ViewAccessResult {
	canView: boolean
	canEdit: boolean
	canDelete: boolean
	canShare: boolean
	canFork: boolean
	accessLevel: "none" | "read-only" | "read-write" | "full-control"
	reason?: string
}

/**
 * Organization Store State
 * Manages all canvases and views for an organization
 */
export interface OrganizationStoreState {
	context: OrganizationContext

	/** Master canvas (full state) */
	masterCanvas: CanvasState

	/** Views (filtered versions of master) */
	views: Map<string, CanvasView>

	/** Currently active view ID */
	activeViewId: string | null

	/** View cache (for performance) */
	viewCache: Map<string, CanvasState>
}

/**
 * View Filter Options
 * Used to filter nodes when rendering a view
 */
export interface ViewFilterOptions {
	/** Show only specific node types */
	nodeTypes?: string[]

	/** Show only nodes with specific tags */
	tags?: string[]

	/** Show only nodes matching search */
	searchQuery?: string

	/** Show only nodes in specific area */
	boundingBox?: {
		x: number
		y: number
		width: number
		height: number
	}
}

/**
 * User Group
 * Groups of users for permission management
 */
export interface UserGroup {
	id: string
	name: string
	description?: string
	organizationId: string
	userIds: string[]
	createdAt: number
	updatedAt: number
}

/**
 * View History Entry
 * Track changes to views for audit and undo
 */
export interface ViewHistoryEntry {
	timestamp: number
	userId: string
	action: "created" | "updated" | "deleted" | "shared" | "forked"
	changes?: any
	viewSnapshot?: Partial<CanvasView>
}

/**
 * Canvas State Management - Core Type Definitions
 *
 * These types define the shape of state stored in our centralized state management system.
 *
 * @phase Phase 1 - Foundation
 * @created October 28, 2025
 */

/**
 * Node State - Represents a single node in the canvas
 * Position is stored separately for immutability
 */
export interface NodeState {
	id: string
	type: string
	data: Record<string, any>
	style?: Record<string, any>
	draggable?: boolean
	selectable?: boolean
	hidden?: boolean
}

/**
 * Edge State - Represents a connection between two nodes
 */
export interface EdgeState {
	id: string
	source: string
	target: string
	sourceHandle?: string
	targetHandle?: string
	type?: string
	animated?: boolean
	animationType?: string
	animationSpeed?: string
	style?: Record<string, any>
	markerEnd?: any
	label?: string
}

/**
 * Position - Immutable 2D coordinates
 * Stored separately from NodeState to prevent accidental mutations
 */
export interface Position {
	x: number
	y: number
}

/**
 * Viewport State - Camera position and zoom level
 */
export interface ViewportState {
	x: number
	y: number
	zoom: number
}

/**
 * Complete Canvas State - All data needed to represent a canvas
 */
export interface CanvasState {
	nodes: Map<string, NodeState>
	edges: Map<string, EdgeState>
	positions: Map<string, Position> // IMMUTABLE - only changed by drag operations
	viewport: ViewportState
	organizationId: string
	viewId?: string
	name: string
}

/**
 * VueFlow-compatible Node - NodeState + Position merged for rendering
 */
export interface VueFlowNode extends NodeState {
	position: Position
}

/**
 * Store Mutation - Represents a single state change for undo/redo (future)
 */
export interface StoreMutation {
	type: "addNode" | "removeNode" | "updateNode" | "addEdge" | "removeEdge" | "updateEdge" | "lockPosition"
	timestamp: number
	data: any
}

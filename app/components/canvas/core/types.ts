import type { Ref } from "vue";

/**
 * Core Canvas Types
 * Shared type definitions for canvas components
 */

export interface CanvasNode {
	id: string
	type: string
	position: { x: number, y: number }
	positionAbsolute?: { x: number, y: number }
	data: any
	style?: any
	draggable?: boolean
	selectable?: boolean
	hidden?: boolean
}

export interface CanvasEdge {
	id: string
	source: string
	target: string
	sourceHandle?: string
	targetHandle?: string
	type?: string
	animated?: boolean
	animationType?: string
	animationSpeed?: string
	style?: any
	markerEnd?: any
	label?: string
}

export interface CanvasViewport {
	x: number
	y: number
	zoom: number
}

export interface NodeUpdateFunction {
	(nodeId: string, key: string, value: any): void
}

export interface CanvasProps {
	nodes: any[]
	edges: any[]
	nodeTypes: any
	minZoom?: number
	maxZoom?: number
	autoConnect?: boolean
	nodesDraggable?: boolean
	zoomOnScroll?: boolean
	panOnScroll?: boolean
	fitViewOnInit?: boolean
	zoomOnDoubleClick?: boolean
	zoomOnPinch?: boolean
}

export interface BaseCanvasEmits {
	connectionCreated: [edge: CanvasEdge]
	nodeClicked: [node: CanvasNode]
	edgeClicked: [edge: CanvasEdge]
	nodesChange: [changes: any[]]
	viewportChange: [viewport: CanvasViewport]
}

export interface HandlerContext {
	allNodes: Ref<any[]>
	edges: Ref<any[]>
	updateNodeData: NodeUpdateFunction
	getNodeFn: any
	addEdges: (edges: any[]) => void
	removeEdges: (edges: any[]) => void
	updateEdge: (edgeId: string, updates: any) => void
	emit?: any
}


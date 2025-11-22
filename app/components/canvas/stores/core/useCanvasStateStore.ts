/**
 * Canvas State Store - Central state management for canvas
 *
 * This is the foundation of our state management system.
 * Provides reactive state for nodes, edges, and positions.
 *
 * @phase Phase 1 - Foundation
 * @created October 28, 2025
 */

import type { EdgeState, NodeState, Position, ViewportState } from "./types";
import { computed, readonly, ref } from "vue";

/**
 * Global singleton store instance
 * Each canvas can have its own store, or share a global one
 */
let globalStoreInstance: ReturnType<typeof createCanvasStateStore> | null = null;

/**
 * Create a new canvas state store instance
 */
function createCanvasStateStore() {
	console.log("🏪 Creating new Canvas State Store instance");

	// ============================================================================
	// PRIVATE STATE (Encapsulated)
	// ============================================================================
	const _nodes = ref(new Map<string, NodeState>());
	const _edges = ref(new Map<string, EdgeState>());
	const _positions = ref(new Map<string, Position>());
	const _viewport = ref<ViewportState>({ x: 0, y: 0, zoom: 1 });
	const _canvasName = ref<string>("Untitled Canvas");
	const _organizationId = ref<string>("");
	const _viewId = ref<string | undefined>(undefined);

	// ============================================================================
	// COMPUTED ARRAYS (VueFlow Compatible)
	// ============================================================================

	/**
	 * Nodes array with positions merged - ready for VueFlow
	 * This is the primary way to consume node data in components
	 */
	const nodes = computed(() => {
		return Array.from(_nodes.value.values()).map((node) => ({
			...node,
			position: _positions.value.get(node.id) || { x: 0, y: 0 }
		}));
	});

	/**
	 * Edges array - ready for VueFlow
	 */
	const edges = computed(() => {
		return Array.from(_edges.value.values());
	});

	// ============================================================================
	// GETTERS (Direct Access)
	// ============================================================================

	/**
	 * Get a specific node by ID
	 */
	const getNode = (nodeId: string): NodeState | undefined => {
		return _nodes.value.get(nodeId);
	};

	/**
	 * Get a specific edge by ID
	 */
	const getEdge = (edgeId: string): EdgeState | undefined => {
		return _edges.value.get(edgeId);
	};

	/**
	 * Get a node's position
	 * Returns a copy to prevent external mutations
	 */
	const getPosition = (nodeId: string): Position | undefined => {
		const pos = _positions.value.get(nodeId);
		return pos ? { ...pos } : undefined;
	};

	/**
	 * Check if a node exists
	 */
	const hasNode = (nodeId: string): boolean => {
		return _nodes.value.has(nodeId);
	};

	/**
	 * Check if an edge exists
	 */
	const hasEdge = (edgeId: string): boolean => {
		return _edges.value.has(edgeId);
	};

	/**
	 * Get all node IDs
	 */
	const getNodeIds = (): string[] => {
		return Array.from(_nodes.value.keys());
	};

	/**
	 * Get all edge IDs
	 */
	const getEdgeIds = (): string[] => {
		return Array.from(_edges.value.keys());
	};

	// ============================================================================
	// MUTATIONS - Node Operations
	// ============================================================================

	/**
	 * Add a node to the canvas
	 * Position is required and will be locked immediately
	 */
	const addNode = (node: NodeState, position: Position) => {
		console.log("🏪 Store: Adding node:", node.id, "at", position);

		// Add to nodes map
		_nodes.value.set(node.id, node);

		// Lock position immediately to prevent drift
		_positions.value.set(node.id, { ...position });

		console.log("✅ Store: Node added successfully, total nodes:", _nodes.value.size);
	};

	/**
	 * Remove a node from the canvas
	 * Also removes its position
	 */
	const removeNode = (nodeId: string) => {
		console.log("🏪 Store: Removing node:", nodeId);

		const existed = _nodes.value.delete(nodeId);
		_positions.value.delete(nodeId);

		if (existed) {
			console.log("✅ Store: Node removed, remaining nodes:", _nodes.value.size);
		} else {
			console.warn("⚠️ Store: Node not found:", nodeId);
		}
	};

	/**
	 * Update node data (NEVER touches position)
	 * This is the safe way to update node properties
	 */
	const updateNodeData = (nodeId: string, key: string, value: any) => {
		const node = _nodes.value.get(nodeId);
		if (!node) {
			console.warn(`⚠️ Store: Cannot update - node ${nodeId} not found`);
			return;
		}

		console.log(`🏪 Store: Updating ${nodeId}.${key}`, typeof value === "object" ? "[object]" : value);

		// Create new node object with updated data
		const updatedNode: NodeState = {
			...node,
			data: {
				...node.data,
				[key]: value
			}
		};

		// Update in map (triggers reactivity)
		_nodes.value.set(nodeId, updatedNode);

		// Position is NEVER touched - it's immutable!
	};

	/**
	 * Update node position (use with caution - prefer lockPosition)
	 * This should only be called during drag operations
	 */
	const updateNodePosition = (nodeId: string, position: Position) => {
		console.log(`🏪 Store: Updating position for ${nodeId}:`, position);
		_positions.value.set(nodeId, { ...position });
	};

	/**
	 * Update node style
	 */
	const updateNodeStyle = (nodeId: string, style: Record<string, any>) => {
		const node = _nodes.value.get(nodeId);
		if (!node) return;

		_nodes.value.set(nodeId, {
			...node,
			style: {
				...node.style,
				...style
			}
		});
	};

	// ============================================================================
	// MUTATIONS - Edge Operations
	// ============================================================================

	/**
	 * Add an edge to the canvas
	 */
	const addEdge = (edge: EdgeState) => {
		console.log("🏪 Store: Adding edge:", edge.id);
		_edges.value.set(edge.id, edge);
		console.log("✅ Store: Edge added, total edges:", _edges.value.size);
	};

	/**
	 * Remove an edge from the canvas
	 */
	const removeEdge = (edgeId: string) => {
		console.log("🏪 Store: Removing edge:", edgeId);
		const existed = _edges.value.delete(edgeId);

		if (existed) {
			console.log("✅ Store: Edge removed, remaining edges:", _edges.value.size);
		} else {
			console.warn("⚠️ Store: Edge not found:", edgeId);
		}
	};

	/**
	 * Update edge properties
	 */
	const updateEdge = (edgeId: string, updates: Partial<EdgeState>) => {
		const edge = _edges.value.get(edgeId);
		if (!edge) {
			console.warn(`⚠️ Store: Cannot update - edge ${edgeId} not found`);
			return;
		}

		console.log(`🏪 Store: Updating edge ${edgeId}`, Object.keys(updates));

		_edges.value.set(edgeId, {
			...edge,
			...updates
		});
	};

	// ============================================================================
	// MUTATIONS - Viewport Operations
	// ============================================================================

	/**
	 * Update viewport (camera position and zoom)
	 */
	const updateViewport = (viewport: ViewportState) => {
		console.log("🏪 Store: Updating viewport:", viewport);
		_viewport.value = { ...viewport };
	};

	// ============================================================================
	// MUTATIONS - Canvas Metadata
	// ============================================================================

	/**
	 * Set canvas name
	 */
	const setCanvasName = (name: string) => {
		console.log("🏪 Store: Setting canvas name:", name);
		_canvasName.value = name;
	};

	/**
	 * Set organization ID
	 */
	const setOrganizationId = (orgId: string) => {
		console.log("🏪 Store: Setting organization ID:", orgId);
		_organizationId.value = orgId;
	};

	/**
	 * Set view ID
	 */
	const setViewId = (viewId: string | undefined) => {
		console.log("🏪 Store: Setting view ID:", viewId);
		_viewId.value = viewId;
	};

	// ============================================================================
	// BULK OPERATIONS
	// ============================================================================

	/**
	 * Clear all state (reset canvas)
	 */
	const clearAll = () => {
		console.log("🏪 Store: Clearing all state");
		_nodes.value.clear();
		_edges.value.clear();
		_positions.value.clear();
		_viewport.value = { x: 0, y: 0, zoom: 1 };
		console.log("✅ Store: All state cleared");
	};

	/**
	 * Load complete canvas state (for restoring saved canvases)
	 */
	const loadCanvasState = (state: {
		nodes: NodeState[]
		edges: EdgeState[]
		positions?: Map<string, Position>
		viewport?: ViewportState
		name?: string
		organizationId?: string
		viewId?: string
	}) => {
		console.log("🏪 Store: Loading canvas state");
		console.log("  Nodes to load:", state.nodes?.length || 0);
		console.log("  Edges to load:", state.edges?.length || 0);

		// Clear existing state
		clearAll();

		// Load nodes
		if (state.nodes) {
			state.nodes.forEach((node) => {
				_nodes.value.set(node.id, node);
			});
		}

		// Load edges
		if (state.edges) {
			state.edges.forEach((edge) => {
				_edges.value.set(edge.id, edge);
			});
		}

		// Load positions (if provided separately)
		if (state.positions) {
			state.positions.forEach((pos, nodeId) => {
				_positions.value.set(nodeId, { ...pos });
			});
		} else {
			// Extract positions from nodes if they have them
			state.nodes?.forEach((node: any) => {
				if (node.position) {
					_positions.value.set(node.id, { ...node.position });
				}
			});
		}

		// Load viewport
		if (state.viewport) {
			_viewport.value = { ...state.viewport };
		}

		// Load metadata
		if (state.name) {
			_canvasName.value = state.name;
		}
		if (state.organizationId) {
			_organizationId.value = state.organizationId;
		}
		if (state.viewId !== undefined) {
			_viewId.value = state.viewId;
		}

		console.log("✅ Store: Canvas state loaded successfully");
		console.log("  Total nodes:", _nodes.value.size);
		console.log("  Total edges:", _edges.value.size);
		console.log("  Total positions:", _positions.value.size);
	};

	/**
	 * Export current state (for saving/serialization)
	 */
	const exportState = () => {
		return {
			nodes: Array.from(_nodes.value.values()),
			edges: Array.from(_edges.value.values()),
			positions: new Map(_positions.value),
			viewport: { ..._viewport.value },
			name: _canvasName.value,
			organizationId: _organizationId.value,
			viewId: _viewId.value
		};
	};

	// ============================================================================
	// RETURN PUBLIC API
	// ============================================================================
	return {
		// State (read-only computed)
		nodes: readonly(nodes),
		edges: readonly(edges),
		viewport: readonly(_viewport),
		canvasName: readonly(_canvasName),
		organizationId: readonly(_organizationId),
		viewId: readonly(_viewId),

		// Getters
		getNode,
		getEdge,
		getPosition,
		hasNode,
		hasEdge,
		getNodeIds,
		getEdgeIds,

		// Node mutations
		addNode,
		removeNode,
		updateNodeData,
		updateNodePosition,
		updateNodeStyle,

		// Edge mutations
		addEdge,
		removeEdge,
		updateEdge,

		// Viewport mutations
		updateViewport,

		// Canvas metadata
		setCanvasName,
		setOrganizationId,
		setViewId,

		// Bulk operations
		clearAll,
		loadCanvasState,
		exportState
	};
}

/**
 * Use the global canvas state store (singleton pattern)
 * This ensures all components share the same state
 */
export function useCanvasStateStore() {
	if (!globalStoreInstance) {
		globalStoreInstance = createCanvasStateStore();
	}
	return globalStoreInstance;
}

/**
 * Create an isolated store instance (for testing or multiple canvases)
 */
export function createIsolatedCanvasStore() {
	return createCanvasStateStore();
}

/**
 * Reset the global store (useful for testing)
 */
export function resetGlobalStore() {
	console.log("🔄 Resetting global store instance");
	globalStoreInstance = null;
}

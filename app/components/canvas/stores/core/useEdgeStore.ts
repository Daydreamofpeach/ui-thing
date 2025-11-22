/**
 * Edge Store - Edge/Connection Management
 * 
 * This store handles all edge (connection) operations.
 * Edges are simpler than nodes as they don't have position drift issues.
 * 
 * @phase Phase 2 - Position Locking
 * @created October 28, 2025
 */

import { computed, readonly, ref } from "vue";
import type { EdgeState } from "./types";

export function useEdgeStore() {
	console.log("🔗 Initializing Edge Store");

	// ============================================================================
	// PRIVATE STATE
	// ============================================================================
	
	/** Edges map: edgeId → EdgeState */
	const _edges = ref(new Map<string, EdgeState>());

	// ============================================================================
	// COMPUTED ARRAYS
	// ============================================================================
	
	/**
	 * Edges array - ready for VueFlow
	 */
	const edgesArray = computed(() => {
		return Array.from(_edges.value.values());
	});

	/**
	 * Get edges connected to a specific node
	 */
	const getConnectedEdges = (nodeId: string) => {
		return computed(() => {
			return edgesArray.value.filter(
				(edge) => edge.source === nodeId || edge.target === nodeId
			);
		});
	};

	/**
	 * Get outgoing edges from a node
	 */
	const getOutgoingEdges = (nodeId: string) => {
		return computed(() => {
			return edgesArray.value.filter((edge) => edge.source === nodeId);
		});
	};

	/**
	 * Get incoming edges to a node
	 */
	const getIncomingEdges = (nodeId: string) => {
		return computed(() => {
			return edgesArray.value.filter((edge) => edge.target === nodeId);
		});
	};

	// ============================================================================
	// GETTERS
	// ============================================================================
	
	/**
	 * Get a specific edge by ID
	 */
	const getEdge = (edgeId: string): EdgeState | undefined => {
		return _edges.value.get(edgeId);
	};

	/**
	 * Check if an edge exists
	 */
	const hasEdge = (edgeId: string): boolean => {
		return _edges.value.has(edgeId);
	};

	/**
	 * Get all edge IDs
	 */
	const getEdgeIds = (): string[] => {
		return Array.from(_edges.value.keys());
	};

	/**
	 * Get edge count
	 */
	const getEdgeCount = (): number => {
		return _edges.value.size;
	};

	/**
	 * Check if two nodes are connected
	 */
	const areNodesConnected = (sourceId: string, targetId: string): boolean => {
		return edgesArray.value.some(
			(edge) => 
				(edge.source === sourceId && edge.target === targetId) ||
				(edge.source === targetId && edge.target === sourceId)
		);
	};

	/**
	 * Find edge between two nodes
	 */
	const findEdgeBetween = (sourceId: string, targetId: string): EdgeState | undefined => {
		return edgesArray.value.find(
			(edge) => edge.source === sourceId && edge.target === targetId
		);
	};

	// ============================================================================
	// MUTATIONS - Add Edge
	// ============================================================================
	
	/**
	 * Add an edge to the canvas
	 */
	const addEdge = (edge: EdgeState) => {
		console.log("🔗 EdgeStore: Adding edge:", edge.id);
		console.log("  Connection:", `${edge.source} → ${edge.target}`);
		
		// Validation
		if (_edges.value.has(edge.id)) {
			console.warn(`⚠️ Edge ${edge.id} already exists, skipping`);
			return;
		}

		// Add to map
		_edges.value.set(edge.id, edge);
		
		console.log("✅ EdgeStore: Edge added, total edges:", _edges.value.size);
	};

	/**
	 * Add multiple edges at once (batch operation)
	 */
	const addEdges = (edges: EdgeState[]) => {
		console.log(`🔗 EdgeStore: Batch adding ${edges.length} edges`);
		
		edges.forEach((edge) => {
			addEdge(edge);
		});
		
		console.log("✅ EdgeStore: Batch add complete");
	};

	// ============================================================================
	// MUTATIONS - Update Edge
	// ============================================================================
	
	/**
	 * Update edge properties
	 */
	const updateEdge = (edgeId: string, updates: Partial<EdgeState>) => {
		const edge = _edges.value.get(edgeId);
		if (!edge) {
			console.warn(`⚠️ EdgeStore: Cannot update - edge ${edgeId} not found`);
			return;
		}

		console.log(`📝 EdgeStore: Updating edge ${edgeId}`, Object.keys(updates));
		
		// Merge updates with existing edge
		const updatedEdge: EdgeState = {
			...edge,
			...updates,
			// Special handling for style object (merge, don't replace)
			style: updates.style ? {
				...edge.style,
				...updates.style
			} : edge.style
		};

		_edges.value.set(edgeId, updatedEdge);
		
		console.log("✅ EdgeStore: Edge updated");
	};

	/**
	 * Update edge style specifically
	 */
	const updateEdgeStyle = (edgeId: string, style: Record<string, any>) => {
		const edge = _edges.value.get(edgeId);
		if (!edge) return;

		console.log(`🎨 EdgeStore: Updating style for ${edgeId}`);

		_edges.value.set(edgeId, {
			...edge,
			style: {
				...edge.style,
				...style
			}
		});
	};

	/**
	 * Update multiple edges at once (for chain flow styling)
	 */
	const updateEdges = (updates: Array<{ edgeId: string, updates: Partial<EdgeState> }>) => {
		console.log(`📝 EdgeStore: Batch updating ${updates.length} edges`);
		
		updates.forEach(({ edgeId, updates: edgeUpdates }) => {
			updateEdge(edgeId, edgeUpdates);
		});
		
		console.log("✅ EdgeStore: Batch update complete");
	};

	// ============================================================================
	// MUTATIONS - Remove Edge
	// ============================================================================
	
	/**
	 * Remove an edge
	 */
	const removeEdge = (edgeId: string) => {
		console.log("🗑️ EdgeStore: Removing edge:", edgeId);
		
		const existed = _edges.value.delete(edgeId);
		
		if (existed) {
			console.log("✅ EdgeStore: Edge removed, remaining:", _edges.value.size);
		} else {
			console.warn("⚠️ EdgeStore: Edge not found:", edgeId);
		}
	};

	/**
	 * Remove multiple edges (batch operation)
	 */
	const removeEdges = (edgeIds: string[]) => {
		console.log(`🗑️ EdgeStore: Batch removing ${edgeIds.length} edges`);
		
		edgeIds.forEach((edgeId) => {
			removeEdge(edgeId);
		});
		
		console.log("✅ EdgeStore: Batch remove complete");
	};

	/**
	 * Remove all edges connected to a node
	 * Called automatically when a node is deleted
	 */
	const removeEdgesForNode = (nodeId: string) => {
		console.log(`🗑️ EdgeStore: Removing all edges for node ${nodeId}`);
		
		const edgesToRemove: string[] = [];
		
		_edges.value.forEach((edge) => {
			if (edge.source === nodeId || edge.target === nodeId) {
				edgesToRemove.push(edge.id);
			}
		});

		if (edgesToRemove.length > 0) {
			removeEdges(edgesToRemove);
			console.log(`✅ EdgeStore: Removed ${edgesToRemove.length} connected edges`);
		} else {
			console.log("ℹ️ EdgeStore: No edges connected to node");
		}
	};

	// ============================================================================
	// BULK OPERATIONS
	// ============================================================================
	
	/**
	 * Clear all edges
	 */
	const clearAll = () => {
		console.log("🧹 EdgeStore: Clearing all edges");
		_edges.value.clear();
		console.log("✅ EdgeStore: All edges cleared");
	};

	/**
	 * Load edges from saved state
	 */
	const loadEdges = (edges: EdgeState[]) => {
		console.log(`📥 EdgeStore: Loading ${edges.length} edges`);
		
		// Clear existing
		clearAll();
		
		// Add each edge
		edges.forEach((edge) => {
			_edges.value.set(edge.id, edge);
		});

		console.log("✅ EdgeStore: Edges loaded");
	};

	// ============================================================================
	// STATISTICS
	// ============================================================================
	
	/**
	 * Get statistics for debugging
	 */
	const getStats = () => {
		return {
			totalEdges: _edges.value.size,
			animatedEdges: edgesArray.value.filter((e) => e.animated).length,
			edgeTypes: new Set(edgesArray.value.map((e) => e.type || "default")).size
		};
	};

	// ============================================================================
	// RETURN PUBLIC API
	// ============================================================================
	return {
		// State (read-only)
		edges: readonly(edgesArray),

		// Computed queries
		getConnectedEdges,
		getOutgoingEdges,
		getIncomingEdges,

		// Getters
		getEdge,
		hasEdge,
		getEdgeIds,
		getEdgeCount,
		areNodesConnected,
		findEdgeBetween,

		// Add operations
		addEdge,
		addEdges,

		// Update operations
		updateEdge,
		updateEdgeStyle,
		updateEdges,

		// Remove operations
		removeEdge,
		removeEdges,
		removeEdgesForNode,

		// Bulk operations
		clearAll,
		loadEdges,

		// Statistics
		getStats
	};
}


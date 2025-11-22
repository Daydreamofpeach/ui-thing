/**
 * Node Store - Node Operations with Position Protection
 * 
 * This store handles all node CRUD operations while ensuring positions are NEVER
 * accidentally modified during data updates.
 * 
 * CRITICAL: This store uses usePositionStore internally to guarantee position immutability.
 * 
 * @phase Phase 2 - Position Locking
 * @created October 28, 2025
 */

import { computed, readonly, ref } from "vue";
import type { NodeState, Position, VueFlowNode } from "./types";
import { usePositionStore } from "./usePositionStore";

export function useNodeStore() {
	console.log("📦 Initializing Node Store with Position Protection");

	// ============================================================================
	// PRIVATE STATE
	// ============================================================================
	
	/** Nodes map: nodeId → NodeState (WITHOUT position) */
	const _nodes = ref(new Map<string, NodeState>());
	
	/** Position store (separate for immutability) */
	const positionStore = usePositionStore();

	// ============================================================================
	// COMPUTED ARRAYS (VueFlow Compatible)
	// ============================================================================
	
	/**
	 * Nodes array with positions merged
	 * This is the primary way components consume node data
	 * VueFlow requires nodes with position property
	 */
	const nodesArray = computed<VueFlowNode[]>(() => {
		return Array.from(_nodes.value.values()).map((node) => ({
			...node,
			position: positionStore.getPosition(node.id) || { x: 0, y: 0 }
		}));
	});

	/**
	 * Get nodes by type (useful for filtering)
	 */
	const getNodesByType = (nodeType: string) => {
		return computed(() => {
			return nodesArray.value.filter((node) => node.type === nodeType);
		});
	};

	// ============================================================================
	// GETTERS
	// ============================================================================
	
	/**
	 * Get a specific node by ID
	 * Returns NodeState WITHOUT position (use getNodeWithPosition for full data)
	 */
	const getNode = (nodeId: string): NodeState | undefined => {
		return _nodes.value.get(nodeId);
	};

	/**
	 * Get a node WITH its position merged (VueFlow format)
	 */
	const getNodeWithPosition = (nodeId: string): VueFlowNode | undefined => {
		const node = _nodes.value.get(nodeId);
		if (!node) return undefined;

		return {
			...node,
			position: positionStore.getPosition(nodeId) || { x: 0, y: 0 }
		};
	};

	/**
	 * Check if a node exists
	 */
	const hasNode = (nodeId: string): boolean => {
		return _nodes.value.has(nodeId);
	};

	/**
	 * Get all node IDs
	 */
	const getNodeIds = (): string[] => {
		return Array.from(_nodes.value.keys());
	};

	/**
	 * Get node count
	 */
	const getNodeCount = (): number => {
		return _nodes.value.size;
	};

	// ============================================================================
	// MUTATIONS - Add Node
	// ============================================================================
	
	/**
	 * Add a node with position locking
	 * This is the ONLY safe way to add nodes - position is locked immediately
	 */
	const addNode = (node: NodeState, position: Position) => {
		console.log("📦 NodeStore: Adding node:", node.id);
		console.log("  Type:", node.type);
		console.log("  Position:", position);
		
		// Validation
		if (_nodes.value.has(node.id)) {
			console.warn(`⚠️ Node ${node.id} already exists, skipping`);
			return;
		}

		// Add to nodes map
		_nodes.value.set(node.id, node);
		
		// CRITICAL: Lock position immediately
		positionStore.lockPosition(node.id, position);
		
		console.log("✅ NodeStore: Node added with locked position");
		console.log("  Total nodes:", _nodes.value.size);
		console.log("  Position locked:", positionStore.isLocked(node.id));
	};

	/**
	 * Add multiple nodes at once (batch operation)
	 */
	const addNodes = (nodes: Array<{ node: NodeState, position: Position }>) => {
		console.log(`📦 NodeStore: Batch adding ${nodes.length} nodes`);
		
		nodes.forEach(({ node, position }) => {
			addNode(node, position);
		});
		
		console.log("✅ NodeStore: Batch add complete");
	};

	// ============================================================================
	// MUTATIONS - Update Node
	// ============================================================================
	
	/**
	 * Update node data (NEVER touches position)
	 * This is the safe way to update node properties
	 * Position remains locked and unchanged
	 */
	const updateNodeData = (nodeId: string, updates: Partial<NodeState["data"]>) => {
		const node = _nodes.value.get(nodeId);
		if (!node) {
			console.warn(`⚠️ NodeStore: Cannot update - node ${nodeId} not found`);
			return;
		}

		console.log(`📝 NodeStore: Updating ${nodeId}`, Object.keys(updates));
		
		// Create new node with updated data
		const updatedNode: NodeState = {
			...node,
			data: {
				...node.data,
				...updates
			}
		};

		// Update in map (triggers reactivity)
		_nodes.value.set(nodeId, updatedNode);
		
		// CRITICAL: Position is NEVER touched!
		// Position remains in positionStore, locked and immutable
		
		console.log("✅ NodeStore: Data updated, position preserved");
	};

	/**
	 * Update node style (NEVER touches position)
	 */
	const updateNodeStyle = (nodeId: string, style: Record<string, any>) => {
		const node = _nodes.value.get(nodeId);
		if (!node) return;

		console.log(`🎨 NodeStore: Updating style for ${nodeId}`);

		_nodes.value.set(nodeId, {
			...node,
			style: {
				...node.style,
				...style
			}
		});
	};

	/**
	 * Update entire node (advanced - use with caution)
	 * Still doesn't touch position
	 */
	const updateNode = (nodeId: string, updates: Partial<NodeState>) => {
		const node = _nodes.value.get(nodeId);
		if (!node) return;

		console.log(`🔧 NodeStore: Full update for ${nodeId}`);

		_nodes.value.set(nodeId, {
			...node,
			...updates,
			// Ensure data is merged, not replaced
			data: {
				...node.data,
				...updates.data
			}
		});
	};

	// ============================================================================
	// MUTATIONS - Position Updates (Drag Only)
	// ============================================================================
	
	/**
	 * Handle drag start - unlock position for dragging
	 */
	const handleDragStart = (nodeId: string) => {
		console.log(`🎯 NodeStore: Drag started for ${nodeId}`);
		positionStore.unlock(nodeId);
	};

	/**
	 * Handle drag end - update and re-lock position
	 */
	const handleDragEnd = (nodeId: string, newPosition: Position) => {
		console.log(`🎯 NodeStore: Drag ended for ${nodeId} at`, newPosition);
		
		// Update position (now unlocked, so it will succeed)
		positionStore.updatePosition(nodeId, newPosition);
		
		// Re-lock immediately
		positionStore.lockPosition(nodeId, newPosition);
		
		console.log("✅ NodeStore: Position updated and re-locked");
	};

	// ============================================================================
	// MUTATIONS - Remove Node
	// ============================================================================
	
	/**
	 * Remove a node
	 * Also removes its position from position store
	 */
	const removeNode = (nodeId: string) => {
		console.log("🗑️ NodeStore: Removing node:", nodeId);
		
		const existed = _nodes.value.delete(nodeId);
		
		if (existed) {
			// Remove position as well
			positionStore.removePosition(nodeId);
			console.log("✅ NodeStore: Node removed, remaining:", _nodes.value.size);
		} else {
			console.warn("⚠️ NodeStore: Node not found:", nodeId);
		}
	};

	/**
	 * Remove multiple nodes (batch operation)
	 */
	const removeNodes = (nodeIds: string[]) => {
		console.log(`🗑️ NodeStore: Batch removing ${nodeIds.length} nodes`);
		
		nodeIds.forEach((nodeId) => {
			removeNode(nodeId);
		});
		
		console.log("✅ NodeStore: Batch remove complete");
	};

	// ============================================================================
	// BULK OPERATIONS
	// ============================================================================
	
	/**
	 * Clear all nodes
	 */
	const clearAll = () => {
		console.log("🧹 NodeStore: Clearing all nodes");
		_nodes.value.clear();
		positionStore.clearAll();
		console.log("✅ NodeStore: All nodes cleared");
	};

	/**
	 * Load nodes from saved state
	 */
	const loadNodes = (nodes: Array<NodeState | VueFlowNode>) => {
		console.log(`📥 NodeStore: Loading ${nodes.length} nodes`);
		
		// Clear existing
		clearAll();
		
		// Add each node with its position
		nodes.forEach((node: any) => {
			// Extract position if it exists
			const position = node.position || { x: 0, y: 0 };
			
			// Create clean NodeState (without position)
			const nodeState: NodeState = {
				id: node.id,
				type: node.type,
				data: node.data || {},
				style: node.style,
				draggable: node.draggable,
				selectable: node.selectable,
				hidden: node.hidden
			};

			// Add with position locking
			addNode(nodeState, position);
		});

		console.log("✅ NodeStore: Nodes loaded with locked positions");
	};

	// ============================================================================
	// STATISTICS & DEBUGGING
	// ============================================================================
	
	/**
	 * Get store statistics
	 */
	const getStats = () => {
		const positionStats = positionStore.getStats();
		
		return {
			totalNodes: _nodes.value.size,
			...positionStats
		};
	};

	/**
	 * Get detailed info for debugging
	 */
	const getDebugInfo = () => {
		return {
			stats: getStats(),
			nodeIds: getNodeIds(),
			positions: Array.from(positionStore.positions.value.entries()),
			nodes: Array.from(_nodes.value.entries())
		};
	};

	// ============================================================================
	// RETURN PUBLIC API
	// ============================================================================
	return {
		// State (read-only)
		nodes: readonly(nodesArray),

		// Getters
		getNode,
		getNodeWithPosition,
		hasNode,
		getNodeIds,
		getNodeCount,
		getNodesByType,

		// Add operations
		addNode,
		addNodes,

		// Update operations (data only - never position)
		updateNodeData,
		updateNodeStyle,
		updateNode,

		// Drag operations
		handleDragStart,
		handleDragEnd,

		// Remove operations
		removeNode,
		removeNodes,

		// Bulk operations
		clearAll,
		loadNodes,

		// Position store access (for advanced usage)
		positionStore,

		// Statistics
		getStats,
		getDebugInfo
	};
}


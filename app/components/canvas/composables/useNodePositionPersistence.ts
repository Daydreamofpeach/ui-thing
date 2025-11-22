import type { Ref } from "vue";
import { ref } from "vue";
import { useCanvasViews } from "./useCanvasViews";

export interface NodePosition {
	x: number
	y: number
}

export interface PersistedNode {
	id: string
	position: NodePosition
	positionAbsolute?: NodePosition
}

/**
 * Composable for handling exact node position persistence
 * Ensures positions are saved to and loaded from API with perfect accuracy
 */
export function useNodePositionPersistence() {
	const { saveCanvas: saveCanvasToApi, currentCanvasId } = useCanvasViews();

	// Store exact positions for all nodes (source of truth)
	const nodePositionLock = ref<Map<string, NodePosition>>(new Map());

	// Track if we're currently saving to prevent race conditions
	let isSaving = false;

	/**
	 * Lock a node's position in the position map
	 */
	const lockNodePosition = (nodeId: string, position: NodePosition) => {
		const exactPos = {
			x: Number(position.x),
			y: Number(position.y)
		};
		nodePositionLock.value.set(nodeId, exactPos);
		console.log(`🔒 Locked position for ${nodeId}: (${exactPos.x}, ${exactPos.y})`);
		return exactPos;
	};

	/**
	 * Lock all node positions
	 */
	const lockAllNodePositions = (nodes: any[]) => {
		console.log("🔒 Locking all node positions...");
		nodes.forEach((node) => {
			if (node.position) {
				lockNodePosition(node.id, node.position);
			}
		});
	};

	/**
	 * Get locked position for a node
	 */
	const getLockedPosition = (nodeId: string): NodePosition | undefined => {
		return nodePositionLock.value.get(nodeId);
	};

	/**
	 * Clear all locked positions
	 */
	const clearPositionLocks = () => {
		console.log("🗑️ Clearing all position locks");
		nodePositionLock.value.clear();
	};

	/**
	 * Restore exact positions to nodes from the lock
	 */
	const restoreLockedPositions = (nodes: any[]) => {
		console.log("🔄 Restoring locked positions...");
		let restored = 0;

		nodes.forEach((node) => {
			const lockedPos = nodePositionLock.value.get(node.id);
			if (lockedPos && node.position) {
				// Only restore if position has drifted
				if (node.position.x !== lockedPos.x || node.position.y !== lockedPos.y) {
					node.position = { x: lockedPos.x, y: lockedPos.y };
					node.positionAbsolute = { x: lockedPos.x, y: lockedPos.y };
					restored++;
					console.log(`  ✅ Restored ${node.id}: (${lockedPos.x}, ${lockedPos.y})`);
				}
			}
		});

		if (restored > 0) {
			console.log(`✅ Restored ${restored} node positions`);
		}
	};

	/**
	 * Load nodes with exact positions from API data
	 */
	const loadNodesWithExactPositions = (apiNodes: any[]): any[] => {
		console.log("📥 Loading nodes with exact positions from API");

		return apiNodes.map((node) => {
			if (node.position) {
				// Parse exact numeric coordinates
				const exactX = Number(node.position.x);
				const exactY = Number(node.position.y);

				// Set exact positions
				node.position = { x: exactX, y: exactY };
				node.positionAbsolute = { x: exactX, y: exactY };

				// Lock the position immediately
				lockNodePosition(node.id, { x: exactX, y: exactY });

				// Ensure draggable properties
				node.draggable = true;
				node.selectable = true;
				node.resizable = true;
			}

			return node;
		});
	};

	/**
	 * Create snapshot of all current node positions
	 */
	const createPositionSnapshot = (nodes: any[]): Map<string, NodePosition> => {
		const snapshot = new Map<string, NodePosition>();

		nodes.forEach((node) => {
			if (node.position) {
				snapshot.set(node.id, {
					x: node.position.x,
					y: node.position.y
				});
			}
		});

		console.log(`📸 Created position snapshot of ${snapshot.size} nodes`);
		return snapshot;
	};

	/**
	 * Restore positions from a snapshot
	 */
	const restoreFromSnapshot = (nodes: any[], snapshot: Map<string, NodePosition>) => {
		console.log("🔄 Restoring positions from snapshot...");
		let restored = 0;

		nodes.forEach((node) => {
			const snapPos = snapshot.get(node.id);
			if (snapPos && node.position) {
				node.position = { x: snapPos.x, y: snapPos.y };
				node.positionAbsolute = { x: snapPos.x, y: snapPos.y };
				restored++;
			}
		});

		console.log(`✅ Restored ${restored} positions from snapshot`);
	};

	/**
	 * Save all node positions to API immediately
	 */
	const savePositionsToApi = async (
		nodes: any[],
		edges: any[],
		viewport: any
	): Promise<boolean> => {
		// Don't save if no canvas is loaded yet
		if (!currentCanvasId.value) {
			console.log("⏭️ No canvas loaded yet, skipping save...");
			return false;
		}

		// Prevent concurrent saves
		if (isSaving) {
			console.log("⏳ Save already in progress, skipping...");
			return false;
		}

		isSaving = true;

		try {
			console.log("💾 Saving canvas", currentCanvasId.value, "with exact positions...");

			// Lock all current positions before save
			lockAllNodePositions(nodes);

			// Save to API
			const savedCanvas = await saveCanvasToApi(nodes, edges, viewport);

			if (savedCanvas) {
				console.log("✅ Canvas saved to API successfully");

				// Verify saved positions match locked positions
				console.log("🔍 Verifying saved positions:");
				savedCanvas.nodes.forEach((savedNode: any) => {
					const locked = nodePositionLock.value.get(savedNode.id);
					if (locked) {
						const matches = savedNode.position.x === locked.x
							&& savedNode.position.y === locked.y;
						console.log(
							`  ${matches ? "✅" : "❌"} ${savedNode.id}: (${savedNode.position.x}, ${savedNode.position.y})`
						);
					}
				});

				return true;
			}

			return false;
		} catch (error) {
			console.error("❌ Failed to save positions:", error);
			return false;
		} finally {
			isSaving = false;
		}
	};

	/**
	 * Handle node drag stop - save immediately
	 */
	const handleNodeDragStop = async (
		draggedNode: any,
		allNodes: any[],
		allEdges: any[],
		viewport: any
	) => {
		if (!draggedNode || !draggedNode.position) return;

		console.log("📍 Node drag stopped:", draggedNode.id);

		// Lock the new position
		lockNodePosition(draggedNode.id, draggedNode.position);

		// Save immediately to API
		await savePositionsToApi(allNodes, allEdges, viewport);
	};

	/**
	 * Add new node and ensure existing positions don't change
	 */
	const addNodeWithPositionProtection = async (
		newNode: any,
		allNodes: Ref<any[]>,
		allEdges: Ref<any[]>,
		viewport: any
	): Promise<void> => {
		console.log("➕ Adding node with position protection");

		// Step 1: Create snapshot of ALL existing positions
		const existingNodes = allNodes.value.filter((n) => n.id !== newNode.id);
		const snapshot = createPositionSnapshot(existingNodes);

		// Step 2: The new node is already added by this point
		// Lock its position
		if (newNode.position) {
			lockNodePosition(newNode.id, newNode.position);
		}

		// Step 3: Restore ALL existing positions from snapshot
		restoreFromSnapshot(allNodes.value, snapshot);

		// Step 4: Save everything to API immediately
		await savePositionsToApi(allNodes.value, allEdges.value, viewport);
	};

	/**
	 * Initialize position tracking for existing nodes
	 */
	const initializePositionTracking = (nodes: any[]) => {
		console.log("🎬 Initializing position tracking for", nodes.length, "nodes");
		clearPositionLocks();
		lockAllNodePositions(nodes);
	};

	/**
	 * Verify all positions match locked positions
	 */
	const verifyAllPositions = (nodes: any[]): boolean => {
		console.log("🔍 Verifying all node positions...");
		let allMatch = true;

		nodes.forEach((node) => {
			const locked = nodePositionLock.value.get(node.id);
			if (locked && node.position) {
				const matches = node.position.x === locked.x
					&& node.position.y === locked.y;
				if (!matches) {
					console.error(`❌ Position mismatch for ${node.id}:`, {
						current: node.position,
						locked
					});
					allMatch = false;
				}
			}
		});

		if (allMatch) {
			console.log("✅ All positions verified successfully");
		}

		return allMatch;
	};

	return {
		// State
		nodePositionLock,

		// Methods
		lockNodePosition,
		lockAllNodePositions,
		getLockedPosition,
		clearPositionLocks,
		restoreLockedPositions,
		loadNodesWithExactPositions,
		createPositionSnapshot,
		restoreFromSnapshot,
		savePositionsToApi,
		handleNodeDragStop,
		addNodeWithPositionProtection,
		initializePositionTracking,
		verifyAllPositions
	};
}

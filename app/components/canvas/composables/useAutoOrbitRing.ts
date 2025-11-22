/**
 * Composable for automatically managing orbit rings for node chains
 * When a template chain is created in a project canvas, it automatically
 * creates an orbit ring and attaches all nodes in the chain to it
 */

import { ref, computed } from "vue";
import type { Ref } from "vue";

export interface AutoOrbitConfig {
	chainNodeIds: string[]; // IDs of nodes in the template chain
	chainName: string; // Name of the chain (e.g., "Git Clone", "Setup Project")
	chainType: string; // Type of chain (e.g., "gitClone", "setupWorkflow")
	projectNodeId: string; // ID of the project node that owns this orbit
	sourceNodeData?: any; // Any data from the source node
}

export interface OrbitRingHandlers {
	createOrbitNode?: (data: any) => string;
	addEdge?: (source: string, target: string) => void;
	updateNodeData?: (nodeId: string, key: string, value: any) => void;
}

export function useAutoOrbitRing() {
	const isAttaching = ref(false);
	const attachError = ref<string | null>(null);
	const createdOrbitId = ref<string | null>(null);
	const attachedNodeIds = ref<string[]>([]);

	/**
	 * Automatically create an orbit ring and attach all nodes from a chain
	 * Call this when a template chain is created in the project canvas
	 */
	const attachChainToOrbit = async (
		config: AutoOrbitConfig,
		handlers: OrbitRingHandlers
	) => {
		isAttaching.value = true;
		attachError.value = null;
		attachedNodeIds.value = [];

		try {
			console.log("═══════════════════════════════════════════");
			console.log("🎯 Auto-Attaching Chain to Orbit Ring");
			console.log("  Chain Name:", config.chainName);
			console.log("  Chain Type:", config.chainType);
			console.log("  Project Node:", config.projectNodeId);
			console.log("  Chain Nodes:", config.chainNodeIds.length);
			console.log("═══════════════════════════════════════════");

			if (!handlers.createOrbitNode) {
				throw new Error("createOrbitNode handler is required");
			}

			if (config.chainNodeIds.length === 0) {
				throw new Error("No nodes in chain to attach");
			}

			// Create a new orbit ring for this chain
			const orbitNodeData = {
				label: `${config.chainName} Orbit`,
				type: "orbitCardNode",
				chainName: config.chainName,
				chainType: config.chainType,
				projectNodeId: config.projectNodeId,
				attachedChainNodes: config.chainNodeIds,
				...config.sourceNodeData
			};

			const orbitNodeId = handlers.createOrbitNode(orbitNodeData);
			createdOrbitId.value = orbitNodeId;

			console.log("✅ Orbit ring created:", orbitNodeId);

			// Attach all nodes in the chain to this orbit ring
			if (handlers.addEdge) {
				for (const chainNodeId of config.chainNodeIds) {
					try {
						handlers.addEdge(orbitNodeId, chainNodeId);
						attachedNodeIds.value.push(chainNodeId);
						console.log(`✅ Attached node to orbit:`, chainNodeId);
					} catch (err) {
						console.warn(`⚠️ Could not attach node ${chainNodeId}:`, err);
					}
				}
			}

			// Update the orbit node data to mark all nodes as attached
			if (handlers.updateNodeData && orbitNodeId) {
				try {
					handlers.updateNodeData(orbitNodeId, "attachedChainNodes", attachedNodeIds.value);
					console.log("✅ Updated orbit node with attached nodes");
				} catch (err) {
					console.warn("⚠️ Could not update orbit node data:", err);
				}
			}

			console.log("═══════════════════════════════════════════");
			console.log("✅ Chain successfully attached to orbit ring");
			console.log("═══════════════════════════════════════════");

			return {
				success: true,
				orbitNodeId,
				attachedCount: attachedNodeIds.value.length
			};
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Unknown error";
			attachError.value = errorMsg;
			console.error("❌ Error attaching chain to orbit:", errorMsg);
			throw error;
		} finally {
			isAttaching.value = false;
		}
	};

	/**
	 * Get the orbit ID for a specific chain type in a project
	 * Useful for finding which orbit ring a new node should join
	 */
	const getOrbitForChain = (
		chainType: string,
		projectNodeId: string,
		allNodes: any[]
	): string | null => {
		const orbitNode = allNodes.find(
			(node) =>
				node.type === "orbitCardNode" &&
				node.data?.chainType === chainType &&
				node.data?.projectNodeId === projectNodeId
		);

		return orbitNode?.id || null;
	};

	/**
	 * Add a node to an existing orbit ring
	 * Called when a new node is created that should join an existing chain
	 */
	const addNodeToExistingOrbit = async (
		orbitNodeId: string,
		newNodeId: string,
		handlers: OrbitRingHandlers
	) => {
		try {
			if (handlers.addEdge) {
				handlers.addEdge(orbitNodeId, newNodeId);
				console.log(`✅ Added node ${newNodeId} to orbit ${orbitNodeId}`);
			}

			if (handlers.updateNodeData && orbitNodeId) {
				// Get current attached nodes and add the new one
				const currentAttached = attachedNodeIds.value;
				if (!currentAttached.includes(newNodeId)) {
					currentAttached.push(newNodeId);
					handlers.updateNodeData(orbitNodeId, "attachedChainNodes", currentAttached);
					attachedNodeIds.value = currentAttached;
				}
			}

			return { success: true };
		} catch (error) {
			console.error("❌ Error adding node to orbit:", error);
			throw error;
		}
	};

	/**
	 * Clear attachment state
	 */
	const clearAttachmentState = () => {
		isAttaching.value = false;
		attachError.value = null;
		createdOrbitId.value = null;
		attachedNodeIds.value = [];
	};

	return {
		// State
		isAttaching: computed(() => isAttaching.value),
		attachError: computed(() => attachError.value),
		createdOrbitId: computed(() => createdOrbitId.value),
		attachedNodeIds: computed(() => attachedNodeIds.value),

		// Methods
		attachChainToOrbit,
		getOrbitForChain,
		addNodeToExistingOrbit,
		clearAttachmentState
	};
}


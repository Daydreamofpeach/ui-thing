/**
 * Generic, reusable composable for linking any node to orbits
 * Works with any node type that has cloneable/linkable data
 */

import { ref, computed } from "vue";
import type { Ref } from "vue";

export interface LinkableData {
	name: string;
	url?: string;
	path?: string;
	[key: string]: any;
}

export interface OrbitLinkingConfig {
	items: LinkableData[];
	sourceNodeId: string;
	sourceNodeType?: string;
	sourceData?: any;
}

export interface OrbitLinkingHandlers {
	createOrbitNode?: (data: any) => string;
	createChildNode?: (parentId: string, data: any) => string;
	addEdge?: (source: string, target: string) => void;
}

export function useNodeOrbitLinking() {
	const isLinking = ref(false);
	const linkError = ref<string | null>(null);
	const linkedOrbitNodeId = ref<string | null>(null);
	const linkingProgress = ref<number>(0); // 0-100

	/**
	 * Generic method to link any node's data to an orbit
	 * @param config - Configuration containing items to link
	 * @param handlers - Handler functions for creating nodes and edges
	 * @param orbitType - Type of orbit to create (default: "orbitCardNode")
	 * @param childNodeType - Type of child nodes to create (default: "taskNode")
	 */
	const linkToOrbit = async (
		config: OrbitLinkingConfig,
		handlers: OrbitLinkingHandlers,
		orbitType: string = "orbitCardNode",
		childNodeType: string = "taskNode"
	) => {
		isLinking.value = true;
		linkError.value = null;
		linkingProgress.value = 0;

		try {
			console.log("═══════════════════════════════════════════");
			console.log("🔗 Linking Node to Orbit");
			console.log("  Source Node:", config.sourceNodeId);
			console.log("  Node Type:", config.sourceNodeType);
			console.log("  Items to Link:", config.items.length);
			console.log("═══════════════════════════════════════════");

			if (!handlers.createOrbitNode) {
				throw new Error("createOrbitNode handler is required");
			}

			if (config.items.length === 0) {
				throw new Error("No items to link");
			}

			// Progress: 10% for starting
			linkingProgress.value = 10;

			// Create orbit node
			const orbitNodeData = {
				label: `${config.items[0].name} Orbit`,
				type: orbitType,
				items: config.items,
				sourceNodeId: config.sourceNodeId,
				sourceNodeType: config.sourceNodeType,
				...config.sourceData
			};

			const orbitNodeId = handlers.createOrbitNode(orbitNodeData);
			linkedOrbitNodeId.value = orbitNodeId;

			console.log("✅ Orbit node created:", orbitNodeId);

			// Progress: 30% after orbit creation
			linkingProgress.value = 30;

			// Create child nodes for each item (if handler exists)
			if (handlers.createChildNode) {
				const itemsPerNode = Math.max(1, Math.floor(60 / config.items.length));

				for (let i = 0; i < config.items.length; i++) {
					const item = config.items[i];

					const childNodeData = {
						title: item.name,
						description: `Child node for ${item.name}`,
						sourceItem: item,
						sourceNodeId: config.sourceNodeId,
						...item
					};

					const childNodeId = handlers.createChildNode(orbitNodeId, childNodeData);

					if (handlers.addEdge) {
						handlers.addEdge(orbitNodeId, childNodeId);
					}

					console.log(`✅ Child node created for ${item.name}:`, childNodeId);

					// Update progress
					linkingProgress.value = 30 + (itemsPerNode * (i + 1));
				}
			}

			// Progress: 100% for completion
			linkingProgress.value = 100;

			console.log("═══════════════════════════════════════════");
			console.log("✅ Node successfully linked to orbit");
			console.log("═══════════════════════════════════════════");

			return {
				success: true,
				orbitNodeId,
				itemCount: config.items.length
			};
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "Unknown error";
			linkError.value = errorMsg;
			console.error("❌ Error linking to orbit:", errorMsg);
			throw error;
		} finally {
			isLinking.value = false;
		}
	};

	/**
	 * Clear linking state
	 */
	const clearLinkingState = () => {
		isLinking.value = false;
		linkError.value = null;
		linkedOrbitNodeId.value = null;
		linkingProgress.value = 0;
	};

	return {
		// State
		isLinking: computed(() => isLinking.value),
		linkError: computed(() => linkError.value),
		linkedOrbitNodeId: computed(() => linkedOrbitNodeId.value),
		linkingProgress: computed(() => linkingProgress.value),

		// Methods
		linkToOrbit,
		clearLinkingState
	};
}


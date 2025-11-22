import type { Ref } from "vue";

/**
 * Oscar Integration Handlers
 * Handles Oscar AI assistant canvas integration events
 */
export function useOscarHandlers(
	allNodes: Ref<any[]>,
	getNodeFn: any,
	vueFlowSetViewport: any,
	updateNodeData: (nodeId: string, key: string, value: any) => void,
	handleNodeUpdated: (nodeId: string, data: any) => void
) {
	/**
	 * Handle Oscar pan to node request
	 */
	const handleOscarPanToNode = (event: CustomEvent) => {
		const { nodeId } = event.detail;
		console.log("👁️ Oscar requested pan to node:", nodeId);

		const node = getNodeFn.value(nodeId);
		if (node) {
			// Center on the node with animation
			vueFlowSetViewport({
				x: -node.position.x + window.innerWidth / 2 - (node.dimensions?.width || 300) / 2,
				y: -node.position.y + window.innerHeight / 2 - (node.dimensions?.height || 200) / 2,
				zoom: 0.8
			}, { duration: 600 });

			// Highlight the node briefly by updating its data
			updateNodeData(nodeId, "highlighted", true);
			setTimeout(() => {
				updateNodeData(nodeId, "highlighted", false);
			}, 1500);
		}
	};

	/**
	 * Handle Oscar node data update
	 */
	const handleOscarUpdateNodeData = (event: CustomEvent) => {
		const { nodeId, key, value } = event.detail;
		console.log("🤖 Oscar triggered node data update:", { nodeId, key, value });
		updateNodeData(nodeId, key, value);
	};

	/**
	 * Handle Oscar proceed to next
	 */
	const handleOscarProceedToNext = (event: CustomEvent) => {
		const { nodeId, nodeType, data } = event.detail;
		console.log("🤖 Oscar triggered proceed to next:", { nodeId, nodeType, data });

		// Trigger the same logic as clicking "Continue" in the canvas
		if (handleNodeUpdated) {
			handleNodeUpdated(nodeId, data || {});
		}
	};

	/**
	 * Handle Oscar node updated
	 */
	const handleOscarNodeUpdated = (event: CustomEvent) => {
		const { nodeId, data } = event.detail;
		console.log("🤖 Oscar triggered node updated:", { nodeId, data });

		if (handleNodeUpdated) {
			handleNodeUpdated(nodeId, data);
		}
	};

	/**
	 * Setup Oscar event listeners
	 */
	const setupOscarListeners = () => {
		window.addEventListener("oscar:pan-to-node", handleOscarPanToNode as any);
		window.addEventListener("oscar:update-node-data", handleOscarUpdateNodeData as any);
		window.addEventListener("oscar:proceed-to-next", handleOscarProceedToNext as any);
		window.addEventListener("oscar:node-updated", handleOscarNodeUpdated as any);
		console.log("✅ Oscar event listeners registered");
	};

	/**
	 * Cleanup Oscar event listeners
	 */
	const cleanupOscarListeners = () => {
		window.removeEventListener("oscar:pan-to-node", handleOscarPanToNode as any);
		window.removeEventListener("oscar:update-node-data", handleOscarUpdateNodeData as any);
		window.removeEventListener("oscar:proceed-to-next", handleOscarProceedToNext as any);
		window.removeEventListener("oscar:node-updated", handleOscarNodeUpdated as any);
		console.log("🧹 Oscar event listeners cleaned up");
	};

	return {
		handleOscarPanToNode,
		handleOscarUpdateNodeData,
		handleOscarProceedToNext,
		handleOscarNodeUpdated,
		setupOscarListeners,
		cleanupOscarListeners
	};
}



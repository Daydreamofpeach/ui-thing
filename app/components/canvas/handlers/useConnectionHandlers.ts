import type { Ref } from "vue";

/**
 * Connection Handlers
 * Handles connection creation, management, and interactions
 */
export function useConnectionHandlers(
	edges: Ref<any[]>,
	connectionTypes: Ref<any[]>,
	defaultConnectionType: Ref<string>,
	addEdge: (edge: any) => void
) {
	/**
	 * Handle connection start
	 */
	const handleConnectionStart = (sourceHandle: any) => {
		console.log("🔗 Connection started:", sourceHandle);
		// ConnectionFlowManager will handle this internally
	};

	/**
	 * Handle connection end
	 */
	const handleConnectionEnd = (targetHandle: any) => {
		console.log("🔗 Connection ended:", targetHandle);
		// ConnectionFlowManager will handle this internally
	};

	/**
	 * Handle create enhanced connection
	 */
	const handleCreateEnhancedConnection = (sourceHandle: any, targetHandle: any, connectionType?: any) => {
		console.log("🔗 Creating enhanced connection:", { sourceHandle, targetHandle, connectionType });

		const selectedType = connectionType || connectionTypes.value.find((t) => t.id === defaultConnectionType.value);
		const newEdge = {
			id: `edge-${sourceHandle.nodeId}-${targetHandle.nodeId}-${Date.now()}`,
			source: sourceHandle.nodeId,
			target: targetHandle.nodeId,
			sourceHandle: sourceHandle.handleId,
			targetHandle: targetHandle.handleId,
			type: selectedType?.flowType || "smoothstep",
			animated: true,
			animationType: "flow",
			animationSpeed: "normal",
			style: {
				stroke: "#f97316",
				strokeWidth: 2
			},
			markerEnd: {
				type: "arrowclosed",
				color: "#f97316"
			}
		};

		// Use the existing addEdge method to ensure consistency
		addEdge(newEdge);
	};

	/**
	 * Handle cancel connection
	 */
	const handleCancelConnection = () => {
		console.log("🔗 Connection cancelled");
		// ConnectionFlowManager will handle cleanup internally
	};

	return {
		handleConnectionStart,
		handleConnectionEnd,
		handleCreateEnhancedConnection,
		handleCancelConnection
	};
}


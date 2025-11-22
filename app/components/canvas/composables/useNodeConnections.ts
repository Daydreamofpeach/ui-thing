import { computed } from "vue";

export function useNodeConnections(
	edges: any,
	allNodes: any,
	addEdges: any,
	addConnection: any,
	processDataFlow: any,
	defaultConnectionStyle?: any
) {
	const allEdges = computed(() => edges.value);

	const handleConnect = (connection: any, processNodeDataFlow: any) => {
		console.log("Connection created:", connection);

		// Use default chain connection style if available (check if it's a ref)
		const styleValue = defaultConnectionStyle?.value || defaultConnectionStyle;
		const style = styleValue || {
			color: "#8b5cf6",
			animationType: "flow",
			animationSpeed: "normal",
			strokeWidth: 3,
			type: "smoothstep",
			animated: true
		};

		console.log("🎨 Using connection style:", style);

		const newEdge = {
			id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
			source: connection.source,
			target: connection.target,
			sourceHandle: connection.sourceHandle,
			targetHandle: connection.targetHandle,
			type: style.type || "smoothstep",
			animated: style.animated !== undefined ? style.animated : true,
			animationType: style.animationType || "flow",
			animationSpeed: style.animationSpeed || "normal",
			style: {
				stroke: style.color || "#8b5cf6",
				strokeWidth: style.strokeWidth || 3
			},
			markerEnd: {
				type: "arrowclosed",
				color: style.color || "#8b5cf6"
			}
		};

		edges.value.push(newEdge);
		addEdges([newEdge]);
		addConnection(connection.source, connection.target, "data-flow");

		const sourceNode = allNodes.value.find((n: any) => n.id === connection.source);
		if (sourceNode) {
			processNodeDataFlow(sourceNode);
		}

		console.log("✅ Edge added with chain styles:", newEdge);
		console.log("Total edges:", edges.value.length);
	};

	const getConnectedNodesCount = (nodeId: string): number => {
		return edges.value.filter((edge: any) =>
			edge.source === nodeId || edge.target === nodeId
		).length;
	};

	return {
		allEdges,
		handleConnect,
		getConnectedNodesCount
	};
}

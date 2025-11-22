import { computed, ref } from "vue";

export function useJsonOutput(allNodes: any, allEdges: any) {
	const showJsonView = ref(false);

	const jsonOutput = computed(() => {
		return {
			timestamp: new Date().toISOString(),
			canvas: "node-hook-canvas",
			nodes: allNodes.value.map((node: any) => ({
				id: node.id,
				type: node.type,
				position: node.position,
				data: node.data,
				selected: node.selected || false,
				draggable: node.draggable !== false,
				selectable: node.selectable !== false
			})),
			edges: allEdges.value.map((edge: any) => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				sourceHandle: edge.sourceHandle,
				targetHandle: edge.targetHandle,
				type: edge.type || "default",
				label: edge.label || "",
				style: edge.style || {},
				markerEnd: edge.markerEnd || {}
			})),
			metadata: {
				totalNodes: allNodes.value.length,
				totalEdges: allEdges.value.length,
				nodeTypes: [...new Set(allNodes.value.map((n: any) => n.type))],
				lastUpdated: new Date().toISOString()
			}
		};
	});

	const formattedJsonOutput = computed(() => {
		return JSON.stringify(jsonOutput.value, null, 2);
	});

	const toggleJsonView = () => {
		showJsonView.value = !showJsonView.value;
	};

	const copyJsonToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(formattedJsonOutput.value);
			console.log("JSON copied to clipboard");
		} catch {
			console.error("Failed to copy to clipboard");
		}
	};

	const downloadJson = () => {
		const blob = new Blob([formattedJsonOutput.value], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "nodes.json";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return {
		showJsonView,
		jsonOutput,
		formattedJsonOutput,
		toggleJsonView,
		copyJsonToClipboard,
		downloadJson
	};
}


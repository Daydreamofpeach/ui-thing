import type { Ref } from "vue";

/**
 * Node Lifecycle Handlers
 * Handles node creation, closing, and deletion operations
 */
export function useNodeLifecycleHandlers(
	allNodes: Ref<any[]>,
	edges: Ref<any[]>,
	codeEditorNodes: Ref<any[]>,
	scriptEditorNodes: Ref<any[]>,
	transportTemplateNodes: Ref<any[]>,
	hookNodes: Ref<any[]>,
	emit: any
) {
	/**
	 * Handle close code editor node
	 */
	const handleCloseCodeEditor = (nodeId: string) => {
		console.log("🗑️ Closing code editor node:", nodeId);

		// Remove from codeEditorNodes array
		const index = codeEditorNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			codeEditorNodes.value.splice(index, 1);
		}

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Code editor node closed");
	};

	/**
	 * Handle refresh code editor
	 */
	const handleRefreshCodeEditor = (nodeId: string) => {
		console.log("🔄 Refreshing code editor:", nodeId);
		// Refresh logic can be added here
	};

	/**
	 * Handle close script editor node
	 */
	const handleCloseScriptEditorNode = (nodeId: string) => {
		console.log("🗑️ Closing script editor node:", nodeId);

		// Remove from scriptEditorNodes array
		const index = scriptEditorNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			scriptEditorNodes.value.splice(index, 1);
		}

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Script editor node closed");
	};

	/**
	 * Handle close transport template node
	 */
	const handleCloseTransportTemplateNode = (nodeId: string) => {
		console.log("🗑️ Closing transport template node:", nodeId);

		// Remove from transportTemplateNodes array
		const index = transportTemplateNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			transportTemplateNodes.value.splice(index, 1);
		}

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Transport template node closed");
	};

	/**
	 * Handle close hook node
	 */
	const handleCloseHookNode = (nodeId: string) => {
		console.log("🗑️ Closing hook node:", nodeId);

		// Remove from hookNodes array
		const index = hookNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			hookNodes.value.splice(index, 1);
		}

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Hook node closed");
	};

	/**
	 * Handle close transport node
	 */
	const handleCloseTransportNode = (nodeId: string) => {
		console.log("🗑️ Closing transport node:", nodeId);

		// Remove from allNodes array
		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Transport node closed");
	};

	/**
	 * Handle close project script runner
	 */
	const handleCloseProjectScriptRunner = (nodeId: string) => {
		console.log("🗑️ Closing project script runner:", nodeId);

		const allNodesIndex = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (allNodesIndex !== -1) {
			allNodes.value.splice(allNodesIndex, 1);
		}

		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		console.log("✅ Project script runner closed");
	};

	/**
	 * Handle user node configure
	 */
	const handleUserNodeConfigure = (nodeId: string) => {
		console.log("⚙️ Configuring user node:", nodeId);
		// Configuration logic
	};

	/**
	 * Handle user node delete
	 */
	const handleUserNodeDelete = (nodeId: string) => {
		console.log("🗑️ Deleting user node:", nodeId);
		const index = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			allNodes.value.splice(index, 1);
			emit("nodeDeleted", nodeId);
		}
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);
	};

	/**
	 * Handle orbit card node configure
	 */
	const handleOrbitCardNodeConfigure = (nodeId: string) => {
		console.log("⚙️ Configuring orbit card node:", nodeId);
		// Configuration logic
	};

	/**
	 * Handle orbit card node delete
	 */
	const handleOrbitCardNodeDelete = (nodeId: string) => {
		console.log("🗑️ Deleting orbit card node:", nodeId);
		const index = allNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			allNodes.value.splice(index, 1);
			emit("nodeDeleted", nodeId);
		}
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);
	};

	return {
		handleCloseCodeEditor,
		handleRefreshCodeEditor,
		handleCloseScriptEditorNode,
		handleCloseTransportTemplateNode,
		handleCloseHookNode,
		handleCloseTransportNode,
		handleCloseProjectScriptRunner,
		handleUserNodeConfigure,
		handleUserNodeDelete,
		handleOrbitCardNodeConfigure,
		handleOrbitCardNodeDelete
	};
}


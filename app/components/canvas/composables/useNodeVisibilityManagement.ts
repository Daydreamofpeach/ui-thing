import type { Ref } from "vue";

export function useNodeVisibilityManagement(
	intentSelectionNodes: Ref<any[]>,
	projectExplorerNodes: Ref<any[]>,
	projectScriptRunnerNodes: Ref<any[]>,
	bFolderSetupNodes: Ref<any[]>,
	saveTemplateNodes: Ref<any[]>,
	allNodes: Ref<any[]>,
	updateNodeDataBase: (nodeId: string, key: string, value: any) => void,
	vueFlowUpdateNode: (nodeId: string, updater: (node: any) => any) => void,
	getNodeFn: any,
	addNodes: (nodes: any[]) => void,
	vueFlowFitView: () => void
) {
	/**
	 * Handle toggle node visibility from TemplateConfiguredNode
	 */
	const handleToggleNodeVisibility = (nodeType: string, visible: boolean) => {
		console.log(`👁️ Toggling ${nodeType} visibility to:`, visible);
		console.log(`   Current allNodes count:`, allNodes.value.length);

		// Find nodes of this type
		const nodeArrayMap: Record<string, any> = {
			intentSelection: intentSelectionNodes,
			projectExplorer: projectExplorerNodes,
			projectScriptRunnerNode: projectScriptRunnerNodes,
			bFolderSetupNode: bFolderSetupNodes,
			saveTemplateNode: saveTemplateNodes
		};

		const targetArray = nodeArrayMap[nodeType];
		if (!targetArray || !targetArray.value) {
			console.warn(`⚠️ No array found for node type: ${nodeType}`);
			console.log(`   Available node types:`, Object.keys(nodeArrayMap));
			return;
		}

		console.log(`   Found ${targetArray.value.length} nodes of type ${nodeType}`);

		// Update hidden property for all nodes of this type
		targetArray.value.forEach((node: any) => {
			console.log(`  ${visible ? "👁️ Showing" : "🙈 Hiding"} ${node.type} (${node.id})`);
			console.log(`    Position: (${node.position.x}, ${node.position.y})`);

			// Update in reactive array
			node.hidden = !visible;

			// Update data
			updateNodeDataBase(node.id, "visible", visible);

			// CRITICAL: Update VueFlow node to reflect hidden state
			const vueFlowNode = getNodeFn.value(node.id);
			console.log(`    VueFlow node found:`, !!vueFlowNode);

			if (vueFlowNode) {
				vueFlowUpdateNode(node.id, (n: any) => ({
					...n,
					hidden: !visible,
					data: {
						...n.data,
						visible
					}
				}));
				console.log(`    ✅ Updated VueFlow node hidden=${!visible}`);
			} else {
				console.warn(`    ⚠️ VueFlow node not found, adding to VueFlow...`);
				// Force add to VueFlow if not found
				addNodes([node]);
				console.log(`    ✅ Added node to VueFlow`);
			}

			// If showing for the first time and processes haven't run, trigger them
			if (visible && !node.data?.processesRun) {
				console.log(`    🚀 Will run processes on next render`);
				updateNodeDataBase(node.id, "shouldRunProcesses", true);
			}
		});

		console.log(`✅ Toggled ${targetArray.value.length} ${nodeType} node(s)`);
		console.log(`   New allNodes count:`, allNodes.value.length);
		console.log(`   Hidden nodes:`, allNodes.value.filter((n: any) => n.hidden).length);
		console.log(`   Visible nodes:`, allNodes.value.filter((n: any) => !n.hidden).length);
	};

	/**
	 * Show all nodes in the chain
	 */
	const handleShowAllNodes = () => {
		console.log("👁️ Showing all chain nodes");

		const nodeTypes = ["intentSelection", "projectExplorer", "projectScriptRunnerNode", "bFolderSetupNode", "saveTemplateNode"];
		nodeTypes.forEach((nodeType) => {
			handleToggleNodeVisibility(nodeType, true);
		});
	};

	/**
	 * Hide all nodes in the chain
	 */
	const handleHideAllNodes = () => {
		console.log("🙈 Hiding all chain nodes");

		const nodeTypes = ["intentSelection", "projectExplorer", "projectScriptRunnerNode", "bFolderSetupNode", "saveTemplateNode"];
		nodeTypes.forEach((nodeType) => {
			handleToggleNodeVisibility(nodeType, false);
		});
	};

	/**
	 * Focus on the chain
	 */
	const handleFocusChain = () => {
		console.log("🎯 Focusing on chain");

		// Find all nodes in the chain
		const chainNodes = [
			...intentSelectionNodes.value,
			...projectExplorerNodes.value,
			...projectScriptRunnerNodes.value,
			...bFolderSetupNodes.value,
			...saveTemplateNodes.value
		];

		if (chainNodes.length === 0) return;

		// Calculate bounding box
		const positions = chainNodes.map((n) => n.position);
		const minX = Math.min(...positions.map((p) => p.x));
		const maxX = Math.max(...positions.map((p) => p.x)) + 600; // Add node width
		const minY = Math.min(...positions.map((p) => p.y));
		const maxY = Math.max(...positions.map((p) => p.y)) + 400; // Add node height

		const width = maxX - minX;
		const height = maxY - minY;

		// Fit view to chain
		vueFlowFitView();
	};

	return {
		handleToggleNodeVisibility,
		handleShowAllNodes,
		handleHideAllNodes,
		handleFocusChain
	};
}


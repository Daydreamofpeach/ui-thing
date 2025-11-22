import type { Node } from "@vue-flow/core";
import type { Ref } from "vue";

/**
 * Composable for managing template chain restoration and node visibility
 * Handles the flow of template → intent → explorer → scripts → setup
 */
export function useTemplateChain(
	templateConfiguredNodes: Ref<Node[]>,
	intentSelectionNodes: Ref<Node[]>,
	projectExplorerNodes: Ref<Node[]>,
	projectScriptRunnerNodes: Ref<Node[]>,
	bFolderSetupNodes: Ref<Node[]>,
	saveTemplateNodes: Ref<Node[]>,
	updateNodeData: (nodeId: string, key: string, value: any) => void,
	vueFlowUpdateNode: (nodeId: string, updates: Partial<Node>) => void
) {
	/**
	 * Restore template chain nodes with initial hidden state
	 * All nodes start hidden and get shown when user interacts
	 */
	const restoreTemplateChain = (templateData: any) => {
		console.log("🔗 Restoring template chain:", templateData);

		// Initialize all chain nodes as hidden
		const nodeArrays = [
			intentSelectionNodes,
			projectExplorerNodes,
			projectScriptRunnerNodes,
			bFolderSetupNodes,
			saveTemplateNodes
		];

		nodeArrays.forEach((nodeArray) => {
			nodeArray.value.forEach((node) => {
				// Set both hidden and data.visible for complete control
				vueFlowUpdateNode(node.id, {
					hidden: true,
					data: {
						...node.data,
						visible: false,
						processesRun: false
					}
				});
			});
		});

		console.log("✅ Template chain nodes initialized as hidden");
	};

	/**
	 * Toggle visibility of a specific node type in the chain
	 */
	const toggleChainNodeVisibility = (nodeType: string, visible: boolean) => {
		console.log(`👁️ Toggling ${nodeType} visibility:`, visible);

		const nodeArrayMap: Record<string, Ref<Node[]>> = {
			intentSelection: intentSelectionNodes,
			projectExplorer: projectExplorerNodes,
			projectScriptRunnerNode: projectScriptRunnerNodes,
			bFolderSetupNode: bFolderSetupNodes,
			saveTemplateNode: saveTemplateNodes
		};

		const targetArray = nodeArrayMap[nodeType];
		if (!targetArray) {
			console.warn(`⚠️ No array found for node type: ${nodeType}`);
			return;
		}

		targetArray.value.forEach((node) => {
			console.log(`  ${visible ? "👁️ Showing" : "🙈 Hiding"} ${node.type} (${node.id})`);

			// Update node visibility
			vueFlowUpdateNode(node.id, {
				hidden: !visible,
				data: {
					...node.data,
					visible,
					shouldRunProcesses: visible && !node.data?.processesRun
				}
			});

			// Mark as needing process run if being shown for first time
			if (visible && !node.data?.processesRun) {
				updateNodeData(node.id, "shouldRunProcesses", true);
			}
		});

		console.log(`✅ Toggled ${nodeType} visibility to ${visible}`);
	};

	/**
	 * Show next node in the template chain
	 */
	const showNextChainNode = (currentNodeType: string) => {
		const chainOrder = [
			"templateConfiguredNode",
			"intentSelection",
			"projectExplorer",
			"projectScriptRunnerNode",
			"bFolderSetupNode",
			"saveTemplateNode"
		];

		const currentIndex = chainOrder.indexOf(currentNodeType);
		if (currentIndex === -1 || currentIndex === chainOrder.length - 1) {
			console.log("📍 At end of chain or invalid node type");
			return null;
		}

		const nextNodeType = chainOrder[currentIndex + 1];
		console.log(`➡️ Showing next chain node: ${nextNodeType}`);

		toggleChainNodeVisibility(nextNodeType, true);
		return nextNodeType;
	};

	/**
	 * Hide node in the template chain
	 */
	const hideChainNode = (nodeType: string) => {
		toggleChainNodeVisibility(nodeType, false);
	};

	/**
	 * Check if a node type is visible in the chain
	 */
	const isChainNodeVisible = (nodeType: string): boolean => {
		const nodeArrayMap: Record<string, Ref<Node[]>> = {
			intentSelection: intentSelectionNodes,
			projectExplorer: projectExplorerNodes,
			projectScriptRunnerNode: projectScriptRunnerNodes,
			bFolderSetupNode: bFolderSetupNodes,
			saveTemplateNode: saveTemplateNodes
		};

		const targetArray = nodeArrayMap[nodeType];
		if (!targetArray || targetArray.value.length === 0) {
			return false;
		}

		// Check if any node of this type is visible
		return targetArray.value.some((node) => node.data?.visible === true);
	};

	return {
		restoreTemplateChain,
		toggleChainNodeVisibility,
		showNextChainNode,
		hideChainNode,
		isChainNodeVisible
	};
}

import { computed, type Ref } from "vue";

export function useNodeOperations(
	rectangleNodes: Ref<any[]>,
	circleNodes: Ref<any[]>,
	diamondNodes: Ref<any[]>,
	triangleNodes: Ref<any[]>,
	hexagonNodes: Ref<any[]>,
	databaseNodes: Ref<any[]>,
	apiNodes: Ref<any[]>,
	serverNodes: Ref<any[]>,
	cloudNodes: Ref<any[]>,
	eventNodes: Ref<any[]>,
	commandNodes: Ref<any[]>,
	viewNodes: Ref<any[]>,
	webviewNodes: Ref<any[]>,
	codeEditorNodes: Ref<any[]>,
	gitActionNodes: Ref<any[]>,
	hookNodes: Ref<any[]>,
	transportNodes: Ref<any[]>,
	templateNodes: Ref<any[]>,
	githubNodes: Ref<any[]>,
	folderBrowserNodes: Ref<any[]>,
	intentSelectionNodes: Ref<any[]>,
	projectExplorerNodes: Ref<any[]>,
	environmentNodes: Ref<any[]>
) {
	const allNodes = computed(() => [
		...rectangleNodes.value,
		...circleNodes.value,
		...diamondNodes.value,
		...triangleNodes.value,
		...hexagonNodes.value,
		...databaseNodes.value,
		...apiNodes.value,
		...serverNodes.value,
		...cloudNodes.value,
		...eventNodes.value,
		...commandNodes.value,
		...viewNodes.value,
		...webviewNodes.value,
		...codeEditorNodes.value,
		...gitActionNodes.value,
		...hookNodes.value,
		...transportNodes.value,
		...templateNodes.value,
		...githubNodes.value,
		...folderBrowserNodes.value,
		...intentSelectionNodes.value,
		...projectExplorerNodes.value,
		...environmentNodes.value
	]);

	const updateNodeData = (nodeId: string, key: string, value: any) => {
		const node = allNodes.value.find(n => n.id === nodeId);
		if (node) {
			node.data[key] = value;
			console.log(`✅ Updated node ${nodeId}: ${key} = ${value}`);
		}
	};

	const updateNodeComplete = (nodeId: string, isComplete: boolean) => {
		updateNodeData(nodeId, "isComplete", isComplete);
	};

	const clearAllNodes = () => {
		rectangleNodes.value = [];
		circleNodes.value = [];
		diamondNodes.value = [];
		triangleNodes.value = [];
		hexagonNodes.value = [];
		databaseNodes.value = [];
		apiNodes.value = [];
		serverNodes.value = [];
		cloudNodes.value = [];
		eventNodes.value = [];
		commandNodes.value = [];
		viewNodes.value = [];
		webviewNodes.value = [];
		codeEditorNodes.value = [];
		gitActionNodes.value = [];
		hookNodes.value = [];
		transportNodes.value = [];
		templateNodes.value = [];
		githubNodes.value = [];
		folderBrowserNodes.value = [];
		intentSelectionNodes.value = [];
		projectExplorerNodes.value = [];
		environmentNodes.value = [];
	};

	return {
		allNodes,
		updateNodeData,
		updateNodeComplete,
		clearAllNodes
	};
}


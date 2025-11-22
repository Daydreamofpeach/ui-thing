import type { Ref } from "vue";
import { computed, ref } from "vue";
import { useNodeFactory } from "./useNodeFactory";

export function useCanvasNodes(vueFlowAddNodes?: (nodes: any[]) => void) {
	const { createNode, createNodeFromTemplate, resetPositioning, syncWithExistingNodes } = useNodeFactory();

	// Node Types Definition
	const nodeTypes = {
		database: "database",
		api: "api",
		server: "server",
		cloud: "cloud",
		eventNode: "eventNode",
		commandNode: "commandNode",
		viewNode: "viewNode",
		webviewNode: "webviewNode",
		viewportNode: "viewportNode",
		codeEditorNode: "codeEditorNode",
		gitActionNode: "gitActionNode",
		hookNode: "hookNode",
		transportNode: "transportNode",
		templateNode: "templateNode",
		templateConfiguredNode: "templateConfiguredNode",
		solutionNode: "solutionNode",
		githubNode: "githubNode",
		folderBrowser: "folderBrowser",
		intentSelection: "intentSelection",
		projectExplorer: "projectExplorer",
		environmentNode: "environmentNode",
		nodeCheckNode: "nodeCheckNode",
		phpCheckNode: "phpCheckNode",
		rustCheckNode: "rustCheckNode",
		dotnetCheckNode: "dotnetCheckNode",
		pythonCheckNode: "pythonCheckNode",
		javaCheckNode: "javaCheckNode",
		builditCli: "buildit-cli",
		browserNode: "browserNode",
		projectScriptRunnerNode: "projectScriptRunnerNode",
		bFolderSetupNode: "bFolderSetupNode",
		saveTemplateNode: "saveTemplateNode",
		fileCreatorNode: "fileCreatorNode",
		formsPanelNode: "formsPanelNode",
		formBuilderNode: "formBuilderNode",
		formAutomationNode: "formAutomationNode",
		scriptEditorNode: "scriptEditorNode",
		userNode: "userNode",
		orbitCardNode: "orbitCardNode",
		projectNode: "projectNode",
		setupProjectNode: "setupProjectNode",
		projectEnvironmentNode: "projectEnvironmentNode",
		userManagementNode: "userManagementNode",
		taskNode: "taskNode",
		integrationConnectionNode: "integrationConnectionNode",
		integrationDetailNode: "integrationDetailNode",
		ideStatusNode: "ideStatusNode"
	};

	// Node storage arrays
	const databaseNodes = ref<any[]>([]);
	const apiNodes = ref<any[]>([]);
	const serverNodes = ref<any[]>([]);
	const cloudNodes = ref<any[]>([]);
	const eventNodes = ref<any[]>([]);
	const commandNodes = ref<any[]>([]);
	const viewNodes = ref<any[]>([]);
	const webviewNodes = ref<any[]>([]);
	const viewportNodes = ref<any[]>([]);
	const codeEditorNodes = ref<any[]>([]);
	const gitActionNodes = ref<any[]>([]);
	const hookNodes = ref<any[]>([]);
	const transportNodes = ref<any[]>([]);
	const transportTemplateNodes = ref<any[]>([]);
	const templateNodes = ref<any[]>([]);
	const templateConfiguredNodes = ref<any[]>([]);
	const solutionNodes = ref<any[]>([]);
	const githubNodes = ref<any[]>([]);
	const folderBrowserNodes = ref<any[]>([]);
	const intentSelectionNodes = ref<any[]>([]);
	const projectExplorerNodes = ref<any[]>([]);
	const environmentNodes = ref<any[]>([]);
	const nodeCheckNodes = ref<any[]>([]);
	const phpCheckNodes = ref<any[]>([]);
	const rustCheckNodes = ref<any[]>([]);
	const dotnetCheckNodes = ref<any[]>([]);
	const pythonCheckNodes = ref<any[]>([]);
	const javaCheckNodes = ref<any[]>([]);
	const builditCliNodes = ref<any[]>([]);
	const browserNodes = ref<any[]>([]);
	const projectScriptRunnerNodes = ref<any[]>([]);
	const bFolderSetupNodes = ref<any[]>([]);
	const saveTemplateNodes = ref<any[]>([]);
	const fileCreatorNodes = ref<any[]>([]);
	const formsPanelNodes = ref<any[]>([]);
	const formBuilderNodes = ref<any[]>([]);
	const formAutomationNodes = ref<any[]>([]);
	const scriptEditorNodes = ref<any[]>([]);
	const userNodes = ref<any[]>([]);
	const orbitCardNodes = ref<any[]>([]);
	const projectNodes = ref<any[]>([]);
	const setupProjectNodes = ref<any[]>([]);
	const projectToolsSetupNodes = ref<any[]>([]);
	const projectEnvironmentNodes = ref<any[]>([]);
	const projectInstallNodes = ref<any[]>([]);
	const builditNodes = ref<any[]>([]);
	const userManagementNodes = ref<any[]>([]);
	const taskNodes = ref<any[]>([]);
	const integrationConnectionNodes = ref<any[]>([]);
	const integrationDetailNodes = ref<any[]>([]);
	const ideStatusNodes = ref<any[]>([]);

	// All nodes computed
	const allNodes = computed(() => [
		...databaseNodes.value,
		...apiNodes.value,
		...serverNodes.value,
		...cloudNodes.value,
		...eventNodes.value,
		...commandNodes.value,
		...viewNodes.value,
		...webviewNodes.value,
		...viewportNodes.value,
		...codeEditorNodes.value,
		...gitActionNodes.value,
		...hookNodes.value,
		...transportNodes.value,
		...transportTemplateNodes.value,
		...templateNodes.value,
		...templateConfiguredNodes.value,
		...solutionNodes.value,
		...githubNodes.value,
		...folderBrowserNodes.value,
		...intentSelectionNodes.value,
		...projectExplorerNodes.value,
		...environmentNodes.value,
		...nodeCheckNodes.value,
		...phpCheckNodes.value,
		...rustCheckNodes.value,
		...dotnetCheckNodes.value,
		...pythonCheckNodes.value,
		...javaCheckNodes.value,
		...builditCliNodes.value,
		...browserNodes.value,
		...projectScriptRunnerNodes.value,
		...bFolderSetupNodes.value,
		...saveTemplateNodes.value,
		...fileCreatorNodes.value,
		...formsPanelNodes.value,
		...formBuilderNodes.value,
		...formAutomationNodes.value,
		...scriptEditorNodes.value,
		...userNodes.value,
		...orbitCardNodes.value,
		...projectNodes.value,
		...setupProjectNodes.value,
		...projectToolsSetupNodes.value,
		...projectEnvironmentNodes.value,
		...projectInstallNodes.value,
		...builditNodes.value,
		...userManagementNodes.value,
		...taskNodes.value,
		...integrationConnectionNodes.value,
		...integrationDetailNodes.value,
		...ideStatusNodes.value
	]);

	// Helper function to add node to appropriate array
	const addNodeToArray = (node: any) => {
		console.log("🔧 addNodeToArray: Adding node:", node.id, "type:", node.type);
		console.log("📊 Current allNodes count BEFORE add:", allNodes.value.length);

		const arrayMap: Record<string, any> = {
			database: databaseNodes,
			api: apiNodes,
			server: serverNodes,
			cloud: cloudNodes,
			eventNode: eventNodes,
			commandNode: commandNodes,
			viewNode: viewNodes,
			webviewNode: webviewNodes,
			viewportNode: viewportNodes,
			codeEditorNode: codeEditorNodes,
			gitActionNode: gitActionNodes,
			hookNode: hookNodes,
			transportNode: transportNodes,
			transportTemplateNode: transportTemplateNodes,
			templateNode: templateNodes,
			templateConfiguredNode: templateConfiguredNodes,
			solutionNode: solutionNodes,
			githubNode: githubNodes,
			folderBrowser: folderBrowserNodes,
			intentSelection: intentSelectionNodes,
			intentSelectionNode: intentSelectionNodes,
			projectExplorer: projectExplorerNodes,
			environmentNode: environmentNodes,
			nodeCheckNode: nodeCheckNodes,
			phpCheckNode: phpCheckNodes,
			rustCheckNode: rustCheckNodes,
			dotnetCheckNode: dotnetCheckNodes,
			pythonCheckNode: pythonCheckNodes,
			javaCheckNode: javaCheckNodes,
			"buildit-cli": builditCliNodes,
			browserNode: browserNodes,
			projectScriptRunnerNode: projectScriptRunnerNodes,
			bFolderSetupNode: bFolderSetupNodes,
			saveTemplateNode: saveTemplateNodes,
			fileCreatorNode: fileCreatorNodes,
			formsPanelNode: formsPanelNodes,
			formBuilderNode: formBuilderNodes,
			formAutomationNode: formAutomationNodes,
			scriptEditorNode: scriptEditorNodes,
			userNode: userNodes,
			orbitCardNode: orbitCardNodes,
			projectNode: projectNodes,
			setupProjectNode: setupProjectNodes,
			projectToolsSetupNode: projectToolsSetupNodes,
			projectEnvironmentNode: projectEnvironmentNodes,
			projectInstallNode: projectInstallNodes,
			builditNode: builditNodes,
			userManagementNode: userManagementNodes,
			taskNode: taskNodes,
			integrationConnectionNode: integrationConnectionNodes,
			integrationDetailNode: integrationDetailNodes,
			ideStatusNode: ideStatusNodes
		};

		const targetArray = arrayMap[node.type];
		if (targetArray) {
		// Add to internal array
			targetArray.value.push(node);
			console.log("✅ addNodeToArray: Added node to internal array:", node.type, "array length:", targetArray.value.length);

			// Also add to VueFlow so it's visible and draggable
			if (vueFlowAddNodes) {
				vueFlowAddNodes([node]);
				console.log("✅ addNodeToArray: Added node to VueFlow");
			}
			console.log("📊 Current allNodes count AFTER add:", allNodes.value.length);
		} else {
			console.warn("❌ addNodeToArray: No array found for node type:", node.type);
		}
	};

	// Simple node creators - pass all nodes to avoid overlap
	const addDatabaseNode = () => addNodeToArray(createNodeFromTemplate("database", {}, allNodes.value));
	const addApiNode = () => addNodeToArray(createNodeFromTemplate("api", {}, allNodes.value));
	const addServerNode = () => addNodeToArray(createNodeFromTemplate("server", {}, allNodes.value));
	const addCloudNode = () => addNodeToArray(createNodeFromTemplate("cloud", {}, allNodes.value));
	const addEventNode = () => addNodeToArray(createNodeFromTemplate("eventNode", {}, allNodes.value));
	const addCommandNode = () => addNodeToArray(createNodeFromTemplate("commandNode", {}, allNodes.value));
	const addViewNode = () => addNodeToArray(createNodeFromTemplate("viewNode", {}, allNodes.value));
	const addWebviewNode = () => addNodeToArray(createNodeFromTemplate("webviewNode", {}, allNodes.value));
	const addGitActionNode = () => addNodeToArray(createNodeFromTemplate("gitActionNode", {}, allNodes.value));
	const addHookNode = () => addNodeToArray(createNodeFromTemplate("hookNode", {}, allNodes.value));
	const addTransportNode = () => addNodeToArray(createNodeFromTemplate("transportNode", {}, allNodes.value));
	const addTemplateNode = () => addNodeToArray(createNodeFromTemplate("templateNode", {}, allNodes.value));
	const addSolutionNode = () => addNodeToArray(createNodeFromTemplate("solutionNode", {}, allNodes.value));
	const addBuilditCliNode = () => addNodeToArray(createNodeFromTemplate("buildit-cli", {}, allNodes.value));
	const addBrowserNode = () => addNodeToArray(createNodeFromTemplate("browserNode", {}, allNodes.value));
	const addRustCheckNode = () => addNodeToArray(createNodeFromTemplate("rustCheckNode", {}, allNodes.value));
	const addProjectScriptRunnerNode = () => addNodeToArray(createNodeFromTemplate("projectScriptRunnerNode", {}, allNodes.value));
	const addBFolderSetupNode = () => addNodeToArray(createNodeFromTemplate("bFolderSetupNode", {}, allNodes.value));
	const addSaveTemplateNode = () => addNodeToArray(createNodeFromTemplate("saveTemplateNode", {}, allNodes.value));
	const addFileCreatorNode = () => addNodeToArray(createNodeFromTemplate("fileCreatorNode", {}, allNodes.value));
	const addFormsPanelNode = () => addNodeToArray(createNodeFromTemplate("formsPanelNode", {}, allNodes.value));
	const addFormBuilderNode = () => addNodeToArray(createNodeFromTemplate("formBuilderNode", {}, allNodes.value));
	const addFormAutomationNode = () => addNodeToArray(createNodeFromTemplate("formAutomationNode", {}, allNodes.value));
	const addUserNode = () => addNodeToArray(createNodeFromTemplate("userNode", {}, allNodes.value));
	const addOrbitCardNode = () => addNodeToArray(createNodeFromTemplate("orbitCardNode", {}, allNodes.value));
	const addProjectNode = () => addNodeToArray(createNodeFromTemplate("projectNode", {}, allNodes.value));
	const addSetupProjectNode = () => addNodeToArray(createNodeFromTemplate("setupProjectNode", {}, allNodes.value));
	const addProjectToolsSetupNode = () => addNodeToArray(createNodeFromTemplate("projectToolsSetupNode", {}, allNodes.value));
	const addProjectEnvironmentNode = () => addNodeToArray(createNodeFromTemplate("projectEnvironmentNode", {}, allNodes.value));
	const addProjectInstallNode = () => addNodeToArray(createNodeFromTemplate("projectInstallNode", {}, allNodes.value));
	const addBuilditNode = () => addNodeToArray(createNodeFromTemplate("builditNode", {}, allNodes.value));

	const registerExistingNode = (node: any) => {
		const arrayMap: Record<string, any> = {
			database: databaseNodes,
			api: apiNodes,
			server: serverNodes,
			cloud: cloudNodes,
			eventNode: eventNodes,
			commandNode: commandNodes,
			viewNode: viewNodes,
			webviewNode: webviewNodes,
			viewportNode: viewportNodes,
			codeEditorNode: codeEditorNodes,
			gitActionNode: gitActionNodes,
			hookNode: hookNodes,
			transportNode: transportNodes,
			transportTemplateNode: transportTemplateNodes,
			templateNode: templateNodes,
			templateConfiguredNode: templateConfiguredNodes,
			solutionNode: solutionNodes,
		githubNode: githubNodes,
		folderBrowser: folderBrowserNodes,
		intentSelection: intentSelectionNodes,
		projectExplorer: projectExplorerNodes,
			environmentNode: environmentNodes,
			nodeCheckNode: nodeCheckNodes,
			phpCheckNode: phpCheckNodes,
			rustCheckNode: rustCheckNodes,
			dotnetCheckNode: dotnetCheckNodes,
			pythonCheckNode: pythonCheckNodes,
			javaCheckNode: javaCheckNodes,
			"buildit-cli": builditCliNodes,
			browserNode: browserNodes,
			projectScriptRunnerNode: projectScriptRunnerNodes,
			bFolderSetupNode: bFolderSetupNodes,
			saveTemplateNode: saveTemplateNodes,
			fileCreatorNode: fileCreatorNodes,
			formsPanelNode: formsPanelNodes,
			formBuilderNode: formBuilderNodes,
			formAutomationNode: formAutomationNodes,
			scriptEditorNode: scriptEditorNodes,
			userNode: userNodes,
			orbitCardNode: orbitCardNodes,
			projectNode: projectNodes,
			setupProjectNode: setupProjectNodes,
			projectToolsSetupNode: projectToolsSetupNodes,
			projectEnvironmentNode: projectEnvironmentNodes,
			projectInstallNode: projectInstallNodes,
			builditNode: builditNodes,
			userManagementNode: userManagementNodes,
			taskNode: taskNodes,
			integrationConnectionNode: integrationConnectionNodes,
			integrationDetailNode: integrationDetailNodes,
			ideStatusNode: ideStatusNodes
		};

		const targetArray = arrayMap[node.type];
		if (targetArray) {
			const exists = targetArray.value.some((existing: any) => existing.id === node.id);
			if (!exists) {
				targetArray.value.push(node);
			}
		} else {
			console.warn("⚠️ registerExistingNode: Unknown node type", node.type);
		}
	};
	const addUserManagementNode = () => addNodeToArray(createNodeFromTemplate("userManagementNode", {}, allNodes.value));
	const addTaskNode = () => addNodeToArray(createNodeFromTemplate("taskNode", {}, allNodes.value));
	const addIntegrationConnectionNode = () => addNodeToArray(createNodeFromTemplate("integrationConnectionNode", {}, allNodes.value));
	const addIntegrationDetailNode = () => addNodeToArray(createNodeFromTemplate("integrationDetailNode", {}, allNodes.value));
	const addIdeStatusNode = () => addNodeToArray(createNodeFromTemplate("ideStatusNode", {}, allNodes.value));

	// Clear all nodes
	const clearAllNodes = () => {
		console.log("🗑️ Clearing all nodes and resetting positioning");
		databaseNodes.value = [];
		apiNodes.value = [];
		serverNodes.value = [];
		cloudNodes.value = [];
		eventNodes.value = [];
		commandNodes.value = [];
		viewNodes.value = [];
		webviewNodes.value = [];
		viewportNodes.value = [];
		codeEditorNodes.value = [];
		gitActionNodes.value = [];
		hookNodes.value = [];
		transportNodes.value = [];
		transportTemplateNodes.value = [];
		templateNodes.value = [];
		templateConfiguredNodes.value = [];
		solutionNodes.value = [];
		githubNodes.value = [];
		folderBrowserNodes.value = [];
		intentSelectionNodes.value = [];
		projectExplorerNodes.value = [];
		environmentNodes.value = [];
		nodeCheckNodes.value = [];
		phpCheckNodes.value = [];
		rustCheckNodes.value = [];
		dotnetCheckNodes.value = [];
		pythonCheckNodes.value = [];
		javaCheckNodes.value = [];
		builditCliNodes.value = [];
		browserNodes.value = [];
		projectScriptRunnerNodes.value = [];
		bFolderSetupNodes.value = [];
		saveTemplateNodes.value = [];
		fileCreatorNodes.value = [];
		formsPanelNodes.value = [];
		formBuilderNodes.value = [];
		formAutomationNodes.value = [];
		scriptEditorNodes.value = [];
		userNodes.value = [];
		orbitCardNodes.value = [];
		projectNodes.value = [];
		setupProjectNodes.value = [];
		projectToolsSetupNodes.value = [];
		projectEnvironmentNodes.value = [];
		projectInstallNodes.value = [];
		builditNodes.value = [];
		userManagementNodes.value = [];
		taskNodes.value = [];
		integrationConnectionNodes.value = [];
		integrationDetailNodes.value = [];
		ideStatusNodes.value = [];
		// Reset positioning when clearing canvas
		resetPositioning();
		console.log("✅ Internal node arrays cleared");
	};

	return {
		nodeTypes,
		// Arrays
		databaseNodes,
		apiNodes,
		serverNodes,
		cloudNodes,
		eventNodes,
		commandNodes,
		viewNodes,
		webviewNodes,
		viewportNodes,
		codeEditorNodes,
		gitActionNodes,
		hookNodes,
		transportNodes,
		transportTemplateNodes,
		templateNodes,
		templateConfiguredNodes,
		solutionNodes,
		githubNodes,
		folderBrowserNodes,
		intentSelectionNodes,
		projectExplorerNodes,
		environmentNodes,
		nodeCheckNodes,
		phpCheckNodes,
		rustCheckNodes,
		dotnetCheckNodes,
		pythonCheckNodes,
		javaCheckNodes,
		builditCliNodes,
		browserNodes,
		projectScriptRunnerNodes,
		bFolderSetupNodes,
		saveTemplateNodes,
		fileCreatorNodes,
		formsPanelNodes,
		formBuilderNodes,
		formAutomationNodes,
		addFormAutomationNode,
		scriptEditorNodes,
		userNodes,
		orbitCardNodes,
		projectNodes,
		setupProjectNodes,
		projectToolsSetupNodes,
		projectEnvironmentNodes,
		projectInstallNodes,
		builditNodes,
		userManagementNodes,
		taskNodes,
		integrationConnectionNodes,
		integrationDetailNodes,
		ideStatusNodes,
		// Computed
		allNodes,
		// Functions
		addNodeToArray,
		addDatabaseNode,
		addApiNode,
		addServerNode,
		addCloudNode,
		addEventNode,
		addCommandNode,
		addViewNode,
		addWebviewNode,
		addGitActionNode,
		addHookNode,
		addTransportNode,
		addTemplateNode,
		addSolutionNode,
		addBuilditCliNode,
		addBrowserNode,
		addRustCheckNode,
		addProjectScriptRunnerNode,
		addBFolderSetupNode,
		addSaveTemplateNode,
		addFileCreatorNode,
		addFormsPanelNode,
		addFormBuilderNode,
		addUserNode,
		addOrbitCardNode,
		addProjectNode,
		addSetupProjectNode,
		addProjectToolsSetupNode,
		addProjectEnvironmentNode,
		addProjectInstallNode,
		addBuilditNode,
		addUserManagementNode,
		addTaskNode,
		addIntegrationConnectionNode,
		addIntegrationDetailNode,
		addIdeStatusNode,
		clearAllNodes,
		registerExistingNode,
		createNode,
		createNodeFromTemplate,
		syncWithExistingNodes
	};
}

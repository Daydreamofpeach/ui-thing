/**
 * Node Component Registry
 *
 * Central registry that maps node types to their components.
 * This eliminates the need for 50+ hardcoded template slots in CanvasPanel.vue.
 *
 * To add a new node type:
 * 1. Create the component in /nodes/
 * 2. Add import here
 * 3. Add to NODE_COMPONENTS map
 * 4. Optionally add specific props in getNodeProps
 *
 * That's it! No changes needed to CanvasPanel.vue.
 */

import type { Component } from "vue";
import FormsPanelNode from "@canvas/nodes/FormsPanelNode.vue";
import HookNode from "@canvas/nodes/hooks/HookNode.vue";
import { defineAsyncComponent, markRaw } from "vue";
// Import node components
import BasicShapesRenderer from "../nodes/BasicShapesRenderer.vue";
import BFolderSetupNode from "../nodes/BFolderSetupNode.vue";
import BrowserNode from "../nodes/BrowserNode.vue";
import FormAutomationTemplateNode from "../nodes/FormAutomationTemplateNode.vue";
import FormBuilderNode from "../nodes/FormBuilderNode.vue";
import FormAutomationNode from "../nodes/FormAutomationNode.vue";
import ProgrammingIconsRenderer from "../nodes/ProgrammingIconsRenderer.vue";
import ProjectScriptRunnerNode from "../nodes/ProjectScriptRunnerNode.vue";
import SaveTemplateNode from "../nodes/SaveTemplateNode.vue";
import TemplateConfiguredNode from "../nodes/TemplateConfiguredNode.vue";
import TransportNode from "../nodes/TransportNode.vue";
import TransportTemplateNode from "../nodes/TransportTemplateNode.vue";

// Node component mapping - wrapped with markRaw to prevent reactivity warnings
const NODE_COMPONENTS: Record<string, Component> = {
	// Programming Icons (use renderer with node-type prop)
	database: markRaw(ProgrammingIconsRenderer),
	api: markRaw(ProgrammingIconsRenderer),
	server: markRaw(ProgrammingIconsRenderer),
	cloud: markRaw(ProgrammingIconsRenderer),

	// Functional Nodes
	hookNode: markRaw(HookNode),
	transportNode: markRaw(TransportNode),
	transportTemplateNode: markRaw(TransportTemplateNode),
	browserNode: markRaw(BrowserNode),
	formsPanelNode: markRaw(FormsPanelNode),
	formBuilderNode: markRaw(FormBuilderNode),
	formAutomationNode: markRaw(FormAutomationNode),
	formAutomationTemplateNode: markRaw(FormAutomationTemplateNode),
	templateConfiguredNode: markRaw(TemplateConfiguredNode),
	saveTemplateNode: markRaw(SaveTemplateNode),
	bFolderSetupNode: markRaw(BFolderSetupNode),
	projectScriptRunnerNode: markRaw(ProjectScriptRunnerNode),

	// Lazy-loaded nodes (loaded on demand)
	eventNode: defineAsyncComponent(() => import("../nodes/childNodes/EventNode.vue")),
	viewportNode: defineAsyncComponent(() => import("../nodes/childNodes/ViewportNode.vue")),
	codeEditorNode: defineAsyncComponent(() => import("../nodes/childNodes/CodeEditorNode.vue")),
	folderBrowserNode: defineAsyncComponent(() => import("../nodes/childNodes/FolderBrowserNode.vue")),
	projectExplorerNode: defineAsyncComponent(() => import("../nodes/childNodes/ProjectExplorerNode.vue")),
	projectExplorer: defineAsyncComponent(() => import("../nodes/childNodes/ProjectExplorerNode.vue")), // Alias for compatibility
	intentSelectionNode: defineAsyncComponent(() => import("../nodes/childNodes/IntentSelectionNode.vue")),
	intentSelection: defineAsyncComponent(() => import("../nodes/childNodes/IntentSelectionNode.vue")), // Alias for compatibility
	scriptEditorNode: defineAsyncComponent(() => import("../nodes/ScriptEditorNode.vue")),
	fileCreatorNode: defineAsyncComponent(() => import("../nodes/FileCreatorNode.vue")),
	fileWatcherNode: defineAsyncComponent(() => import("../nodes/FileWatcherNode.vue")),
	userNode: defineAsyncComponent(() => import("@components/nodes/user/UserNode.vue")),
	adminUserNode: defineAsyncComponent(() => import("@components/nodes/user/AdminUserNode.vue")),
	userManagementNode: defineAsyncComponent(() => import("../nodes/UserManagementNode.vue")),
	projectNode: defineAsyncComponent(() => import("../nodes/ProjectNode.vue")),
	projectConfiguredNode: defineAsyncComponent(() => import("../nodes/ProjectConfiguredNode.vue")),
	projectToolsSetupNode: defineAsyncComponent(() => import("../nodes/ProjectToolsSetupNode.vue")),
	setupProjectNode: defineAsyncComponent(() => import("../nodes/SetupProjectNode.vue")),
	projectEnvironmentNode: defineAsyncComponent(() => import("../nodes/ProjectEnvironmentNode.vue")),
	projectInstallNode: defineAsyncComponent(() => import("../nodes/ProjectInstallNode.vue")),
	builditNode: defineAsyncComponent(() => import("../nodes/BuilditNode.vue")),
	taskNode: defineAsyncComponent(() => import("../nodes/TaskNode.vue")),
	integrationConnectionNode: defineAsyncComponent(() => import("../nodes/IntegrationConnectionNode.vue")),
	integrationDetailNode: defineAsyncComponent(() => import("../nodes/IntegrationDetailNode.vue")),
	orbitCardNode: defineAsyncComponent(() => import("@components/nodes/OrbitCardNode.vue")),
	githubNode: defineAsyncComponent(() => import("../nodes/GitHubNode.vue")),
	solutionNode: defineAsyncComponent(() => import("../nodes/SolutionNode.vue")),
	webviewNode: defineAsyncComponent(() => import("../viewers/WebviewViewer.vue")),

	// IDE Status Node
	ideStatusNode: defineAsyncComponent(() => import("../nodes/IdeStatusNode.vue")),

	// Environment check nodes
	environmentNode: defineAsyncComponent(() => import("../nodes/EnvironmentSetupNode.vue")),
	nodeCheckNode: defineAsyncComponent(() => import("../nodes/NodeCheckNode.vue")),
	rustCheckNode: defineAsyncComponent(() => import("../nodes/RustCheckNode.vue")),
	phpCheckNode: defineAsyncComponent(() => import("../nodes/PhpCheckNode.vue")),
	dotnetCheckNode: defineAsyncComponent(() => import("../nodes/DotNetCheckNode.vue")),
	pythonCheckNode: defineAsyncComponent(() => import("../nodes/PythonCheckNode.vue")),
	javaCheckNode: defineAsyncComponent(() => import("../nodes/JavaCheckNode.vue")),
	// App/IDE Checkers
	vscodeCheckNode: defineAsyncComponent(() => import("../nodes/VscodeCheckNode.vue")),
	cursorCheckNode: defineAsyncComponent(() => import("../nodes/CursorCheckNode.vue")),
	visualstudioCheckNode: defineAsyncComponent(() => import("../nodes/VisualStudioCheckNode.vue")),
	intellijCheckNode: defineAsyncComponent(() => import("../nodes/IntellijCheckNode.vue")),
	pycharmCheckNode: defineAsyncComponent(() => import("../nodes/PycharmCheckNode.vue")),
	webstormCheckNode: defineAsyncComponent(() => import("../nodes/WebstormCheckNode.vue")),
	sublimeCheckNode: defineAsyncComponent(() => import("../nodes/SublimeCheckNode.vue")),
	notepadppCheckNode: defineAsyncComponent(() => import("../nodes/NotepadppCheckNode.vue")),
	dockerCheckNode: defineAsyncComponent(() => import("../nodes/DockerCheckNode.vue")),
	gitCheckNode: defineAsyncComponent(() => import("../nodes/GitCheckNode.vue")),
	builditCliNode: defineAsyncComponent(() => import("../nodes/BuilditCLINode.vue")),

	// Template nodes
	templateNode: defineAsyncComponent(() => import("../nodes/TemplateNodeInline.vue")),

	// Action nodes
	commandNode: defineAsyncComponent(() => import("../nodes/CommandNodeInline.vue")),
	viewNode: defineAsyncComponent(() => import("../nodes/ViewNode.vue")),
	gitActionNode: defineAsyncComponent(() => import("../nodes/GitActionNode.vue")),

	// Git Clone Chain nodes
	gitCloneRepositoryNode: defineAsyncComponent(() => import("../nodes/GitCloneRepositoryNode.vue")),
	gitCloneRequirementsNode: defineAsyncComponent(() => import("../nodes/GitCloneRequirementsNode.vue")),
	gitCloneDependenciesNode: defineAsyncComponent(() => import("../nodes/GitCloneDependenciesNode.vue"))
};

// Node-specific prop mapping (for nodes that need extra props)
const NODE_SPECIFIC_PROPS: Record<string, (props: any) => Record<string, any>> = {
	// Renderer nodes need nodeType prop
	database: () => ({ nodeType: "database" }),
	api: () => ({ nodeType: "api" }),
	server: () => ({ nodeType: "server" }),
	cloud: () => ({ nodeType: "cloud" }),

	// Functional nodes with specific requirements
	hookNode: (props) => ({
		"organisation-id": props.organizationId || "",
		"available-hooks": props.availableHooks || [],
		"listener-configured": props.allHandlers?.handleListenerConfigured,
		"create-transport-listener": props.allHandlers?.handleCreateTransportListener,
		"remove-transport-listener": props.allHandlers?.handleRemoveTransportListener,
		"hook-attached": props.allHandlers?.handleHookAttached,
		"close-hook": props.allHandlers?.handleCloseHookNode
	}),

	transportNode: (props) => ({
		"available-transports": props.availableTransports || [],
		"organisation-id": props.organizationId || "",
		"listener-configured": props.allHandlers?.handleListenerConfigured,
		"transport-attached": props.allHandlers?.handleTransportAttached,
		"create-template-node": props.allHandlers?.handleCreateTransportTemplateNode,
		"close-transport": props.allHandlers?.handleCloseTransportNode
	}),

	transportTemplateNode: (props) => ({
		"close-template": props.allHandlers?.handleCloseTransportTemplateNode
	}),

	browserNode: (props) => ({
		"spawn-viewport": props.allHandlers?.handleSpawnViewport,
		"url-changed": props.allHandlers?.handleBrowserUrlChanged,
		refresh: props.allHandlers?.handleBrowserRefresh,
		"open-external": props.allHandlers?.handleBrowserOpenExternal,
		"close-browser": props.allHandlers?.handleCloseBrowserNode,
		"form-submitted": props.allHandlers?.handleFormSubmitted,
		"submission-error": props.allHandlers?.handleFormSubmissionError,
		"save-form-chain-config": props.allHandlers?.handleSaveFormChainConfig
	}),

	formsPanelNode: (props) => ({
		"create-form-preview": props.allHandlers?.handleCreateFormPreviewBrowserNode,
		"open-form-generator": props.allHandlers?.handleOpenFormGenerator,
		onCreateFormBuilderNode: props.allHandlers?.handleAddFormBuilderNode
	}),

	formBuilderNode: (props) => ({
		"create-automation-node": props.allHandlers?.handleCreateFormAutomationNode,
		"create-form-preview": props.allHandlers?.handleCreateFormPreviewBrowserNode
	}),

	formAutomationNode: (props) => ({
		updateNodeData: props.updateNodeData
	}),

	formAutomationTemplateNode: (props) => ({
		"show-chain": props.allHandlers?.handleShowFormAutomationChain,
		"view-code": props.allHandlers?.handleViewFormAutomationCode,
		"restore-form-chain": props.allHandlers?.handleRestoreFormChain
	}),

	templateConfiguredNode: (props) => ({
		"toggle-node-visibility": props.allHandlers?.handleToggleNodeVisibility,
		"show-all-nodes": props.allHandlers?.handleShowAllNodes,
		"hide-all-nodes": props.allHandlers?.handleHideAllNodes,
		"focus-chain": props.allHandlers?.handleFocusChain,
		"create-browser-node": props.allHandlers?.handleCreateDevBrowserNode,
		"open-form-generator": props.allHandlers?.handleOpenFormGenerator,
		"restore-form-chain": props.allHandlers?.handleRestoreFormChain
	}),

	saveTemplateNode: (props) => ({
		"save-status-changed": props.allHandlers?.handleSaveStatusChanged,
		"template-saved": props.allHandlers?.handleTemplateSaved,
		"template-updated": props.allHandlers?.handleTemplateUpdated,
		"project-id": props.allHandlers?.projectId
	}),

	bFolderSetupNode: (props) => ({
		"create-save-template-node": props.allHandlers?.handleCreateSaveTemplateNode
	}),

	projectScriptRunnerNode: (props) => ({
		"script-updated": props.allHandlers?.handleScriptUpdated,
		"open-script-editor": props.allHandlers?.handleOpenScriptEditor
	}),

	scriptEditorNode: (props) => ({
		"script-updated": props.allHandlers?.handleScriptUpdated,
		"close-script-editor": props.allHandlers?.handleCloseScriptEditorNode
	}),

	codeEditorNode: (props) => ({
		codeContent: props.customNodeProps?.data?.codeContent || "",
		fileName: props.customNodeProps?.data?.fileName || "untitled",
		fileType: props.customNodeProps?.data?.fileType || "plaintext",
		"close-code-editor": props.allHandlers?.handleCloseCodeEditor,
		"refresh-code-editor": props.allHandlers?.handleRefreshCodeEditor,
		"file-opened": props.allHandlers?.handleFileOpened,
		onCloseEditor: props.allHandlers?.handleCloseCodeEditor,
		onRefreshCode: props.allHandlers?.handleRefreshCodeEditor,
		onFileOpened: props.allHandlers?.handleFileOpened
	}),

	viewportNode: (props) => ({
		"close-viewport": props.allHandlers?.handleCloseViewport
	}),

	fileCreatorNode: (props) => ({
		"file-created": props.allHandlers?.handleFileCreated
	}),

	fileWatcherNode: (props) => ({
		watchId: props.customNodeProps?.data?.watchId,
		updateNodeData: props.updateNodeData
	}),

	userNode: (props) => ({
		configure: props.allHandlers?.handleUserNodeConfigure,
		delete: props.allHandlers?.handleUserNodeDelete,
		showTaskOrbit: props.customNodeProps?.data?.showTaskOrbit || false
	}),

	userManagementNode: (props) => ({
		"organisation-id": props.organizationId || "",
		createChildUserNode: props.allHandlers?.handleCreateChildUserNode,
		userSelected: props.allHandlers?.handleUserSelected
	}),

	projectNode: (props) => ({
		"organisation-id": props.organizationId || "",
		createChildProjectNode: props.allHandlers?.handleCreateChildProjectNode,
		projectSelected: props.allHandlers?.handleProjectSelected,
		createChildUserNode: props.allHandlers?.handleCreateChildUserNode,
		createChildTaskNode: props.allHandlers?.handleCreateChildTaskNode,
		createChildIntegrationDetailNode: props.allHandlers?.handleCreateChildIntegrationDetailNode,
		createChildOrbitNode: props.allHandlers?.handleCreateUserOrbitNode,
		createChildSetupProjectNode: props.allHandlers?.handleCreateChildSetupProjectNode,
		createChildProjectToolsNode: props.allHandlers?.handleCreateChildProjectToolsNode,
		createChildProjectEnvironmentNode: props.allHandlers?.handleCreateProjectEnvironmentNode
	}),

	projectConfiguredNode: (props) => ({
		"organisation-id": props.organizationId || "",
		createChildProjectNode: props.allHandlers?.handleCreateChildProjectNode,
		projectSelected: props.allHandlers?.handleProjectSelected,
		createChildUserNode: props.allHandlers?.handleCreateChildUserNode,
		createChildTaskNode: props.allHandlers?.handleCreateChildTaskNode,
		createChildIntegrationDetailNode: props.allHandlers?.handleCreateChildIntegrationDetailNode,
		createChildOrbitNode: props.allHandlers?.handleCreateUserOrbitNode,
		createChildSetupProjectNode: props.allHandlers?.handleCreateChildSetupProjectNode,
		createChildProjectToolsNode: props.allHandlers?.handleCreateChildProjectToolsNode,
		createChildProjectEnvironmentNode: props.allHandlers?.handleCreateProjectEnvironmentNode
	}),

	projectToolsSetupNode: (props) => ({
		"organisation-id": props.organizationId || "",
		"project-id": props.projectId,
		"project-name": props.projectName,
		createChildSetupProjectNode: props.allHandlers?.handleCreateChildSetupProjectNode
	}),

	setupProjectNode: (props) => ({
		"organisation-id": props.organizationId || "",
		"project-id": props.projectId,
		"project-name": props.projectName,
		onIntegrationCreated: props.allHandlers?.handleIntegrationCreated,
		createChildProjectEnvironmentNode: props.allHandlers?.handleCreateProjectEnvironmentNode
	}),

	projectEnvironmentNode: (props) => ({
		onEnvironmentSetupSaved: props.allHandlers?.handleEnvironmentSetupSaved,
		createChildProjectInstallNode: props.allHandlers?.handleCreateProjectInstallNode,
		createChildBuilditNode: props.allHandlers?.handleCreateBuilditNode
	}),

	projectInstallNode: (props) => ({
		createChildProjectEnvironmentNode: props.allHandlers?.handleCreateProjectEnvironmentNode
	}),

	builditNode: (props) => ({
		updateNodeData: props.allHandlers?.handleUpdateNodeData,
		createChildProjectEnvironmentNode: props.allHandlers?.handleCreateProjectEnvironmentNode,
		registerExistingNode: props.allHandlers?.registerExistingNode,
		createEdge: props.allHandlers?.createEdge,
		triggerTemplateNodeChain: props.allHandlers?.triggerTemplateNodeChain
	}),

	gitCloneRepositoryNode: (props) => ({
		updateNodeData: props.updateNodeData,
		createOrbitNode: props.allHandlers?.handleCreateUserOrbitNode,
		createChildNode: props.allHandlers?.handleCreateChildTaskNode,
		addEdge: props.allHandlers?.onConnect
	}),

	taskNode: (props) => ({
		"organisation-id": props.organizationId || "",
		"project-id": props.projectId,
		createChildUserNode: props.allHandlers?.handleCreateChildUserNode,
		createChildTaskNode: props.allHandlers?.handleCreateChildTaskNode,
		taskSelected: props.allHandlers?.handleTaskSelected,
		showTaskInOrbit: props.allHandlers?.handleShowTaskInOrbit
	}),

	integrationConnectionNode: (props) => ({
		"organisation-id": props.organizationId || "",
		integrationCreated: props.allHandlers?.handleIntegrationCreated,
		createChildIntegrationDetailNode: props.allHandlers?.handleCreateChildIntegrationDetailNode
	}),

	integrationDetailNode: (_props) => ({
		// No special props needed, just the standard ones
	}),

	ideStatusNode: (_props) => ({
		// No special props needed
	}),

	orbitCardNode: (props) => ({
		configure: props.allHandlers?.handleOrbitCardNodeConfigure,
		delete: props.allHandlers?.handleOrbitCardNodeDelete
	}),

	eventNode: (props) => ({
		"event-select": props.allHandlers?.openEventSelector,
		"event-selected": props.allHandlers?.handleEventSelect
	}),

	commandNode: (props) => ({
		"command-select": props.allHandlers?.openCommandSelector,
		"command-selected": props.allHandlers?.handleCommandSelect
	}),

	viewNode: (props) => ({
		"view-select": props.allHandlers?.openViewSelector,
		"view-selected": props.allHandlers?.handleViewSelect
	}),

	gitActionNode: (props) => ({
		"git-action-select": props.allHandlers?.openGitActionSelector,
		"git-action-selected": props.allHandlers?.handleGitActionSelect
	}),

	githubNode: (props) => ({
		"connect-repository": props.allHandlers?.connectGitHubRepository
	}),

	projectExplorerNode: (props) => ({
		"file-selected": props.allHandlers?.handleFileSelected,
		"file-opened": props.allHandlers?.handleFileOpened,
		error: props.allHandlers?.handleError,
		"watch-toggled": props.allHandlers?.handleFileWatchToggled,
		onFileSelected: props.allHandlers?.handleFileSelected,
		onFileOpened: props.allHandlers?.handleFileOpened,
		onError: props.allHandlers?.handleError,
		onWatchToggled: props.allHandlers?.handleFileWatchToggled
	}),

	// Alias for projectExplorerNode
	projectExplorer: (props) => ({
		"file-selected": props.allHandlers?.handleFileSelected,
		"file-opened": props.allHandlers?.handleFileOpened,
		error: props.allHandlers?.handleError,
		"watch-toggled": props.allHandlers?.handleFileWatchToggled,
		onFileSelected: props.allHandlers?.handleFileSelected,
		onFileOpened: props.allHandlers?.handleFileOpened,
		onError: props.allHandlers?.handleError,
		onWatchToggled: props.allHandlers?.handleFileWatchToggled
	}),

	intentSelectionNode: (props) => ({
		"intent-selected": props.allHandlers?.handleIntentSelected,
		"proceed-to-next": props.allHandlers?.handleProceedToNext,
		"node-updated": props.allHandlers?.handleNodeUpdated
	}),

	// Alias for intentSelectionNode
	intentSelection: (props) => ({
		"intent-selected": props.allHandlers?.handleIntentSelected,
		"proceed-to-next": props.allHandlers?.handleProceedToNext,
		"node-updated": props.allHandlers?.handleNodeUpdated
	}),


	environmentNode: (props) => ({
		"environment-detected": props.allHandlers?.handleEnvironmentDetected
	}),

	templateNode: (props) => ({
		"backgroundColor": props.customNodeProps?.data?.themeColor 
			? `${props.customNodeProps.data.themeColor.replace('0.95', '0.15')}`
			: "rgba(16, 185, 129, 0.15)",
		"borderColor": props.customNodeProps?.data?.themeColor 
			? props.customNodeProps.data.themeColor
			: "rgba(16, 185, 129, 0.95)",
		"borderWidth": 2,
		"borderRadius": 8,
		"minWidth": 400,
		"minHeight": 250,
		"themeColor": props.customNodeProps?.data?.themeColor,
		"title": props.customNodeProps?.data?.label || "Template",
		"icon": "i-lucide-layers",
		"showDefaultHeader": true,
		"showCloseButton": true,
		"showEditButton": true,
		"showHandles": true,
		"collapsible": false,
		"template-created": props.allHandlers?.handleTemplateCreated,
		"template-updated": props.allHandlers?.handleTemplateUpdated
	})
};

export function useNodeComponentRegistry() {
	/**
	 * Get the component for a given node type
	 */
	const getNodeComponent = (nodeType: string): Component | null => {
		return NODE_COMPONENTS[nodeType] || null;
	};

	/**
	 * Get node-specific props for a given node type
	 */
	const getNodeProps = (nodeType: string, globalProps: any): Record<string, any> => {
		const propsGetter = NODE_SPECIFIC_PROPS[nodeType];
		return propsGetter ? propsGetter(globalProps) : {};
	};

	/**
	 * Register a new node type dynamically
	 * Useful for plugins or runtime node registration
	 */
	const registerNodeType = (nodeType: string, component: Component, propsGetter?: (props: any) => Record<string, any>) => {
		NODE_COMPONENTS[nodeType] = component;
		if (propsGetter) {
			NODE_SPECIFIC_PROPS[nodeType] = propsGetter;
		}
		console.log(`✅ Registered new node type: ${nodeType}`);
	};

	/**
	 * Check if a node type is registered
	 */
	const isNodeTypeRegistered = (nodeType: string): boolean => {
		return nodeType in NODE_COMPONENTS;
	};

	/**
	 * Get all node types as STRING mappings for VueFlow :node-types prop
	 * VueFlow expects { rectangle: "rectangle" } NOT { rectangle: Component }
	 * Template slots will handle actual rendering
	 */
	const getAllNodeTypes = (): Record<string, string> => {
		const types: Record<string, string> = {};
		for (const key of Object.keys(NODE_COMPONENTS)) {
			types[key] = key; // Map to itself as string
		}
		return types;
	};

	/**
	 * Get list of all registered node type names
	 */
	const getNodeTypeNames = (): string[] => {
		return Object.keys(NODE_COMPONENTS);
	};

	return {
		getNodeComponent,
		getNodeProps,
		registerNodeType,
		getAllNodeTypes,
		isNodeTypeRegistered,
		getNodeTypeNames
	};
}

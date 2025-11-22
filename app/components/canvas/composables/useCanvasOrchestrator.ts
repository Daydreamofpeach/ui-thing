/**
 * Canvas Orchestrator - Consolidates all composable initializations
 *
 * This composable reduces CanvasPanel.vue from 2,661 lines to ~600-800 lines
 * by centralizing the initialization of 25+ composables in correct dependency order.
 *
 * @created October 2025
 * @status Production-ready
 */

import type { Ref } from "vue";
import { buttClient } from "@utils/buttClient";
import { useVueFlow } from "@vue-flow/core";
import { computed, ref } from "vue";
import { useTransports } from "~/composables/useTransports";

import { getConnectionAnimationStyles } from "~/utils/connectionAnimations";
// Import all composables
import { useAnimationHandlers } from "../handlers/useAnimationHandlers";
import { useConnectionHandlers } from "../handlers/useConnectionHandlers";
import { useFormHandlers } from "../handlers/useFormHandlers";
import { useNodeLifecycleHandlers } from "../handlers/useNodeLifecycleHandlers";
import { useTemplateHandlers } from "../handlers/useTemplateHandlers";
import { useBrowserNodeManagement } from "./useBrowserNodeManagement";
import { useCanvasDataManagement } from "./useCanvasDataManagement";
import { useCanvasModals } from "./useCanvasModals";
import { useCanvasNodes } from "./useCanvasNodes";
import { useCanvasViews } from "./useCanvasViews";
import { useEdgeOperations } from "./useEdgeOperations";
import { useEnvironmentDetection } from "./useEnvironmentDetection";
import { useEnvironmentNodeHandlers } from "./useEnvironmentNodeHandlers";
import { useEventHandlers } from "./useEventHandlers";
import { useFileEditorManagement } from "./useFileEditorManagement";
import { useFileNodeOperations } from "./useFileNodeOperations";
import { useFormAutomation } from "./useFormAutomation";
import { useFormChainManagement } from "./useFormChainManagement";
import { useGitHubIntegration } from "./useGitHubIntegration";
import { useGitHubNodeHandlers } from "./useGitHubNodeHandlers";
import { useJsonOutput } from "./useJsonOutput";
import { useNodeConnections } from "./useNodeConnections";
import { useNodeCreatorHandlers } from "./useNodeCreatorHandlers";
import { useNodeDataFlow } from "./useNodeDataFlow";
import { useNodeDataUpdates } from "./useNodeDataUpdates";
import { useNodeFactoryHelpers } from "./useNodeFactoryHelpers";
import { useNodeInteractions } from "./useNodeInteractions";
import { useNodePositionPersistence } from "./useNodePositionPersistence";
import { useNodeVisibilityManagement } from "./useNodeVisibilityManagement";
import { useOscarHandlers } from "./useOscarHandlers";
import { usePowerShellCommands } from "./usePowerShellCommands";
import { useScriptHandlers } from "./useScriptHandlers";
import { useTemplateChainManagement } from "./useTemplateChainManagement";
import { useTemplateNodeManagement } from "./useTemplateNodeManagement";
import { useTemplateOperations } from "./useTemplateOperations";
import { useWebviewOperations } from "./useWebviewOperations";

interface OrchestratorProps {
	projectId?: string
	organizationId?: string
	availableHooks?: any[]
	availableTransports?: any[]
	templateId?: string
}

interface OrchestratorEmit {
	nodeCreated: [node: any]
	nodeDeleted: [nodeId: string]
	close: []
	saveStatusChanged: [status: "idle" | "saving" | "saved" | "error"]
	templateSaved: [templateId: string]
	reloadComponents: []
	edgeClicked: [edge: any]
}

export function useCanvasOrchestrator(
	props: OrchestratorProps,
	emit: (event: keyof OrchestratorEmit, ...args: any[]) => void,
	nodeCreatorRef: Ref<any>,
	formSubmissionControllerRef: Ref<any>
) {
	// ============================================================================
	// VUEFLOW SETUP
	// ============================================================================
	const {
		fitView: vueFlowFitView,
		onConnect,
		onEdgeClick,
		onNodesChange,
		addEdges,
		addNodes,
		removeNodes,
		removeEdges,
		setEdges,
		updateNode: vueFlowUpdateNode,
		getNode: getNodeFn,
		viewport,
		setViewport: vueFlowSetViewport,
		onNodeDragStop
	} = useVueFlow();

	// ============================================================================
	// CORE NODE MANAGEMENT
	// ============================================================================
	const canvasNodes = useCanvasNodes(addNodes);

	const {
		nodeTypes,
		allNodes,
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
		folderBrowserNodes: _folderBrowserNodes,
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
		addBrowserNode,
		addProjectScriptRunnerNode,
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
		addUserManagementNode,
		addTaskNode,
		addIntegrationConnectionNode,
		addIntegrationDetailNode,
		addIdeStatusNode,
		clearAllNodes: clearAllNodesBase,
		createNode,
		createNodeFromTemplate,
		syncWithExistingNodes: _syncWithExistingNodes,
		registerExistingNode
	} = canvasNodes;

	// Create allNodeArrays for composables that need it
	const allNodeArrays = [
		{ array: databaseNodes, name: "databaseNodes" },
		{ array: apiNodes, name: "apiNodes" },
		{ array: serverNodes, name: "serverNodes" },
		{ array: cloudNodes, name: "cloudNodes" },
		{ array: eventNodes, name: "eventNodes" },
		{ array: commandNodes, name: "commandNodes" },
		{ array: viewNodes, name: "viewNodes" },
		{ array: gitActionNodes, name: "gitActionNodes" },
		{ array: hookNodes, name: "hookNodes" },
		{ array: transportNodes, name: "transportNodes" },
		{ array: transportTemplateNodes, name: "transportTemplateNodes" },
		{ array: templateNodes, name: "templateNodes" },
		{ array: templateConfiguredNodes, name: "templateConfiguredNodes" },
		{ array: solutionNodes, name: "solutionNodes" },
		{ array: webviewNodes, name: "webviewNodes" },
		{ array: viewportNodes, name: "viewportNodes" },
		{ array: codeEditorNodes, name: "codeEditorNodes" },
		{ array: githubNodes, name: "githubNodes" },
		{ array: _folderBrowserNodes, name: "folderBrowserNodes" },
		{ array: intentSelectionNodes, name: "intentSelectionNodes" },
		{ array: projectExplorerNodes, name: "projectExplorerNodes" },
		{ array: environmentNodes, name: "environmentNodes" },
		{ array: nodeCheckNodes, name: "nodeCheckNodes" },
		{ array: phpCheckNodes, name: "phpCheckNodes" },
		{ array: userNodes, name: "userNodes" },
		{ array: orbitCardNodes, name: "orbitCardNodes" },
		{ array: projectNodes, name: "projectNodes" },
		{ array: setupProjectNodes, name: "setupProjectNodes" },
		{ array: projectToolsSetupNodes, name: "projectToolsSetupNodes" },
		{ array: projectEnvironmentNodes, name: "projectEnvironmentNodes" },
		{ array: projectInstallNodes, name: "projectInstallNodes" },
		{ array: builditNodes, name: "builditNodes" },
		{ array: userManagementNodes, name: "userManagementNodes" },
		{ array: taskNodes, name: "taskNodes" },
		{ array: integrationConnectionNodes, name: "integrationConnectionNodes" },
		{ array: integrationDetailNodes, name: "integrationDetailNodes" },
		{ array: rustCheckNodes, name: "rustCheckNodes" },
		{ array: dotnetCheckNodes, name: "dotnetCheckNodes" },
		{ array: pythonCheckNodes, name: "pythonCheckNodes" },
		{ array: javaCheckNodes, name: "javaCheckNodes" },
		{ array: builditCliNodes, name: "builditCliNodes" },
		{ array: browserNodes, name: "browserNodes" },
		{ array: projectScriptRunnerNodes, name: "projectScriptRunnerNodes" },
		{ array: bFolderSetupNodes, name: "bFolderSetupNodes" },
		{ array: saveTemplateNodes, name: "saveTemplateNodes" },
		{ array: fileCreatorNodes, name: "fileCreatorNodes" },
		{ array: formsPanelNodes, name: "formsPanelNodes" },
		{ array: formBuilderNodes, name: "formBuilderNodes" },
		{ array: scriptEditorNodes, name: "scriptEditorNodes" },
		{ array: userNodes, name: "userNodes" },
		{ array: orbitCardNodes, name: "orbitCardNodes" },
		{ array: projectNodes, name: "projectNodes" },
		{ array: userManagementNodes, name: "userManagementNodes" },
		{ array: taskNodes, name: "taskNodes" },
		{ array: integrationConnectionNodes, name: "integrationConnectionNodes" },
		{ array: integrationDetailNodes, name: "integrationDetailNodes" },
		{ array: builditNodes, name: "builditNodes" },
		{ array: ideStatusNodes, name: "ideStatusNodes" }
	];

	// ============================================================================
	// EDGES & DISPLAY STATE
	// ============================================================================
	const edges = ref<any[]>([]);
	const canvasDisplayName = ref<string>("Untitled Canvas");
	const currentViewport = computed(() => ({
		x: viewport.value.x,
		y: viewport.value.y,
		zoom: viewport.value.zoom
	}));

	// Get animated edges for animation component injection
	const animatedEdges = computed(() => {
		return edges.value.filter((edge: any) =>
			edge.animated
			&& edge.animationType
			&& edge.animationType !== "flow"
		);
	});

	// ============================================================================
	// NODE DATA MANAGEMENT
	// ============================================================================
	const { updateNodeData: updateNodeDataBase, isDataProducingNode: _isDataProducingNode, processNodeDataFlow, refreshViewData: _refreshViewData } = useNodeDataUpdates(allNodeArrays, () => ({}), () => {});

	// Position persistence system
	const {
		nodePositionLock: _nodePositionLock,
		lockNodePosition,
		lockAllNodePositions: _lockAllNodePositions,
		getLockedPosition,
		clearPositionLocks,
		loadNodesWithExactPositions,
		createPositionSnapshot: _createPositionSnapshot,
		restoreFromSnapshot: _restoreFromSnapshot,
		savePositionsToApi,
		handleNodeDragStop: handleDragStopPersistence,
		addNodeWithPositionProtection: _addNodeWithPositionProtection,
		initializePositionTracking,
		verifyAllPositions
	} = useNodePositionPersistence();

	// Forward declaration for handleNodeUpdated (will be properly defined after useTemplateNodeManagement)
	let handleNodeUpdated: (nodeId: string, data: any) => void;

	// Clean up edges that reference nodes that don't exist
	const cleanupInvalidEdges = () => {
		const nodeIds = new Set(allNodes.value.map((n: any) => n.id));
		const validEdges = edges.value.filter((edge: any) => {
			const hasSource = nodeIds.has(edge.source);
			const hasTarget = nodeIds.has(edge.target);
			if (!hasSource || !hasTarget) {
				console.warn(`⚠️ Removing invalid edge: ${edge.id} (source: ${hasSource}, target: ${hasTarget})`);
				return false;
			}
			return true;
		});
		if (validEdges.length < edges.value.length) {
			console.log(`🧹 Cleaned up ${edges.value.length - validEdges.length} invalid edge(s)`);
			setEdges(validEdges);
		}
	};

	// Enhanced updateNodeData that ONLY updates data, NEVER touches positions
	const updateNodeData = (nodeId: string, key: string, value: any) => {
		console.log(`🔧 updateNodeData: ${nodeId}.${key} = ${value}`);

		// CRITICAL: Lock current position BEFORE any update
		const currentNode = getNodeFn.value(nodeId);
		if (!currentNode) {
			console.warn(`⚠️ updateNodeData: Node ${nodeId} not found, skipping update for key ${key}`);
			return;
		}

		if (currentNode.position) {
			lockNodePosition(nodeId, currentNode.position);
			console.log(`🔒 Pre-locked position for ${nodeId}:`, currentNode.position);
		}

		// Update data in reactive array (this is the source of truth)
		// Fallback: update directly on node if base method fails
		try {
			updateNodeDataBase(nodeId, key, value);
		} catch (err) {
			console.warn(`⚠️ updateNodeDataBase failed, updating directly on node`);
			if (currentNode && currentNode.data) {
				currentNode.data[key] = value;
			}
		}

		// DO NOT call vueFlowUpdateNode - it causes position issues
		// VueFlow will automatically reflect changes from the reactive arrays (allNodes)
		// which is computed from all the node arrays that were just updated

		// Clean up any edges that reference nodes that don't exist
		cleanupInvalidEdges();

		// Trigger propagation logic if handler is defined
		if (handleNodeUpdated) {
			const updateData: any = { [key]: value };
			handleNodeUpdated(nodeId, updateData);
		}
	};

	const PROJECT_CONFIG_CHAIN_PREFIX = "project-config-";

	const toProjectConfigChainKey = (projectId?: string | null, fallbackId?: string) => {
		const baseId = projectId ?? fallbackId;
		return baseId ? `${PROJECT_CONFIG_CHAIN_PREFIX}${String(baseId)}` : null;
	};

	const assignProjectConfigChainMetadata = (
		node: any,
		projectId: string | null | undefined,
		order: number,
		fallbackId?: string
	) => {
		const chainKey = toProjectConfigChainKey(projectId, fallbackId ?? node.id);
		node.data = {
			...(node.data || {}),
			projectConfigChainParent: chainKey,
			_isChainNode: true,
			_chainParent: chainKey || node.id,
			_chainOrder: order
		};
	};

	const updateProjectConfigChainMetadata = (
		nodeId: string,
		projectId: string | null | undefined,
		order: number,
		fallbackId?: string
	) => {
		const chainKey = toProjectConfigChainKey(projectId, fallbackId ?? nodeId);
		updateNodeData(nodeId, "_isChainNode", true);
		updateNodeData(nodeId, "_chainParent", chainKey || nodeId);
		updateNodeData(nodeId, "_chainOrder", order);
		if (chainKey) {
			updateNodeData(nodeId, "projectConfigChainParent", chainKey);
		}
	};

	const refreshBuilditOrbitForProject = (projectId?: string | null) => {
		if (!projectId) {
			return;
		}

		const nodesForProject = (allNodes.value || []).filter((node: any) =>
			["setupProjectNode", "projectToolsSetupNode", "projectEnvironmentNode", "projectInstallNode"].includes(node.type)
			&& String(node.data?.projectId) === String(projectId)
		);

		nodesForProject.forEach((node: any) => {
			let order = 1;
			let fallbackId: string | undefined;

			if (node.type === "setupProjectNode") {
				order = 0;
				fallbackId = node.data?.parentNodeId;
			} else if (node.type === "projectToolsSetupNode") {
				order = 1;
				fallbackId = node.data?.parentNodeId || node.data?.sourceSetupNodeId || node.data?.sourceProjectNodeId;
			} else if (node.type === "projectEnvironmentNode") {
				order = 2;
				fallbackId = node.data?.sourceSetupNodeId || node.data?.sourceProjectNodeId;
			} else if (node.type === "projectInstallNode") {
				order = 3;
				fallbackId = node.data?.sourceProjectNodeId || node.data?.sourceEnvironmentNodeId;
			}

			updateProjectConfigChainMetadata(node.id, projectId, order, fallbackId);
		});

		const builditNode = (allNodes.value || []).find((node: any) =>
			node.type === "builditNode" && String(node.data?.projectId) === String(projectId)
		);

		if (builditNode) {
			updateProjectConfigChainMetadata(builditNode.id, projectId, 4, builditNode.id);
			updateNodeData(builditNode.id, "orbitRefreshKey", Date.now());
		}
	};

	// ============================================================================
	// CONNECTION & EDGE MANAGEMENT
	// ============================================================================
	const connectionTypes = ref([
		{ id: "default", name: "Default", flowType: "smoothstep" },
		{ id: "straight", name: "Straight", flowType: "straight" },
		{ id: "step", name: "Step", flowType: "step" },
		{ id: "smoothstep", name: "Smooth Step", flowType: "smoothstep" },
		{ id: "simplebezier", name: "Bezier", flowType: "simplebezier" }
	]);

	const defaultConnectionType = ref("smoothstep");

	// Default connection style (can be updated by chain flow controller)
	const defaultConnectionStyle = ref({
		color: "#8b5cf6",
		animationType: "flow",
		animationSpeed: "normal",
		strokeWidth: 3,
		type: "smoothstep",
		animated: true
	});

	const { allEdges, handleConnect, getConnectedNodesCount: _getConnectedNodesCount } = useNodeConnections(edges, allNodes, addEdges, () => {}, () => {}, defaultConnectionStyle);

	// Edge Operations Composable - Must come after VueFlow setup
	const edgeOperations = useEdgeOperations(
		allNodes,
		edges,
		allNodeArrays,
		getNodeFn,
		addEdges,
		addNodes,
		removeEdges,
		setEdges,
		vueFlowUpdateNode,
		getConnectionAnimationStyles as any
	);

	const { addEdge, removeEdge, updateEdge, addMultipleNodes, addMultipleEdges, updateNodePositions } = edgeOperations;

	// Connection Handlers Composable - Must come after addEdge is available
	const connectionHandlers = useConnectionHandlers(
		edges,
		connectionTypes,
		defaultConnectionType,
		addEdge
	);

	const { handleConnectionStart, handleConnectionEnd, handleCreateEnhancedConnection, handleCancelConnection } = connectionHandlers;

	// ============================================================================
	// POWERSHELL & EVENT HANDLERS
	// ============================================================================
	const { commands, commandsLoading, commandsError, loadPowerShellCommands } = usePowerShellCommands();
	const { eventsModalOpen, commandsModalOpen, viewsModalOpen, gitActionsModalOpen } = useEventHandlers();

	// ============================================================================
	// NODE INTERACTIONS
	// ============================================================================
	const {
		selectedNodeForEvent,
		selectedNodeForCommand,
		selectedNodeForView,
		selectedNodeForGitAction,
		openEventSelector,
		handleEventSelect,
		openCommandSelector,
		handleCommandSelect,
		handleCommandGoogle: _handleCommandGoogle,
		openViewSelector,
		handleViewSelect,
		openGitActionSelector,
		handleGitActionSelect,
		testEvent,
		testCommand,
		testView: _testView,
		testGitAction: _testGitAction,
		getEventCategory,
		getStatusClass,
		getCommandCategory,
		getViewCategory: _getViewCategory,
		getGitActionCategory: _getGitActionCategory,
		getNodeColor,
		deleteSelectedNodes: _deleteSelectedNodes
	} = useNodeInteractions(allNodes, edges, emit, allNodeArrays, updateNodeData, eventsModalOpen, commandsModalOpen, viewsModalOpen, gitActionsModalOpen);

	// ============================================================================
	// JSON OUTPUT & MODALS
	// ============================================================================
	const { showJsonView, jsonOutput: _jsonOutput, formattedJsonOutput, toggleJsonView, copyJsonToClipboard, downloadJson } = useJsonOutput(allNodes, allEdges);

	const {
		showTemplateCreationModal,
		selectedNodeForTemplate,
		isCreatingTemplate: _isCreatingTemplate,
		newTemplate: _newTemplate,
		isTemplateFormValid: _isTemplateFormValid,
		openTemplateCreationModal,
		closeTemplateCreationModal,
		createTemplate: _createTemplateFromModal,
		showTransportModal,
		selectedTransport,
		availableTransportTypes,
		openTransportCreationModal: _openTransportCreationModal,
		openTransportEditModal: _openTransportEditModal,
		closeTransportModal,
		handleTransportCreated,
		handleTransportUpdated: _handleTransportUpdated,
		deleteTransportFromNode: deleteTransportFromNodeModal,
		showHookModal,
		availableHookTypes: _availableHookTypes,
		openHookCreationModal: _openHookCreationModal,
		closeHookModal,
		handleHookCreated
	} = useCanvasModals(updateNodeData, allNodes, (_templateNodeId, createdTemplate) => {
		handleTemplateCreated(createdTemplate);
	});

	const { fetchAvailableTransportTypes, deleteTransport } = useTransports();

	// ============================================================================
	// CANVAS VIEWS
	// ============================================================================
	const { setCurrentCanvas: _setCurrentCanvas, setCurrentCanvasName, currentCanvasId, renameCanvas } = useCanvasViews();

	// ============================================================================
	// ENVIRONMENT & INTEGRATIONS
	// ============================================================================
	const { getConnectedData: _getConnectedData, setConnectedData: _setConnectedData, clearConnectedData: _clearConnectedData, addConnection: _addConnection, removeConnection: _removeConnection, processDataFlow: _processDataFlow, getGitHubRepoData: _getGitHubRepoData } = useNodeDataFlow();
	const envDetection = useEnvironmentDetection();
	const githubIntegration = useGitHubIntegration();
	const { findCodeEditorNodeByFilePath: _findCodeEditorNodeByFilePath, removeCodeEditorNode: _removeCodeEditorNode, handleFileOpened, toggleCodeEditorCollapse: _toggleCodeEditorCollapse, getCodeEditorNodeStyle: _getCodeEditorNodeStyle, handleCodeChanged: _handleCodeChanged } = useFileEditorManagement(allNodes, edges, addEdges, vueFlowUpdateNode, nodeCreatorRef, addNodes);
	const { handleFileGenerated: _handleFileGenerated, handleCreateWebview: _handleCreateWebview, handleCreateCodeEditor: _handleCreateCodeEditor, handleNodesUpdated, handleEdgesUpdated } = useNodeCreatorHandlers(nodeCreatorRef);
	const { updateEnvironmentNodeData: _updateEnvironmentNodeData, handleDetectNode: _handleDetectNode, handleDetectPackageManagers: _handleDetectPackageManagers, handleDetectRust: _handleDetectRust, handleDetectPhp: _handleDetectPhp, handleDetectDotnet: _handleDetectDotnet, handleDetectPython: _handleDetectPython, handleDetectJava: _handleDetectJava } = useEnvironmentNodeHandlers(envDetection, updateNodeData, allNodes);
	const { connectGitHubRepository } = useGitHubNodeHandlers(githubIntegration, githubNodes);

	// ============================================================================
	// BROWSER & VIEWPORT MANAGEMENT
	// ============================================================================
	const browserManagement = useBrowserNodeManagement(
		browserNodes,
		viewportNodes,
		hookNodes,
		transportNodes,
		transportTemplateNodes,
		formsPanelNodes,
		edges,
		allNodes,
		allEdges,
		getNodeFn,
		createNode,
		addNodes,
		addEdges,
		removeNodes,
		removeEdges,
		updateNodeDataBase,
		vueFlowUpdateNode,
		lockNodePosition
	);

	const {
		getActiveViewportTypes,
		handleCloseViewport,
		handleCreateDevBrowserNode,
		handleCreateFormPreviewBrowserNode,
		handleCreateHookNodeForForm,
		handleCloseHookNode,
		handleHookAttached,
		handleCloseTransportNode,
		handleOpenFormGenerator,
		handleCreateTransportListener,
		handleRemoveTransportListener,
		handleCreateTransportTemplateNode,
		handleSpawnViewport,
		handleBrowserUrlChanged,
		handleBrowserRefresh,
		handleBrowserOpenExternal,
		handleCloseBrowserNode,
		getConnectedHookNode,
		getConnectedTransportNode,
		handleCreateFormAutomationNode
	} = browserManagement;

	// Add form builder node handler
	const handleAddFormBuilderNode = addFormBuilderNode;

	// ============================================================================
	// VISIBILITY, TEMPLATE CHAINS, WEBVIEW, AND CANVAS DATA
	// ============================================================================
	const visibilityManagement = useNodeVisibilityManagement(
		intentSelectionNodes,
		projectExplorerNodes,
		projectScriptRunnerNodes,
		bFolderSetupNodes,
		saveTemplateNodes,
		allNodes,
		updateNodeDataBase,
		vueFlowUpdateNode,
		getNodeFn,
		addNodes,
		vueFlowFitView
	);

	const {
		handleToggleNodeVisibility,
		handleShowAllNodes,
		handleHideAllNodes,
		handleFocusChain
	} = visibilityManagement;

	const templateChain = useTemplateChainManagement(
		allNodes,
		edges,
		templateNodes,
		templateConfiguredNodes,
		intentSelectionNodes,
		projectExplorerNodes,
		projectScriptRunnerNodes,
		bFolderSetupNodes,
		saveTemplateNodes,
		hookNodes,
		transportNodes,
		transportTemplateNodes,
		solutionNodes,
		codeEditorNodes,
		webviewNodes,
		formsPanelNodes,
		browserNodes,
		addNodes,
		lockNodePosition,
		clearAllNodesBase,
		clearPositionLocks,
		vueFlowSetViewport,
		savePositionsToApi,
		verifyAllPositions,
		updateNodeDataBase
	);

	const { restoreTemplateChain } = templateChain;

	const webviewOps = useWebviewOperations();
	const {
		isWebviewLoading,
		loadUrlContent: loadUrlContentBase,
		switchToHtmlMode: switchToHtmlModeBase,
		switchToUrlMode: switchToUrlModeBase,
		onWebviewLoad: onWebviewLoadBase,
		onWebviewError: onWebviewErrorBase,
		openInTauriWebview,
		openInExternalBrowser
	} = webviewOps;

	const loadUrlContent = (nodeId: string, url: string, htmlContent?: string) => loadUrlContentBase(nodeId, url, updateNodeData, htmlContent);
	const switchToHtmlMode = (nodeId: string) => switchToHtmlModeBase(nodeId, updateNodeData);
	const switchToUrlMode = (nodeId: string) => switchToUrlModeBase(nodeId, updateNodeData);
	const onWebviewLoad = (nodeId: string) => onWebviewLoadBase(nodeId, updateNodeData);
	const onWebviewError = (nodeId: string, event: Event) => onWebviewErrorBase(nodeId, event, updateNodeData);

	const openInTauriWebviewWrapper = async (nodeId: string, url: string, htmlContent?: string) => {
		const node = allNodes.value.find((n) => n.id === nodeId);
		const nodeHtmlContent = htmlContent || node?.data?.htmlContent;
		return openInTauriWebview(nodeId, url, nodeHtmlContent);
	};

	const canvasData = useCanvasDataManagement(
		allNodes,
		edges,
		databaseNodes,
		apiNodes,
		serverNodes,
		cloudNodes,
		eventNodes,
		commandNodes,
		viewNodes,
		gitActionNodes,
		hookNodes,
		transportNodes,
		transportTemplateNodes,
		templateNodes,
		templateConfiguredNodes,
		solutionNodes,
		githubNodes,
		_folderBrowserNodes,
		intentSelectionNodes,
		projectExplorerNodes,
		projectScriptRunnerNodes,
		bFolderSetupNodes,
		saveTemplateNodes,
		environmentNodes,
		webviewNodes,
		viewportNodes,
		codeEditorNodes,
		rustCheckNodes,
		nodeCheckNodes,
		phpCheckNodes,
		dotnetCheckNodes,
		pythonCheckNodes,
		javaCheckNodes,
		builditCliNodes,
		fileCreatorNodes,
		formsPanelNodes,
		formBuilderNodes,
		formAutomationNodes,
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
		browserNodes,
		clearAllNodesBase,
		clearPositionLocks,
		lockNodePosition,
		loadNodesWithExactPositions,
		vueFlowSetViewport,
		verifyAllPositions,
		canvasDisplayName,
		setEdges,
		setCurrentCanvasName,
		addNodes
	);

	const {
		loadCanvasData,
		handleLoadCanvas: _handleLoadCanvas,
		handleCreateNewCanvas: handleCreateNewCanvasBase
	} = canvasData;

	// ============================================================================
	// NODE FACTORIES, TEMPLATES, FILES, SCRIPTS, OSCAR
	// ============================================================================
	const factoryHelpers = useNodeFactoryHelpers(createNode, addNodes);
	const { getNodeCreators: getSpecialNodeCreators } = factoryHelpers;

	// Create unified getNodeCreators that includes ALL node types
	const getNodeCreators = () => {
		return {
			// Basic shapes from useCanvasNodes
			rectangle: addRectangleNode,
			circle: addCircleNode,
			diamond: addDiamondNode,
			triangle: addTriangleNode,
			hexagon: addHexagonNode,
			database: addDatabaseNode,
			api: addApiNode,
			server: addServerNode,
			cloud: addCloudNode,
			eventNode: addEventNode,
			commandNode: addCommandNode,
			viewNode: addViewNode,
			webviewNode: addWebviewNode,
			gitActionNode: addGitActionNode,
			hookNode: addHookNode,
			transportNode: addTransportNode,
			templateNode: addTemplateNode,
			solutionNode: addSolutionNode,
			browserNode: addBrowserNode,
			projectScriptRunnerNode: addProjectScriptRunnerNode,
			fileCreatorNode: addFileCreatorNode,
			formsPanelNode: addFormsPanelNode,
			formBuilderNode: addFormBuilderNode,
			userNode: addUserNode,
			orbitCardNode: addOrbitCardNode,
			projectNode: addProjectNode,
			setupProjectNode: addSetupProjectNode,
			projectToolsSetupNode: addProjectToolsSetupNode,
			projectEnvironmentNode: addProjectEnvironmentNode,
			userManagementNode: addUserManagementNode,
			taskNode: addTaskNode,
			integrationConnectionNode: addIntegrationConnectionNode,
			integrationDetailNode: addIntegrationDetailNode,
			ideStatusNode: addIdeStatusNode,

			// Special nodes from useNodeFactoryHelpers
			...getSpecialNodeCreators()
		};
	};

	const templateNodeMgmt = useTemplateNodeManagement(
		allNodes,
		edges,
		addNodes,
		addEdges,
		emit,
		templateNodes,
		intentSelectionNodes,
		projectExplorerNodes,
		vueFlowUpdateNode,
		getNodeFn,
		allNodeArrays,
		projectScriptRunnerNodes,
		bFolderSetupNodes,
		saveTemplateNodes
	);

	const {
		handleProjectTypeSelected,
		handleFolderSelected,
		handleIntentAnalyzed,
		handleStackSelected,
		handleIntentSelected,
		handleProceedToNext,
		handleNodeUpdated: handleNodeUpdatedBase,
		handleFileSelected,
		handleAnalysisComplete,
		handleError,
		createIntentSelectionNode,
		createProjectExplorerNode,
		createEdge,
		configureTemplateNode
	} = templateNodeMgmt;

	handleNodeUpdated = handleNodeUpdatedBase;

	const scriptHandlers = useScriptHandlers(
		allNodes,
		edges,
		scriptEditorNodes,
		codeEditorNodes,
		getNodeFn,
		addNodes,
		addEdges,
		updateNodeData
	);

	const oscarHandlers = useOscarHandlers(
		allNodes,
		getNodeFn,
		vueFlowSetViewport,
		updateNodeData,
		handleNodeUpdated
	);

	const fileOps = useFileNodeOperations(createNode, addNodes, addEdges, getNodeFn, allNodes);
	const { handleFileCreated, handleCreateSaveTemplateNode: handleCreateSaveTemplateNodeBase } = fileOps;

	const templateOps = useTemplateOperations(
		allNodes,
		allEdges,
		viewport,
		templateNodes,
		createNode,
		createNodeFromTemplate,
		createIntentSelectionNode,
		createEdge,
		configureTemplateNode,
		lockNodePosition,
		savePositionsToApi,
		verifyAllPositions,
		addNodes,
		userNodes,
		orbitCardNodes
	);

	const { addNodeWithData, handleTemplateCreated, handleTemplateUpdated: handleTemplateUpdatedBase } = templateOps;

	const handleCreateSaveTemplateNode = (bFolderNodeProps: any) =>
		handleCreateSaveTemplateNodeBase(bFolderNodeProps, saveTemplateNodes, templateNodes, addEdges, updateNodeDataBase);

	const handleTemplateUpdated = (nodeId: string, templateData: any) =>
		handleTemplateUpdatedBase(nodeId, templateData, updateNodeData);

	const handleSaveStatusChanged = (status: "idle" | "saving" | "saved" | "error") => {
		emit("saveStatusChanged", status);
	};

	const handleTemplateSaved = (templateId: string) => {
		emit("templateSaved", templateId);
		emit("reloadComponents");
	};

	// ============================================================================
	// FORM AUTOMATION & CHAIN MANAGEMENT
	// ============================================================================
	const formAutomation = useFormAutomation(
		formsPanelNodes,
		browserNodes,
		hookNodes,
		transportNodes,
		allNodes,
		edges,
		updateNodeDataBase
	);

	const formChain = useFormChainManagement(
		formsPanelNodes,
		browserNodes,
		hookNodes,
		transportNodes,
		transportTemplateNodes,
		allNodes,
		edges,
		getNodeFn,
		updateNodeDataBase
	);

	const {
		handleFormSubmitted,
		handleFormSubmissionError,
		handleSubmissionChainUpdated,
		handleTransportAttached,
		handleSaveFormChainConfig,
		handleRestoreFormChain,
		handleCreateFormPreviewEdge
	} = formChain;

	// ============================================================================
	// PROJECT ENVIRONMENT NODE HANDLER
	// ============================================================================
	const handleCreateProjectEnvironmentNode = (setupNodeId: string, environmentData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🌳 CREATING PROJECT ENVIRONMENT NODE");
		console.log("  Setup Node ID:", setupNodeId);
		console.log("  Environment Data:", environmentData);
		console.log("  Auto-install:", environmentData.autoInstall || false);
		console.log("═══════════════════════════════════════════");

		// Determine if this is spawned from ProjectNode or SetupProjectNode
		const parentNode = getNodeFn.value(setupNodeId);
		const isDirectFromProject = parentNode?.type === "projectNode";

		// Create new environment node
		const envNode = createNodeFromTemplate("projectEnvironmentNode", {
			projectId: environmentData.projectId,
			projectName: environmentData.projectName,
			connectedIde: environmentData.connectedIde,
			repositories: environmentData.repositories || [],
			autoInstall: environmentData.autoInstall || false, // Pass auto-install flag
			sourceSetupNodeId: setupNodeId,
			sourceProjectNodeId: isDirectFromProject ? setupNodeId : null // Store if spawned directly from ProjectNode
		}, allNodes.value);

		const environmentProjectId = environmentData.projectId || parentNode?.data?.projectId || null;
		assignProjectConfigChainMetadata(envNode, environmentProjectId, 2, setupNodeId);

	// Position it to the right of the parent node
	const setupNode = parentNode;
	if (setupNode) {
		envNode.position = {
			x: setupNode.position.x + 650,
			y: setupNode.position.y
		};
		// Don't lock the position - allow the user to move the node freely
		// lockNodePosition(envNode.id, envNode.position);
	}

		// Register node in internal arrays FIRST
		registerExistingNode(envNode);

		// Then add the node to VueFlow
		addNodes([envNode]);

		// Create connection
		const connectionId = `${setupNodeId}-to-${envNode.id}`;
		const connection = {
			id: connectionId,
			source: setupNodeId,
			target: envNode.id,
			sourceHandle: "right",
			targetHandle: "left",
			type: "smoothstep",
			style: { stroke: "rgba(239, 68, 68, 0.8)", strokeWidth: 2 },
			markerEnd: { type: "arrowclosed", color: "rgba(239, 68, 68, 0.8)" },
			animated: true,
			label: "Environment",
			labelStyle: {
				fill: "rgba(239, 68, 68, 1)",
				fontWeight: 600,
				fontSize: "11px",
				fontFamily: "Inter, system-ui, sans-serif"
			},
			labelBgStyle: {
				fill: "rgba(0, 0, 0, 0.85)",
				fillOpacity: 0.95
			},
			labelBgPadding: [8, 6],
			labelBgBorderRadius: 6
		};

		addEdges([connection]);

		console.log("✅ Project Environment Node created");
		console.log("  Node ID:", envNode.id);
		console.log("  Connected IDE:", environmentData.connectedIde?.name);
		console.log("  Repositories:", environmentData.repositories?.length || 0);
		console.log("  Auto-install:", environmentData.autoInstall || false);
		console.log("═══════════════════════════════════════════");

		refreshBuilditOrbitForProject(environmentProjectId);
	};

	const handleCreateProjectInstallNode = (sourceNodeId: string, installData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🧩 CREATING PROJECT INSTALL NODE");
		console.log("  Source Node ID:", sourceNodeId);
		console.log("  Install Data:", installData);
		console.log("═══════════════════════════════════════════");

		const sourceNode = getNodeFn.value(sourceNodeId);
		if (!sourceNode) {
			console.error("❌ Source node not found:", sourceNodeId);
			return;
		}

		const isSourceProject = sourceNode.type === "projectNode" || sourceNode.type === "projectConfiguredNode";
		const parentNodeId = sourceNode.id;
		const parentPosition = sourceNode.position || { x: 0, y: 0 };
		const sourceProjectNodeId = isSourceProject ? parentNodeId : sourceNode.data?.sourceProjectNodeId || null;
		const sourceEnvironmentNodeId = isSourceProject ? null : parentNodeId;

		const installProjectId = installData.projectId || sourceNode.data?.projectId || null;

		const existingInstallNode = (allNodes.value || []).find((node: any) =>
			node.type === "projectInstallNode"
			&& node.data?.projectId === installData.projectId
		);

		if (existingInstallNode) {
			console.log("ℹ️ Project install node already exists, updating data");
			if (existingInstallNode.id) {
				updateNodeData(existingInstallNode.id, "projectId", installData.projectId || existingInstallNode.data?.projectId);
				updateNodeData(existingInstallNode.id, "projectName", installData.projectName || existingInstallNode.data?.projectName);
				updateNodeData(existingInstallNode.id, "savedEnvironmentSetup", installData.setupData || existingInstallNode.data?.savedEnvironmentSetup);
				updateNodeData(existingInstallNode.id, "sourceProjectNodeId", sourceProjectNodeId);
				updateNodeData(existingInstallNode.id, "sourceEnvironmentNodeId", sourceEnvironmentNodeId);
				updateProjectConfigChainMetadata(existingInstallNode.id, installProjectId, 3, parentNodeId);
			}
			refreshBuilditOrbitForProject(installProjectId);
			return;
		}

		const installNode = createNodeFromTemplate("projectInstallNode", {
			projectId: installData.projectId,
			projectName: installData.projectName,
			savedEnvironmentSetup: installData.setupData || null,
			sourceProjectNodeId,
			sourceEnvironmentNodeId
		}, allNodes.value);

		assignProjectConfigChainMetadata(installNode, installProjectId, 3, parentNodeId);

		installNode.position = isSourceProject
			? { x: parentPosition.x + 650, y: parentPosition.y + 220 }
			: { x: parentPosition.x + 420, y: parentPosition.y + 260 };
		lockNodePosition(installNode.id, installNode.position);

		registerExistingNode(installNode);

		addNodes([installNode]);

		const connectionId = `${parentNodeId}-to-${installNode.id}`;
		const connection = {
			id: connectionId,
			source: parentNodeId,
			target: installNode.id,
			sourceHandle: "right",
			targetHandle: "left",
			type: "smoothstep",
			style: { stroke: "rgba(16, 185, 129, 0.85)", strokeWidth: 2 },
			markerEnd: { type: "arrowclosed", color: "rgba(16, 185, 129, 0.85)" },
			animated: true,
			label: "Install",
			labelStyle: {
				fill: "rgba(16, 185, 129, 1)",
				fontWeight: 600,
				fontSize: "11px",
				fontFamily: "Inter, system-ui, sans-serif"
			},
			labelBgStyle: {
				fill: "rgba(0, 0, 0, 0.85)",
				fillOpacity: 0.95
			},
			labelBgPadding: [8, 6],
			labelBgBorderRadius: 6
		};

		addEdges([connection]);

		console.log("✅ Project Install Node created");
		console.log("  Node ID:", installNode.id);
		console.log("  Project ID:", installData.projectId);
		console.log("  Source Project Node ID:", sourceProjectNodeId);
		console.log("  Source Environment Node ID:", sourceEnvironmentNodeId);
		console.log("═══════════════════════════════════════════");

		refreshBuilditOrbitForProject(installProjectId);
	};

	const handleCreateBuilditNode = (sourceNodeId: string, builditData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🚀 CREATING BUILDIT NODE");
		console.log("  Source Node ID:", sourceNodeId);
		console.log("  Buildit Data:", builditData);
		console.log("═══════════════════════════════════════════");

		const sourceNode = getNodeFn.value(sourceNodeId);
		if (!sourceNode) {
			console.error("❌ Source node not found:", sourceNodeId);
			return;
		}

		const parentNodeId = sourceNode.id;
		const parentPosition = sourceNode.position || { x: 0, y: 0 };
		const builditProjectId = builditData.projectId || sourceNode.data?.projectId || null;

		// Check if BuilditNode already exists for this project
		const existingBuilditNode = (allNodes.value || []).find((node: any) =>
			node.type === "builditNode"
			&& node.data?.projectId === builditData.projectId
		);

		if (existingBuilditNode) {
			console.log("ℹ️ Buildit node already exists, updating data");
			if (existingBuilditNode.id) {
				updateNodeData(existingBuilditNode.id, "projectId", builditData.projectId || existingBuilditNode.data?.projectId);
				updateNodeData(existingBuilditNode.id, "projectName", builditData.projectName || existingBuilditNode.data?.projectName);
				updateNodeData(existingBuilditNode.id, "savedEnvironmentSetup", builditData.setupData || existingBuilditNode.data?.savedEnvironmentSetup);
				if (typeof builditData.environmentInstallable === "boolean") {
					updateNodeData(existingBuilditNode.id, "environmentInstallable", builditData.environmentInstallable);
				}
				updateProjectConfigChainMetadata(existingBuilditNode.id, builditProjectId, 4, parentNodeId);
			}
			refreshBuilditOrbitForProject(builditProjectId);
			return;
		}

		const builditNode = createNodeFromTemplate("builditNode", {
			projectId: builditData.projectId,
			projectName: builditData.projectName,
			savedEnvironmentSetup: builditData.setupData || null,
			environmentInstallable: typeof builditData.environmentInstallable === "boolean" ? builditData.environmentInstallable : false
		}, allNodes.value);

		assignProjectConfigChainMetadata(builditNode, builditProjectId, 4, parentNodeId);

		builditNode.position = { x: parentPosition.x + 420, y: parentPosition.y + 260 };
		lockNodePosition(builditNode.id, builditNode.position);

		registerExistingNode(builditNode);

		addNodes([builditNode]);

		const connectionId = `${parentNodeId}-to-${builditNode.id}`;
		const connection = {
			id: connectionId,
			source: parentNodeId,
			target: builditNode.id,
			sourceHandle: "right",
			targetHandle: "left",
			type: "smoothstep",
			style: { stroke: "rgba(34, 197, 94, 0.85)", strokeWidth: 2 },
			markerEnd: { type: "arrowclosed", color: "rgba(34, 197, 94, 0.85)" },
			animated: true,
			label: "Build",
			labelStyle: {
				fill: "rgba(34, 197, 94, 1)",
				fontWeight: 600,
				fontSize: "11px",
				fontFamily: "Inter, system-ui, sans-serif"
			},
			labelBgStyle: {
				fill: "rgba(0, 0, 0, 0.85)",
				fillOpacity: 0.95
			},
			labelBgPadding: [8, 6],
			labelBgBorderRadius: 6
		};

		addEdges([connection]);

		console.log("✅ Buildit Node created");
		console.log("  Node ID:", builditNode.id);
		console.log("  Project ID:", builditData.projectId);
		console.log("═══════════════════════════════════════════");

		refreshBuilditOrbitForProject(builditProjectId);
	};

	const handleEnvironmentSetupSaved = async (envNodeId: string, setupData: any, savedToAPI: boolean = false) => {
		console.log("═══════════════════════════════════════════");
		console.log("💾 ENVIRONMENT SETUP SAVED");
		console.log("  Environment Node ID:", envNodeId);
		console.log("  Setup Data:", setupData);
		console.log("  Saved to API:", savedToAPI);
		console.log("═══════════════════════════════════════════");

		// Find the source ProjectNode
		const envNode = getNodeFn.value(envNodeId);
		if (!envNode) {
			console.error("❌ Environment node not found");
			return;
		}

		console.log("🔍 Environment node data:", envNode.data);
		console.log("  sourceProjectNodeId:", envNode.data?.sourceProjectNodeId);
		console.log("  sourceSetupNodeId:", envNode.data?.sourceSetupNodeId);

		// Find the ProjectNode that spawned this environment node
		// It could be the source of an incoming edge or stored in sourceSetupNodeId
		const sourceProjectNodeId = envNode.data?.sourceProjectNodeId;
		const setupNodeId = envNode.data?.sourceSetupNodeId;
		const fallbackProjectId = envNode.data?.projectId || setupData?.projectId || null;
		const fallbackProjectName = envNode.data?.projectName || setupData?.projectName || "";

		// Try to find the ProjectNode through edges
		let projectNodeId = sourceProjectNodeId;

		if (!projectNodeId && setupNodeId) {
			console.log("🔍 Tracing back from SetupNode:", setupNodeId);
			// If spawned from SetupProjectNode, find its parent ProjectNode
			const currentEdges = allEdges.value || [];
			const edgeToSetup = currentEdges.find((e: any) => e.target === setupNodeId);
			console.log("  Edge to setup node:", edgeToSetup);
			if (edgeToSetup) {
				const sourceNode = getNodeFn.value(edgeToSetup.source);
				console.log("  Source node type:", sourceNode?.type);

				// Check if source is ProjectNode or projectConfiguredNode
				if (sourceNode?.type === "projectNode" || sourceNode?.type === "projectConfiguredNode") {
					projectNodeId = edgeToSetup.source;
					console.log("✅ Found ProjectNode from SetupNode edge:", projectNodeId);
				}
			}
		}

		if (!projectNodeId) {
			console.log("🔍 Looking for direct edge to environment node");
			// Direct connection: find edge pointing to this env node
			const currentEdges = allEdges.value || [];
			const edgeToEnv = currentEdges.find((e: any) => e.target === envNodeId);
			console.log("  Edge to env node:", edgeToEnv);
			if (edgeToEnv) {
				const sourceNode = getNodeFn.value(edgeToEnv.source);
				console.log("  Source node type:", sourceNode?.type);

				// Check if source is ProjectNode or projectConfiguredNode
				if (sourceNode?.type === "projectNode" || sourceNode?.type === "projectConfiguredNode") {
					projectNodeId = edgeToEnv.source;
					console.log("✅ Found ProjectNode from direct edge:", projectNodeId);
				}
			}
		}

		if (!projectNodeId) {
			console.warn("⚠️ Could not find source ProjectNode via edges");
			console.warn("  Environment node ID:", envNodeId);
			console.warn("  Setup node ID:", setupNodeId);

			if (fallbackProjectId) {
				const candidate = (allNodes.value || []).find((node: any) => {
					if (!node?.data) return false;
					const candidateId = node.data?.selectedProjectId || node.data?.projectId || node.data?.id;
					return (node.type === "projectNode" || node.type === "projectConfiguredNode") && candidateId === fallbackProjectId;
				});

				if (candidate) {
					projectNodeId = candidate.id;
					console.log("✅ Fallback matched ProjectNode via projectId:", projectNodeId);
				} else {
					console.warn("⚠️ No ProjectNode found with projectId:", fallbackProjectId);
					console.warn("  Proceeding with fallback data only");
				}
			} else {
				console.warn("⚠️ No fallback projectId available");
			}
		}

		let projectNameFromNode = fallbackProjectName;
		const hasProjectNode = !!projectNodeId;
		const projectNode = hasProjectNode ? getNodeFn.value(projectNodeId!) : null;
		const projectIdFromNode = projectNode?.data?.selectedProjectId || null;

		if (projectNode) {
			projectNameFromNode = projectNode.data?.projectName || projectNode.data?.name || projectNameFromNode;
		}

		if (hasProjectNode && projectNode) {
			console.log("✅ Found ProjectNode:", projectNodeId);
			updateNodeData(projectNodeId!, "savedEnvironmentSetup", setupData);
			updateNodeData(projectNodeId!, "environmentSetupSaved", true);
			updateNodeData(projectNodeId!, "environmentSetupSavedToAPI", savedToAPI);
			updateNodeData(projectNodeId!, "environmentInstallable", savedToAPI);

			console.log("🔄 Transforming ProjectNode to ProjectConfiguredNode (orange → green)");
			if (projectNode.type === "projectNode") {
				vueFlowUpdateNode(projectNodeId!, {
					type: "projectConfiguredNode"
				});
				console.log("✅ Node transformed to ProjectConfiguredNode (green, ready to install)");
			}

			if (projectIdFromNode) {
				console.log("✅ Project ready - environment setup saved");
				console.log("  Project ID:", projectIdFromNode);
			}
		} else {
			console.warn("⚠️ Project node unavailable; skipping project node updates");
		}

		if (savedToAPI && fallbackProjectId) {
			const sourceForBuildit = envNodeId;
			handleCreateBuilditNode(sourceForBuildit, {
				projectId: fallbackProjectId,
				projectName: projectNameFromNode || fallbackProjectName,
				setupData
			});
		}

		console.log("✅ Environment setup handled");
		console.log("  Project Node ID:", projectNodeId || "<none>");
		console.log("  Setup saved flag:", true);
		console.log("  Setup saved to API:", savedToAPI);
		console.log("  Install node spawned:", savedToAPI && fallbackProjectId ? "yes" : "no");
		console.log("═══════════════════════════════════════════");
	};

	// Return the complete orchestrated canvas state and operations
	return {
		// VueFlow refs
		vueFlowFitView,
		onConnect,
		onEdgeClick,
		onNodesChange,
		addEdges,
		addNodes,
		removeNodes,
		removeEdges,
		setEdges,
		vueFlowUpdateNode,
		getNodeFn,
		viewport,
		vueFlowSetViewport,
		onNodeDragStop,

		// All node state
		...canvasNodes,
		allNodeArrays,

		// Edges and display
		edges,
		canvasDisplayName,
		currentViewport,
		animatedEdges,
		allEdges,

		// Node data management
		updateNodeDataBase,
		updateNodeData,
		processNodeDataFlow,

		// Position management
		lockNodePosition,
		getLockedPosition,
		clearPositionLocks,
		loadNodesWithExactPositions,
		savePositionsToApi,
		handleDragStopPersistence,
		initializePositionTracking,
		verifyAllPositions,

		// Connection management
		connectionTypes,
		defaultConnectionType,
		defaultConnectionStyle,
		handleConnect,

		// Edge operations
		edgeOperations,
		addEdge,
		removeEdge,
		updateEdge,
		addMultipleNodes,
		addMultipleEdges,
		updateNodePositions,

		// Connection handlers
		connectionHandlers,
		handleConnectionStart,
		handleConnectionEnd,
		handleCreateEnhancedConnection,
		handleCancelConnection,

		// PowerShell
		commands,
		commandsLoading,
		commandsError,
		loadPowerShellCommands,

		// Event handlers
		eventsModalOpen,
		commandsModalOpen,
		viewsModalOpen,
		gitActionsModalOpen,

		// Node interactions
		selectedNodeForEvent,
		selectedNodeForCommand,
		selectedNodeForView,
		selectedNodeForGitAction,
		openEventSelector,
		handleEventSelect,
		openCommandSelector,
		handleCommandSelect,
		openViewSelector,
		handleViewSelect,
		openGitActionSelector,
		handleGitActionSelect,
		testEvent,
		testCommand,
		getEventCategory,
		getStatusClass,
		getCommandCategory,
		getNodeColor,

		// JSON output
		showJsonView,
		formattedJsonOutput,
		toggleJsonView,
		copyJsonToClipboard,
		downloadJson,

		// Modals
		showTemplateCreationModal,
		selectedNodeForTemplate,
		openTemplateCreationModal,
		closeTemplateCreationModal,
		showTransportModal,
		selectedTransport,
		availableTransportTypes,
		closeTransportModal,
		handleTransportCreated,
		deleteTransportFromNodeModal,
		showHookModal,
		closeHookModal,
		handleHookCreated,
		fetchAvailableTransportTypes,
		deleteTransport,

		// Canvas views
		setCurrentCanvasName,
		currentCanvasId,
		renameCanvas,

		// Environment & integrations
		envDetection,
		githubIntegration,
		handleFileOpened,
		handleNodesUpdated,
		handleEdgesUpdated,
		connectGitHubRepository,

		// Browser & viewport management
		...browserManagement,
		getActiveViewportTypes,
		handleCloseViewport,
		handleCreateDevBrowserNode,
		handleCreateFormPreviewBrowserNode,
		handleCreateHookNodeForForm,
		handleCloseHookNode,
		handleHookAttached,
		handleCloseTransportNode,
		handleOpenFormGenerator,
		handleCreateTransportListener,
		handleRemoveTransportListener,
		handleCreateTransportTemplateNode,
		handleSpawnViewport,
		handleBrowserUrlChanged,
		handleBrowserRefresh,
		handleBrowserOpenExternal,
		handleCloseBrowserNode,
		getConnectedHookNode,
		getConnectedTransportNode,
		handleAddFormBuilderNode,

		// Visibility management
		handleToggleNodeVisibility,
		handleShowAllNodes,
		handleHideAllNodes,
		handleFocusChain,

		// Template chain
		restoreTemplateChain,

		// Webview operations
		isWebviewLoading,
		loadUrlContent,
		switchToHtmlMode,
		switchToUrlMode,
		onWebviewLoad,
		onWebviewError,
		openInTauriWebviewWrapper,
		openInExternalBrowser,

		// Canvas data management
		loadCanvasData,
		handleCreateNewCanvasBase,

		// Node factories
		getNodeCreators,

		// Template node management
		handleProjectTypeSelected,
		handleFolderSelected,
		handleIntentAnalyzed,
		handleStackSelected,
		handleIntentSelected,
		handleProceedToNext,
		handleNodeUpdated,
		handleFileSelected,
		handleAnalysisComplete,
		handleError,
		createIntentSelectionNode,
		createProjectExplorerNode,
		createEdge,
		configureTemplateNode,

		// Script handlers
		...scriptHandlers,

		// Oscar handlers
		...oscarHandlers,

		// File operations
		handleFileCreated,
		handleCreateSaveTemplateNode,

		// Template operations
		addNodeWithData,
		handleTemplateCreated,
		handleTemplateUpdated,
		handleSaveStatusChanged,
		handleTemplateSaved,

		// Form automation & chain
		...formAutomation,
		handleFormSubmitted,
		handleFormSubmissionError,
		handleSubmissionChainUpdated,
		handleTransportAttached,
		handleSaveFormChainConfig,
		handleRestoreFormChain,
		handleCreateFormPreviewEdge,

		// Project environment
		handleCreateProjectEnvironmentNode,
		handleCreateProjectInstallNode,
		handleCreateBuilditNode,
		handleEnvironmentSetupSaved
	};
}

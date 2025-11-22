<template>
	<div
		class="node-panel-canvas h-full w-full"
		:style="_props.panelStyles"
		:class="_props.panelClasses"
	>
		<!-- Connection Animation Effects CSS Injection -->
		<AnimatedConnection
			v-for="edge in animatedEdges"
			:key="`animation-${edge.id}`"
			:animation-type="edge.animationType"
			:speed="edge.animationSpeed"
			:color="edge.style?.stroke"
			:edge-id="edge.id"
		/>

		<!-- Canvas Header Component -->
		<CanvasHeader
			:initial-name="canvasDisplayName"
			@close="emit('close')"
			@name-changed="updateCanvasName"
		/>

		<!-- Node Creator Component -->
		<NodeCreator
			ref="nodeCreatorRef"
			:all-nodes="allNodes"
			:edges="edges"
			:webview-nodes="webviewNodes"
			:code-editor-nodes="codeEditorNodes"
			@nodes-updated="handleNodesUpdated"
			@edges-updated="handleEdgesUpdated"
		/>

		<!-- Form Submission Controller - Orchestrates form → hook → transport flow -->
		<FormSubmissionController
			ref="formSubmissionControllerRef"
			:browser-nodes="browserNodes"
			:hook-nodes="hookNodes"
			:transport-nodes="transportNodes"
			:edges="allEdges"
			:get-node-fn="getNodeFn"
			:update-node-data="updateNodeDataBase"
			@form-submitted="handleFormSubmitted"
			@submission-error="handleFormSubmissionError"
			@chain-updated="handleSubmissionChainUpdated"
		/>

		<!-- Node Chain Manager -->
		<NodeChainManager
			:all-nodes="allNodes"
			:edges="edges"
			:template-nodes="templateNodes"
			:intent-selection-nodes="intentSelectionNodes"
			:project-explorer-nodes="projectExplorerNodes"
			:on-create-project-explorer-node="createProjectExplorerNode"
			:on-create-edge="createEdge"
			:on-update-node="handleNodeUpdated"
		/>

		<!-- Connection Flow Manager -->
		<ConnectionFlowManager
			:nodes="allNodes"
			:edges="allEdges"
			:connection-types="connectionTypes"
			@connection-start="handleConnectionStart"
			@connection-end="handleConnectionEnd"
			@create-connection="handleCreateEnhancedConnection"
			@cancel-connection="handleCancelConnection"
		/>

		<!-- Main Canvas Area -->
		<div class="canvas-container">
			<!-- View Layer Overlay (for colored view backgrounds) -->
			<ViewOverlay
				:is-visible="!!activeViewColor"
				:color="activeViewColor || '#3b82f6'"
				:opacity="activeViewOpacity"
			/>

			<BaseCanvas
				ref="baseCanvasRef"
				:nodes="allNodes"
				:edges="allEdges"
				:node-types="nodeTypesForVueFlow"
				:node-color="(node) => getNodeColor(node.type)"
				@nodes-change="handleNodesChange"
				@node-click="handleNodeClickOnCanvas"
				@ready="handleCanvasReady"
			>
				<!-- Universal Dynamic Node Renderer - ALL node types via template slots -->
				<!-- :node-types tells VueFlow which types exist (as strings) -->
				<!-- Template slots tell VueFlow HOW to render them (with our components) -->
				<template v-for="nodeType in nodeTypeNames" :key="nodeType" #[`node-${nodeType}`]="nodeProps">
					<DynamicNodeRenderer
						:custom-node-props="nodeProps"
						:update-node-data="updateNodeData"
						:all-handlers="allHandlers"
						:organization-id="_props.organizationId"
						:available-hooks="_props.availableHooks"
						:available-transports="_props.availableTransports"
						@edit="handleNodeEdit(nodeProps.id)"
						@delete="handleNodeDelete(nodeProps.id)"
						@close-node="handleCloseNodeByType(nodeProps.type, nodeProps.id)"
					/>
				</template>
			</BaseCanvas>

			<!-- Canvas Toolbar Component -->
			<CanvasToolbar
				:all-nodes="allNodes"
				:all-edges="allEdges"
				:fit-view="fitView"
				:clear-all-nodes="clearAllNodes"
				:toggle-json-view="toggleJsonView"
				:open-components-drawer="openComponentsDrawer"
			/>
		</div>

		<!-- Components Drawer -->
		<CanvasComponentsDrawer
			v-model:open="componentsDrawerOpen"
			:organization-id="_props.organizationId"
			:project-id="_props.projectId"
			:canvas-nodes="allNodes"
			:canvas-edges="allEdges"
			:save-status="saveStatus"
			@add-component-node="handleAddComponentNode"
			@update-edge="handleUpdateEdge"
			@delete-edge="handleDeleteEdge"
			@create-edge="handleCreateEdge"
			@update-node-positions="handleUpdateNodePositions"
			@animate-chain-flow="handleAnimateChainFlow"
			@update-default-connection-style="handleUpdateDefaultConnectionStyle"
		/>

		<!-- All Modals - Extracted to CanvasModals Component -->
		<CanvasModals
			:events-modal-open="eventsModalOpen"
			:commands-modal-open="commandsModalOpen"
			:views-modal-open="viewsModalOpen"
			:git-actions-modal-open="gitActionsModalOpen"
			:show-hook-modal="showHookModal"
			:show-transport-modal="showTransportModal"
			:show-template-creation-modal="showTemplateCreationModal"
			:show-json-view="showJsonView"
			:selected-node-for-event="selectedNodeForEvent"
			:selected-node-for-command="selectedNodeForCommand"
			:selected-node-for-view="selectedNodeForView"
			:selected-node-for-git-action="selectedNodeForGitAction"
			:selected-node-for-template="selectedNodeForTemplate"
			:selected-transport="selectedTransport"
			:project-id="_props.projectId"
			:commands="commands"
			:commands-loading="commandsLoading"
			:commands-error="commandsError"
			:formatted-json-output="formattedJsonOutput"
			:canvas-data="{ nodes: allNodes, edges: allEdges }"
			@close-events-modal="() => openEventSelector('')"
			@event-selected="handleEventSelect"
			@close-commands-modal="() => openCommandSelector('')"
			@command-selected="handleCommandSelect"
			@close-views-modal="() => openViewSelector('')"
			@view-selected="handleViewSelect"
			@close-git-actions-modal="() => openGitActionSelector('')"
			@git-action-selected="handleGitActionSelect"
			@close-hook-modal="closeHookModal"
			@hook-created="handleHookCreated"
			@close-transport-modal="closeTransportModal"
			@transport-created="handleTransportCreated"
			@close-template-modal="closeTemplateCreationModal"
			@template-created="handleTemplateCreated"
			@template-updated="handleTemplateUpdated"
			@close-json-view="toggleJsonView"
			@copy-json="copyJsonToClipboard"
			@download-json="downloadJson"
		/>

	<!-- Node Configuration Panel - Currently disabled, kept for future use -->
	<!--
	<NodeConfigurationPanel
		:is-open="false"
		:node-type="currentConfiguration.nodeType"
		:node-data="currentConfiguration.nodeData"
		:node-id="currentConfiguration.nodeId"
		:mode="currentConfiguration.mode"
		:organization-id="_props.organizationId"
		:available-hooks="_props.availableHooks"
		:available-transports="_props.availableTransports"
		:all-handlers="allHandlers"
		:canvas-nodes="allNodes"
		:canvas-edges="allEdges"
		:canvas-viewport="currentViewport"
		@close="closeNodeConfiguration"
		@add-node="handleAddNodeFromConfig"
		@update-node="handleUpdateNodeFromConfig"
		@delete-node="handleDeleteNodeFromConfig"
	/>
	-->
	</div>
</template>

<script lang="ts" setup>
	import { buttClient } from "@app/utils/buttClient";
	import FormSubmissionController from "@canvas/controllers/FormSubmissionController.vue";
	import NodeCreator from "@canvas/controllers/NodeCreator.vue";
	import NodeChainManager from "@canvas/managers/NodeChainManager.vue";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
	import { useCanvasOrchestrator } from "./composables/useCanvasOrchestrator";
	import { useCanvasState } from "./composables/useCanvasState";
	import { useNodeComponentRegistry } from "./composables/useNodeComponentRegistry";
	// import { useNodeConfigurationPanel } from "./composables/useNodeConfigurationPanel"; // Disabled for now
	import BaseCanvas from "./core/BaseCanvas.vue";
	import DynamicNodeRenderer from "./core/DynamicNodeRenderer.vue";
	import { useNodeLifecycleHandlers } from "./handlers/useNodeLifecycleHandlers";
	import { useTemplateHandlers } from "./handlers/useTemplateHandlers";
	import CanvasHeader from "./panels/CanvasHeader.vue";
	import CanvasModals from "./panels/CanvasModals.vue";
	import CanvasToolbar from "./panels/CanvasToolbar.vue";
	import CanvasComponentsDrawer from "./drawers/CanvasComponentsDrawer.vue";
	// import NodeConfigurationPanel from "./panels/NodeConfigurationPanel.vue"; // Disabled for now
	import ConnectionFlowManager from "./ui/connection/ConnectionFlowManager.vue";
	import AnimatedConnection from "./ui/ConnectionAnimations/AnimatedConnection.vue";
	import { ViewOverlay } from "./ui/shared";
	import "./CanvasPanel.css";

	// Import VueFlow styles
	import "@vue-flow/core/dist/style.css";
	import "@vue-flow/controls/dist/style.css";
	import "@vue-flow/minimap/dist/style.css";
	import "@vue-flow/node-resizer/dist/style.css";

	// ============================================================================
	// PROPS & EMITS
	// ============================================================================
	interface Props {
		projectId?: string
		organizationId?: string
		availableHooks?: any[]
		availableTransports?: any[]
		templateId?: string
		panelStyles?: any
		panelClasses?: string
	}

	const _props = withDefaults(defineProps<Props>(), {
		projectId: undefined,
		organizationId: undefined,
		availableHooks: () => [],
		availableTransports: () => [],
		templateId: undefined,
		panelStyles: () => ({}),
		panelClasses: ""
	});

	const emit = defineEmits<{
		nodeCreated: [node: any]
		nodeDeleted: [nodeId: string]
		close: []
		saveStatusChanged: [status: "idle" | "saving" | "saved" | "error"]
		templateSaved: [templateId: string]
		reloadComponents: []
		edgeClicked: [edge: any]
		builditCompleted: [payload: {
			nodeId: string
			projectId?: string
			projectName?: string
			result?: any
		}]
	}>();

	// ============================================================================
	// REFS
	// ============================================================================
	const nodeCreatorRef = ref();
	const formSubmissionControllerRef = ref();
	const baseCanvasRef = ref<any>(null);
	const isCanvasReady = ref(false);
	const builditCompletionCache = new Map<string, string>();
	const componentsDrawerOpen = ref(false);
	const saveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");

	// ============================================================================
	// ACTIVE VIEW STATE - For colored view overlays
	// ============================================================================
	const activeViewColor = ref<string | undefined>(undefined);
	const activeViewOpacity = ref<number>(50); // Default 50% opacity

	// ============================================================================
	// CANVAS STATE MANAGEMENT - Centralized state for cross-node data
	// ============================================================================
	const canvasState = useCanvasState();
	console.log("✅ Canvas State initialized");

	// ============================================================================
	// NODE COMPONENT REGISTRY - Get string type mappings for VueFlow
	// ============================================================================
	const { getAllNodeTypes, getNodeTypeNames } = useNodeComponentRegistry();
	const nodeTypesForVueFlow = getAllNodeTypes(); // { rectangle: "rectangle", ... }
	const nodeTypeNames = getNodeTypeNames();

	// ============================================================================
	// NODE CONFIGURATION PANEL - Disabled for now (direct node addition)
	// ============================================================================
	// const {
	// 	configurationState: _configurationState,
	// 	isConfigurationOpen,
	// 	currentConfiguration,
	// 	isEditMode: _isEditMode,
	// 	panelTitle: _configPanelTitle,
	// 	openNodeConfiguration,
	// 	openNodeEdit,
	// 	closeNodeConfiguration,
	// 	updateConfigurationData: _updateConfigurationData
	// } = useNodeConfigurationPanel();

	// ============================================================================
	// CANVAS ORCHESTRATOR - Consolidates all composable initializations
	// ============================================================================
	const canvas = useCanvasOrchestrator(_props, emit as any, nodeCreatorRef, formSubmissionControllerRef);

	// Destructure ONLY what's directly used in this component
	const {
		// Critical refs used in template
		allNodes,
		allEdges,
		edges,
		canvasDisplayName,
		currentViewport,
		animatedEdges,

		// VueFlow methods used in lifecycle
		vueFlowFitView,
		onEdgeClick,
		onNodeDragStop,
		getNodeFn,
		addNodes,
		addEdges,
		removeNodes,
		setEdges,
		viewport,

		// Node arrays needed for inline handlers
		scriptEditorNodes,
		codeEditorNodes,
		webviewNodes,
		browserNodes,
		hookNodes,
		transportNodes,
		transportTemplateNodes,
		templateNodes,
		bFolderSetupNodes,
		intentSelectionNodes,
		projectExplorerNodes,

		// Core methods used directly
		updateNodeData,
		updateNodeDataBase,
		updateEdge,
		removeEdge,
		addEdge,
		addMultipleNodes,
		addMultipleEdges,
		updateNodePositions,
		setCurrentCanvasName,
		getNodeCreators,
		loadCanvasData,
		restoreTemplateChain,
		addNodeWithData,
		loadPowerShellCommands,
		initializePositionTracking,
		handleDragStopPersistence,
		defaultConnectionStyle,
		handleNodeUpdated: handleNodeUpdatedFromCanvas,
		connectGitHubRepository,
		vueFlowUpdateNode,
		handleNodesUpdated,
		handleEdgesUpdated,
		connectionTypes,
		handleConnectionStart,
		handleConnectionEnd,
		handleCreateEnhancedConnection,
		handleCancelConnection,
		createProjectExplorerNode,
		createEdge,
		handleTemplateCreated,
		handleTemplateUpdated,
		handleCloseBrowserNode: handleCloseBrowserNodeFromCanvas,

		// Modal state used in template
		eventsModalOpen,
		commandsModalOpen,
		viewsModalOpen,
		gitActionsModalOpen,
		showJsonView,
		formattedJsonOutput,
		showTemplateCreationModal,
		selectedNodeForTemplate,
		showTransportModal,
		selectedTransport,
		showHookModal,
		commands,
		commandsLoading,
		commandsError,
		selectedNodeForEvent,
		selectedNodeForCommand,
		selectedNodeForView,
		selectedNodeForGitAction,

		// Event handlers used in template
		openEventSelector,
		handleEventSelect,
		openCommandSelector,
		handleCommandSelect,
		openViewSelector,
		handleViewSelect,
		openGitActionSelector,
		handleGitActionSelect,
		closeTemplateCreationModal,
		closeTransportModal,
		handleTransportCreated,
		closeHookModal,
		handleHookCreated,
		toggleJsonView,
		copyJsonToClipboard,
		downloadJson,
		getNodeColor,

		// Form handlers
		handleFormSubmitted,
		handleFormSubmissionError,
		handleSubmissionChainUpdated,
		handleTransportAttached,
		handleSaveFormChainConfig,
		handleRestoreFormChain
	} = canvas;

	const PROJECT_CONFIG_CHAIN_PREFIX = "project-config-";

	const toProjectConfigChainKey = (projectId?: string | null, fallbackId?: string) => {
		const baseId = projectId ?? fallbackId;
		return baseId ? `${PROJECT_CONFIG_CHAIN_PREFIX}${String(baseId)}` : null;
	};

	const refreshBuilditOrbit = (projectId?: string | null) => {
		if (!projectId) {
			return;
		}

		const builditNode = (allNodes.value || []).find((node: any) =>
			node.type === "builditNode" && String(node.data?.projectId) === String(projectId)
		);

		if (builditNode) {
			updateNodeData(builditNode.id, "orbitRefreshKey", Date.now());
		}
	};

	// ============================================================================
	// COMPONENT-SPECIFIC INLINE HANDLERS
	// ============================================================================

	/**
	 * Handle script editor updates
	 */
	const handleScriptUpdated = (scriptName: string, updates: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("📝 HANDLE SCRIPT UPDATED CALLED");
		console.log("Script Name:", scriptName);
		console.log("Updates:", updates);
		console.log("═══════════════════════════════════════════");

		// Find the script editor node that just updated
		const scriptEditorNode = allNodes.value.find((n: any) =>
			n.type === "scriptEditorNode" && n.data?.scriptData?.name === scriptName
		);

		console.log("🔍 Found scriptEditorNode:", scriptEditorNode?.id);
		console.log("🔍 Source node ID:", scriptEditorNode?.data?.sourceNodeId);

		if (scriptEditorNode?.data?.sourceNodeId) {
			const sourceNodeId = scriptEditorNode.data.sourceNodeId;
			const sourceNode = getNodeFn.value(sourceNodeId);

			console.log("🔍 Found sourceNode:", sourceNode?.id, sourceNode?.type);

			if (sourceNode && sourceNode.type === "projectScriptRunnerNode") {
				console.log("🔄 Updating detectedScripts in ProjectScriptRunnerNode:", sourceNodeId);

				// Get current detectedScripts
				const currentDetectedScripts = sourceNode.data?.detectedScripts;
				const currentScripts = currentDetectedScripts?.scripts || [];

				console.log("📋 Current scripts:", currentScripts.length);
				console.log("📋 Scripts before update:", currentScripts.map((s: any) => ({ name: s.name, description: s.description, order: s.order })));

				// Update the specific script
				const updatedScripts = currentScripts.map((script: any) => {
					if (script.name === scriptName) {
						console.log(`✏️ Updating script "${scriptName}":`, {
							oldDescription: script.description,
							newDescription: updates.description,
							oldOrder: script.order,
							newOrder: updates.order
						});
						return {
							...script,
							description: updates.description || "",
							order: typeof updates.order === "number" ? updates.order : 0
						};
					}
					return script;
				});

				console.log("📋 Scripts after update:", updatedScripts.map((s: any) => ({ name: s.name, description: s.description, order: s.order })));

				// Update the ProjectScriptRunnerNode with new detectedScripts
				updateNodeData(sourceNodeId, "detectedScripts", {
					...currentDetectedScripts,
					scripts: updatedScripts
				});

				console.log("✅ Updated detectedScripts in ProjectScriptRunnerNode");
				console.log("═══════════════════════════════════════════");
			} else {
				console.error("❌ Source node not found or not a projectScriptRunnerNode");
				console.log("═══════════════════════════════════════════");
			}
		} else {
			console.error("❌ No sourceNodeId found in scriptEditorNode");
			console.log("═══════════════════════════════════════════");
		}
	};

	/**
	 * Handle opening script editor
	 */
	const handleOpenScriptEditor = (scriptData: any, sourceNodeId: string, sourcePosition: { x: number, y: number }) => {
		console.log("📝 Opening script editor for:", scriptData.name);

		const nodeId = `scriptEditor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		const newNode = {
			id: nodeId,
			type: "scriptEditorNode",
			position: {
				x: sourcePosition.x + 650,
				y: sourcePosition.y
			},
			data: {
				label: `Edit: ${scriptData.name}`,
				scriptData,
				sourceNodeId
			},
			style: {
				width: "500px",
				height: "auto"
			},
			draggable: true,
			selectable: true
		};

		// Add to scriptEditorNodes array FIRST
		scriptEditorNodes.value.push(newNode);
		console.log("✅ Added to scriptEditorNodes array");

		// Create edge BEFORE calling addEdges
		const newEdge = {
			id: `edge_${sourceNodeId}_${nodeId}_${Date.now()}`,
			source: sourceNodeId,
			target: nodeId,
			sourceHandle: "right",
			targetHandle: "left",
			type: "smoothstep",
			animated: true,
			style: { stroke: "#a855f7", strokeWidth: 2 },
			markerEnd: { type: "arrowclosed", color: "#a855f7" }
		};

		// Add to edges array FIRST
		edges.value.push(newEdge);
		console.log("✅ Added to edges array");

		// Then call VueFlow methods
		addNodes([newNode]);
		addEdges([newEdge]);

		console.log("✅ Created ScriptEditorNode with connection:", nodeId);
	};

	/**
	 * Handle script editor node close
	 */
	const handleCloseScriptEditorNode = (nodeId: string) => {
		console.log("🗑️ Closing script editor node:", nodeId);

		// Remove from scriptEditorNodes array
		const index = scriptEditorNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			scriptEditorNodes.value.splice(index, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		// Remove from VueFlow
		removeNodes([nodeId]);
	};

	/**
	 * Handle code editor node close
	 */
	const handleCloseCodeEditor = (nodeId: string) => {
		console.log("🗑️ Closing code editor node:", nodeId);

		// Remove from codeEditorNodes array
		const index = codeEditorNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			codeEditorNodes.value.splice(index, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		// Remove from VueFlow
		removeNodes([nodeId]);
	};

	/**
	 * Handle code editor refresh
	 */
	const handleRefreshCodeEditor = (nodeId: string) => {
		console.log("🔄 Refreshing code editor:", nodeId);
		// Refresh is handled internally by the CodeEditorNode component
	};

	// Enhanced handleNodeUpdated that ensures proper data propagation WITHOUT touching positions
	const handleNodeUpdated = (nodeId: string, data: any) => {
		console.log(`🔧 handleNodeUpdated: ${nodeId}`, Object.keys(data));

		handleNodeUpdatedFromCanvas(nodeId, data);

		const updatedNode = getNodeFn.value(nodeId);

		if (updatedNode?.type === "builditNode") {
			const result = data?.lastBuilditResult ?? updatedNode.data?.lastBuilditResult;
			const status = result?.status;
			if (status === "success" || status === "skipped") {
				const completionKey = `${status}:${result?.completedAt ?? ""}`;
				if (builditCompletionCache.get(nodeId) !== completionKey) {
					builditCompletionCache.set(nodeId, completionKey);
					emit("builditCompleted", {
						nodeId,
						projectId: updatedNode.data?.projectId,
						projectName: updatedNode.data?.projectName,
						result
					});
				}
			}
		}

		// Propagate scripts from ProjectScriptRunner to BFolderSetup
		if (updatedNode && updatedNode.type === "projectScriptRunnerNode" && (data.detectedScripts || data.scriptOSVersions)) {
			const fullNodeData = updatedNode.data;
			const scriptsToPropagate = data.detectedScripts || fullNodeData?.detectedScripts;
			const osVersionsToPropagate = data.scriptOSVersions || fullNodeData?.scriptOSVersions;

			// Try edges first
			const connectedEdges = allEdges.value.filter((edge: any) => edge.source === nodeId);

			if (connectedEdges.length > 0) {
				for (const edge of connectedEdges) {
					const targetNode = getNodeFn.value(edge.target);
					if (targetNode && targetNode.type === "bFolderSetupNode") {
						if (scriptsToPropagate) {
							updateNodeDataBase(targetNode.id, "detectedScripts", scriptsToPropagate);
						}
						if (osVersionsToPropagate) {
							updateNodeDataBase(targetNode.id, "scriptOSVersions", osVersionsToPropagate);
						}
						// Position is preserved automatically by NOT calling vueFlowUpdateNode
					}
				}
			} else {
				// Fallback: Match by project path
				const allBFolderNodes = bFolderSetupNodes.value;
				for (const bFolderNode of allBFolderNodes) {
					if (bFolderNode.data?.projectPath === updatedNode.data?.projectPath) {
						if (scriptsToPropagate) {
							updateNodeDataBase(bFolderNode.id, "detectedScripts", scriptsToPropagate);
						}
						if (osVersionsToPropagate) {
							updateNodeDataBase(bFolderNode.id, "scriptOSVersions", osVersionsToPropagate);
						}
						// Position is preserved automatically by NOT calling vueFlowUpdateNode
						break;
					}
				}
			}
		}
	};

	// Template handlers composable (needs parameters that orchestrator doesn't have)
	const templateHandlers = useTemplateHandlers(
		allNodes,
		edges,
		codeEditorNodes,
		updateNodeDataBase,
		vueFlowUpdateNode,
		vueFlowFitView,
		nodeCreatorRef,
		emit
	);

	const { handleShowFormAutomationChain, handleViewFormAutomationCode } = templateHandlers;

	// Node lifecycle handlers composable (needs specific parameters)
	const lifecycleHandlers = useNodeLifecycleHandlers(
		allNodes,
		edges,
		codeEditorNodes,
		scriptEditorNodes,
		transportTemplateNodes,
		hookNodes,
		emit
	);

	const {
		handleCloseTransportTemplateNode,
		handleUserNodeConfigure: _handleUserNodeConfigure,
		handleUserNodeDelete: _handleUserNodeDelete,
		handleOrbitCardNodeConfigure: _handleOrbitCardNodeConfigure,
		handleOrbitCardNodeDelete: _handleOrbitCardNodeDelete
	} = lifecycleHandlers;

	// ============================================================================
	// FORM SUBMISSION & TRANSPORT HANDLERS
	// ============================================================================

	/**
	 * Form Submission Event Handlers
	 */
	const handleFormSubmittedWrapper = (formData: any, browserNodeId: string) => {
		console.log("📋 Form submitted from browser:", browserNodeId);
		handleFormSubmitted(formData, browserNodeId);
	};

	const handleFormSubmissionErrorWrapper = (error: any, browserNodeId: string) => {
		console.error("❌ Form submission error:", error);
		handleFormSubmissionError(error, browserNodeId);
	};

	const handleSubmissionChainUpdatedWrapper = (browserNodeId: string, chainStatus: any) => {
		console.log("🔗 Submission chain updated:", chainStatus);
		handleSubmissionChainUpdated(browserNodeId, chainStatus);
	};

	/**
	 * Handle transport attached event
	 */
	const handleTransportAttachedWrapper = (transportData: any, transportNodeId: string) => {
		console.log("═══════════════════════════════════════════");
		console.log("🚛 TRANSPORT ATTACHED EVENT");
		console.log("  Transport Data:", transportData);
		console.log("  Transport Node ID:", transportNodeId);
		console.log("═══════════════════════════════════════════");

		// Find the transport node
		const transportNode = allNodes.value.find((n: any) => n.id === transportNodeId);
		if (!transportNode) {
			console.error("❌ Transport node not found:", transportNodeId);
			return;
		}

		// Update transport node with full config
		updateNodeData(transportNodeId, "transportConfig", {
			id: transportData.id,
			name: transportData.name,
			type: transportData.type,
			target: transportData.target
		});

		// Find connected browser node via edges
		const edgeToBrowser = allEdges.value.find((e: any) => e.target === transportNodeId || e.source === transportNodeId);
		if (edgeToBrowser) {
			const browserNodeId = edgeToBrowser.source === transportNodeId ? edgeToBrowser.target : edgeToBrowser.source;
			const browserNode = allNodes.value.find((n: any) => n.id === browserNodeId && n.type === "browserNode");

			if (browserNode) {
				console.log("✅ Found connected browser node:", browserNodeId);
				// Update browser node with transport config
				updateNodeData(browserNodeId, "transportConfig", {
					id: transportData.id,
					type: transportData.type,
					target: transportData.target,
					name: transportData.name
				});

				console.log("✅ Updated browser node with transport config");
			}
		}

		// Call the original handler
		handleTransportAttached(transportData, transportNodeId);

		console.log("✅ Transport attached event processed");
		console.log("═══════════════════════════════════════════");
	};

	/**
	 * Handle browser node close
	 */
	const handleCloseBrowserNodeWrapper = (nodeId: string) => {
		console.log("🗑️ Closing browser node:", nodeId);

		// Remove from browserNodes array
		const index = browserNodes.value.findIndex((n: any) => n.id === nodeId);
		if (index !== -1) {
			browserNodes.value.splice(index, 1);
		}

		// Remove connected edges
		edges.value = edges.value.filter((e: any) => e.source !== nodeId && e.target !== nodeId);

		// Remove from VueFlow
		removeNodes([nodeId]);

		// Call original handler if needed
		handleCloseBrowserNodeFromCanvas(nodeId);
	};

	// Handlers from composables are used directly (no wrappers needed)

	/**
	 * Handle listener configured event - update hook's listeners array AND subscribe via BAPI
	 */
	const handleListenerConfigured = async (transportData: any, hookNodeId: string, listenerIndex: number) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔔 LISTENER CONFIGURED EVENT RECEIVED!");
		console.log("  Transport Data:", transportData);
		console.log("  Hook Node ID:", hookNodeId);
		console.log("  Listener Index:", listenerIndex);
		console.log("═══════════════════════════════════════════");

		// Get hook node
		const hookNode = allNodes.value.find((n: any) => n.id === hookNodeId);
		if (!hookNode) {
			console.error("❌ Hook node not found:", hookNodeId);
			return;
		}

		const hookId = hookNode.data?.hookId;
		if (!hookId) {
			console.error("❌ Hook ID not found in hook node");
			return;
		}

		// Update the listener at the specific index
		const listeners = hookNode.data?.listeners || [];
		if (listeners[listenerIndex]) {
			listeners[listenerIndex] = {
				...listeners[listenerIndex],
				id: transportData.id,
				transportId: transportData.id,
				name: transportData.name,
				type: transportData.type, // Keep original type (TEMPLATE, WEBHOOK, etc)
				target: transportData.target, // Keep original target (template ID for TEMPLATE type)
				status: "configured",
				transportNodeId: transportData.nodeId
			};

			updateNodeDataBase(hookNodeId, "listeners", [...listeners]);
			console.log("✅ Updated hook listener at index", listenerIndex);

			// Subscribe this transport to the hook via BAPI
			// CRITICAL: For TEMPLATE transports, the type stays as TEMPLATE
			try {
				console.log("═══════════════════════════════════════════");
				console.log("📡 SUBSCRIBING TRANSPORT TO HOOK VIA BAPI");
				console.log("  Hook ID:", hookId);
				console.log("  Transport ID (subscriber):", transportData.id);
				console.log("  Transport Type:", transportData.type, "(TEMPLATE for email templates)");
				console.log("  Transport Target:", transportData.target, "(template ID if TEMPLATE)");
				console.log("═══════════════════════════════════════════");

				const subscribeResult = await buttClient.subscribe({
					id: hookId,
					subscriber: transportData.id,
					type: transportData.type // TEMPLATE, WEBHOOK, or INTEGRATIONCONNECTION
				});

				console.log("═══════════════════════════════════════════");
				console.log("✅ TRANSPORT SUBSCRIBED TO HOOK SUCCESSFULLY!");
				console.log("  Subscription Result:", subscribeResult);
				console.log("  Hook will now trigger this transport when webhook receives data");
				console.log("  Expected behavior on form submit:");
				console.log("    1. Form POSTs to webhook URL");
				console.log("    2. Hook receives form data at webhook endpoint");
				console.log("    3. Hook checks registered listeners (subscribers)");
				console.log("    4. Hook triggers this transport:", transportData.type);
				if (transportData.type === "TEMPLATE") {
					console.log("    5. TEMPLATE transport executes email template");
					console.log("    6. Email sent via template configuration");
				} else {
					console.log("    5. Transport delivers to:", transportData.target);
				}
				console.log("═══════════════════════════════════════════");
			} catch (error) {
				console.error("═══════════════════════════════════════════");
				console.error("❌ FAILED TO SUBSCRIBE TRANSPORT TO HOOK");
				console.error("  Error:", error);
				console.error("  This means notifications will NOT be sent!");
				console.error("  Transport type:", transportData.type);
				console.error("  Transport ID:", transportData.id);
				console.error("═══════════════════════════════════════════");
			}
		}
	};

	// handleNodeUpdated is now defined above with enhanced propagation logic

	// Helper to brighten color for animation
	const brightenColor = (hex: string, percent: number) => {
		// Remove # if present
		hex = hex.replace("#", "");

		// Convert to RGB
		let r = Number.parseInt(hex.substring(0, 2), 16);
		let g = Number.parseInt(hex.substring(2, 4), 16);
		let b = Number.parseInt(hex.substring(4, 6), 16);

		// Increase brightness by percent
		const factor = 1 + (percent / 100);
		r = Math.min(255, Math.floor(r * factor));
		g = Math.min(255, Math.floor(g * factor));
		b = Math.min(255, Math.floor(b * factor));

		// Convert back to hex
		return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
	};

	// Animate chain flow kept inline (uses updateEdge from edgeOperations)
	const animateChainSequence = async (sequence: string[], duration: number, originalColor: string) => {
		console.log("🎬 CanvasPanel: Animating chain sequence");

		if (sequence.length < 2) return;

		// Get brightened color (increase brightness + add glow)
		const brightColor = brightenColor(originalColor, 50); // 50% brighter
		const glowColor = brightenColor(originalColor, 80); // 80% brighter for glow

		// Get all connections in the chain
		const chainEdges: any[] = [];
		for (let i = 0; i < sequence.length - 1; i++) {
			const sourceId = sequence[i];
			const targetId = sequence[i + 1];
			const edge = edges.value.find(
				(e: any) => e.source === sourceId && e.target === targetId
			);
			if (edge) {
				chainEdges.push(edge);
			}
		}

		console.log(`🎬 Found ${chainEdges.length} edges to animate`);

		// Animate each connection sequentially with stunning multi-phase effect
		for (let i = 0; i < chainEdges.length; i++) {
			const edge = chainEdges[i];
			const originalWidth = edge.style?.strokeWidth || 3;

			// PHASE 1: PRE-GLOW - Subtle brightness increase
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: brightColor,
					strokeWidth: originalWidth * 1.5,
					filter: `drop-shadow(0 0 4px ${brightColor}) brightness(1.3)`,
					opacity: 0.9,
					transition: "all 0.15s ease-out"
				},
				markerEnd: {
					type: "arrowclosed",
					color: brightColor
				}
			});

			await new Promise((resolve) => setTimeout(resolve, duration * 0.2));

			// PHASE 2: INTENSE GLOW - Maximum brightness with bloom effect
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: glowColor,
					strokeWidth: originalWidth * 3, // Triple width
					filter: `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 40px ${glowColor}) brightness(2.5) saturate(1.8)`,
					opacity: 1,
					transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
				},
				markerEnd: {
					type: "arrowclosed",
					color: glowColor
				}
			});

			await new Promise((resolve) => setTimeout(resolve, duration * 0.4));

			// PHASE 3: PULSE - Quick flash
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: "#ffffff",
					strokeWidth: originalWidth * 3.5,
					filter: `drop-shadow(0 0 30px ${glowColor}) brightness(3)`,
					opacity: 1,
					transition: "all 0.1s ease-in"
				},
				markerEnd: {
					type: "arrowclosed",
					color: "#ffffff"
				}
			});

			await new Promise((resolve) => setTimeout(resolve, duration * 0.15));

			// PHASE 4: FADE OUT - Smooth return with trail effect
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: brightColor,
					strokeWidth: originalWidth * 1.2,
					filter: `drop-shadow(0 0 6px ${originalColor}) brightness(1.2)`,
					opacity: 0.95,
					transition: "all 0.3s ease-out"
				},
				markerEnd: {
					type: "arrowclosed",
					color: brightColor
				}
			});

			await new Promise((resolve) => setTimeout(resolve, duration * 0.15));

			// PHASE 5: RESTORE - Back to original with smooth transition
			updateEdge(edge.id, {
				style: {
					...edge.style,
					stroke: originalColor,
					strokeWidth: originalWidth,
					filter: "none",
					opacity: 1,
					transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
				},
				markerEnd: {
					type: "arrowclosed",
					color: originalColor
				}
			});

			// Small overlap for smoother flow effect
			await new Promise((resolve) => setTimeout(resolve, duration * 0.1));
		}

		console.log("✅ CanvasPanel: Chain animation complete");
	};

	// Update default connection style for manual connections
	const updateDefaultConnectionStyle = (style: any) => {
		console.log("🎨 CanvasPanel: Updating default connection style:", style);
		defaultConnectionStyle.value = { ...style };
	};

	// Handle edge click to open editor
	onEdgeClick(({ edge }) => {
		console.log("🔗 Edge clicked:", edge);
		emit("edgeClicked", edge);
	});

	// ============================================================================
	// ADDITIONAL COMPONENT HANDLERS
	// ============================================================================

	// GitHub repository connector
	const connectGitHubRepositoryWrapper = async (nodeId: string) => {
		console.log("🔗 Connecting GitHub repository:", nodeId);
		try {
			await connectGitHubRepository(nodeId);
			console.log("✅ GitHub repository connected successfully");
		} catch (error) {
			console.error("❌ Failed to connect GitHub repository:", error);
		}
	};

	// Add node with data wrapper
	const addNodeWithDataWrapper = async (nodeType: string, data: any) => {
		console.log("➕ Adding node with data:", nodeType, data);
		return await addNodeWithData(nodeType, data, restoreTemplateChain);
	};

	// Clear all nodes wrapper
	const clearAllNodes = () => {
		console.log("🗑️ Clearing all nodes");
		console.log("📊 Nodes before clear:", allNodes.value.length);

		// Get all node IDs before clearing internal arrays
		const nodeIdsToRemove = allNodes.value.map((n: any) => n.id);
		console.log("🎯 Node IDs to remove from VueFlow:", nodeIdsToRemove);

		// Clear internal node arrays
		canvas.clearAllNodes();

		// Clear edges
		edges.value = [];
		setEdges([]);

		// Remove nodes from VueFlow's internal state
		if (nodeIdsToRemove.length > 0) {
			console.log("🗑️ Removing nodes from VueFlow...");
			removeNodes(nodeIdsToRemove);
		}

		console.log("✅ All nodes cleared. Remaining nodes:", allNodes.value.length);
	};

	// Fit view wrapper
	const fitView = () => {
		console.log("🔍 Fitting view");
		vueFlowFitView();
	};

	// Open components drawer
	const openComponentsDrawer = () => {
		console.log("🔘 Opening drawer, current state:", componentsDrawerOpen.value);
		componentsDrawerOpen.value = true;
		console.log("✅ Drawer state set to:", componentsDrawerOpen.value);
	};

	// Update canvas name
	const updateCanvasName = (name: string) => {
		console.log("📝 Updating canvas name:", name);
		canvasDisplayName.value = name;
		setCurrentCanvasName(name);
	};

	// ============================================================================
	// NODE CONFIGURATION PANEL HANDLERS
	// ============================================================================

	/**
	 * Handle add component node from drawer
	 */
	const handleAddComponentNode = async (componentType: string, componentData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("➕ CanvasPanel: Adding component node from drawer");
		console.log("Component Type:", componentType);
		console.log("Component Data:", componentData);
		console.log("Current nodes count:", allNodes.value.length);
		console.log("═══════════════════════════════════════════");
		
		// Check if canvas is empty - if so, create a new view with the component name
		const isCanvasEmpty = allNodes.value.length === 0;
		if (isCanvasEmpty) {
			console.log("🆕 Canvas is empty - creating new view with component name");
			try {
				const { useCanvasViews } = await import("./composables/useCanvasViews");
				const { createNewCanvas } = useCanvasViews();
				
				// Get component name for the view
				const componentName = componentData.name || componentData.templateName || componentData.solutionName || componentData.hookName || componentData.transportName || "Untitled Canvas";
				const viewName = componentName;
				
				console.log("📝 Creating new canvas view with name:", viewName);
				const newCanvas = await createNewCanvas(viewName);
				
				if (newCanvas) {
					console.log("✅ Created new canvas view:", newCanvas.id, newCanvas.name);
					// Update the canvas display name
					canvasDisplayName.value = viewName;
					if (setCurrentCanvasName) {
						setCurrentCanvasName(viewName);
					}
				} else {
					console.warn("⚠️ Failed to create new canvas view, continuing anyway");
				}
			} catch (error) {
				console.error("❌ Error creating new canvas view:", error);
				// Continue anyway - node should still be added
			}
		}
		
		// Map component types to node types
		const nodeTypeMap: Record<string, string> = {
			template: "templateNode",
			solution: "solutionNode",
			hook: "hookNode",
			transport: "transportNode"
		};

		const nodeType = nodeTypeMap[componentType];
		if (!nodeType) {
			console.error("❌ Unknown component type:", componentType);
			return;
		}

		console.log("📝 Using node type:", nodeType);
		console.log("📝 Calling addNodeWithData...");

		// Use the proper node creation method that handles all node types correctly
		try {
			await addNodeWithData(nodeType, componentData, restoreTemplateChain);
			console.log("✅ CanvasPanel: Component node added successfully using addNodeWithData");
			console.log("New nodes count:", allNodes.value.length);
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Error adding component node:", error);
			console.log("═══════════════════════════════════════════");
		}
	};

	/**
	 * Handle update edge from drawer
	 */
	const handleUpdateEdge = (edgeId: string, edgeData: any) => {
		console.log("🔗 CanvasPanel: Updating edge:", edgeId, edgeData);
		updateEdge(edgeId, edgeData);
	};

	/**
	 * Handle delete edge from drawer
	 */
	const handleDeleteEdge = (edgeId: string) => {
		console.log("🗑️ CanvasPanel: Deleting edge:", edgeId);
		removeEdge(edgeId);
	};

	/**
	 * Handle create edge from drawer
	 */
	const handleCreateEdge = (edgeData: any) => {
		console.log("➕ CanvasPanel: Creating edge:", edgeData);
		addEdge(edgeData);
	};

	/**
	 * Handle update node positions from drawer
	 */
	const handleUpdateNodePositions = (positions: Record<string, { x: number, y: number }>) => {
		console.log("📐 CanvasPanel: Updating node positions:", positions);
		updateNodePositions(positions);
	};

	/**
	 * Handle animate chain flow from drawer
	 */
	const handleAnimateChainFlow = (sequence: string[], duration: number, originalColor: string) => {
		console.log("🎬 CanvasPanel: Animating chain flow");
		// This would need to be implemented in the canvas orchestrator
		// For now, just log it
	};

	/**
	 * Handle update default connection style from drawer
	 */
	const handleUpdateDefaultConnectionStyle = (style: any) => {
		console.log("🎨 CanvasPanel: Updating default connection style:", style);
		// This would update the defaultConnectionStyle in the orchestrator
		// For now, just log it
	};

	/**
	 * Handle add node - Directly adds node to canvas (configuration panel disabled)
	 */
	const handleAddNode = (nodeType: string) => {
		console.log("═══════════════════════════════════════════");
		console.log("➕ CanvasPanel: Adding node directly to canvas");
		console.log("  Node type:", nodeType);
		console.log("  Current allNodes count:", allNodes.value.length);
		console.log("═══════════════════════════════════════════");

		const creators: Record<string, () => void> = getNodeCreators() as any;
		const creator = creators[nodeType];

		if (creator) {
			// Call the creator which will add the node to the canvas
			creator();
			console.log("═══════════════════════════════════════════");
			console.log("✅ CanvasPanel: Node added successfully!");
			console.log("  Node type:", nodeType);
			console.log("  New allNodes count:", allNodes.value.length);
			console.log("  Available creators:", Object.keys(creators).length);
			console.log("═══════════════════════════════════════════");
		} else {
			console.error("═══════════════════════════════════════════");
			console.error("❌ CanvasPanel: No creator found for node type:", nodeType);
			console.error("  Available creators:", Object.keys(creators).join(", "));
			console.error("  This node type may need to be added to getNodeCreators()");
			console.error("═══════════════════════════════════════════");
		}
	};

	/**
	 * Handle add node from configuration panel (after configuration) - Currently unused
	 */
	const _handleAddNodeFromConfig = (nodeType: string, nodeData: any) => {
		console.log("➕ Adding configured node to canvas:", nodeType, nodeData);
		console.log("📊 Current allNodes count BEFORE add:", allNodes.value.length);

		const creators: Record<string, () => void> = getNodeCreators() as any;
		const creator = creators[nodeType];

		if (creator) {
			// Call the creator which will add the node to the canvas
			creator();

			// Get the newly created node (last node in allNodes)
			const newNode = allNodes.value[allNodes.value.length - 1];

			if (newNode) {
				// Update the node with configured data
				Object.keys(nodeData).forEach((key) => {
					if (nodeData[key] !== undefined) {
						updateNodeData(newNode.id, key, nodeData[key]);
					}
				});
			}

			console.log("✅ Node added with configuration:", nodeType);
			console.log("📊 Current allNodes count AFTER add:", allNodes.value.length);
		} else {
			console.error("❌ No creator found for node type:", nodeType);
		}
	};

	/**
	 * Handle update node from configuration panel - Currently unused
	 */
	const _handleUpdateNodeFromConfig = (nodeId: string, nodeData: any) => {
		console.log("💾 Updating node from config panel:", nodeId, nodeData);

		// Update each property
		Object.keys(nodeData).forEach((key) => {
			if (nodeData[key] !== undefined) {
				updateNodeData(nodeId, key, nodeData[key]);
			}
		});

		console.log("✅ Node updated:", nodeId);
	};

	/**
	 * Handle delete node from configuration panel - Currently unused
	 */
	const _handleDeleteNodeFromConfig = (nodeId: string) => {
		console.log("🗑️ Deleting node from config panel:", nodeId);

		// Find the node in all arrays and remove it
		const node = getNodeFn.value(nodeId);
		if (node) {
			// Remove from VueFlow
			removeNodes([nodeId]);

			// Remove connected edges
			const connectedEdges = allEdges.value.filter((e: any) =>
				e.source === nodeId || e.target === nodeId
			);
			if (connectedEdges.length > 0) {
				connectedEdges.forEach((edge: any) => removeEdge(edge.id));
			}

			console.log("✅ Node deleted:", nodeId);
		}
	};

	/**
	 * Handle node click on canvas - Open configuration panel
	 */
	// Disabled: Nodes now have dedicated edit buttons instead of click-to-edit
	const handleNodeClickOnCanvas = (node: any) => {
		console.log("🖱️ Node clicked on canvas (no action - use Edit button):", node.id, node.type);
		// openNodeEdit(node.id, node.type, node.data, "canvas"); // Disabled - use Edit button instead
	};

	/**
	 * Handle canvas ready event
	 */
	const handleCanvasReady = (instance: any) => {
		isCanvasReady.value = true;
		console.log("✅ CanvasPanel: Canvas is ready", instance);
	};

	/**
	 * Handle node edit button click (configuration panel disabled - editing happens inline)
	 */
	const handleNodeEdit = (nodeId: string) => {
		console.log("✏️ Edit button clicked for node (inline editing only):", nodeId);
		// Configuration panel is disabled - nodes should handle their own inline editing
		// The edit button can be kept for future use or removed from node templates
	};

	/**
	 * Handle node delete button click
	 */
	const handleNodeDelete = (nodeId: string) => {
		console.log("🗑️ Delete button clicked for node:", nodeId);
		// Use the existing removeNodes function from orchestrator
		if (canvas.removeNodes) {
			canvas.removeNodes([nodeId]);
		} else {
			console.error("removeNodes function not available");
		}
	};

	/**
	 * Handle close node by type - routes to the appropriate close handler
	 */
	const handleCloseNodeByType = (nodeType: string, nodeId: string) => {
		console.log("🗑️ Close node by type:", nodeType, nodeId);

		// Handle specific node types with custom close logic
		if (nodeType === "taskNode") {
			console.log("🗑️ Closing TaskNode:", nodeId);
			removeNodes([nodeId]);
			return;
		}

		if (nodeType === "projectNode") {
			console.log("🗑️ Closing ProjectNode:", nodeId);
			removeNodes([nodeId]);
			return;
		}

		if (nodeType === "userManagementNode") {
			console.log("🗑️ Closing UserManagementNode:", nodeId);
			removeNodes([nodeId]);
			return;
		}

		// Map node types to their specific close handlers
		const closeHandlers: Record<string, ((id: string) => void) | undefined> = {
			hookNode: canvas.handleCloseHookNode,
			transportNode: canvas.handleCloseTransportNode,
			transportTemplateNode: handleCloseTransportTemplateNode,
			browserNode: canvas.handleCloseBrowserNode,
			scriptEditorNode: handleCloseScriptEditorNode,
			viewportNode: canvas.handleCloseViewport
		};

		// Get the appropriate handler for this node type
		const handler = closeHandlers[nodeType];

		if (handler) {
			console.log(`✅ Found close handler for ${nodeType}, calling it...`);
			handler(nodeId);
		} else {
			console.warn(`⚠️ No specific close handler for node type: ${nodeType}, using generic delete`);
			handleNodeDelete(nodeId);
		}
	};

	/**
	 * Handle creating child user node when user is selected
	 */
	const handleCreateChildUserNode = async (parentNodeId: string, userData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("👶 CREATING CHILD USER NODE");
		console.log("  Parent Node ID:", parentNodeId);
		console.log("  User Data:", userData);
		console.log("═══════════════════════════════════════════");

		try {
			const parentNode = getNodeFn.value(parentNodeId);
			if (!parentNode) {
				console.error("❌ Parent node not found:", parentNodeId);
				return;
			}

			console.log("📍 Parent node type:", parentNode.type);
			console.log("📍 Parent node data:", parentNode.data);

			const parentPosition = parentNode.position || { x: 0, y: 0 };

			// Position child node to the right of parent
			const childNodeId = `userNode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const horizontalOffset = 700;
			const verticalOffset = 0;

			// Get role color for the user node
			const roleColors: Record<string, string> = {
				admin: "#10b981",
				owner: "#10b981",
				member: "#3b82f6",
				developer: "#8b5cf6",
				guest: "#f59e0b"
			};
			const role = (userData.role || "member").toLowerCase();
			const themeColor = roleColors[role] || roleColors.member;

			// Fetch ALL tasks assigned to this user
			let assignedTasks: any[] = [];

			try {
				// Get all projects for organization (proven working method)
				const allProjects = await buttClient.findAllProject();
				const orgProjects = _props.organizationId
					? allProjects.filter((p: any) => p.organisationId === _props.organizationId)
					: allProjects;
				console.log("📋 Found", orgProjects.length, "projects");

				// Fetch tasks for each project (proven working method)
				const allTasksPromises = orgProjects.map((p: any) =>
					buttClient.getTasksByProjectId(p.id).catch((err: any) => {
						console.warn(`  Failed to fetch tasks for project ${p.id}:`, err);
						return [];
					})
				);
				const allTasksArrays = await Promise.all(allTasksPromises);
				const allTasks = allTasksArrays.flat();
				console.log("  Total tasks loaded:", allTasks.length);

				// Create project map for attaching names
				const projectMap = new Map(orgProjects.map((p: any) => [p.id, p]));

				// Filter tasks that have this user assigned
				assignedTasks = allTasks
					.filter((task: any) => {
						const desc = task.description || "";
						return desc.includes(`[ASSIGNED:${userData.id}|`) || desc.includes(`[ASSIGNED:${userData.id}]`);
					})
					.map((task: any) => {
						// Attach project name to each task
						const project = projectMap.get(task.projectId);
						return {
							...task,
							projectName: project?.name || "Unknown Project"
						};
					});

				console.log(`✅ Found ${assignedTasks.length} tasks assigned to user ${userData.name || userData.email}`);
			} catch (error) {
				console.error("❌ Failed to fetch user's assigned tasks:", error);

				// Fallback: If parent is a TaskNode, at least include that task
				if (parentNode.type === "taskNode" && parentNode.data?.selectedTaskId) {
					console.log("👶 Fallback: Parent is TaskNode, adding task to user's assigned tasks");
					const taskInfo = {
						id: parentNode.data.selectedTaskId,
						name: parentNode.data.taskName,
						title: parentNode.data.taskName,
						description: parentNode.data.description,
						status: parentNode.data.status,
						jiraStatus: parentNode.data.status,
						priority: parentNode.data.priority,
						projectId: parentNode.data.projectId
					};
					assignedTasks = [taskInfo];
					console.log("  Task info:", taskInfo);
				}
			}

			// Determine if this is an admin/owner user
			const isAdmin = userData.isOwner === true || userData.isAdmin === true || (userData.role && userData.role.toLowerCase() === "owner");

			console.log("🔐 User admin status:", {
				isAdmin,
				isOwner: userData.isOwner,
				isAdminFlag: userData.isAdmin,
				role: userData.role
			});

			// Use AdminUserNode for admins/owners, UserNode for regular users
			const nodeType = isAdmin ? "adminUserNode" : "userNode";
			console.log(`📍 Creating ${nodeType} for ${userData.name || userData.email}`);

			// Create user node using the direct creator
			const childNodeData = {
				id: childNodeId,
				type: nodeType,
				position: {
					x: parentPosition.x + horizontalOffset,
					y: parentPosition.y + verticalOffset
				},
				data: {
					label: `${userData.name || userData.email}`,
					userData: {
						id: userData.id,
						name: userData.name,
						email: userData.email,
						role: userData.role || "member",
						status: "active",
						isOwner: userData.isOwner,
						isAdmin: userData.isAdmin
					},
					assignedTasks,
					allOrganizationProjects: userData.allOrganizationProjects || [],
					organizationId: userData.organizationId,
					organizationOwnerEmail: userData.organizationOwnerEmail,
					organizationOwnerId: userData.organizationOwnerId,
					isOwner: userData.isOwner,
					isAdmin: userData.isAdmin,
					themeColor,
					parentNodeId,
					configured: true,
					showTaskOrbit: userData.showTaskOrbit || false
				}
			};

			// Add to VueFlow and internal arrays
			addNodes([childNodeData]);
			console.log("✅ Child user node added to canvas:", childNodeId);

			// Create connection from parent to child
			const userLabel = userData.name || userData.email || "User";
			const connectionId = `edge_${parentNodeId}_${childNodeId}`;
			const connection = {
				id: connectionId,
				source: parentNodeId,
				target: childNodeId,
				sourceHandle: "right",
				targetHandle: "left",
				type: "smoothstep",
				style: {
					stroke: themeColor,
					strokeWidth: 2
				},
				markerEnd: {
					type: "arrowclosed",
					color: themeColor
				},
				animated: true,
				label: userLabel,
				labelStyle: {
					fill: themeColor,
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

			console.log("✅ Child user node created and connected");
			console.log("  Child Node ID:", childNodeId);
			console.log("  Connection ID:", connectionId);
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Error creating child user node:", error);
		}
	};

	/**
	 * Handle user selected event
	 */
	const handleUserSelected = (userData: any, nodeId: string) => {
		console.log("👤 User selected:", userData, "in node:", nodeId);
		// This can be used for additional logging or side effects
	};

	/**
	 * Handler when a task is selected in TaskNode
	 */
	const handleTaskSelected = (taskData: any, nodeId: string) => {
		console.log("📋 Task selected:", taskData, "in node:", nodeId);
		// This can be used for additional logging or side effects
	};

	/**
	 * Handler when an integration is created in IntegrationConnectionNode or SetupProjectNode
	 */
	const handleIntegrationCreated = (integrationData: any, nodeId?: string) => {
		console.log("🔌 Integration created:", integrationData, "in node:", nodeId || "unknown");

		// Find all project nodes and refresh their integration counts
		console.log("🔄 Refreshing integration counts in all project nodes...");

		// Get all nodes from canvas
		const allCurrentNodes = canvas.allNodes?.value || [];
		const projectNodes = allCurrentNodes.filter((node: any) => node.type === "projectNode");

		console.log(`  Found ${projectNodes.length} project nodes to refresh`);

		// For each project node, trigger a data update to force re-render
		projectNodes.forEach((node: any) => {
			// Trigger a dummy update to force reactivity
			if (node.data) {
				node.data._integrationRefreshTrigger = Date.now();
				console.log(`  ✅ Triggered refresh for project node: ${node.id}`);
			}
		});
	};

	/**
	 * Handler to show task in orbit view - now shows on user's node
	 */
	const handleShowTaskInOrbit = async (taskData: any, parentNodeId: string) => {
		console.log("═══════════════════════════════════════════");
		console.log("🌀 SHOWING TASK IN ORBIT ON USER NODE");
		console.log("  Task Data:", taskData);
		console.log("  Parent Node ID:", parentNodeId);
		console.log("═══════════════════════════════════════════");

		try {
			const parentNode = getNodeFn.value(parentNodeId);
			if (!parentNode) {
				throw new Error("Parent node not found");
			}

			// Extract assigned user ID from task description
			const description = taskData.description || "";
			const assignedMatch = description.match(/\[ASSIGNED:([^\]|]+)\|?/);

			if (!assignedMatch) {
				console.warn("⚠️ No assigned user found in task description");
				return;
			}

			const assignedUserId = assignedMatch[1];
			console.log("👤 Task assigned to user ID:", assignedUserId);

			// Check if a UserNode already exists for this user
			let userNode = allNodes.value.find((node: any) =>
				node.type === "userNode" && node.data?.userData?.id === assignedUserId
			);

			if (userNode) {
				console.log("✅ Found existing UserNode for user, activating orbit");
				// Update the node to show orbit
				canvas.updateNodeData(userNode.id, "showTaskOrbit", true);
			} else {
				console.log("🆕 Creating new UserNode with orbit active");

				// Fetch user data from parent node or API
				const parentNodeData = parentNode.data;
				const allUsers = parentNodeData?.users || [];
				let userData = allUsers.find((u: any) => u.id === assignedUserId);

				if (!userData) {
					console.warn("⚠️ User not found in parent data, fetching from API");
					try {
						const response = await buttClient.getUserUser(assignedUserId);
						userData = response.user || response;
					} catch (error) {
						console.error("❌ Failed to fetch user data:", error);
						return;
					}
				}

				// Get all tasks assigned to this user from parent node
				const allTasks = parentNodeData?.tasks || [];
				const userTasks = allTasks.filter((task: any) => {
					const desc = task.description || "";
					return desc.includes(`[ASSIGNED:${assignedUserId}|`) || desc.includes(`[ASSIGNED:${assignedUserId}]`);
				});

				console.log(`📋 Found ${userTasks.length} tasks for user orbit`);

				// Trigger user node creation with orbit active
				if (canvas.handleCreateChildUserNode) {
					const userDataToPass = {
						...userData,
						organizationId: _props.organizationId,
						showTaskOrbit: true // Flag to show orbit on mount
					};
					canvas.handleCreateChildUserNode(parentNodeId, userDataToPass);
				}
			}

			console.log("✅ Orbit display initiated");
		} catch (error) {
			console.error("❌ Error showing orbit:", error);
		}
	};

	/**
	 * Handler to create user orbit node (user at center with their tasks orbiting)
	 */
	const handleCreateUserOrbitNode = async (parentNodeId: string, orbitData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🌀 CREATING USER ORBIT NODE");
		console.log("  Parent Node ID:", parentNodeId);
		console.log("  Orbit Data:", orbitData);
		console.log("═══════════════════════════════════════════");

		try {
			const parentNode = getNodeFn.value(parentNodeId);
			if (!parentNode) {
				throw new Error("Parent node not found");
			}

			const parentPosition = parentNode.position || { x: 0, y: 0 };
			const childNodeId = `orbitCardNode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			// Create orbit node with user at center
			const childNodeData = {
				id: childNodeId,
				type: "orbitCardNode",
				position: {
					x: parentPosition.x + 700,
					y: parentPosition.y + 100
				},
				data: {
					label: `${orbitData.userData.name}'s Tasks`,
					// Store user data for the center
					userData: orbitData.userData,
					// Store tasks as timeline data
					taskData: {
						id: orbitData.userData.id,
						name: orbitData.userData.name,
						email: orbitData.userData.email,
						role: orbitData.userData.role,
						centerType: "user",
						tasks: orbitData.tasks
					},
					projectId: orbitData.projectId,
					organisationId: orbitData.organisationId,
					configured: true
				}
			};

			console.log("🎨 Creating user orbit node:", childNodeData);
			addNodes([childNodeData]);

			// Create edge connection with purple color for user orbit
			const userLabel = orbitData.userData.name || "User Orbit";
			const edgeData = {
				id: `edge-${parentNodeId}-${childNodeId}`,
				source: parentNodeId,
				target: childNodeId,
				type: "smoothstep",
				animated: true,
				style: {
					stroke: "#9333ea", // Purple for user orbit
					strokeWidth: 2
				},
				markerEnd: {
					type: "arrowclosed",
					color: "#9333ea"
				},
				label: userLabel,
				labelStyle: {
					fill: "#9333ea",
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

			console.log("🔗 Adding edge:", edgeData);
			addEdges([edgeData]);

			console.log("✅ User orbit view created successfully");
		} catch (error) {
			console.error("❌ Error creating user orbit view:", error);
		}
	};

	/**
	 * Handler to create child integration detail node
	 */
	const handleCreateChildIntegrationDetailNode = (parentNodeId: string, integrationData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔌 CREATING CHILD INTEGRATION DETAIL NODE");
		console.log("  Parent Node ID:", parentNodeId);
		console.log("  Integration Data:", integrationData);
		console.log("═══════════════════════════════════════════");

		try {
			const parentNode = getNodeFn.value(parentNodeId);
			if (!parentNode) {
				console.error("❌ Parent node not found:", parentNodeId);
				return;
			}

			const parentPosition = parentNode.position || { x: 0, y: 0 };

			// Position child node to the right of parent
			const childNodeId = `integrationDetailNode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const horizontalOffset = 700;
			const verticalOffset = 0;

			// Create integration detail node
			const childNodeData = {
				id: childNodeId,
				type: "integrationDetailNode",
				position: {
					x: parentPosition.x + horizontalOffset,
					y: parentPosition.y + verticalOffset
				},
				data: {
					label: integrationData.name,
					integrationId: integrationData.id,
					integrationType: integrationData.type,
					integrationName: integrationData.name,
					description: integrationData.description,
					connected: integrationData.connected,
					clientId: integrationData.clientId,
					method: integrationData.method,
					parentNodeId,
					configured: true
				}
			};

			console.log("🎨 Adding integration detail node with data:", childNodeData);
			addNodes([childNodeData]);

			// Create edge connection with purple color
			const edgeData = {
				id: `edge-${parentNodeId}-${childNodeId}`,
				source: parentNodeId,
				target: childNodeId,
				type: "default",
				animated: true,
				style: {
					stroke: "#a855f7", // Purple for integration connections
					strokeWidth: 2
				}
			};

			console.log("🔗 Adding edge:", edgeData);
			addEdges([edgeData]);

			console.log("✅ Child integration detail node created successfully");
		} catch (error) {
			console.error("❌ Error creating child integration detail node:", error);
		}
	};

	/**
	 * Handler to create child project tools setup node
	 */
	const handleCreateChildProjectToolsNode = (parentNodeId: string, projectContext: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🛠️ CREATING CHILD PROJECT TOOLS SETUP NODE");
		console.log("  Parent Node ID:", parentNodeId);
		console.log("  Project Context:", projectContext);
		console.log("═══════════════════════════════════════════");

		try {
			const parentNode = getNodeFn.value(parentNodeId);
			if (!parentNode) {
				console.error("❌ Parent node not found:", parentNodeId);
				return;
			}

			const parentPosition = parentNode.position || { x: 0, y: 0 };

			const childNodeId = `projectToolsSetupNode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const horizontalOffset = 700;
			const verticalOffset = 0;
			const themeColor = "#38bdf8"; // Cyan for tools step

			const childNodeData = {
				id: childNodeId,
				type: "projectToolsSetupNode",
				position: {
					x: parentPosition.x + horizontalOffset,
					y: parentPosition.y + verticalOffset
				},
				organizationId: projectContext.organisationId,
				projectId: projectContext.projectId,
				projectName: projectContext.projectName,
				data: {
					label: "Tools Setup",
					projectId: projectContext.projectId,
					projectName: projectContext.projectName,
					organisationId: projectContext.organisationId,
					parentNodeId,
					connectedIde: projectContext.connectedIde || null,
					connectedIDEs: projectContext.connectedIDEs || [],
					themeColor
				}
			};

			const projectChainKey = toProjectConfigChainKey(projectContext.projectId, parentNodeId);
			Object.assign(childNodeData.data as Record<string, any>, {
				projectConfigChainParent: projectChainKey,
				_isChainNode: true,
				_chainParent: projectChainKey || childNodeId,
				_chainOrder: 1
			});

			console.log("🎨 Adding project tools setup node with data:", childNodeData);
			// Register the node in internal arrays first
			canvas.registerExistingNode?.(childNodeData);
			// Then add to VueFlow
			addNodes([childNodeData]);

			const edgeData = {
				id: `edge-${parentNodeId}-${childNodeId}`,
				source: parentNodeId,
				target: childNodeId,
				type: "smoothstep",
				animated: true,
				style: {
					stroke: themeColor,
					strokeWidth: 2
				},
				markerEnd: {
					type: "arrowclosed",
					color: themeColor
				},
				label: "Tools",
				labelStyle: {
					fill: themeColor,
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

			addEdges([edgeData]);
			console.log("✅ Child project tools setup node created successfully");

			refreshBuilditOrbit(projectContext.projectId);
		} catch (error) {
			console.error("❌ Error creating child project tools setup node:", error);
		}
	};

	/**
	 * Handler to create child setup project node
	 */
	const handleCreateChildSetupProjectNode = (parentNodeId: string, projectContext: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("⚙️ CREATING CHILD SETUP PROJECT NODE");
		console.log("  Parent Node ID:", parentNodeId);
		console.log("  Project Context:", projectContext);
		console.log("═══════════════════════════════════════════");

		try {
			const parentNode = getNodeFn.value(parentNodeId);
			if (!parentNode) {
				console.error("❌ Parent node not found:", parentNodeId);
				return;
			}

			const parentPosition = parentNode.position || { x: 0, y: 0 };

			// Position child node to the right of parent
			const childNodeId = `setupProjectNode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const horizontalOffset = 700;
			const verticalOffset = 0;
			const themeColor = "#10b981"; // Green for setup

			const childNodeData = {
				id: childNodeId,
				type: "setupProjectNode",
				position: {
					x: parentPosition.x + horizontalOffset,
					y: parentPosition.y + verticalOffset
				},
				organizationId: projectContext.organisationId,
				projectId: projectContext.projectId,
				projectName: projectContext.projectName,
				data: {
					label: "Integration Setup",
					projectId: projectContext.projectId,
					projectName: projectContext.projectName,
					organisationId: projectContext.organisationId,
					currentStep: "step1",
					selectedRepository: null,
					connectedIde: projectContext.connectedIde, // Pass the connected IDE
					parentNodeId,
					themeColor
				}
			};

			const projectChainKey = toProjectConfigChainKey(projectContext.projectId, parentNodeId);
			Object.assign(childNodeData.data as Record<string, any>, {
				projectConfigChainParent: projectChainKey,
				_isChainNode: true,
				_chainParent: projectChainKey || childNodeId,
				_chainOrder: 0
			});

			console.log("🎨 Adding setup project node with data:", childNodeData);

			// Add to VueFlow
			addNodes([childNodeData]);

			// Add to internal array
			if (canvas.setupProjectNodes) {
				canvas.setupProjectNodes.value.push(childNodeData);
				console.log("✅ Added setup project node to internal array");
			}

			// Create edge connection
			const edgeData = {
				id: `edge-${parentNodeId}-${childNodeId}`,
				source: parentNodeId,
				target: childNodeId,
				type: "smoothstep",
				animated: true,
				style: {
					stroke: themeColor,
					strokeWidth: 2
				},
				markerEnd: {
					type: "arrowclosed",
					color: themeColor
				},
				label: "Integration Setup",
				labelStyle: {
					fill: themeColor,
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

			addEdges([edgeData]);
			console.log("✅ Child setup project node created successfully");

			refreshBuilditOrbit(projectContext.projectId);
		} catch (error) {
			console.error("❌ Error creating child setup project node:", error);
		}
	};

	/**
	 * Handler to create child task node
	 */
	const handleCreateChildTaskNode = (parentNodeId: string, taskContext: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("📋 CREATING CHILD TASK NODE");
		console.log("  Parent Node ID:", parentNodeId);
		console.log("  Task Context:", taskContext);
		console.log("═══════════════════════════════════════════");

		try {
			const parentNode = getNodeFn.value(parentNodeId);
			if (!parentNode) {
				console.error("❌ Parent node not found:", parentNodeId);
				return;
			}

			const parentPosition = parentNode.position || { x: 0, y: 0 };

			// Position child node to the right of parent
			const childNodeId = `taskNode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const horizontalOffset = 700;
			const verticalOffset = 100; // Offset vertically so nodes don't overlap

			// Determine theme color based on task status
			const statusColors: Record<string, string> = {
				"To Do": "#6366f1",
				"In Progress": "#3b82f6",
				"In Review": "#f59e0b",
				Done: "#10b981",
				Blocked: "#ef4444",
				Cancelled: "#6b7280"
			};
			const taskStatus = taskContext.status || "To Do";
			const themeColor = statusColors[taskStatus] || "#6366f1";

			// Check if this is for an existing task or a new one
			const isExistingTask = !!taskContext.selectedTaskId;
			const taskLabel = isExistingTask
				? (taskContext.taskName || "Task")
				: "New Task";

			// Create task node using the direct creator
			// Note: organizationId and projectId need to be at the node level for the registry
			const childNodeData = {
				id: childNodeId,
				type: "taskNode",
				position: {
					x: parentPosition.x + horizontalOffset,
					y: parentPosition.y + verticalOffset
				},
				// These are used by the registry to pass as props to the component
				organizationId: taskContext.organisationId,
				projectId: taskContext.projectId,
				data: {
					label: taskLabel,
					projectId: taskContext.projectId,
					projectName: taskContext.projectName,
					organisationId: taskContext.organisationId,
					selectedTaskId: taskContext.selectedTaskId || null,
					taskName: taskContext.taskName,
					description: taskContext.description,
					status: taskContext.status,
					priority: taskContext.priority,
					parentNodeId,
					configured: taskContext.configured || false,
					themeColor
				}
			};

			console.log("🎨 Adding task node with data:", childNodeData);
			console.log("  Is existing task:", isExistingTask);
			console.log("  Task status:", taskStatus);
			console.log("  Theme color:", themeColor);

			// Add to VueFlow
			addNodes([childNodeData]);

			// CRITICAL: Also add to internal taskNodes array so updateNodeData can find it
			if (canvas.taskNodes) {
				canvas.taskNodes.value.push(childNodeData);
				console.log("✅ Added task node to internal array, count:", canvas.taskNodes.value.length);
			}

			// Create edge connection with task-specific color
			const edgeData = {
				id: `edge-${parentNodeId}-${childNodeId}`,
				source: parentNodeId,
				target: childNodeId,
				type: "smoothstep",
				animated: true,
				style: {
					stroke: themeColor,
					strokeWidth: 2
				},
				markerEnd: {
					type: "arrowclosed",
					color: themeColor
				},
				label: taskLabel,
				labelStyle: {
					fill: themeColor,
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

			console.log("🔗 Adding edge:", edgeData);
			addEdges([edgeData]);

			console.log("✅ Child task node created successfully");
		} catch (error) {
			console.error("❌ Error creating child task node:", error);
		}
	};

	const handleProjectSelected = async (projectData: any | null, nodeId: string) => {
		console.log("═══════════════════════════════════════════");
		console.log(projectData ? "📁 PROJECT SELECTED" : "📁 PROJECT DESELECTED");
		console.log("  Node ID:", nodeId);
		console.log("  Project Data:", projectData);
		console.log("═══════════════════════════════════════════");

		const node = getNodeFn.value(nodeId);
		if (!node) {
			console.error("❌ Project node not found for selection change:", nodeId);
			return;
		}

		if (!projectData) {
			updateNodeData(nodeId, "selectedProjectId", null);
			updateNodeData(nodeId, "configured", false);
			updateNodeData(nodeId, "projectName", null);
			updateNodeData(nodeId, "description", null);
			updateNodeData(nodeId, "status", "planning");
			updateNodeData(nodeId, "tasks", []);
			updateNodeData(nodeId, "assignedUsers", []);
			updateNodeData(nodeId, "connectedIDEs", []);
			updateNodeData(nodeId, "savedEnvironmentSetup", null);
			updateNodeData(nodeId, "environmentSetupSaved", false);
			updateNodeData(nodeId, "environmentSetupSavedToAPI", false);
			updateNodeData(nodeId, "environmentInstallable", false);

			if (node.type !== "projectNode") {
				vueFlowUpdateNode(nodeId, { type: "projectNode" });
				console.log("🔄 Node type reset to projectNode");
			}
			return;
		}

		const nextProjectId = projectData.id ?? projectData.selectedProjectId ?? null;
		const nextName = projectData.name || projectData.projectName || "Unnamed Project";
		const nextDescription = projectData.description ?? null;
		const nextStatus = projectData.status || "active";

		if (nextProjectId) {
			const duplicateNodes = (allNodes.value || []).filter((n: any) => {
				if (!n?.data || n.id === nodeId) return false;
				if (n.type !== "projectNode" && n.type !== "projectConfiguredNode") return false;
				const candidateId = n.data?.selectedProjectId || n.data?.projectId || n.data?.id;
				return candidateId && candidateId === nextProjectId;
			});

			if (duplicateNodes.length > 0) {
				const duplicateIds = duplicateNodes.map((n: any) => n.id);
				console.log("🧹 Removing duplicate project nodes:", duplicateIds);
				removeNodes(duplicateIds);
			}
		}

		if (nextProjectId) {
			updateNodeData(nodeId, "selectedProjectId", nextProjectId);
		}
		updateNodeData(nodeId, "projectName", nextName);
		updateNodeData(nodeId, "description", nextDescription);
		updateNodeData(nodeId, "status", nextStatus);
		updateNodeData(nodeId, "configured", true);

		if (node.type !== "projectConfiguredNode") {
			vueFlowUpdateNode(nodeId, { type: "projectConfiguredNode" });
			console.log("🔄 Node type updated to projectConfiguredNode");
		}

		await nextTick();
		const updatedNode = getNodeFn.value(nodeId);
		if (updatedNode) {
			canvas.registerExistingNode?.(updatedNode);
		}
	};

	/**
	 * Handle proceedToNext from IntentSelectionNode
	 * Routes to specific node chains based on intent type
	 * Automatically creates full chain: ProjectExplorer → ScriptRunner → BFolderSetup → SaveTemplate
	 * All chain nodes are added to the same orbit ring as the template node
	 */
	const handleProceedToNextIntent = (data: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔗 Intent Proceed To Next");
		console.log("  Intent Type:", data.type);
		console.log("  Folder Path:", data.folderPath);
		console.log("  Parent Intent Node:", data.parentNodeId);
		console.log("═══════════════════════════════════════════");

		// Find the IntentSelectionNode that triggered this
		const intentSelectionNode = (allNodes.value || []).find((n: any) => n.id === data.parentNodeId || (n.type === "intentSelection" || n.type === "intentSelectionNode"));

		if (!intentSelectionNode) {
			console.error("❌ IntentSelectionNode not found");
			return;
		}

		// Find the template node (parent of intent selection node)
		const templateNodeId = data.templateNodeId || intentSelectionNode.data?.parentNodeId;
		if (!templateNodeId) {
			console.error("❌ Template node ID not found in intent node data");
			return;
		}

		const templateNode = (allNodes.value || []).find((n: any) => n.id === templateNodeId);
		if (!templateNode) {
			console.error("❌ Template node not found");
			return;
		}

		// Handle all intent types by creating the full template chain
		try {
			console.log("📦 Creating template chain for intent type:", data.type);

			const projectExplorerNode = canvas.createProjectExplorerNode(intentSelectionNode);
			if (!projectExplorerNode) {
				console.error("❌ Failed to create ProjectExplorerNode from intent selection");
				return;
			}

			const edgeResult = canvas.createEdge(intentSelectionNode.id, projectExplorerNode.id);
			console.log("✅ Template chain started:", {
				projectExplorerId: projectExplorerNode.id,
				templateNodeId,
				intentSelectionNodeId: intentSelectionNode.id,
				edgeResult
			});
		} catch (error) {
			console.error("❌ Error creating template chain:", error);
		}
	};

	/**
	 * Handle file watch toggle - create FileWatcherNode when a file is watched
	 */
	const handleFileWatchToggled = async (watchId: string, isNowWatching: boolean) => {
		console.log("👁️ handleFileWatchToggled:", { watchId, isNowWatching });

		if (!isNowWatching) {
			// Close the corresponding watcher node if it exists
			const watcherNode = allNodes.value.find((n: any) => n.data?.watchId === watchId);
			if (watcherNode) {
				console.log("🗑️ Removing FileWatcherNode:", watcherNode.id);
				removeNodes([watcherNode.id]);
			}
			return;
		}

		// Get the watched file info
		const { useFileWatcher } = await import('~/composables/useFileWatcher');
		const { getWatchedFile } = useFileWatcher();
		const watched = getWatchedFile(watchId);

		if (!watched) {
			console.warn("⚠️ Watched file not found:", watchId);
			return;
		}

		// Find the ProjectExplorer node to connect from
		const explorerNode = allNodes.value.find((n: any) => n.type === 'projectExplorer');
		if (!explorerNode) {
			console.warn("⚠️ ProjectExplorer node not found - cannot create FileWatcherNode");
			return;
		}

		try {
			const nodeId = `watcher_${watchId}`;

			// Check if watcher node already exists
			const existingWatcher = allNodes.value.find((n: any) => n.id === nodeId);
			if (existingWatcher) {
				console.log("ℹ️ FileWatcherNode already exists:", nodeId);
				return;
			}

			// Create FileWatcherNode
			const watcherNode = {
				id: nodeId,
				type: 'fileWatcherNode',
				position: {
					x: explorerNode.position.x + 900 + (Math.random() * 50 - 25),
					y: explorerNode.position.y + 200 + (Math.random() * 50 - 25)
				},
				data: {
					label: `Watching: ${watched.fileName}`,
					watchId,
					filePath: watched.path,
					fileName: watched.fileName,
					fileType: watched.fileType
				}
			};

			console.log("📌 Creating FileWatcherNode:", nodeId);
			addNodes([watcherNode]);

			// Create connection from explorer to watcher with purple color for watch connections
			const connectionId = `explorer-watch-${nodeId}`;
			const edge = {
				id: connectionId,
				source: explorerNode.id,
				target: nodeId,
				type: 'smoothstep',
				animated: true,
				style: {
					stroke: '#a855f7', // Purple for watch connections
					strokeWidth: 2.5
				},
				markerEnd: {
					type: 'arrowclosed',
					color: '#a855f7'
				},
				label: 'WATCH',
				labelBgStyle: { fill: 'rgba(0, 0, 0, 0.8)' },
				labelStyle: { fill: '#a855f7', fontSize: 11, fontWeight: 'bold' }
			};

			addEdges([edge]);
			console.log("✅ FileWatcherNode connected to ProjectExplorer:", connectionId);

		} catch (error) {
			console.error("❌ Failed to create FileWatcherNode:", error);
		}
	};

	// Consolidate all handlers - orchestrator provides 99%, we override a few
	const allHandlers = {
		...canvas, // Spread all orchestrator handlers
		handleScriptUpdated, // Override with component-specific logic
		handleOpenScriptEditor,
		handleCloseScriptEditorNode,
		handleCloseCodeEditor,
		handleRefreshCodeEditor,
		handleFormSubmitted: handleFormSubmittedWrapper,
		handleFormSubmissionError: handleFormSubmissionErrorWrapper,
		handleSubmissionChainUpdated: handleSubmissionChainUpdatedWrapper,
		handleTransportAttached: handleTransportAttachedWrapper,
		handleCloseBrowserNode: handleCloseBrowserNodeWrapper,
		handleCloseTransportTemplateNode,
		handleSaveFormChainConfig,
		handleRestoreFormChain,
		handleShowFormAutomationChain,
		handleViewFormAutomationCode,
		handleListenerConfigured,
		handleNodeUpdated,
		connectGitHubRepository: connectGitHubRepositoryWrapper,
		handleCreateChildUserNode,
		handleUserSelected,
		handleTaskSelected,
		handleProjectSelected,
		handleCreateChildTaskNode,
		handleCreateChildProjectToolsNode,
		handleCreateChildSetupProjectNode,
		handleIntegrationCreated,
		handleCreateChildIntegrationDetailNode,
		handleShowTaskInOrbit,
		handleCreateUserOrbitNode,
		handleProceedToNext: handleProceedToNextIntent, // Override to handle Git Clone routing
		handleFileWatchToggled, // NEW - File watcher integration
		// Node configuration panel handlers (disabled)
		// openNodeConfiguration,
		// openNodeEdit,
		handleNodeClickOnCanvas
	};

	// Handle nodes change event
	const handleNodesChange = (changes: any[]) => {
		console.log("🔧 Nodes changed:", changes);
	};

	// ============================================================================
	// DEBUG: Watch configuration panel state (disabled)
	// ============================================================================
	// watch(isConfigurationOpen, (newValue, oldValue) => {
	// 	console.log("🔍 isConfigurationOpen changed:", oldValue, "→", newValue);
	// 	console.log("  currentConfiguration:", currentConfiguration.value);
	// });

	// ============================================================================
	// LIFECYCLE HOOKS
	// ============================================================================

	onMounted(async () => {
		console.log("🎨 CanvasPanel mounted");

		// Initialize position tracking
		initializePositionTracking(allNodes.value);

		// Load canvas data if template ID provided
		if (_props.templateId) {
			console.log("📂 Loading template:", _props.templateId);
			await restoreTemplateChain(_props.templateId);
		}

		// Load PowerShell commands
		await loadPowerShellCommands();

		// Setup Oscar event listeners if available
		if (typeof window !== "undefined" && (window as any).setupOscarListeners) {
			const { setupOscarListeners } = canvas;
			if (setupOscarListeners) {
				setupOscarListeners();
			}
		}

		console.log("✅ CanvasPanel initialization complete");
	});

	onBeforeUnmount(() => {
		console.log("🧹 CanvasPanel unmounting");

		// Cleanup Oscar listeners if available
		if (typeof window !== "undefined" && (window as any).cleanupOscarListeners) {
			const { cleanupOscarListeners } = canvas;
			if (cleanupOscarListeners) {
				cleanupOscarListeners();
			}
		}

		console.log("✅ CanvasPanel cleanup complete");
	});

	// Handle drag stop for position persistence
	onNodeDragStop(({ node }) => {
		handleDragStopPersistence(node, allNodes.value, allEdges.value, currentViewport.value);
	});

	/**
	 * Set the active view's color for overlay
	 */
	const setActiveViewColor = (color: string | undefined, opacity: number = 50) => {
		activeViewColor.value = color;
		activeViewOpacity.value = opacity;
		console.log("🎨 CanvasPanel: Active view color set:", { color, opacity });
	};

	/**
	 * Add a BuildIt node with pre-configured data
	 */
	const addBuilditNodeWithData = async (nodeData: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🚀 CanvasPanel: Adding BuildIt node with data");
		console.log("  Project ID:", nodeData.projectId);
		console.log("  Project Name:", nodeData.projectName);
		console.log("═══════════════════════════════════════════");

		try {
			await addNodeWithData("builditNode", {
				projectId: nodeData.projectId,
				projectName: nodeData.projectName,
				savedEnvironmentSetup: nodeData.savedEnvironmentSetup || null,
				environmentInstallable: nodeData.environmentInstallable || false,
				lastBuilditResult: nodeData.lastBuilditResult || null
			}, restoreTemplateChain);

			console.log("✅ BuildIt node added successfully");
			console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Failed to add BuildIt node:", error);
		}
	};

	// Expose methods for parent component
	defineExpose({
		handleAddNode,
		addNodeWithData: addNodeWithDataWrapper,
		addBuilditNodeWithData,
		clearAllNodes,
		fitView,
		vueFlowFitView, // Expose the raw VueFlow fitView for custom options
		loadCanvasData,
		updateCanvasName,
		setActiveViewColor,
		allNodes,
		allEdges,
		viewport,
		formSubmissionController: formSubmissionControllerRef,
		updateEdge,
		removeEdge,
		addEdge,
		addMultipleNodes,
		addMultipleEdges,
		updateNodePositions,
		animateChainSequence,
		updateDefaultConnectionStyle
		// Node configuration panel methods (disabled)
		// openNodeConfiguration,
		// openNodeEdit,
		// closeNodeConfiguration
	});
</script>

<style>
	@import "./CanvasPanel.css";
</style>

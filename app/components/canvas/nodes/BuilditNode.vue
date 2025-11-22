<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-zap"
		title="BUILDIT"
		:title-color="themeColor"
		:theme-color="themeColor"
		:status-label="statusLabel"
		:status-color="statusColor"
		:show-edit-button="false"
		:show-close-button="true"
		:show-default-header="true"
		:background-color="undefined"
		:border-color="borderColor"
		:min-width="500"
		:min-height="400"
		:default-collapsed="false"
		node-class="buildit-node"
		@close="handleClose"
	>
		<div ref="builditContentWrapperRef" class="buildit-content-wrapper">

		<!-- Content -->
		<div class="buildit-content">
			<Tabs default-value="overview" class="buildit-tabs-wrapper">
				<!-- Tab List -->
				<TabsList class="buildit-tabs-list">
					<TabsTrigger value="overview" class="buildit-tab-trigger">
						<UIcon name="i-lucide-zap" class="size-4" />
						Overview
					</TabsTrigger>
					<TabsTrigger v-if="orbitItems.length > 0" value="orbit" class="buildit-tab-trigger">
						<UIcon name="i-lucide-network" class="size-4" />
						Orbit
						<span class="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{{ orbitItems.length }}</span>
					</TabsTrigger>
				</TabsList>

				<!-- Overview Tab -->
				<TabsContent value="overview" class="buildit-tabs-content buildit-section">
					<div class="section-header">
						<UIcon name="i-lucide-zap" class="size-5" :style="{ color: themeColor }" />
						<div class="section-title">
							<span class="title-text">Ready to Build</span>
							<span class="subtitle-text">{{ projectName || "Unnamed Project" }}</span>
						</div>
					</div>

					<p class="status-message">
						{{ statusMessage }}
					</p>

					<button
						ref="builditButtonRef"
						class="buildit-button"
						:class="builditButtonStateClass"
						:disabled="builditButtonDisabled"
						@click="handleBuilditClick"
					>
						<UIcon
							:name="builditButtonStateIcon"
							class="size-5"
							:class="{ 'animate-spin': isLinking || isInstalling }"
						/>
						<span>{{ builditButtonLabel }}</span>
					</button>

					<!-- Environment Info -->
					<div v-if="environmentInfo" class="environment-info">
						<div class="info-row">
							<span class="info-label">Environment:</span>
							<span class="info-value">{{ environmentInfo.name }}</span>
						</div>
						<div class="info-row">
							<span class="info-label">Status:</span>
							<span class="info-value" :class="{ 'text-warning': !isEnvironmentLinked }">
								{{ isEnvironmentLinked ? 'Linked' : 'Not Linked' }}
							</span>
						</div>
					</div>

					<!-- Orbit Control Buttons with inline template creation -->
					<OrbitControlButton
						:active-orbit-node-id="activeOrbitNodeId"
						:is-expanded="orbitNodesExpanded"
						:has-orbit-items="orbitItems.length > 0"
						:node-count="orbitItems.length"
						@close="handleCloseOrbitNode"
						@toggle="handleToggleOrbitNodes"
						@add-template="handleAddTemplate"
					/>
				</TabsContent>

				<!-- Orbit Nodes Tab -->
				<TabsContent value="orbit" class="buildit-tabs-content buildit-orbit-list">
					<div class="orbit-nodes-list">
						<div v-if="orbitItems.length === 0" class="orbit-nodes-empty">
							<UIcon name="i-lucide-network" class="size-8 text-white/30" />
							<p class="text-white/60 text-sm">No connected nodes</p>
						</div>

						<div v-else class="space-y-2">
							<div
								v-for="item in orbitItems"
								:key="item.id"
								class="orbit-node-item"
								@click="handleOrbitItemClick(item)"
							>
								<div class="orbit-node-icon">
									<UIcon :name="item.icon" class="size-4 text-white" />
								</div>
								<div class="orbit-node-info">
									<div class="orbit-node-label">{{ getNodeTypeName(item.payload?.type) }}</div>
									<div class="orbit-node-type">{{ item.label }}</div>
								</div>
								<UIcon name="i-lucide-chevron-right" class="size-4 text-white/40" />
							</div>
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</div>
		</div>

		<template #overlay>
			<NodeOrbitOverlay
				v-if="orbitItems.length"
				:items="orbitItems"
				center-icon="i-lucide-zap"
				:auto-rotate="true"
				:size="orbitOverlaySize"
				:start-radius="orbitStartRadius"
				:radius-step="orbitRadiusStep"
				:active-id="activeOrbitNodeId"
				:center-z-index="20"
				@select="handleOrbitItemClick"
			/>
		</template>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
import type { Options as ConfettiOptions } from "canvas-confetti";
import Tabs from "~/components/Ui/Tabs/Tabs.vue";
import TabsContent from "~/components/Ui/Tabs/Content.vue";
import TabsList from "~/components/Ui/Tabs/List.vue";
import TabsTrigger from "~/components/Ui/Tabs/Trigger.vue";
import { useEnvironmentLink } from "@composables/useEnvironmentLink";
import { useEnvironmentStore } from "@composables/useEnvironmentStore";
import { useProjectInstallable } from "@composables/useProjectInstallable";
import { useVueFlow } from "@vue-flow/core";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import OrbitControlButton from "@canvas/shared/OrbitControlButton.vue";
import NodeOrbitOverlay from "@canvas/shared/NodeOrbitOverlay.vue";
import { useOrbitNodeManager } from "@canvas/composables/useOrbitNodeManager";
import type { OrbitItem, OrbitNodeMeta } from "@canvas/composables/useOrbitNodeManager";
import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";

interface Props {
	customNodeProps: any
	updateNodeData?: (nodeId: string, key: string, value: any) => void
	createChildProjectEnvironmentNode?: (nodeId: string, environmentData: Record<string, any>) => void
	registerExistingNode?: (node: any) => void
	createEdge?: (sourceNodeId: string, targetNodeId: string) => void
	triggerTemplateNodeChain?: (templateNodeId: string) => void
}

const props = defineProps<Props>();

const registerExistingNode = props.registerExistingNode;
const createEdgeFromHandlers = props.createEdge;
const triggerTemplateNodeChain = props.triggerTemplateNodeChain;

const vueFlow = useVueFlow();
	const { removeNodes } = vueFlow;
	const setNodes = vueFlow.setNodes;
	const { activeEnvironment, loadCurrentEnvironment } = useEnvironmentStore();
	const { linkEnvironment, isEnvironmentLinkedToProject } = useEnvironmentLink();
	const { checkInstallable, setInstallable, isChecking: isCheckingInstallable } = useProjectInstallable();

	// Initialize Orbit Node Manager
	const orbitManager = useOrbitNodeManager(
		computed(() => props.customNodeProps?.id || '').value,
		setNodes
	);

	// Refs
	const builditButtonRef = ref<HTMLButtonElement | null>(null);

	// Use composable state
	const orbitItems = orbitManager.orbitItems;
	const orbitNodeMeta = orbitManager.orbitNodeMeta;
	const activeOrbitNodeId = orbitManager.activeOrbitNodeId;
	const orbitNodesExpanded = orbitManager.orbitNodesExpanded;

	// Timer management for collapsing nodes
	const collapseTimers: number[] = [];

	const setNodeCollapsed = (collapsed: boolean) => {
		if (!props.updateNodeData || !props.customNodeProps?.id) {
			return;
		}

		const current = props.customNodeProps.data?.collapsed;
		if (current === collapsed) {
			return;
		}

		props.updateNodeData(props.customNodeProps.id, "collapsed", collapsed);
	};


	const isNodeCollapsed = computed(() => Boolean(props.customNodeProps.data?.collapsed));
	const nodeCardSize = computed(() => {
		const width = props.customNodeProps?.data?.collapsed ? 320 : 420;
		const height = props.customNodeProps?.data?.collapsed ? 180 : 260;
		return Math.max(width, height);
	});

	const orbitPadding = computed(() => (isNodeCollapsed.value ? 80 : 120));

	const orbitOverlaySize = computed(() => {
		const count = Math.max(orbitItems.value.length, 1);
		const minDiameter = nodeCardSize.value + (orbitPadding.value * 2);
		const base = minDiameter + ((count - 1) * orbitRadiusStep.value * 2);
		return Math.max(minDiameter, base);
	});

	const primaryChainKey = computed(() => orbitItems.value.find((item) => item.payload?.chainParent)?.payload?.chainParent || null);
	const firstRingAdditionalRadius = computed(() => {
		if (!orbitItems.value.length) {
			return 0;
		}

		const primaryCount = primaryChainKey.value
			? orbitItems.value.filter((item) => item.payload?.chainParent === primaryChainKey.value).length
			: orbitItems.value.length;

		const baseOffset = 80;
		const extraOffset = Math.max(primaryCount - 4, 0) * 14;
		return baseOffset + extraOffset;
	});

	const orbitStartRadius = computed(() => (nodeCardSize.value / 2) + orbitPadding.value + firstRingAdditionalRadius.value);
	const orbitRadiusStep = computed(() => orbitPadding.value + 60);

	const nodeIconMap: Record<string, string> = {
		// Project management
		projectNode: "i-lucide-folder-kanban",
		setupProjectNode: "i-lucide-project-arrows",
		projectEnvironmentNode: "i-lucide-git-branch",
		projectInstallNode: "i-lucide-rocket",
		projectToolsSetupNode: "i-lucide-wrench",
		projectConfiguredNode: "i-lucide-check-circle",
		// User/Team
		userManagementNode: "i-lucide-users",
		userNode: "i-lucide-user",
		adminUserNode: "i-lucide-user-cog",
		// Tasks & Work
		taskNode: "i-lucide-check-square",
		orbitCardNode: "i-lucide-orbit",
		// Development & Automation
		solutionNode: "i-lucide-puzzle",
		projectBuilditNode: "i-lucide-zap",
		builditNode: "i-lucide-zap",
		integrationNode: "i-lucide-plug",
		integrationConnectionNode: "i-lucide-plug",
		integrationDetailNode: "i-lucide-plug-2",
		// Version Control
		gitCloneRepositoryNode: "i-lucide-git-clone",
		gitActionNode: "i-lucide-git-commit",
		// Code & Templates
		templateNode: "i-lucide-layout-template",
		templateConfiguredNode: "i-lucide-layout-grid",
		solutionTemplateNode: "i-lucide-layers",
		// Development Tools
		hookNode: "i-lucide-hook",
		transportNode: "i-lucide-wifi",
		transportTemplateNode: "i-lucide-wifi",
		browserNode: "i-lucide-globe",
		codeEditorNode: "i-lucide-code",
		scriptEditorNode: "i-lucide-code-2",
		fileCreatorNode: "i-lucide-file-plus",
		// System & Configuration
		intentSelectionNode: "i-lucide-target",
		intentSelection: "i-lucide-target",
		projectExplorerNode: "i-lucide-folder",
		projectExplorer: "i-lucide-folder",
		folderBrowserNode: "i-lucide-folder-open",
		ideStatusNode: "i-lucide-monitor",
		// Forms & UI
		formsPanelNode: "i-lucide-form",
		eventNode: "i-lucide-zap",
		commandNode: "i-lucide-terminal",
		viewNode: "i-lucide-eye",
		webviewNode: "i-lucide-globe",
		viewportNode: "i-lucide-maximize-2",
		// Data & Storage
		databaseNode: "i-lucide-database",
		environmentNode: "i-lucide-box",
		nodeCheckNode: "i-lucide-check",
		phpCheckNode: "i-lucide-code",
		rustCheckNode: "i-lucide-code",
		dotnetCheckNode: "i-lucide-code",
		pythonCheckNode: "i-lucide-code",
		javaCheckNode: "i-lucide-code",
		// Folders & Utilities
		bFolderSetupNode: "i-lucide-folder-plus",
		projectScriptRunnerNode: "i-lucide-play",
		saveTemplateNode: "i-lucide-save",
		// CLI
		builditCli: "i-lucide-terminal",
		"buildit-cli": "i-lucide-terminal",
		// Generic
		rectangle: "i-lucide-square",
		circle: "i-lucide-circle",
		diamond: "i-lucide-gem",
		triangle: "i-lucide-triangle",
		hexagon: "i-lucide-hexagon",
		cloud: "i-lucide-cloud",
		database: "i-lucide-database",
		api: "i-lucide-api",
		server: "i-lucide-server",
		githubNode: "i-lucide-github"
	};

	const nodeColorMap: Record<string, string> = {
		// Project management
		projectNode: "rgba(59, 130, 246, 0.95)",
		setupProjectNode: "rgba(59, 130, 246, 0.85)",
		projectEnvironmentNode: "rgba(248, 113, 113, 0.95)",
		projectInstallNode: "rgba(16, 185, 129, 0.95)",
		projectToolsSetupNode: "rgba(56, 189, 248, 0.95)",
		projectConfiguredNode: "rgba(34, 197, 94, 0.95)",
		// User/Team
		userManagementNode: "rgba(192, 132, 252, 0.95)",
		userNode: "rgba(168, 85, 247, 0.90)",
		adminUserNode: "rgba(139, 92, 246, 0.95)",
		// Tasks & Work
		taskNode: "rgba(251, 191, 36, 0.95)",
		orbitCardNode: "rgba(251, 191, 36, 0.95)",
		// Development & Automation
		solutionNode: "rgba(45, 212, 191, 0.95)",
		projectBuilditNode: "rgba(34, 197, 94, 0.95)",
		builditNode: "rgba(34, 197, 94, 0.95)",
		integrationNode: "rgba(249, 115, 22, 0.95)",
		integrationConnectionNode: "rgba(249, 115, 22, 0.95)",
		integrationDetailNode: "rgba(234, 88, 12, 0.90)",
		// Version Control
		gitCloneRepositoryNode: "rgba(249, 115, 22, 0.95)",
		gitActionNode: "rgba(249, 115, 22, 0.90)",
		// Code & Templates
		templateNode: "rgba(139, 92, 246, 0.95)",
		templateConfiguredNode: "rgba(168, 85, 247, 0.90)",
		solutionTemplateNode: "rgba(124, 58, 237, 0.90)",
		// Development Tools
		hookNode: "rgba(249, 115, 22, 0.85)",
		transportNode: "rgba(14, 165, 233, 0.90)",
		transportTemplateNode: "rgba(14, 165, 233, 0.85)",
		browserNode: "rgba(14, 165, 233, 0.95)",
		codeEditorNode: "rgba(139, 92, 246, 0.90)",
		scriptEditorNode: "rgba(124, 58, 237, 0.90)",
		fileCreatorNode: "rgba(34, 197, 94, 0.85)",
		// System & Configuration
		intentSelectionNode: "rgba(249, 115, 22, 0.90)",
		intentSelection: "rgba(249, 115, 22, 0.90)",
		projectExplorerNode: "rgba(14, 165, 233, 0.85)",
		projectExplorer: "rgba(14, 165, 233, 0.85)",
		folderBrowserNode: "rgba(56, 189, 248, 0.90)",
		ideStatusNode: "rgba(45, 212, 191, 0.85)",
		// Forms & UI
		formsPanelNode: "rgba(168, 85, 247, 0.90)",
		eventNode: "rgba(249, 115, 22, 0.85)",
		commandNode: "rgba(59, 130, 246, 0.85)",
		viewNode: "rgba(14, 165, 233, 0.85)",
		webviewNode: "rgba(14, 165, 233, 0.90)",
		viewportNode: "rgba(139, 92, 246, 0.85)",
		// Data & Storage
		databaseNode: "rgba(59, 130, 246, 0.90)",
		environmentNode: "rgba(248, 113, 113, 0.85)",
		nodeCheckNode: "rgba(34, 197, 94, 0.85)",
		phpCheckNode: "rgba(249, 115, 22, 0.85)",
		rustCheckNode: "rgba(249, 115, 22, 0.90)",
		dotnetCheckNode: "rgba(59, 130, 246, 0.90)",
		pythonCheckNode: "rgba(249, 115, 22, 0.95)",
		javaCheckNode: "rgba(249, 115, 22, 0.85)",
		// Folders & Utilities
		bFolderSetupNode: "rgba(56, 189, 248, 0.90)",
		projectScriptRunnerNode: "rgba(124, 58, 237, 0.90)",
		saveTemplateNode: "rgba(34, 197, 94, 0.90)",
		// CLI
		builditCli: "rgba(34, 197, 94, 0.85)",
		"buildit-cli": "rgba(34, 197, 94, 0.85)"
	};

	const nodeGradientMap: Record<string, [string, string]> = {
		projectNode: ["rgba(37, 99, 235, 0.95)", "rgba(56, 189, 248, 0.85)"],
		setupProjectNode: ["rgba(59, 130, 246, 0.95)", "rgba(37, 99, 235, 0.85)"],
		projectEnvironmentNode: ["rgba(248, 113, 113, 0.95)", "rgba(220, 38, 38, 0.85)"],
		projectInstallNode: ["rgba(16, 185, 129, 0.95)", "rgba(5, 150, 105, 0.85)"],
		projectToolsSetupNode: ["rgba(56, 189, 248, 0.95)", "rgba(14, 165, 233, 0.85)"],
		projectConfiguredNode: ["rgba(34, 197, 94, 0.95)", "rgba(22, 163, 74, 0.85)"],
		userManagementNode: ["rgba(192, 132, 252, 0.95)", "rgba(124, 58, 237, 0.88)"],
		userNode: ["rgba(168, 85, 247, 0.95)", "rgba(139, 92, 246, 0.85)"],
		adminUserNode: ["rgba(139, 92, 246, 0.95)", "rgba(109, 40, 217, 0.85)"],
		taskNode: ["rgba(251, 191, 36, 0.95)", "rgba(249, 115, 22, 0.88)"],
		orbitCardNode: ["rgba(251, 191, 36, 0.95)", "rgba(249, 115, 22, 0.88)"],
		solutionNode: ["rgba(45, 212, 191, 0.95)", "rgba(13, 148, 136, 0.88)"],
		projectBuilditNode: ["rgba(34, 197, 94, 0.95)", "rgba(22, 163, 74, 0.88)"],
		builditNode: ["rgba(34, 197, 94, 0.95)", "rgba(22, 163, 74, 0.88)"],
		integrationNode: ["rgba(249, 115, 22, 0.95)", "rgba(234, 88, 12, 0.85)"],
		integrationConnectionNode: ["rgba(249, 115, 22, 0.95)", "rgba(234, 88, 12, 0.85)"],
		integrationDetailNode: ["rgba(234, 88, 12, 0.95)", "rgba(194, 65, 12, 0.85)"],
		gitCloneRepositoryNode: ["rgba(249, 115, 22, 0.95)", "rgba(234, 88, 12, 0.85)"],
		gitActionNode: ["rgba(249, 115, 22, 0.95)", "rgba(234, 88, 12, 0.85)"],
		templateNode: ["rgba(139, 92, 246, 0.95)", "rgba(109, 40, 217, 0.88)"],
		templateConfiguredNode: ["rgba(168, 85, 247, 0.95)", "rgba(139, 92, 246, 0.88)"],
		hookNode: ["rgba(249, 115, 22, 0.95)", "rgba(234, 88, 12, 0.85)"],
		transportNode: ["rgba(14, 165, 233, 0.95)", "rgba(3, 136, 206, 0.85)"],
		browserNode: ["rgba(14, 165, 233, 0.95)", "rgba(3, 136, 206, 0.88)"],
		fileCreatorNode: ["rgba(34, 197, 94, 0.95)", "rgba(22, 163, 74, 0.88)"],
		intentSelectionNode: ["rgba(249, 115, 22, 0.95)", "rgba(234, 88, 12, 0.88)"],
		formsPanelNode: ["rgba(168, 85, 247, 0.95)", "rgba(139, 92, 246, 0.88)"],
		bFolderSetupNode: ["rgba(56, 189, 248, 0.95)", "rgba(14, 165, 233, 0.88)"],
		projectScriptRunnerNode: ["rgba(124, 58, 237, 0.95)", "rgba(109, 40, 217, 0.88)"],
		saveTemplateNode: ["rgba(34, 197, 94, 0.95)", "rgba(22, 163, 74, 0.88)"]
	};

	const nodeHaloMap: Record<string, string> = {
		projectNode: "rgba(59, 130, 246, 0.45)",
		setupProjectNode: "rgba(59, 130, 246, 0.40)",
		projectEnvironmentNode: "rgba(248, 113, 113, 0.45)",
		projectInstallNode: "rgba(16, 185, 129, 0.45)",
		projectToolsSetupNode: "rgba(56, 189, 248, 0.42)",
		projectConfiguredNode: "rgba(34, 197, 94, 0.45)",
		userManagementNode: "rgba(192, 132, 252, 0.45)",
		userNode: "rgba(168, 85, 247, 0.40)",
		adminUserNode: "rgba(139, 92, 246, 0.45)",
		taskNode: "rgba(251, 191, 36, 0.45)",
		orbitCardNode: "rgba(251, 191, 36, 0.45)",
		solutionNode: "rgba(45, 212, 191, 0.45)",
		projectBuilditNode: "rgba(34, 197, 94, 0.45)",
		builditNode: "rgba(34, 197, 94, 0.45)",
		integrationNode: "rgba(249, 115, 22, 0.4)",
		integrationConnectionNode: "rgba(249, 115, 22, 0.40)",
		integrationDetailNode: "rgba(234, 88, 12, 0.40)",
		gitCloneRepositoryNode: "rgba(249, 115, 22, 0.40)",
		gitActionNode: "rgba(249, 115, 22, 0.40)",
		templateNode: "rgba(139, 92, 246, 0.40)",
		templateConfiguredNode: "rgba(168, 85, 247, 0.40)",
		hookNode: "rgba(249, 115, 22, 0.40)",
		transportNode: "rgba(14, 165, 233, 0.40)",
		browserNode: "rgba(14, 165, 233, 0.45)",
		fileCreatorNode: "rgba(34, 197, 94, 0.40)",
		intentSelectionNode: "rgba(249, 115, 22, 0.40)",
		formsPanelNode: "rgba(168, 85, 247, 0.40)",
		bFolderSetupNode: "rgba(56, 189, 248, 0.40)",
		projectScriptRunnerNode: "rgba(124, 58, 237, 0.40)",
		saveTemplateNode: "rgba(34, 197, 94, 0.40)"
	};

	const nodeTypeLabelMap: Record<string, string> = {
		projectNode: "Project",
		setupProjectNode: "Setup Project",
		projectEnvironmentNode: "Environment",
		projectInstallNode: "Install",
		projectToolsSetupNode: "Tool Setup",
		projectConfiguredNode: "Configured",
		userManagementNode: "User Management",
		userNode: "User",
		adminUserNode: "Admin User",
		taskNode: "Task",
		orbitCardNode: "Orbit",
		solutionNode: "Solution",
		builditNode: "Buildit",
		integrationNode: "Integration",
		integrationConnectionNode: "Connection",
		integrationDetailNode: "Detail",
		gitCloneRepositoryNode: "Git Clone",
		gitActionNode: "Git Action",
		templateNode: "Template",
		templateConfiguredNode: "Template Config",
		hookNode: "Hook",
		transportNode: "Transport",
		browserNode: "Browser",
		codeEditorNode: "Code Editor",
		scriptEditorNode: "Script Editor",
		fileCreatorNode: "File Creator",
		intentSelectionNode: "Intent",
		projectExplorerNode: "Explorer",
		formsPanelNode: "Forms",
		eventNode: "Event",
		commandNode: "Command",
		viewNode: "View",
		webviewNode: "Webview",
		viewportNode: "Viewport",
		bFolderSetupNode: "Folder Setup",
		projectScriptRunnerNode: "Script Runner",
		saveTemplateNode: "Save Template",
		ideStatusNode: "IDE Status"
	};

	const fallbackNodeIcon = "i-lucide-cube";
	const fallbackNodeColor = "rgba(59, 130, 246, 0.7)";

	const adjustColorAlpha = (color: string, alpha: number) => {
		if (!color) return `rgba(59, 130, 246, ${alpha})`;
		const rgbaMatch = color.trim().match(/rgba?\(([^)]+)\)/);
		if (rgbaMatch) {
			const parts = rgbaMatch[1].split(",").map((part) => part.trim());
			if (parts.length >= 3) {
				const [r, g, b] = parts;
				return `rgba(${r}, ${g}, ${b}, ${alpha})`;
			}
		}
		return color;
	};

	const deriveGradient = (baseColor: string): [string, string] => {
		const start = adjustColorAlpha(baseColor, 0.95);
		const end = adjustColorAlpha(baseColor, 0.7);
		return [start, end];
	};

	const getNodeTypeLabel = (type?: string) => {
		if (!type) {
			return "Node";
		}
		return nodeTypeLabelMap[type] || type.replace(/([a-z])([A-Z])/g, "$1 $2");
	};

	const getNodeTypeName = (type?: string) => {
		return getNodeTypeLabel(type);
	};

	const getCurrentEdges = () => {
		const edgesFn = (vueFlow as any)?.getEdges;
		if (typeof edgesFn === "function") {
			const edges = edgesFn();
			if (Array.isArray(edges)) {
				return edges;
			}
		}

		const edgesRef = (vueFlow as any)?.edges ?? (vueFlow as any)?.store?.edges;
		if (Array.isArray(edgesRef?.value)) {
			return edgesRef.value;
		}

		return [];
	};

	const getCurrentNodes = () => {
		const nodesFn = (vueFlow as any)?.getNodes;
		if (typeof nodesFn === "function") {
			const nodes = nodesFn();
			if (Array.isArray(nodes)) {
				return nodes;
			}
		}

		const nodesRef = (vueFlow as any)?.nodes ?? (vueFlow as any)?.store?.nodes;
		if (Array.isArray(nodesRef?.value)) {
			return nodesRef.value;
		}

		return [];
	};

	const getConnectedNodeIds = (startId: string) => {
		const edges = getCurrentEdges();
		if (!Array.isArray(edges) || !edges.length) {
			return [];
		}

		const visited = new Set<string>([startId]);
		const queue: string[] = [startId];

		while (queue.length > 0) {
			const current = queue.shift()!;
			for (const edge of edges) {
				if (edge.source === current && !visited.has(edge.target)) {
					visited.add(edge.target);
					queue.push(edge.target);
				}
				if (edge.target === current && !visited.has(edge.source)) {
					visited.add(edge.source);
					queue.push(edge.source);
				}
			}
		}

		return Array.from(visited);
	};


	const deriveChainParent = (node: any): string => {
		const templateChainKey = node?.data?._chainParent;
		if (templateChainKey) {
			return String(templateChainKey);
		}

		const projectChainKey = node?.data?.projectConfigChainParent;
		if (projectChainKey) {
			return String(projectChainKey);
		}

		const projectId =
			node?.data?.projectId
			|| node?.data?.sourceProjectNodeId
			|| props.customNodeProps.data?.projectId;
		if (projectId) {
			return `project-config-${String(projectId)}`;
		}

		if (node?.data?.parentNodeId) {
			return String(node.data.parentNodeId);
		}

		return String(node?.id);
	};

	const deriveChainOrder = (node: any): number => {
		if (typeof node?.data?._chainOrder === "number") {
			return node.data._chainOrder;
		}

		switch (node?.type) {
		case "setupProjectNode":
			return 0;
		case "projectToolsSetupNode":
			return 1;
		case "projectEnvironmentNode":
			return 2;
		case "projectInstallNode":
			return 3;
		case "builditNode":
			return 4;
		default:
			return 0;
		}
	};

	const createOrbitItems = (nodeIds: string[]) => {
		const nodes = getCurrentNodes();
		const meta: Record<string, OrbitNodeMeta> = { ...orbitNodeMeta.value };

		const items = nodeIds
			.map((id) => nodes.find((node: any) => node.id === id))
			.filter(Boolean)
			.map((node: any) => {
				const label =
					node?.data?.title
					|| node?.data?.projectName
					|| node?.data?.label
					|| node?.label
					|| getNodeTypeLabel(node?.type)
					|| node?.id;

				const icon = node?.data?.icon
					|| nodeIconMap[node?.type || ""]
					|| fallbackNodeIcon;

				const color = node?.data?.themeColor
					|| node?.data?.headerColor
					|| nodeColorMap[node?.type || ""]
					|| fallbackNodeColor;

				const gradient = node?.data?.orbitGradient
					|| nodeGradientMap[node?.type || ""]
					|| deriveGradient(color);

				const haloColor = node?.data?.orbitHaloColor
					|| nodeHaloMap[node?.type || ""]
					|| adjustColorAlpha(color, 0.3);

				const initial = (label || "").trim().charAt(0).toUpperCase() || "•";

				meta[node.id] = {
					id: node.id,
					type: node.type || "",
					label,
					data: { ...(node.data || {}) }
				};

				const chainParent = deriveChainParent(node);
				const chainOrder = deriveChainOrder(node);

				return {
				id: node.id,
				label,
				icon,
				color,
				initial,
				disabled: false,
				tooltip: `${getNodeTypeLabel(node?.type)} • ${label}`,
				badgeGradient: gradient,
				haloColor,
				payload: {
					type: node.type,
					chainParent,
					chainOrder,
					templateNodeId: node?.data?.templateNodeId ?? (node.type === "templateNode" ? node.id : undefined),
					parentNodeId: node?.data?.parentNodeId
				}
			} as OrbitItem;
			});

		orbitNodeMeta.value = meta;
		return items;
	};

	const groupOrbitItemsByParent = (items: OrbitItem[]) => {
		const grouped = new Map<string, OrbitItem[]>();

		for (const item of items) {
			const parentKey = item.payload?.chainParent || item.id;
			if (!grouped.has(parentKey)) {
				grouped.set(parentKey, []);
			}
			grouped.get(parentKey)!.push(item);
		}

		return Array.from(grouped.entries()).map(([key, groupItems]) => ({
			key,
			items: groupItems.sort((a, b) => Number(a.payload?.chainOrder ?? 0) - Number(b.payload?.chainOrder ?? 0))
		}));
	};

	function initializeOrbit() {
		if (!isBuildComplete.value || !props.customNodeProps?.id) {
			return;
		}

		const connectedIds = getConnectedNodeIds(props.customNodeProps.id)
			.filter((id) => id !== props.customNodeProps?.id);

		if (!connectedIds.length) {
			orbitManager.clearOrbit();
			return;
		}

		const currentIds = orbitItems.value.map((item) => item.id).sort();
		const newIdsSorted = [...connectedIds].sort();
		const alreadyInitialized = currentIds.length === newIdsSorted.length
			&& currentIds.every((id, idx) => id === newIdsSorted[idx]);

		if (alreadyInitialized) {
			return;
		}

		orbitManager.restoreOrbitNodes();
		if (!orbitNodesExpanded.value) {
			orbitManager.hideNodesForOrbit(connectedIds);
		}

		const newItems = createOrbitItems(connectedIds);
		const groupedItems = groupOrbitItemsByParent(newItems);

		const flattenedItems = groupedItems.flatMap((group, index) => {
			const ringIndex = index;
			const ringRadius = (nodeCardSize.value / 2) + orbitPadding.value + (ringIndex * orbitRadiusStep.value);

			return group.items.map((item) => ({
				...item,
				payload: {
					...item.payload,
					ringIndex,
					ringRadius
				}
			}));
		});

		const meta: Record<string, OrbitNodeMeta> = {};
		flattenedItems.forEach((item) => {
			const nodeMeta = orbitNodeMeta.value[item.id];
			if (nodeMeta) {
				meta[item.id] = nodeMeta;
			}
		});

		orbitNodeMeta.value = meta;
		orbitManager.setOrbitItems(flattenedItems, meta);
	}

	function handleOrbitItemClick(item: any) {
		orbitManager.openNodeFromOrbit(item.id);
	}

	function handleCloseOrbitNode() {
		orbitManager.closeOrbitNode();
	}

	function handleToggleOrbitNodes() {
		orbitManager.toggleOrbitNodes();
	}

	async function handleAddTemplate() {
		console.log("🎨 Creating template node with intent selection chain");

		const parentNodeId = props.customNodeProps?.id;
		if (!parentNodeId) {
			console.error("❌ Parent node ID is required");
			return;
		}

		const projectId = props.customNodeProps?.data?.projectId;
		const projectName = props.customNodeProps?.data?.projectName;
		const organizationId = props.customNodeProps?.data?.organisationId;

		if (!projectId) {
			console.error("❌ Project ID is required to create template chain");
			return;
		}

		// Get parent position
		const allNodesArray = getCurrentNodes();
		const parentNode = allNodesArray.find((node: any) => node.id === parentNodeId);
		if (!parentNode) {
			console.error("❌ Parent node not found");
			return;
		}

		const parentPosition = parentNode.position || { x: 0, y: 0 };

		try {
			const templateNodeId = `templateNode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const templateThemeColor = "rgba(16, 185, 129, 0.95)";

			const templateNodeData = {
				id: templateNodeId,
				type: "templateNode",
				position: {
					x: parentPosition.x + 650,
					y: parentPosition.y + (100 * (orbitItems.value.length + 1))
				},
				data: {
					label: "Template",
					projectId,
					projectName,
					organisationId: organizationId,
					parentNodeId,
					themeColor: templateThemeColor,
					_isChainNode: true,
					_chainParent: templateNodeId,
					_chainOrder: 0
				}
			};

			console.log("📦 Adding template node");
			vueFlow.addNodes([templateNodeData]);
			registerExistingNode?.(templateNodeData);

			if (createEdgeFromHandlers) {
				createEdgeFromHandlers(parentNodeId, templateNodeId);
			} else {
				const templateEdgeData = {
					id: `edge-${parentNodeId}-${templateNodeId}`,
					source: parentNodeId,
					target: templateNodeId,
					type: "smoothstep",
					animated: true,
					style: {
						stroke: "rgba(16, 185, 129, 0.95)",
						strokeWidth: 2
					},
					markerEnd: {
						type: "arrowclosed",
						color: "rgba(16, 185, 129, 0.95)"
					},
					label: "Template",
					labelStyle: {
						fill: "rgba(16, 185, 129, 0.95)",
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

				vueFlow.addEdges([templateEdgeData]);
			}

			props.updateNodeData?.(templateNodeId, "_chainParent", templateNodeId);
			props.updateNodeData?.(templateNodeId, "_chainOrder", 0);
			props.updateNodeData?.(templateNodeId, "_isChainNode", true);

			// Trigger the template chain so the intent selection node appears immediately
			triggerTemplateNodeChain?.(templateNodeId);

			console.log("🔄 Reinitializing orbit to include template node");
			setTimeout(() => {
				initializeOrbit();
				console.log("✅ Template node created and orbit ring updated");
			}, 100);
		} catch (error) {
			console.error("❌ Error creating template chain:", error);
		}
	}

	function collapseAfterDelay(delay: number) {
		if (!props.customNodeProps?.id) {
			return;
		}

		if (!Number.isFinite(delay) || delay <= 0) {
			setNodeCollapsed(true);
			return;
		}

		collapseTimers.forEach((timer) => {
			window.clearTimeout(timer);
		});
		collapseTimers.length = 0;

		const timer = window.setTimeout(() => {
			setNodeCollapsed(true);
		}, delay);

		collapseTimers.push(timer);
	}

	const builditContentWrapperRef = ref<HTMLElement | null>(null);

	// State
	const isLinking = ref(false);
	const isInstalling = ref(false);
	const isCheckingLink = ref(false);
	const isEnvironmentLinked = ref(false);
	const lastBuilditResultLocal = ref<any>(props.customNodeProps.data?.lastBuilditResult ?? null);
	const updateLastBuilditResult = (result: {
		status: "success" | "failure" | "skipped"
		completedAt: string
		successCount: number
		failureCount: number
		skippedCount: number
	}) => {
		lastBuilditResultLocal.value = result;
		props.updateNodeData?.(props.customNodeProps.id, "lastBuilditResult", result);
	};

	// Theme colors
	const lastBuilditResult = computed(() => lastBuilditResultLocal.value);
	const isBuildComplete = computed(
		() => lastBuilditResult.value?.status === "success" || lastBuilditResult.value?.status === "skipped"
	);
	const isBuildFailure = computed(() => lastBuilditResult.value?.status === "failure");

	const PENDING_COLORS = {
		theme: "rgba(249, 115, 22, 1)",
		background: "linear-gradient(135deg, rgba(124, 45, 18, 0.9), rgba(194, 65, 12, 0.95))",
		border: "rgba(251, 191, 36, 0.35)"
	} as const;

	const COMPLETE_COLORS = {
		theme: "rgba(34, 197, 94, 1)",
		background: "linear-gradient(135deg, rgba(6, 95, 70, 0.9), rgba(4, 120, 87, 0.95))",
		border: "rgba(52, 211, 153, 0.3)"
	} as const;

	const nodeColorScheme = computed(() => (isBuildComplete.value ? COMPLETE_COLORS : PENDING_COLORS));

	const themeColor = computed(() => nodeColorScheme.value.theme);
	const backgroundColor = computed(() => nodeColorScheme.value.background);
	const borderColor = computed(() => nodeColorScheme.value.border);

	// Data from node
	const setupData = computed(() => props.customNodeProps.data?.savedEnvironmentSetup || null);
	const projectId = computed(() => props.customNodeProps.data?.projectId || "");
	const projectName = computed(() => props.customNodeProps.data?.projectName || "Unnamed Project");

	// Environment info from setup data
	const environmentInfo = computed(() => {
		const setup = setupData.value;
		if (!setup?.environment) return null;
		return setup.environment;
	});

	const getTemplateName = (templateLink: any): string => {
		return templateLink?.template?.name
			|| templateLink?.meta?.templateName
			|| templateLink?.templateName
			|| templateLink?.name
			|| "Unknown Template";
	};

	const environmentInstallable = computed(() => Boolean(props.customNodeProps.data?.environmentInstallable));

	watch(() => props.customNodeProps.data?.lastBuilditResult, (value) => {
		lastBuilditResultLocal.value = value ?? null;
	}, { immediate: true });

	watch(isBuildComplete, (complete) => {
		if (complete) {
			initializeOrbit();
		} else {
			orbitManager.clearOrbit();
		}
	}, { immediate: true });

watch(() => props.customNodeProps?.data?.openOrbitNodeId, (nodeId) => {
	if (!nodeId) {
		return;
	}

	orbitManager.openNodeFromOrbit(nodeId);
	props.updateNodeData?.(props.customNodeProps.id, "openOrbitNodeId", null);
}, { immediate: false });

watch(() => props.customNodeProps?.data?.orbitRefreshKey, (refreshKey) => {
	if (!refreshKey) {
		return;
	}

	initializeOrbit();
	props.updateNodeData?.(props.customNodeProps.id, "orbitRefreshKey", null);
});

	// Status message
	const statusMessage = computed(() => {
		if (isLinking.value || isInstalling.value) {
			return "Preparing installation...";
		}
		if (!setupData.value) {
			return "Save the environment setup first.";
		}
		if (isCheckingLink.value) {
			return "Checking environment link status...";
		}

		if (isBuildComplete.value) {
			return lastBuilditResult.value?.status === "skipped"
				? "Environment already set up. No installation needed."
				: `Installation complete (${lastBuilditResult.value?.completedAt ?? "just now"}).`;
		}

		if (isBuildFailure.value) {
			return "Last installation attempt failed. Review results and try again.";
		}

		if (!isEnvironmentLinked.value) {
			return "Click BUILDIT to link environment and start installation.";
		}
		return "Environment linked. Ready to build!";
	});

	const statusLabel = computed(() => {
		if (isBuildComplete.value) return "Complete";
		if (isEnvironmentLinked.value) return "Ready";
		return "Pending";
	});

	const statusColor = computed(() => {
		if (isBuildComplete.value) return COMPLETE_COLORS.theme;
		if (isEnvironmentLinked.value) return PENDING_COLORS.theme;
		return "rgba(234, 179, 8, 1)";
	});

	const builditButtonDisabled = computed(() =>
		!setupData.value
		|| isLinking.value
		|| isInstalling.value
		|| isCheckingInstallable.value
	);

	const builditButtonLabel = computed(() => {
		if (isInstalling.value || isLinking.value) {
			return "Installing...";
		}

		if (!setupData.value) {
			return "Setup Needed";
		}

		if (isBuildComplete.value) {
			return lastBuilditResult.value?.status === "skipped" ? "Already Installed" : "Complete";
		}

		if (isBuildFailure.value) {
			return "Retry";
		}

		return "BUILDIT";
	});

	const builditButtonStateIcon = computed(() => {
		if (isInstalling.value || isLinking.value) {
			return "i-lucide-loader-2";
		}

		if (isBuildComplete.value) {
			return "i-lucide-check-circle";
		}

		if (isBuildFailure.value) {
			return "i-lucide-alert-octagon";
		}

		return "i-lucide-zap";
	});

	const builditButtonStateClass = computed(() => {
		if (isInstalling.value || isLinking.value) {
			return {};
		}
		return {
			"buildit-button--success": isBuildComplete.value,
			"buildit-button--failure": isBuildFailure.value
		};
	});

	// Check if environment is linked to project
	const checkEnvironmentLink = async () => {
		if (!projectId.value || !activeEnvironment.value?.id) {
			isEnvironmentLinked.value = false;
			return;
		}

		isCheckingLink.value = true;
		try {
			const linked = await isEnvironmentLinkedToProject(projectId.value, activeEnvironment.value.id);
			isEnvironmentLinked.value = linked;
		} catch (error) {
			console.error("❌ Failed to check environment link:", error);
			isEnvironmentLinked.value = false;
		} finally {
			isCheckingLink.value = false;
		}
	};

	// Trigger confetti using the useConfetti composable
	const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

	const triggerBuilditConfetti = () => {
		const origin = (() => {
			if (builditButtonRef.value) {
				const buttonRect = builditButtonRef.value.getBoundingClientRect();
				return {
					x: (buttonRect.left + buttonRect.width / 2) / window.innerWidth,
					y: Math.max(0.05, (buttonRect.top + buttonRect.height / 2) / window.innerHeight)
				};
			}
			return { x: 0.5, y: 0.5 };
		})();

		const fireConfetti = (options: ConfettiOptions) => {
			useConfetti({
				disableForReducedMotion: true,
				...options
			});
		};

		fireConfetti({
			origin,
			spread: 70,
			particleCount: 120,
			startVelocity: 65,
			decay: 0.88,
			scalar: 0.9
		});

		// Secondary bursts for broader coverage
		setTimeout(() => {
			const originRight = {
				x: clamp(origin.x + 0.12),
				y: clamp(origin.y - 0.1)
			};
			fireConfetti({
				origin: originRight,
				spread: 90,
				particleCount: 80,
				startVelocity: 55,
				decay: 0.9,
				scalar: 0.75
			});
		}, 180);

		setTimeout(() => {
			const originLeft = {
				x: clamp(origin.x - 0.12),
				y: clamp(origin.y - 0.12)
			};
			fireConfetti({
				origin: originLeft,
				spread: 100,
				particleCount: 80,
				startVelocity: 50,
				decay: 0.9,
				scalar: 0.7
			});
		}, 320);
	};

	// Handle close
	const handleClose = () => {
		removeNodes([props.customNodeProps.id]);
	};

	// Handle Buildit button click
	const handleBuilditClick = async () => {
		if (!projectId.value) {
			console.error("❌ No project ID");
			return;
		}

		if (!setupData.value) {
			console.error("❌ No setup data");
			return;
		}

	if (isLinking.value || isInstalling.value) {
		return;
	}

	orbitManager.restoreOrbitNodes();
	setNodeCollapsed(false);
	isLinking.value = true;

		try {
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();

			// Load current environment
			await loadCurrentEnvironment();
			const activeEnv = activeEnvironment.value;

			if (!activeEnv?.id) {
				toast.add({
					title: "Environment Missing",
					description: "No active environment detected.",
					color: "red"
				});
				return;
			}

			// Check if environment needs to be linked
			await checkEnvironmentLink();

			if (!isEnvironmentLinked.value) {
				// Link environment to project
				const linkResult = await linkEnvironment({
					projectId: projectId.value,
					environmentId: activeEnv.id,
					meta: {
						linkedFrom: "BuilditNode",
						linkedAt: new Date().toISOString(),
						environmentName: activeEnv.name,
						environmentType: activeEnv.type,
						machineId: (activeEnv as any)?.machineId || null
					}
				});

				if (!linkResult.success) {
					throw new Error(linkResult.error?.message || "Failed to link environment");
				}

				toast.add({
					title: "Environment Linked",
					description: `Linked "${activeEnv.name}" to project.`,
					color: "green"
				});

				// Verify link was successful
				await checkEnvironmentLink();
			}

			let installable = environmentInstallable.value;

			// Ensure project is flagged as installable before proceeding
			try {
				await setInstallable(projectId.value);
				installable = true;
			} catch (error) {
				console.warn("⚠️ Failed to set project as installable prior to BUILDIT:", error);
			}

			// Verify project is installable if not already confirmed
			if (!installable) {
				installable = await checkInstallable(projectId.value);
			}

			if (!installable) {
				toast.add({
					title: "Not Installable",
					description: "Project not marked as installable yet.",
					color: "warning"
				});
				return;
			}

			props.updateNodeData?.(props.customNodeProps.id, "environmentInstallable", true);

			// Now proceed to install templates
			isInstalling.value = true;
			await runTemplateInstall();
		} catch (error) {
			console.error("❌ BUILDIT failed:", error);
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "BUILDIT Failed",
				description: error instanceof Error ? error.message : "An error occurred",
				color: "red"
			});
		} finally {
			isLinking.value = false;
			isInstalling.value = false;
		}
	};

	// Install templates logic
	const runTemplateInstall = async () => {
		const { useToast } = await import("#ui/composables/useToast");
		const toast = useToast();

		const linkedTemplates = setupData.value?.linkedTemplates || [];
		if (linkedTemplates.length === 0) {
			toast.add({
				title: "No Templates",
				description: "No templates to install.",
				color: "info"
			});
			return;
		}

		const currentOS = "windows";
		const currentVersion = "11";
		let successCount = 0;
		let failureCount = 0;
		let skippedCount = 0;

		try {
			// Import Tauri shell directly to avoid vueuse issues
			const shellModule = await import("@tauri-apps/plugin-shell");
			const Command = shellModule.Command;

			for (const templateLink of linkedTemplates) {
				const template = templateLink?.template || templateLink;
				const templateName = getTemplateName(templateLink);

				console.log("\n═══════════════════════════════════════════");
				console.log(`🔍 Processing template: ${templateName}`);
				console.log("  Template object:", template);

				const hooks = template?.template?.hooks || template?.hooks;
				if (!hooks || !hooks.install) {
					console.log(`  ⏭️ No install hooks found for ${templateName}`);
					skippedCount++;
					continue;
				}

				const osHooks = hooks.install[currentOS];
				if (!osHooks) {
					console.log(`  ⏭️ No ${currentOS} install hooks for ${templateName}`);
					skippedCount++;
					continue;
				}

				const versionHooks = osHooks[currentVersion];
				if (!versionHooks) {
					console.log(`  ⏭️ No version ${currentVersion} hooks for ${templateName}`);
					skippedCount++;
					continue;
				}

				const actions = versionHooks.actions;
				if (!Array.isArray(actions) || actions.length === 0) {
					console.log(`  ⏭️ No actions found for ${templateName}`);
					skippedCount++;
					continue;
				}

				console.log(`  Found ${actions.length} action(s) to execute`);

				let templateSuccess = false;
				let templateSkipped = false;
				let templateErrorMessage = "";

				for (let i = 0; i < actions.length; i++) {
					const action = actions[i];
					console.log(`  📌 Action ${i + 1}/${actions.length}:`, action);

					const exe = action.exe || "powershell.exe";
					let command = action.command;
					const preCheckCommand = action.preCheck;

					if (!command) {
						console.warn(`    ⚠️ No command specified in action ${i + 1}`);
						continue;
					}

					const templateVersion = template?.version || template?.template?.version || "";
					if (command.includes("{VERSION}") && !templateVersion) {
						console.warn("    ⚠️ Command requires {VERSION} but template has none; removing placeholder");
						command = command.replace(/@\{VERSION\}/g, "").replace(/=\{VERSION\}/g, "");
					}

					const placeholders: Record<string, string> = {
						"{VERSION}": templateVersion,
						"{PROJECT_NAME}": projectName.value || "project",
						"{PROJECT_ID}": projectId.value || "",
						"{IDE_NAME}": activeEnvironment.value?.name || "",
						"{TEMPLATE_NAME}": templateName
					};

					for (const [placeholder, value] of Object.entries(placeholders)) {
						if (value) {
							command = command.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), value);
						}
					}

					console.log(`    📝 Original command: ${action.command}`);
					console.log(`    🔄 Processed command: ${command}`);

					try {
						if (preCheckCommand) {
							console.log(`    🔍 Running pre-check: ${preCheckCommand}`);
							try {
								const preCheckCmd = Command.create("exec-pwsh", ["-Command", preCheckCommand]);
								const preCheckResult = await preCheckCmd.execute();
								if (preCheckResult.code === 0 && preCheckResult.stdout.toLowerCase().includes("found")) {
									console.log("    ⏭️ Already installed, skipping template");
									templateSkipped = true;
									skippedCount++;
									break;
								}
							} catch (preCheckError) {
								console.warn("    ⚠️ Pre-check failed, continuing:", preCheckError);
							}
						}

						console.log("    🚀 Executing install command via Tauri shell...", { exe });
						const cmd = Command.create("exec-pwsh", ["-Command", command]);
						const result = await cmd.execute();
						const output = `${result.stdout} ${result.stderr}`.toLowerCase();
						const alreadyInstalled = output.includes("already installed")
							|| output.includes("no applicable update")
							|| output.includes("no newer package");

						if (alreadyInstalled) {
							console.log("    ⏭️ Reported as already installed");
							templateSkipped = true;
							skippedCount++;
							break;
						}

						if (result.code === 0 || output.includes("successfully installed")) {
							console.log("    ✅ Command succeeded");
							templateSuccess = true;
						} else {
							throw new Error(`Exit code ${result.code}`);
						}
					} catch (actionError) {
						console.error("    ❌ Action failed:", actionError);
						templateErrorMessage = actionError instanceof Error ? actionError.message : String(actionError);
						templateSuccess = false;
						break;
					}
				}

				if (templateSkipped) {
					continue;
				}

				if (templateSuccess) {
					successCount++;
					console.log(`  ✅ ${templateName} installed successfully`);
				} else {
					failureCount++;
					console.error(`  ❌ ${templateName} failed:`, templateErrorMessage);
				}
			}

			if (failureCount > 0) {
				toast.add({
					title: "Installation Issues",
					description: `${failureCount} template(s) failed. Check logs for details.`,
					color: "red"
				});
				updateLastBuilditResult({
					status: "failure",
					completedAt: new Date().toLocaleString(),
					successCount,
					failureCount,
					skippedCount
				});
				setNodeCollapsed(false);
			orbitManager.restoreOrbitNodes();
			} else if (successCount > 0) {
				toast.add({
					title: "Installation Complete",
					description: `${successCount} template(s) installed successfully.`,
					color: "green"
				});
				updateLastBuilditResult({
					status: "success",
					completedAt: new Date().toLocaleString(),
					successCount,
					failureCount,
					skippedCount
				});
				triggerBuilditConfetti();
				props.updateNodeData?.(props.customNodeProps.id, "environmentInstallable", true);
				initializeOrbit();
				collapseAfterDelay(700);
			} else {
				toast.add({
					title: "No Actions",
					description: `No installation actions executed (${skippedCount} skipped).`,
					color: "blue"
				});
				updateLastBuilditResult({
					status: "skipped",
					completedAt: new Date().toLocaleString(),
					successCount,
					failureCount,
					skippedCount
				});
				initializeOrbit();
				collapseAfterDelay(400);
			}
		} catch (error) {
			console.error("❌ Installation error:", error);
			toast.add({
				title: "Installation Error",
				description: error instanceof Error ? error.message : "An error occurred during installation.",
				color: "red"
			});
			updateLastBuilditResult({
				status: "failure",
				completedAt: new Date().toLocaleString(),
				successCount,
				failureCount,
				skippedCount
			});
			setNodeCollapsed(false);
		orbitManager.restoreOrbitNodes();
		}
	};

	// Watch for setup data changes
	watch(() => setupData.value?.savedAt, async () => {
		await loadCurrentEnvironment();
		await checkEnvironmentLink();
	});

	// Watch for environment changes
	watch(() => activeEnvironment.value?.id, async (newId, oldId) => {
		if (newId && newId !== oldId) {
			await checkEnvironmentLink();
		}
	});

	onMounted(async () => {
		await loadCurrentEnvironment();
		await checkEnvironmentLink();
	});

	onUnmounted(() => {
		collapseTimers.forEach((timer) => {
			window.clearTimeout(timer);
		});
	orbitManager.restoreOrbitNodes();
	});
</script>

<style scoped>
.buildit-content-wrapper {
	position: relative;
}


.buildit-content {
	position: relative;
	z-index: 10;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.buildit-section {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem 1rem;
	border-radius: 0.75rem;
	background: rgba(16, 185, 129, 0.1);
	border: 1px solid rgba(52, 211, 153, 0.2);
}

.section-title {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	flex: 1;
}

.title-text {
	font-size: 1rem;
	font-weight: 600;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: rgba(226, 252, 239, 0.95);
}

.subtitle-text {
	font-size: 0.8rem;
	color: rgba(209, 250, 229, 0.7);
}

.status-message {
	font-size: 0.95rem;
	line-height: 1.6;
	padding: 0.75rem 1rem;
	border-radius: 0.75rem;
	background: rgba(15, 118, 110, 0.2);
	border: 1px solid rgba(45, 212, 191, 0.2);
	color: rgba(226, 252, 239, 0.85);
}

.buildit-button {
	--buildit-button-color-start: rgba(249, 115, 22, 1);
	--buildit-button-color-end: rgba(234, 88, 12, 0.95);
	--buildit-button-border: rgba(249, 115, 22, 0.85);
	--buildit-button-text: rgba(49, 24, 9, 1);
	--buildit-button-shadow: rgba(249, 115, 22, 0.35);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 1rem 2rem;
	border-radius: 999px;
	font-size: 1.25rem;
	font-weight: 900;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	background: linear-gradient(135deg, var(--buildit-button-color-start), var(--buildit-button-color-end));
	border: 2px solid var(--buildit-button-border);
	color: var(--buildit-button-text);
	cursor: pointer;
	transition: all 0.3s ease;
	box-shadow: 0 20px 40px var(--buildit-button-shadow);
	position: relative;
	overflow: hidden;
}

.buildit-button::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
	transition: left 0.5s ease;
}

.buildit-button:hover:not(:disabled) {
	transform: translateY(-3px) scale(1.05);
	box-shadow: 0 28px 56px var(--buildit-button-shadow);
}

.buildit-button:hover:not(:disabled)::before {
	left: 100%;
}

.buildit-button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
	filter: grayscale(30%);
	box-shadow: none;
	transform: scale(0.98);
}

.buildit-button--success {
	--buildit-button-color-start: rgba(34, 197, 94, 1);
	--buildit-button-color-end: rgba(16, 185, 129, 0.95);
	--buildit-button-border: rgba(16, 185, 129, 0.9);
	--buildit-button-text: rgba(4, 47, 46, 1);
	--buildit-button-shadow: rgba(34, 197, 94, 0.4);
}

.buildit-button--failure {
	--buildit-button-color-start: rgba(248, 113, 113, 1);
	--buildit-button-color-end: rgba(220, 38, 38, 0.95);
	--buildit-button-border: rgba(239, 68, 68, 0.9);
	--buildit-button-text: rgba(41, 37, 36, 1);
	--buildit-button-shadow: rgba(239, 68, 68, 0.35);
}

.environment-info {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 1rem;
	border-radius: 0.75rem;
	background: rgba(4, 47, 46, 0.35);
	border: 1px solid rgba(52, 211, 153, 0.2);
}

.info-row {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	font-size: 0.9rem;
}

.info-label {
	color: rgba(209, 250, 229, 0.65);
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	font-size: 0.8rem;
}

.info-value {
	color: rgba(226, 252, 239, 0.95);
	font-weight: 500;
}

.text-warning {
	color: rgba(250, 204, 21, 0.95);
}

/* Tabs Styling */
.buildit-tabs-wrapper {
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 0;
}

.buildit-tabs-list {
	display: flex;
	gap: 0.5rem;
	padding: 0.75rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(0, 0, 0, 0.2);
	border-radius: 0;
}

.buildit-tab-trigger {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	font-size: 0.875rem;
	font-weight: 500;
	border-radius: 0.375rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.7);
	cursor: pointer;
	transition: all 0.2s ease;
}

.buildit-tab-trigger:hover {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.12);
	color: rgba(255, 255, 255, 0.9);
}

.buildit-tab-trigger[data-state="active"] {
	background: rgba(16, 185, 129, 0.15);
	border-color: rgba(16, 185, 129, 0.4);
	color: rgba(16, 185, 129, 0.95);
}

.buildit-tabs-content {
	padding: 1rem 0;
	overflow-y: auto;
}

/* Orbit Nodes List */
.buildit-orbit-list {
	padding: 0.75rem;
}

.orbit-nodes-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.orbit-nodes-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 2rem;
	text-align: center;
	color: rgba(255, 255, 255, 0.5);
	min-height: 150px;
}

.orbit-node-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.orbit-node-item:hover {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.12);
	transform: translateX(2px);
}

.orbit-node-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2rem;
	height: 2rem;
	border-radius: 0.375rem;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.05);
	color: rgba(255, 255, 255, 0.7);
	flex-shrink: 0;
	transition: all 0.2s ease;
}

.orbit-node-item:hover .orbit-node-icon {
	border-color: rgba(255, 255, 255, 0.3);
	background: rgba(255, 255, 255, 0.1);
	color: rgba(255, 255, 255, 0.9);
}

.orbit-node-info {
	flex: 1;
	min-width: 0;
}

.orbit-node-label {
	font-size: 0.875rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.9);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.orbit-node-type {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>

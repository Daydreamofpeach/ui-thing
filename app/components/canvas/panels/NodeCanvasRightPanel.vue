<template>
	<div class="node-canvas-right-panel h-full w-full flex flex-col">
		<!-- Active Template Status Bar -->
		<div v-if="activeTemplateOnCanvas" class="active-template-bar" :class="getTemplateStatusClass()">
			<div class="template-status-content">
				<div class="template-status-icon">
					<UIcon :name="getTemplateStatusIcon()" class="size-4" />
				</div>
				<div class="template-status-info">
					<div class="template-status-name">
						{{ activeTemplateOnCanvas.name }}
					</div>
					<div class="template-status-text">
						{{ getTemplateStatusText() }}
					</div>
				</div>
				<div class="template-status-badge" :class="getTemplateStatusBadgeClass()">
					{{ getTemplateStatusBadgeText() }}
				</div>
				<button
					v-if="canSaveTemplate"
					class="save-template-btn"
					:disabled="isSavingTemplate"
					@click="saveTemplateFromPanel"
				>
					<UIcon :name="isSavingTemplate ? 'i-lucide-loader-2' : 'i-lucide-save'" :class="{ 'animate-spin': isSavingTemplate }" class="size-3" />
					{{ isSavingTemplate ? 'Saving...' : 'Save' }}
				</button>
			</div>
		</div>

		<!-- Header -->
		<div class="panel-header">
			<div class="header-content">
				<h3 class="panel-title">
					<UIcon :name="showOscar ? 'i-lucide-bot' : showUserManagement ? 'i-lucide-users' : showTaskManagement ? 'i-lucide-check-square' : 'i-lucide-layers'" class="size-5" />
					{{ showOscar ? 'OSCAR Assistant' : showUserManagement ? 'User Management' : showTaskManagement ? 'Task Management' : 'Components' }}
				</h3>
				<p class="panel-subtitle">
					{{ showOscar ? 'Supreme automation machine' : showUserManagement ? 'Manage organization users' : showTaskManagement ? 'Manage project tasks' : 'Add to canvas' }}
				</p>
			</div>
			<div class="header-actions">
				<button
					v-if="!showOscar && !showUserManagement && !showTaskManagement"
					class="panel-switch-btn oscar-btn"
					title="Open OSCAR assistant"
					@click="showOscar = true"
				>
					<UIcon name="i-lucide-bot" class="size-4" />
				</button>
				<button
					v-if="!showOscar && !showUserManagement && !showTaskManagement"
					class="panel-switch-btn"
					title="Open user management"
					@click="showUserManagement = true"
				>
					<UIcon name="i-lucide-users" class="size-4" />
				</button>
				<button
					v-if="!showOscar && !showUserManagement && !showTaskManagement"
					class="panel-switch-btn"
					title="Open task management"
					@click="showTaskManagement = true"
				>
					<UIcon name="i-lucide-check-square" class="size-4" />
				</button>
				<button
					class="panel-switch-btn"
					:title="showOscar || showUserManagement || showTaskManagement ? 'Back to components' : 'Switch to original right panel'"
					@click="showOscar || showUserManagement || showTaskManagement ? (showOscar = false, showUserManagement = false, showTaskManagement = false) : handleSwitchToOriginalPanel()"
				>
					<UIcon :name="showOscar || showUserManagement || showTaskManagement ? 'i-lucide-arrow-left' : 'i-lucide-sidebar'" class="size-4" />
				</button>
			</div>
		</div>

		<!-- User Management Panel -->
		<UserManagementPanel
			v-if="showUserManagement"
			:organization-id="organizationId"
			:project-id="projectId"
			@add-component-node="handleAddComponentNodeFromPanel"
			@switch-to-original-panel="showUserManagement = false"
		/>

		<!-- Task Management Panel -->
		<TaskPanel
			v-else-if="showTaskManagement"
			:organization-id="organizationId"
			:project-id="projectId"
			@add-component-node="handleAddComponentNodeFromPanel"
			@switch-to-original-panel="showTaskManagement = false"
		/>

		<!-- OSCAR Assistant Panel -->
		<OscarDashboardIntegration
			v-if="showOscar"
			:organizations="organizations || []"
			:current-organization="currentOrganization || null"
			:selected-organisation-id="organizationId || null"
			:projects="projects || []"
			:filtered-projects="projects || []"
			:selected-project="selectedProject || null"
			:selected-project-id="projectId || ''"
		/>

		<!-- Components Panel -->
		<div v-else>
			<!-- Search Bar -->
			<div class="search-section">
				<div class="search-input-wrapper">
					<UIcon name="i-lucide-search" class="search-icon" />
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Search components..."
						class="search-input"
					>
					<button
						v-if="searchQuery"
						class="clear-search-button"
						@click="searchQuery = ''"
					>
						<UIcon name="i-lucide-x" class="size-3" />
					</button>
				</div>
			</div>

			<!-- Tab Navigation -->
			<div class="tab-navigation">
				<button
					class="tab-button"
					:class="{ active: activeTab === 'templates' }"
					@click="activeTab = 'templates'"
				>
					<UIcon name="i-lucide-layout-template" class="tab-icon" />
					<span>Templates ({{ filteredTemplates.length }})</span>
				</button>
				<button
					class="tab-button"
					:class="{ active: activeTab === 'solutions' }"
					@click="activeTab = 'solutions'"
				>
					<UIcon name="i-lucide-puzzle" class="tab-icon" />
					<span>Solutions ({{ filteredSolutions.length }})</span>
				</button>
				<button
					class="tab-button"
					:class="{ active: activeTab === 'hooks' }"
					@click="activeTab = 'hooks'"
				>
					<UIcon name="i-lucide-webhook" class="tab-icon" />
					<span>Hooks ({{ filteredHooks.length }})</span>
				</button>
				<button
					class="tab-button"
					:class="{ active: activeTab === 'transports' }"
					@click="activeTab = 'transports'"
				>
					<UIcon name="i-lucide-send" class="tab-icon" />
					<span>Transports ({{ filteredTransports.length }})</span>
				</button>
				<button
					class="tab-button"
					:class="{ active: activeTab === 'connections' }"
					@click="activeTab = 'connections'"
				>
					<UIcon name="i-lucide-link" class="tab-icon" />
					<span>Connections ({{ canvasEdges?.length || 0 }})</span>
				</button>
				<button
					class="tab-button"
					:class="{ active: activeTab === 'chain-templates' }"
					@click="activeTab = 'chain-templates'"
				>
					<UIcon name="i-lucide-git-branch" class="tab-icon" />
					<span>Chain Flow</span>
				</button>
			</div>

			<!-- Type Filter (for Templates) -->
			<div v-if="activeTab === 'templates'" class="type-filter-section">
				<div class="filter-label">
					Filter by type:
				</div>
				<div class="type-filter-buttons">
					<button
						class="type-filter-btn"
						:class="{ active: selectedTemplateType === 'all' }"
						@click="selectedTemplateType = 'all'"
					>
						All ({{ templates.length }})
					</button>
					<button
						v-for="type in availableTemplateTypes"
						:key="type"
						class="type-filter-btn"
						:class="{ active: selectedTemplateType === type }"
						@click="selectedTemplateType = type"
					>
						{{ type }} ({{ getTemplatesByType(type).length }})
					</button>
				</div>
			</div>

			<!-- Content Area -->
			<div class="panel-content">
				<!-- Connection Editor (overlay when active) -->
				<ConnectionEditor
					v-if="showConnectionEditor && selectedConnection"
					:connection="selectedConnection"
					:nodes="canvasNodes || []"
					:chain-style="chainFlowStyle"
					@close="closeConnectionEditor"
					@update="handleConnectionUpdate"
					@delete="handleConnectionDelete"
					@add-to-chain="handleAddConnectionToChain"
					@live-update="handleConnectionLiveUpdate"
				/>

				<!-- Loading State -->
				<div v-if="isLoading && !showConnectionEditor" class="loading-state">
					<UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary/60" />
					<p class="text-sm text-white/60 mt-3">
						Loading components...
					</p>
				</div>

				<!-- Templates Tab - Dynamic Rendering -->
				<div v-else-if="activeTab === 'templates'" class="tab-content-section">
					<div v-if="filteredTemplates.length === 0" class="empty-state">
						<UIcon name="i-lucide-layout-template" class="size-12 text-white/20 mb-3" />
						<p class="text-sm text-white/50">
							{{ searchQuery ? 'No templates match your search' : 'No templates found' }}
						</p>
					</div>
					<div v-else class="component-list">
						<ComponentListItem
							v-for="template in filteredTemplates"
							:key="template.id"
							:component="template"
							component-type="template"
							:expanded="isExpanded(template.id)"
							:editing="editingItem === template.id"
							@add="addTemplateToCanvas"
							@edit="handleComponentEdit"
							@delete="deleteTemplate"
							@toggle-expanded="toggleExpanded"
						/>
					</div>
				</div>

				<!-- Solutions Tab - Dynamic Rendering -->
				<div v-else-if="activeTab === 'solutions'" class="tab-content-section">
					<div v-if="filteredSolutions.length === 0" class="empty-state">
						<UIcon name="i-lucide-puzzle" class="size-12 text-white/20 mb-3" />
						<p class="text-sm text-white/50">
							{{ searchQuery ? 'No solutions match your search' : 'No solutions found' }}
						</p>
					</div>
					<div v-else class="component-list">
						<ComponentListItem
							v-for="solution in filteredSolutions"
							:key="solution.id"
							:component="solution"
							component-type="solution"
							:expanded="isExpanded(solution.id)"
							:editing="editingItem === solution.id"
							@add="addSolutionToCanvas"
							@edit="handleComponentEdit"
							@delete="deleteSolution"
							@toggle-expanded="toggleExpanded"
						/>
					</div>
				</div>

				<!-- Hooks Tab - Dynamic Rendering -->
				<div v-else-if="activeTab === 'hooks'" class="tab-content-section">
					<div v-if="filteredHooks.length === 0" class="empty-state">
						<UIcon name="i-lucide-webhook" class="size-12 text-white/20 mb-3" />
						<p class="text-sm text-white/50 mb-2">
							{{ searchQuery ? 'No hooks match your search' : 'No hooks found' }}
						</p>
						<p v-if="!searchQuery" class="text-xs text-white/40">
							Create hooks in the Buildit organization to see them here
						</p>
					</div>
					<div v-else class="component-list">
						<ComponentListItem
							v-for="hook in filteredHooks"
							:key="hook.id"
							:component="hook"
							component-type="hook"
							:expanded="isExpanded(hook.id)"
							:editing="false"
							@add="addHookToCanvas"
							@delete="deleteHook"
							@toggle-expanded="toggleExpanded"
						/>
					</div>
				</div>

				<!-- Transports Tab - Dynamic Rendering -->
				<div v-else-if="activeTab === 'transports'" class="tab-content-section">
					<div v-if="filteredTransports.length === 0" class="empty-state">
						<UIcon name="i-lucide-send" class="size-12 text-white/20 mb-3" />
						<p class="text-sm text-white/50">
							{{ searchQuery ? 'No transports match your search' : 'No transports found' }}
						</p>
					</div>
					<div v-else class="component-list">
						<ComponentListItem
							v-for="transport in filteredTransports"
							:key="transport.id"
							:component="transport"
							component-type="transport"
							:expanded="isExpanded(transport.id)"
							:editing="editingItem === transport.id"
							@add="addTransportToCanvas"
							@edit="handleComponentEdit"
							@delete="deleteTransport"
							@toggle-expanded="toggleExpanded"
						/>
					</div>
				</div>

				<!-- Connections Tab -->
				<ConnectionsPanel
					v-else-if="activeTab === 'connections'"
					:nodes="canvasNodes || []"
					:edges="canvasEdges || []"
					@update-edge="handleUpdateEdge"
					@delete-edge="handleDeleteEdge"
					@create-edge="handleCreateEdge"
					@switch-to-components="activeTab = 'templates'"
					@start-chain-creation="activeTab = 'chain-templates'"
				/>

				<!-- Chain Flow Controller Tab -->
				<ChainFlowController
					v-else-if="activeTab === 'chain-templates'"
					:nodes="canvasNodes || []"
					:edges="canvasEdges || []"
					@update-node-positions="handleUpdateNodePositions"
					@update-edges="handleUpdateMultipleEdges"
					@create-edges="handleCreateMultipleEdges"
					@delete-edges="handleDeleteMultipleEdges"
					@save-template="handleSaveChainTemplate"
					@animate-chain-flow="handleAnimateChainFlow"
					@update-default-connection-style="handleUpdateDefaultConnectionStyle"
				/>
			</div>
		</div>

		<!-- Delete Confirmation Modal -->
		<Teleport to="body">
			<div v-if="deleteConfirmation" class="fixed inset-0 z-[9999] flex items-center justify-center">
				<!-- Backdrop -->
				<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cancelDelete" />

				<!-- Modal Content -->
				<div class="relative w-full max-w-md mx-4">
					<div class="glassmorphic-panel p-6 border border-red-500/20 rounded-xl">
						<!-- Modal Header -->
						<div class="flex items-center gap-3 mb-4">
							<UIcon name="i-lucide-alert-triangle" class="size-6 text-red-400" />
							<h3 class="text-lg font-semibold text-white">
								Delete {{ deleteConfirmation.type.charAt(0).toUpperCase() + deleteConfirmation.type.slice(1) }}?
							</h3>
						</div>

						<!-- Modal Body -->
						<p class="text-white/70 mb-6">
							Are you sure you want to delete "<span class="font-medium text-white">{{ deleteConfirmation.item.name }}</span>"? This action cannot be undone.
						</p>

						<!-- Modal Actions -->
						<div class="flex items-center justify-end gap-3">
							<button
								type="button"
								class="glassmorphic-button px-4 py-2 text-sm border border-neutral-500/30 text-white/80 hover:text-white"
								@click="cancelDelete"
							>
								Cancel
							</button>
							<button
								type="button"
								class="glassmorphic-button px-4 py-2 text-sm border border-red-500/30 text-red-400 hover:text-red-300 hover:border-red-400/40"
								@click="confirmDelete"
							>
								<UIcon name="i-lucide-trash-2" class="size-4 mr-2" />
								Delete
							</button>
						</div>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
	import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
	import TaskPanel from "~/components/dashboard/TaskPanel.vue";
	import UserManagementPanel from "~/components/dashboard/UserManagementPanel.vue";
	import OscarDashboardIntegration from "~/components/Oscar/OscarDashboardIntegration.vue";
	import { useTransports } from "~/composables/useTransports";
	import { useProjectDataCache } from "~/composables/useProjectDataCache";
	import { buttClient } from "~/utils/buttClient";
	import { useComponentMetadata } from "../composables/useComponentMetadata";
	import ComponentListItem from "../ui/ComponentListItem.vue";
	import ChainFlowController from "../ui/connection/ChainFlowController.vue";
	import ConnectionEditor from "../ui/connection/ConnectionEditor.vue";
	import ConnectionsPanel from "./ConnectionsPanel.vue";
	import "./NodeCanvasRightPanel.css";

	// Props
	const props = defineProps<{
		canvasData?: any
		selectedNode?: any
		organizationId?: string
		projectId?: string
		canvasNodes?: any[]
		canvasEdges?: any[]
		saveStatus?: "idle" | "saving" | "saved" | "error"
		organizations?: any[]
		projects?: any[]
		selectedProject?: any
		currentOrganization?: any
	}>();

	// Emits
	const emit = defineEmits<{
		nodeUpdated: [nodeId: string, data: any]
		propertyChanged: [property: string, value: any]
		addComponentNode: [componentType: string, componentData: any]
		reloadComponents: []
		switchToOriginalPanel: []
		updateEdge: [edgeId: string, edgeData: any]
		deleteEdge: [edgeId: string]
		createEdge: [edgeData: any]
		addNodes: [nodes: any[]]
		addEdges: [edges: any[]]
		applyTemplate: [template: any]
		updateNodePositions: [positions: Record<string, { x: number, y: number }>]
		animateChainFlow: [sequence: string[], duration: number, originalColor: string]
		updateDefaultConnectionStyle: [style: any]
	}>();

	// State
	const activeTab = ref<"templates" | "solutions" | "hooks" | "transports" | "connections" | "chain-templates">("templates");
	const templates = ref<any[]>([]);
	const solutions = ref<any[]>([]);
	const hooks = ref<any[]>([]);
	const transports = ref<any[]>([]);
	const isLoading = ref(false);
	const searchQuery = ref("");
	const expandedItems = ref<Set<string>>(new Set());
	const editingItem = ref<string | null>(null);
	const editForm = ref<any>({});
	const isCompactMode = ref(false);
	const panelRef = ref<HTMLElement | null>(null);
	const activeTemplateOnCanvas = ref<any>(null);
	const templateSaveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
	const selectedTemplateType = ref<string>("all");
	const showUserManagement = ref(false);
	const showTaskManagement = ref(false);
	const showOscar = ref(false);
	const deleteConfirmation = ref<{ type: string, item: any } | null>(null);
	const showConnectionEditor = ref(false);
	const selectedConnection = ref<any>(null);
	const chainFlowStyle = ref<any>(null);
	const isSavingTemplate = ref(false);
	let resizeObserver: ResizeObserver | null = null;

	// Composables
	const { fetchTransports } = useTransports();
	const {
		getAvailableTemplateTypes: getTemplateTypes
	} = useComponentMetadata();
	const { getCachedData, setCachedData, isLoading: isCacheLoading, setLoading: setCacheLoading } = useProjectDataCache();

	// Can save template if we have canvas nodes
	const canSaveTemplate = computed(() => {
		return activeTemplateOnCanvas.value && props.canvasNodes && props.canvasNodes.length > 0;
	});

	// Save template function
	const saveTemplateFromPanel = async () => {
		if (!activeTemplateOnCanvas.value || !props.canvasNodes) return;

		isSavingTemplate.value = true;
		templateSaveStatus.value = "saving";

		try {
			console.log("💾 Saving template from right panel:", activeTemplateOnCanvas.value.name);

			// Trigger save on SaveTemplateNode if it exists
			const saveTemplateNode = props.canvasNodes.find((n: any) => n.type === "saveTemplateNode");

			if (saveTemplateNode) {
				console.log("✅ Found SaveTemplateNode, triggering save via event");
				// Dispatch event to trigger save
				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("oscar:trigger-template-save", {
						detail: { nodeId: saveTemplateNode.id }
					}));
				}
			} else {
				console.log("⚠️ No SaveTemplateNode found, creating one...");
				// Find the last node in the template chain to attach SaveTemplateNode
				const bFolderNode = props.canvasNodes.find((n: any) => n.type === "bFolderSetupNode");

				if (bFolderNode && typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("oscar:create-save-template-node", {
						detail: { bFolderNodeId: bFolderNode.id }
					}));
				}
			}

			// Show success after delay
			setTimeout(() => {
				templateSaveStatus.value = "saved";
				isSavingTemplate.value = false;

				// Reset to idle after 2s
				setTimeout(() => {
					if (templateSaveStatus.value === "saved") {
						templateSaveStatus.value = "idle";
					}
				}, 2000);
			}, 1000);
		} catch (error) {
			console.error("❌ Error saving template:", error);
			templateSaveStatus.value = "error";
			isSavingTemplate.value = false;
		}
	};

	// Clear Oscar messages and set canvas context when opening Oscar panel
	watch(showOscar, async (newValue) => {
		if (newValue) {
			console.log("🤖 Opening OSCAR panel - setting up canvas context");
			try {
				// Import Oscar composables
				const { useOscarState } = await import("~/components/Oscar/composables/useOscarState");
				const { useSharedOscarCanvasContext } = await import("~/components/Oscar/composables/useOscarCanvasContext");
				const { clearMessages, addMessage } = useOscarState();
				const { setCanvasContext, setAvailableResources } = useSharedOscarCanvasContext();

				// Set canvas context
				console.log("📊 Setting canvas context with nodes:", props.canvasNodes?.length || 0);
				console.log("📊 Canvas nodes:", props.canvasNodes);
				console.log("📊 Canvas edges:", props.canvasEdges?.length || 0);

				setCanvasContext(
					props.canvasNodes || [],
					props.canvasEdges || [],
					{ x: 0, y: 0, zoom: 1 }, // Viewport (can be enhanced later)
					"Current Canvas", // Canvas name (can be enhanced later)
					"" // Canvas ID (can be enhanced later)
				);

				// Set available resources
				setAvailableResources(
					templates.value,
					hooks.value,
					transports.value,
					solutions.value
				);

				// Clear all messages
				clearMessages();

				// Add welcome message with canvas context
				addMessage("assistant", "👋 **Welcome to OSCAR!**\n\nI'm your supreme automation machine, ready to help with your canvas automation.", {
					actions: [
						{ id: "show-canvas-context", label: "📊 Show Canvas Info", variant: "primary" },
						{ id: "browse-existing", label: "📂 Browse Project", variant: "secondary" }
					]
				});

				// Add canvas context card
				addMessage("assistant", "📊 **Current Canvas Context**\n\nHere's what's on your canvas:", {
					widget: {
						name: "OscarCanvasContextCard",
						props: {}
					}
				});

				// Detect and show automation chains
				const { useOscarChainDetection } = await import("~/components/Oscar/composables/useOscarChainDetection");
				const { detectChains } = useOscarChainDetection();

				console.log("🔍 Detected chains:", detectChains.value);
				console.log("🔍 Number of chains:", detectChains.value.length);

				if (detectChains.value.length > 0) {
					console.log("✅ Showing detected chains card with", detectChains.value.length, "chains");
					addMessage("assistant", "🔍 **Automation Chains Detected!**\n\nI found some workflow chains on your canvas. Click 'View Nodes' to see each step.", {
						widget: {
							name: "OscarDetectedChainsCard",
							props: {}
						}
					});
				} else {
					console.log("⚠️ No chains detected on canvas");
				}

				console.log("✅ OSCAR canvas context set and messages initialized");
			} catch (error) {
				console.error("❌ Failed to set OSCAR canvas context:", error);
			}
		}
	});

	// Filtered components based on search and type
	const filteredTemplates = computed(() => {
		let filtered = templates.value;

		// Filter by template type first
		if (selectedTemplateType.value !== "all") {
			filtered = filtered.filter((t: any) =>
				t.template?.type?.toLowerCase() === selectedTemplateType.value.toLowerCase()
			);
		}

		// Then filter by search query
		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			filtered = filtered.filter((t: any) =>
				t.name?.toLowerCase().includes(query)
				|| t.description?.toLowerCase().includes(query)
				|| t.template?.type?.toLowerCase().includes(query)
			);
		}

		return filtered;
	});

	// Get available template types - now uses component metadata
	const availableTemplateTypes = computed(() => {
		return getTemplateTypes(templates.value);
	});

	// Helper function to get templates by type
	const getTemplatesByType = (type: string) => {
		if (type === "all") return templates.value;
		return templates.value.filter((t: any) => {
			const templateType = t.template?.type;
			// Handle case where type might be an object or non-string
			if (!templateType) return false;
			const typeStr = typeof templateType === 'string' ? templateType : String(templateType);
			return typeStr.toLowerCase() === type.toLowerCase();
		});
	};

	const filteredSolutions = computed(() => {
		if (!searchQuery.value) return solutions.value;
		const query = searchQuery.value.toLowerCase();
		return solutions.value.filter((s: any) =>
			s.name?.toLowerCase().includes(query)
			|| s.description?.toLowerCase().includes(query)
			|| s.type?.toLowerCase().includes(query)
		);
	});

	const filteredHooks = computed(() => {
		if (!searchQuery.value) return hooks.value;
		const query = searchQuery.value.toLowerCase();
		return hooks.value.filter((h: any) =>
			h.name?.toLowerCase().includes(query)
			|| h.description?.toLowerCase().includes(query)
			|| h.type?.toLowerCase().includes(query)
		);
	});

	const filteredTransports = computed(() => {
		if (!searchQuery.value) return transports.value;
		const query = searchQuery.value.toLowerCase();
		return transports.value.filter((t: any) =>
			t.name?.toLowerCase().includes(query)
			|| t.description?.toLowerCase().includes(query)
			|| t.type?.toLowerCase().includes(query)
			|| t.target?.toLowerCase().includes(query)
		);
	});

	// Load all components
	const loadComponents = async () => {
		console.log("═══════════════════════════════════════════");
		console.log("🚀 NodeCanvasRightPanel: loadComponents() CALLED");
		console.log("📋 Props received:");
		console.log("   - organizationId:", props.organizationId);
		console.log("   - projectId:", props.projectId);
		console.log("═══════════════════════════════════════════");

		if (!props.organizationId) {
			console.warn("⚠️ NodeCanvasRightPanel: No organization ID provided - ABORTING");
			return;
		}

		isLoading.value = true;
		try {
			// Load templates - with caching to avoid duplicate calls
			console.log("═══════════════════════════════════════════");
			console.log("🔧 NodeCanvasRightPanel: LOADING TEMPLATES");
			console.log("📋 Project ID:", props.projectId);
			console.log("📋 Organization ID:", props.organizationId);
			console.log("═══════════════════════════════════════════");
			try {
				if (props.projectId) {
					// Check cache first
					const cachedTemplates = getCachedData(props.projectId, 'templates');
					if (cachedTemplates !== null) {
						templates.value = cachedTemplates;
						console.log("✅ NodeCanvasRightPanel: Using cached templates:", templates.value.length);
					} else if (isCacheLoading(props.projectId, 'templates')) {
						// Another component is already loading, wait and check cache again
						console.log("⏳ NodeCanvasRightPanel: Waiting for ProjectInfoCards to finish loading templates...");
						await new Promise(resolve => setTimeout(resolve, 500));
						const nowCached = getCachedData(props.projectId, 'templates');
						if (nowCached !== null) {
							templates.value = nowCached;
							console.log("✅ NodeCanvasRightPanel: Got templates from cache after wait:", templates.value.length);
						} else {
							templates.value = [];
						}
					} else {
						// We need to load the data (unlikely since ProjectInfoCards usually loads first)
						setCacheLoading(props.projectId, 'templates', true);
						try {
							const templatesData = await buttClient.findByProjectIdTemplate(props.projectId);
							templates.value = Array.isArray(templatesData) ? templatesData : [];
							
							// Fallback if empty
							if (templates.value.length === 0) {
								const allTemplates = await buttClient.findAllTemplate();
								const projectTemplates = Array.isArray(allTemplates)
									? allTemplates.filter((template: any) => {
										const metaProjectId = template.meta?.projectId;
										const templateProjectId = template.template?.projectId;
										return metaProjectId === props.projectId || templateProjectId === props.projectId;
									})
									: [];
								templates.value = projectTemplates;
							}
							
							// Cache the result
							setCachedData(props.projectId, 'templates', templates.value);
							console.log("✅ NodeCanvasRightPanel: Loaded and cached templates:", templates.value.length);
						} finally {
							setCacheLoading(props.projectId, 'templates', false);
						}
					}
				} else if (props.organizationId) {
					// No project selected - load all organization templates (no caching for org-level)
					console.log("⚠️ NodeCanvasRightPanel: No project ID, loading all organization templates");
					const allTemplates = await buttClient.findAllTemplate();
					templates.value = (allTemplates || []).filter((template: any) => {
						const name = template.name?.toLowerCase() || "";
						const excludePatterns = ["buildit config", "buildit.config", "internal"];
						return !excludePatterns.some((pattern: string) => name.includes(pattern));
					});
					console.log(`✅ NodeCanvasRightPanel: Loaded ${templates.value.length} templates for organization`);
				} else {
					console.warn("⚠️ NodeCanvasRightPanel: No project ID or organization ID");
					templates.value = [];
				}
			} catch (error) {
				console.error("❌ Error loading templates:", error);
				templates.value = [];
				if (props.projectId) {
					setCacheLoading(props.projectId, 'templates', false);
				}
			}

			// Load solutions - with caching
			console.log("🔧 NodeCanvasRightPanel: Loading solutions");
			try {
				if (props.projectId) {
					// Check cache first
					const cachedSolutions = getCachedData(props.projectId, 'solutions');
					if (cachedSolutions !== null) {
						solutions.value = cachedSolutions;
						console.log("✅ NodeCanvasRightPanel: Using cached solutions:", solutions.value.length);
					} else if (isCacheLoading(props.projectId, 'solutions')) {
						// Another component is already loading
						console.log("⏳ NodeCanvasRightPanel: Waiting for ProjectInfoCards to finish loading solutions...");
						await new Promise(resolve => setTimeout(resolve, 300));
						const nowCached = getCachedData(props.projectId, 'solutions');
						solutions.value = nowCached !== null ? nowCached : [];
					} else {
						// We need to load (unlikely)
						setCacheLoading(props.projectId, 'solutions', true);
						try {
							const solutionsData = await buttClient.findByProjectIdSolution(props.projectId);
							solutions.value = Array.isArray(solutionsData) ? solutionsData : [];
							setCachedData(props.projectId, 'solutions', solutions.value);
							console.log(`✅ NodeCanvasRightPanel: Loaded and cached ${solutions.value.length} solutions`);
						} finally {
							setCacheLoading(props.projectId, 'solutions', false);
						}
					}
				} else if (props.organizationId) {
					// No project - load all solutions (no caching for org-level)
					try {
						const allSolutions = await buttClient.findAllSolution();
						solutions.value = Array.isArray(allSolutions) ? allSolutions : [];
						console.log(`✅ NodeCanvasRightPanel: Loaded ${solutions.value.length} solutions for organization`);
					} catch (allSolutionsError) {
						console.warn("⚠️ Failed to load all solutions:", allSolutionsError);
						solutions.value = [];
					}
				} else {
					solutions.value = [];
				}
			} catch (error) {
				console.error("❌ Error loading solutions:", error);
				solutions.value = [];
				if (props.projectId) {
					setCacheLoading(props.projectId, 'solutions', false);
				}
			}

			// Load hooks - get default buildit hooks + current org hooks
			console.log("🔧 NodeCanvasRightPanel: Loading hooks");
			try {
				const allHooksCollected: any[] = [];

				// Get default Buildit hooks (organizationId = "buildit" string, not MongoDB ID)
				try {
					console.log("🔧 NodeCanvasRightPanel: Fetching hooks with organizationId='buildit'");
					const builditHooks = await buttClient.getByOrganisationId("buildit");
					console.log("🔧 NodeCanvasRightPanel: Buildit default hooks received:", builditHooks);
					if (builditHooks && builditHooks.length > 0) {
						allHooksCollected.push(...builditHooks);
						console.log(`✅ Added ${builditHooks.length} default Buildit hooks`);
					} else {
						console.warn("⚠️ No default buildit hooks found");
					}
				} catch (builditError) {
					console.warn("⚠️ Error loading buildit default hooks:", builditError);
				}

				// Also get hooks from user's current organization
				if (props.organizationId) {
					try {
						console.log("🔧 NodeCanvasRightPanel: Fetching hooks for organization:", props.organizationId);
						const userOrgHooks = await buttClient.getByOrganisationId(props.organizationId);
						console.log("🔧 NodeCanvasRightPanel: User organization hooks received:", userOrgHooks);
						if (userOrgHooks && userOrgHooks.length > 0) {
							// Add user org hooks, avoiding duplicates
							userOrgHooks.forEach((hook: any) => {
								if (!allHooksCollected.find((h: any) => h.id === hook.id)) {
									allHooksCollected.push(hook);
								}
							});
							console.log(`✅ Added ${userOrgHooks.length} user organization hooks (${allHooksCollected.length} total)`);
						}
					} catch (userOrgError) {
						console.warn("⚠️ Error loading user organization hooks:", userOrgError);
					}
				}

				// Map hooks to ensure they all have names
				hooks.value = allHooksCollected.map((hook: any) => ({
					...hook,
					name: hook.name || hook.type || "Unnamed Hook"
				}));

				console.log(`✅ NodeCanvasRightPanel: Loaded ${hooks.value.length} total hooks`);
				console.log("✅ NodeCanvasRightPanel: Final hooks data:", hooks.value);
			} catch (error) {
				console.error("❌ Error loading hooks:", error);
				// Fallback to empty array on error
				hooks.value = [];
			}

			// Load transports
			console.log("🔧 NodeCanvasRightPanel: Loading transports");
			try {
				const allTransports = await fetchTransports();
				transports.value = (allTransports || []).map((transport: any) => ({
					...transport,
					name: transport.name || transport.type || "Unnamed Transport"
				}));
				console.log(`✅ NodeCanvasRightPanel: Loaded ${transports.value.length} transports`);
			} catch (error) {
				console.error("❌ Error loading transports:", error);
				transports.value = [];
			}
		} catch (error) {
			console.error("❌ NodeCanvasRightPanel: Error loading components:", error);
		} finally {
			isLoading.value = false;

			console.log("═══════════════════════════════════════════");
			console.log("✅ LOAD COMPONENTS COMPLETE");
			console.log("Templates loaded:", templates.value.length);
			console.log("Solutions loaded:", solutions.value.length);
			console.log("Hooks loaded:", hooks.value.length);
			console.log("Transports loaded:", transports.value.length);
			if (templates.value.length > 0) {
				console.log("Template names:", templates.value.map((t: any) => t.name));
			}
			if (solutions.value.length > 0) {
				console.log("Solution names:", solutions.value.map((s: any) => s.name));
			}
			console.log("═══════════════════════════════════════════");
		}
	};

	// Expand/collapse handling
	const toggleExpanded = (itemId: string) => {
		if (expandedItems.value.has(itemId)) {
			expandedItems.value.delete(itemId);
		} else {
			expandedItems.value.add(itemId);
		}
		// Force reactivity update
		expandedItems.value = new Set(expandedItems.value);
	};

	const isExpanded = (itemId: string) => {
		return expandedItems.value.has(itemId);
	};

	// Edit handling (legacy - kept for backward compatibility)
	const _startEditing = (item: any, type: string) => {
		editingItem.value = item.id;
		editForm.value = { ...item, _type: type };
	};

	const _cancelEdit = () => {
		editingItem.value = null;
		editForm.value = {};
	};

	const _saveEdit = async () => {
		if (!editingItem.value) return;

		try {
			const type = editForm.value._type;
			console.log("💾 Saving edited component:", type, editForm.value);

			// Update via ButtClient based on type
			if (type === "template") {
				// Ensure template structure is preserved
				const updateData = {
					name: editForm.value.name,
					description: editForm.value.description,
					template: {
						...editForm.value.template,
						type: editForm.value.template?.type || editForm.value.template
					}
				};
				await buttClient.updateTemplate(editingItem.value, updateData);
			} else if (type === "solution") {
				const updateData = {
					name: editForm.value.name,
					description: editForm.value.description,
					type: editForm.value.type,
					status: editForm.value.status
				};
				await buttClient.updateSolution(editingItem.value, updateData);
			} else if (type === "hook") {
				// Hook doesn't have update method, would need to recreate
				console.warn("⚠️ Hook editing not supported via API");
			} else if (type === "transport") {
				await buttClient.updateTransport(editingItem.value, {
					type: editForm.value.type,
					target: editForm.value.target,
					meta: editForm.value.meta
				});
			}

			// Reload components
			await loadComponents();
			_cancelEdit();
		} catch (error) {
			console.error("❌ Error saving component:", error);
		}
	};

	// Unified component edit handler for ComponentListItem
	const handleComponentEdit = async (component: any, updates: any) => {
		try {
			console.log("💾 Saving component via unified handler:", updates);

			// Determine component type from the component itself
			if (updates.template !== undefined) {
				// This is a template
				await buttClient.updateTemplate(component.id, {
					name: updates.name,
					description: updates.description,
					template: updates.template
				});
			} else if (component.type === "solution" || updates.status !== undefined) {
				// This is a solution (status field indicates solution type)
				await buttClient.updateSolution(component.id, {
					name: updates.name,
					description: updates.description
				});
			} else if (updates.target !== undefined) {
				// This is a transport
				await buttClient.updateTransport(component.id, {
					target: updates.target,
					meta: updates.meta || {}
				});
			}

			// Reload components
			await loadComponents();
		} catch (error) {
			console.error("❌ Error in unified edit handler:", error);
		}
	};

	// Delete handling
	const deleteTemplate = async (template: any) => {
		deleteConfirmation.value = { type: "template", item: template };
	};

	const deleteSolution = async (solution: any) => {
		deleteConfirmation.value = { type: "solution", item: solution };
	};

	const deleteHook = async (hook: any) => {
		deleteConfirmation.value = { type: "hook", item: hook };
	};

	const deleteTransport = async (transport: any) => {
		deleteConfirmation.value = { type: "transport", item: transport };
	};

	const confirmDelete = async () => {
		if (!deleteConfirmation.value) return;

		const { type, item } = deleteConfirmation.value;

		try {
			if (type === "template") {
				console.log("🗑️ Deleting template:", item.id);
				await buttClient.deleteTemplate(item.id);
			} else if (type === "solution") {
				console.log("🗑️ Deleting solution:", item.id);
				await buttClient.deleteSolution(item.id);
			} else if (type === "hook") {
				console.log("🗑️ Deleting hook:", item.id);
				// Note: buttClient.deleteHook may not be available yet
				console.warn("⚠️ Hook deletion not yet implemented in BAPI");
				// await buttClient.deleteHook(item.id);
			} else if (type === "transport") {
				console.log("🗑️ Deleting transport:", item.id);
				await buttClient.deleteTransport(item.id);
			}

			// Reload components to refresh the list
			await loadComponents();

			// Show success toast
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
			toast.add({
				title: `${typeLabel} Deleted`,
				description: `"${item.name}" has been deleted successfully`,
				color: "success",
				icon: "i-lucide-check-circle"
			});

			console.log(`✅ ${type} deleted successfully`);
		} catch (error) {
			console.error("❌ Error deleting:", error);

			// Show error toast
			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			toast.add({
				title: "Delete Failed",
				description: `Failed to delete ${type}. Please try again.`,
				color: "error",
				icon: "i-lucide-x-circle"
			});
		} finally {
			deleteConfirmation.value = null;
		}
	};

	const cancelDelete = () => {
		deleteConfirmation.value = null;
	};

	// Track active template on canvas
	watch(() => props.canvasNodes, (nodes) => {
		if (!nodes || nodes.length === 0) {
			activeTemplateOnCanvas.value = null;
			return;
		}

		// Find template nodes
		const templateNodes = nodes.filter((n: any) => n.type === "templateNode");
		if (templateNodes.length > 0) {
			const templateNode = templateNodes[0];
			// Find the matching template data
			const matchingTemplate = templates.value.find((t: any) => t.id === templateNode.id);
			if (matchingTemplate) {
				activeTemplateOnCanvas.value = matchingTemplate;
			} else {
				// Use node data
				activeTemplateOnCanvas.value = {
					id: templateNode.id,
					name: templateNode.data?.templateName || templateNode.data?.label || "Active Template"
				};
			}
		} else {
			activeTemplateOnCanvas.value = null;
		}
	}, { deep: true, immediate: true });

	// Watch save status
	watch(() => props.saveStatus, (status) => {
		if (status) {
			templateSaveStatus.value = status;
		}
	});

	// Status helper functions
	const getTemplateStatusClass = () => {
		switch (templateSaveStatus.value) {
		case "saving": return "status-saving";
		case "saved": return "status-saved";
		case "error": return "status-error";
		default: return "status-idle";
		}
	};

	const getTemplateStatusIcon = () => {
		switch (templateSaveStatus.value) {
		case "saving": return "i-lucide-loader-2";
		case "saved": return "i-lucide-check-circle";
		case "error": return "i-lucide-alert-circle";
		default: return "i-lucide-file-edit";
		}
	};

	const getTemplateStatusText = () => {
		switch (templateSaveStatus.value) {
		case "saving": return "Saving configuration...";
		case "saved": return "All changes saved";
		case "error": return "Error saving";
		default: return "Configuring template";
		}
	};

	const getTemplateStatusBadgeClass = () => {
		switch (templateSaveStatus.value) {
		case "saving": return "badge-saving";
		case "saved": return "badge-saved";
		case "error": return "badge-error";
		default: return "badge-idle";
		}
	};

	const getTemplateStatusBadgeText = () => {
		switch (templateSaveStatus.value) {
		case "saving": return "Saving...";
		case "saved": return "Saved";
		case "error": return "Error";
		default: return "Unsaved";
		}
	};

	// Add component to canvas methods
	const addTemplateToCanvas = (template: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("➕ ADD TEMPLATE TO CANVAS CLICKED");
		console.log("Template:", template);
		console.log("Template.name:", template.name);
		console.log("Template.id:", template.id);
		console.log("Template.template:", template.template);
		console.log("Template.template?.nodeCanvas:", template.template?.nodeCanvas);
		console.log("═══════════════════════════════════════════");

		// Set as active template
		activeTemplateOnCanvas.value = template;
		templateSaveStatus.value = "idle";

		console.log("📤 Emitting addComponentNode event with type: 'template'");
		emit("addComponentNode", "template", template);
		console.log("✅ Event emitted");
		console.log("═══════════════════════════════════════════");
	};

	const addSolutionToCanvas = (solution: any) => {
		console.log("🔧 Adding solution to canvas:", solution);
		emit("addComponentNode", "solution", solution);
	};

	const addHookToCanvas = (hook: any) => {
		console.log("🔧 Adding hook to canvas:", hook);
		emit("addComponentNode", "hook", hook);
	};

	const addTransportToCanvas = (transport: any) => {
		console.log("🔧 Adding transport to canvas:", transport);
		emit("addComponentNode", "transport", transport);
	};

	// Generate tooltip text for components - simple name only (legacy)
	const _getTooltipText = (item: any, _type: string) => {
		return item.name || "Unnamed";
	};

	// Handle switching back to original panel
	const handleSwitchToOriginalPanel = () => {
		console.log("🔄 Switching to original right panel");
		emit("switchToOriginalPanel");
	};

	const handleAddComponentNodeFromPanel = (componentType: string, componentData: any) => {
		console.log("🔧 NodeCanvasRightPanel: Received add component request:", componentType, componentData);
		emit("addComponentNode", componentType, componentData);
	};

	// Edge handler functions for ConnectionsPanel
	const handleUpdateEdge = (edgeId: string, edgeData: any) => {
		console.log("🔗 NodeCanvasRightPanel: Updating edge:", edgeId, edgeData);
		emit("updateEdge", edgeId, edgeData);
	};

	const handleDeleteEdge = (edgeId: string) => {
		console.log("🗑️ NodeCanvasRightPanel: Deleting edge:", edgeId);
		emit("deleteEdge", edgeId);
	};

	const handleCreateEdge = (edgeData: any) => {
		console.log("➕ NodeCanvasRightPanel: Creating edge:", edgeData);
		emit("createEdge", edgeData);
	};

	// Chain template handler functions
	const _handleApplyChainTemplate = (template: any) => {
		console.log("🔗 NodeCanvasRightPanel: Applying chain template:", template.name);
		emit("applyTemplate", template);
	};

	const _handleAddNodes = (nodes: any[]) => {
		console.log("➕ NodeCanvasRightPanel: Adding nodes from chain template:", nodes.length);
		emit("addNodes", nodes);
	};

	const _handleAddEdges = (edges: any[]) => {
		console.log("➕ NodeCanvasRightPanel: Adding edges from chain template:", edges.length);
		emit("addEdges", edges);
	};

	const handleUpdateNodePositions = (positions: Record<string, { x: number, y: number }>) => {
		console.log("📐 NodeCanvasRightPanel: Updating node positions:", positions);
		emit("updateNodePositions", positions);
	};

	// Chain Flow Controller handlers
	const handleUpdateMultipleEdges = (edgeIds: string[], updates: any) => {
		console.log("🔗 NodeCanvasRightPanel: Updating multiple edges:", edgeIds.length);
		// Update each edge
		edgeIds.forEach((edgeId: string) => {
			emit("updateEdge", edgeId, updates);
		});
	};

	const handleCreateMultipleEdges = (edges: any[]) => {
		console.log("➕ NodeCanvasRightPanel: Creating multiple edges:", edges.length);
		edges.forEach((edge: any) => {
			emit("createEdge", edge);
		});
	};

	const handleDeleteMultipleEdges = (edgeIds: string[]) => {
		console.log("🗑️ NodeCanvasRightPanel: Deleting multiple edges:", edgeIds.length);
		edgeIds.forEach((edgeId: string) => {
			emit("deleteEdge", edgeId);
		});
	};

	const handleSaveChainTemplate = async (template: any) => {
		console.log("💾 NodeCanvasRightPanel: Saving chain template:", template);
		// Use the composable to save the template
		try {
			// TODO: Implement proper template saving with dialog for name/description
			console.log("Template data:", template);
		} catch (error) {
			console.error("❌ Error saving chain template:", error);
		}
	};

	const handleAnimateChainFlow = (sequence: string[], duration: number, originalColor: string) => {
		console.log("🎬 NodeCanvasRightPanel: Animating chain flow");
		emit("animateChainFlow", sequence, duration, originalColor);
	};

	const handleUpdateDefaultConnectionStyle = (style: any) => {
		console.log("🎨 NodeCanvasRightPanel: Updating default connection style:", style);
		chainFlowStyle.value = style; // Store for connection editor
		emit("updateDefaultConnectionStyle", style);
	};

	const openConnectionEditor = (edge: any) => {
		console.log("🔗 NodeCanvasRightPanel: Opening connection editor for:", edge);
		selectedConnection.value = edge;
		showConnectionEditor.value = true;
		// Switch to connections tab
		activeTab.value = "connections";
	};

	const closeConnectionEditor = () => {
		showConnectionEditor.value = false;
		selectedConnection.value = null;
	};

	const handleConnectionUpdate = (edgeId: string, updates: any) => {
		console.log("🔗 NodeCanvasRightPanel: Updating connection (Apply clicked):", edgeId, updates);
		emit("updateEdge", edgeId, updates);
		closeConnectionEditor();
	};

	const handleConnectionLiveUpdate = (edgeId: string, updates: any) => {
		console.log("🎨 NodeCanvasRightPanel: Live updating connection:", edgeId);
		// Don't close editor - this is real-time preview
		emit("updateEdge", edgeId, updates);
		// Update selected connection to reflect changes
		if (selectedConnection.value && selectedConnection.value.id === edgeId) {
			selectedConnection.value = {
				...selectedConnection.value,
				...updates
			};
		}
	};

	const handleConnectionDelete = (edgeId: string) => {
		console.log("🗑️ NodeCanvasRightPanel: Deleting connection:", edgeId);
		emit("deleteEdge", edgeId);
		closeConnectionEditor();
	};

	const handleAddConnectionToChain = (edgeId: string, chainStyle: any) => {
		console.log("➕ NodeCanvasRightPanel: Adding connection to chain:", edgeId);
		// Apply chain style to this connection
		const updates = {
			type: chainStyle.type,
			animated: chainStyle.animated,
			animationType: chainStyle.animationType,
			animationSpeed: chainStyle.animationSpeed,
			style: {
				stroke: chainStyle.color,
				strokeWidth: chainStyle.strokeWidth
			},
			markerEnd: {
				type: "arrowclosed",
				color: chainStyle.color
			}
		};
		emit("updateEdge", edgeId, updates);
		closeConnectionEditor();
	};

	// Debounce timer for reloading components
	let reloadDebounceTimer: NodeJS.Timeout | null = null;
	const debouncedReload = () => {
		if (reloadDebounceTimer) {
			clearTimeout(reloadDebounceTimer);
		}
		reloadDebounceTimer = setTimeout(() => {
			console.log("🔄 NodeCanvasRightPanel: Debounced reload triggered");
			loadComponents();
		}, 300); // 300ms debounce
	};

	// Watch for projectId changes and reload (debounced)
	watch(() => props.projectId, (newProjectId, oldProjectId) => {
		if (newProjectId && newProjectId !== oldProjectId) {
			console.log("🔄 Project ID changed:", { old: oldProjectId, new: newProjectId });
			// Clear existing data
			templates.value = [];
			solutions.value = [];
			hooks.value = [];
			transports.value = [];
			// Debounced reload
			debouncedReload();
		}
	});

	// Watch for organizationId changes and reload (debounced)
	watch(() => props.organizationId, (newOrgId, oldOrgId) => {
		if (newOrgId && newOrgId !== oldOrgId) {
			console.log("🔄 Organization ID changed:", { old: oldOrgId, new: newOrgId });
			// Clear existing data
			templates.value = [];
			solutions.value = [];
			hooks.value = [];
			transports.value = [];
			// Debounced reload
			debouncedReload();
		}
	});

	// Load data on mount
	onMounted(() => {
		console.log("🎬 NodeCanvasRightPanel mounted with props:", {
			projectId: props.projectId,
			organizationId: props.organizationId
		});
		loadComponents();

		// Set up resize observer for compact mode
		const panelElement = document.querySelector(".node-canvas-right-panel") as HTMLElement;
		if (panelElement) {
			panelRef.value = panelElement;

			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const width = entry.contentRect.width;
					// Switch to compact mode when width < 180px (keep names visible longer)
					isCompactMode.value = width < 180;
					console.log(`📐 Panel width: ${width}px, Compact mode: ${isCompactMode.value}`);
				}
			});

			resizeObserver.observe(panelElement);
		}
	});

	onBeforeUnmount(() => {
		// Clean up resize observer
		if (resizeObserver && panelRef.value) {
			resizeObserver.unobserve(panelRef.value);
			resizeObserver.disconnect();
		}
		// Clean up debounce timer
		if (reloadDebounceTimer) {
			clearTimeout(reloadDebounceTimer);
			reloadDebounceTimer = null;
		}
		// Clear component data to free memory
		// BUT DON'T clear the shared cache - it should persist!
		templates.value = [];
		solutions.value = [];
		hooks.value = [];
		transports.value = [];
		console.log("✅ NodeCanvasRightPanel: Cleanup complete (cache preserved)");
	});

	// Expose loadComponents, hooks, and transports for parent to access
	defineExpose({
		loadComponents,
		reloadComponents: loadComponents,
		getAvailableHooks: () => hooks.value,
		getAvailableTransports: () => transports.value,
		openConnectionEditor
	});
</script>

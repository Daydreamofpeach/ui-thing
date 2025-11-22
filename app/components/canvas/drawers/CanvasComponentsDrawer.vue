<template>
	<UiDrawer v-model:open="isOpen" should-scale-background direction="right">
		<UiDrawerContent class="w-full sm:max-w-md h-full max-h-screen">
			<div class="flex flex-col h-full min-h-0">
				<!-- Header -->
				<UiDrawerHeader class="border-b flex-shrink-0">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<Icon 
								:name="showOscar ? 'lucide:bot' : showUserManagement ? 'lucide:users' : showTaskManagement ? 'lucide:check-square' : 'lucide:layers'" 
								class="size-5" 
							/>
							<UiDrawerTitle>
								{{ showOscar ? 'OSCAR Assistant' : showUserManagement ? 'User Management' : showTaskManagement ? 'Task Management' : 'Components' }}
							</UiDrawerTitle>
						</div>
						<UiDrawerClose as-child>
							<UiButton variant="ghost" size="icon-sm" class="opacity-50 hover:opacity-100">
								<Icon name="lucide:x" />
							</UiButton>
						</UiDrawerClose>
					</div>
					<UiDrawerDescription>
						{{ showOscar ? 'Supreme automation machine' : showUserManagement ? 'Manage organization users' : showTaskManagement ? 'Manage project tasks' : 'Add to canvas' }}
					</UiDrawerDescription>
				</UiDrawerHeader>

				<!-- Active Template Status Bar -->
				<div v-if="activeTemplateOnCanvas" class="border-b p-3 bg-muted/30 flex-shrink-0" :class="getTemplateStatusClass()">
					<div class="flex items-center gap-3">
						<Icon :name="getTemplateStatusIcon()" class="size-4" :class="{ 'animate-spin': templateSaveStatus === 'saving' }" />
						<div class="flex-1 min-w-0">
							<div class="text-sm font-medium truncate">
								{{ activeTemplateOnCanvas.name }}
							</div>
							<div class="text-xs text-muted-foreground">
								{{ getTemplateStatusText() }}
							</div>
						</div>
						<div class="flex items-center gap-2">
							<UiBadge :variant="getTemplateStatusBadgeVariant()" size="sm">
								{{ getTemplateStatusBadgeText() }}
							</UiBadge>
							<UiButton
								v-if="canSaveTemplate"
								size="sm"
								variant="outline"
								:disabled="isSavingTemplate"
								@click="saveTemplateFromPanel"
							>
								<Icon 
									:name="isSavingTemplate ? 'lucide:loader-2' : 'lucide:save'" 
									:class="{ 'animate-spin': isSavingTemplate }" 
									class="size-3 mr-2" 
								/>
								{{ isSavingTemplate ? 'Saving...' : 'Save' }}
							</UiButton>
						</div>
					</div>
				</div>

				<!-- Header Actions -->
				<div v-if="!showOscar && !showUserManagement && !showTaskManagement" class="border-b p-3 flex-shrink-0">
					<div class="flex items-center gap-2">
						<UiButton
							variant="ghost"
							size="sm"
							class="flex-1"
							@click="showOscar = true"
						>
							<Icon name="lucide:bot" class="size-4 mr-2" />
							OSCAR
						</UiButton>
						<UiButton
							variant="ghost"
							size="sm"
							class="flex-1"
							@click="showUserManagement = true"
						>
							<Icon name="lucide:users" class="size-4 mr-2" />
							Users
						</UiButton>
						<UiButton
							variant="ghost"
							size="sm"
							class="flex-1"
							@click="showTaskManagement = true"
						>
							<Icon name="lucide:check-square" class="size-4 mr-2" />
							Tasks
						</UiButton>
					</div>
				</div>

				<!-- User Management Panel -->
				<div v-if="showUserManagement" class="flex-1 overflow-auto">
					<UserManagementPanel
						:organization-id="organizationId"
						:project-id="projectId"
						@add-component-node="handleAddComponentNodeFromPanel"
						@switch-to-original-panel="showUserManagement = false"
					/>
				</div>

				<!-- Task Management Panel -->
				<div v-else-if="showTaskManagement" class="flex-1 overflow-auto">
					<TaskPanel
						:organization-id="organizationId"
						:project-id="projectId"
						@add-component-node="handleAddComponentNodeFromPanel"
						@switch-to-original-panel="showTaskManagement = false"
					/>
				</div>

				<!-- OSCAR Assistant Panel -->
				<div v-else-if="showOscar" class="flex-1 overflow-auto">
					<OscarDashboardIntegration
						:organizations="organizations || []"
						:current-organization="currentOrganization || null"
						:selected-organisation-id="organizationId || null"
						:projects="projects || []"
						:filtered-projects="projects || []"
						:selected-project="selectedProject || null"
						:selected-project-id="projectId || ''"
					/>
				</div>

				<!-- Components Panel -->
				<div v-else class="flex-1 flex flex-col overflow-hidden min-h-0">
					<!-- Search Bar -->
					<div class="border-b p-3 flex-shrink-0">
						<div class="relative">
							<Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none z-10" />
							<UiInput
								v-model="searchQuery"
								type="text"
								placeholder="Search components..."
								class="pl-9 pr-9"
							/>
							<UiButton
								v-if="searchQuery"
								variant="ghost"
								size="icon-sm"
								class="absolute right-1 top-1/2 -translate-y-1/2"
								@click="searchQuery = ''"
							>
								<Icon name="lucide:x" class="size-3" />
							</UiButton>
						</div>
					</div>

					<!-- Tab Navigation -->
					<UiTabs v-model="activeTab" class="flex-1 flex flex-col overflow-hidden min-h-0">
						<div class="border-b overflow-x-auto flex-shrink-0">
							<UiTabsList :pill="false" class="w-full justify-start border-0 rounded-none bg-transparent">
								<UiTabsTrigger value="templates" :pill="false" class="gap-2">
									<Icon name="lucide:layout-template" class="size-4" />
									Templates
									<UiBadge variant="secondary" size="sm" class="ml-1">
										{{ filteredTemplates.length }}
									</UiBadge>
								</UiTabsTrigger>
								<UiTabsTrigger value="solutions" :pill="false" class="gap-2">
									<Icon name="lucide:puzzle" class="size-4" />
									Solutions
									<UiBadge variant="secondary" size="sm" class="ml-1">
										{{ filteredSolutions.length }}
									</UiBadge>
								</UiTabsTrigger>
								<UiTabsTrigger value="hooks" :pill="false" class="gap-2">
									<Icon name="lucide:webhook" class="size-4" />
									Hooks
									<UiBadge variant="secondary" size="sm" class="ml-1">
										{{ filteredHooks.length }}
									</UiBadge>
								</UiTabsTrigger>
								<UiTabsTrigger value="transports" :pill="false" class="gap-2">
									<Icon name="lucide:send" class="size-4" />
									Transports
									<UiBadge variant="secondary" size="sm" class="ml-1">
										{{ filteredTransports.length }}
									</UiBadge>
								</UiTabsTrigger>
								<UiTabsTrigger value="connections" :pill="false" class="gap-2">
									<Icon name="lucide:link" class="size-4" />
									Connections
									<UiBadge variant="secondary" size="sm" class="ml-1">
										{{ canvasEdges?.length || 0 }}
									</UiBadge>
								</UiTabsTrigger>
								<UiTabsTrigger value="chain-templates" :pill="false" class="gap-2">
									<Icon name="lucide:git-branch" class="size-4" />
									Chain Flow
								</UiTabsTrigger>
							</UiTabsList>
						</div>

						<!-- Type Filter (for Templates) -->
						<div v-if="activeTab === 'templates'" class="border-b p-3 bg-muted/30 flex-shrink-0">
							<div class="text-xs font-medium text-muted-foreground mb-2">Filter by type:</div>
							<div class="flex flex-wrap gap-2">
								<UiButton
									variant="outline"
									size="sm"
									:class="{ 'bg-primary text-primary-foreground border-primary': selectedTemplateType === 'all' }"
									@click="selectedTemplateType = 'all'"
								>
									All
									<UiBadge variant="secondary" size="sm" class="ml-1.5">
										{{ templates.length }}
									</UiBadge>
								</UiButton>
								<UiButton
									v-for="type in availableTemplateTypes"
									:key="String(type)"
									variant="outline"
									size="sm"
									:class="{ 'bg-primary text-primary-foreground border-primary': selectedTemplateType === String(type) }"
									@click="selectedTemplateType = String(type)"
								>
									{{ String(type) }}
									<UiBadge variant="secondary" size="sm" class="ml-1.5">
										{{ getTemplatesByType(String(type)).length }}
									</UiBadge>
								</UiButton>
							</div>
						</div>

						<!-- Content Area -->
						<UiScrollArea class="flex-1 min-h-0">
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
							<div v-if="isLoading && !showConnectionEditor" class="flex flex-col items-center justify-center h-full p-8">
								<Icon name="lucide:loader-2" class="size-8 animate-spin text-primary/60" />
								<p class="text-sm text-muted-foreground mt-3">
									Loading components...
								</p>
							</div>

							<!-- Templates Tab -->
							<UiTabsContent value="templates" class="p-4 mt-0">
								<div v-if="filteredTemplates.length === 0" class="flex flex-col items-center justify-center py-12">
									<Icon name="lucide:layout-template" class="size-12 text-muted-foreground/20 mb-3" />
									<p class="text-sm text-muted-foreground">
										{{ searchQuery ? 'No templates match your search' : 'No templates found' }}
									</p>
								</div>
								<div v-else class="space-y-2">
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
							</UiTabsContent>

							<!-- Solutions Tab -->
							<UiTabsContent value="solutions" class="p-4 mt-0">
								<div v-if="filteredSolutions.length === 0" class="flex flex-col items-center justify-center py-12">
									<Icon name="lucide:puzzle" class="size-12 text-muted-foreground/20 mb-3" />
									<p class="text-sm text-muted-foreground">
										{{ searchQuery ? 'No solutions match your search' : 'No solutions found' }}
									</p>
								</div>
								<div v-else class="space-y-2">
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
							</UiTabsContent>

							<!-- Hooks Tab -->
							<UiTabsContent value="hooks" class="p-4 mt-0">
								<div v-if="filteredHooks.length === 0" class="flex flex-col items-center justify-center py-12">
									<Icon name="lucide:webhook" class="size-12 text-muted-foreground/20 mb-3" />
									<p class="text-sm text-muted-foreground mb-2">
										{{ searchQuery ? 'No hooks match your search' : 'No hooks found' }}
									</p>
									<p v-if="!searchQuery" class="text-xs text-muted-foreground/60">
										Create hooks in the Buildit organization to see them here
									</p>
								</div>
								<div v-else class="space-y-2">
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
							</UiTabsContent>

							<!-- Transports Tab -->
							<UiTabsContent value="transports" class="p-4 mt-0">
								<div v-if="filteredTransports.length === 0" class="flex flex-col items-center justify-center py-12">
									<Icon name="lucide:send" class="size-12 text-muted-foreground/20 mb-3" />
									<p class="text-sm text-muted-foreground">
										{{ searchQuery ? 'No transports match your search' : 'No transports found' }}
									</p>
								</div>
								<div v-else class="space-y-2">
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
							</UiTabsContent>

							<!-- Connections Tab -->
							<UiTabsContent value="connections" class="mt-0">
								<ConnectionsPanel
									:nodes="canvasNodes || []"
									:edges="canvasEdges || []"
									@update-edge="handleUpdateEdge"
									@delete-edge="handleDeleteEdge"
									@create-edge="handleCreateEdge"
									@switch-to-components="activeTab = 'templates'"
									@start-chain-creation="activeTab = 'chain-templates'"
								/>
							</UiTabsContent>

							<!-- Chain Flow Controller Tab -->
							<UiTabsContent value="chain-templates" class="mt-0">
								<ChainFlowController
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
							</UiTabsContent>
						</UiScrollArea>
					</UiTabs>
				</div>
			</div>
		</UiDrawerContent>
	</UiDrawer>

	<!-- Delete Confirmation Dialog -->
	<UiAlertDialog :open="!!deleteConfirmation" @update:open="(open) => !open && cancelDelete()">
		<UiAlertDialogContent>
			<UiAlertDialogHeader>
				<div class="flex items-center gap-3">
					<Icon name="lucide:alert-triangle" class="size-6 text-destructive" />
					<UiAlertDialogTitle>
						Delete {{ deleteConfirmation ? deleteConfirmation.type.charAt(0).toUpperCase() + deleteConfirmation.type.slice(1) : '' }}?
					</UiAlertDialogTitle>
				</div>
			</UiAlertDialogHeader>
			<UiAlertDialogDescription>
				Are you sure you want to delete "<span class="font-medium text-foreground">{{ deleteConfirmation?.item.name }}</span>"? This action cannot be undone.
			</UiAlertDialogDescription>
			<UiAlertDialogFooter>
				<UiAlertDialogCancel @click="cancelDelete">
					Cancel
				</UiAlertDialogCancel>
				<UiAlertDialogAction variant="destructive" @click="confirmDelete">
					<Icon name="lucide:trash-2" class="size-4 mr-2" />
					Delete
				</UiAlertDialogAction>
			</UiAlertDialogFooter>
		</UiAlertDialogContent>
	</UiAlertDialog>
</template>

<script setup lang="ts">
	// Import all the same logic from NodeCanvasRightPanel
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
	import ConnectionsPanel from "../panels/ConnectionsPanel.vue";
	import "../panels/NodeCanvasRightPanel.css";

	// Import UI components
	import UiDrawer from "~/components/Ui/Drawer/Drawer.vue";
	import UiDrawerContent from "~/components/Ui/Drawer/Content.vue";
	import UiDrawerHeader from "~/components/Ui/Drawer/Header.vue";
	import UiDrawerTitle from "~/components/Ui/Drawer/Title.vue";
	import UiDrawerClose from "~/components/Ui/Drawer/Close.vue";
	import UiDrawerDescription from "~/components/Ui/Drawer/Description.vue";
	import UiButton from "~/components/Ui/Button.vue";
	import UiInput from "~/components/Ui/Input.vue";
	import UiBadge from "~/components/Ui/Badge.vue";
	import UiTabs from "~/components/Ui/Tabs/Tabs.vue";
	import UiTabsList from "~/components/Ui/Tabs/List.vue";
	import UiTabsTrigger from "~/components/Ui/Tabs/Trigger.vue";
	import UiTabsContent from "~/components/Ui/Tabs/Content.vue";
	import UiScrollArea from "~/components/Ui/ScrollArea/ScrollArea.vue";
	import UiSeparator from "~/components/Ui/Separator.vue";
	import UiAlertDialog from "~/components/Ui/AlertDialog/AlertDialog.vue";
	import UiAlertDialogContent from "~/components/Ui/AlertDialog/Content.vue";
	import UiAlertDialogHeader from "~/components/Ui/AlertDialog/Header.vue";
	import UiAlertDialogTitle from "~/components/Ui/AlertDialog/Title.vue";
	import UiAlertDialogDescription from "~/components/Ui/AlertDialog/Description.vue";
	import UiAlertDialogFooter from "~/components/Ui/AlertDialog/Footer.vue";
	import UiAlertDialogCancel from "~/components/Ui/AlertDialog/Cancel.vue";
	import UiAlertDialogAction from "~/components/Ui/AlertDialog/Action.vue";

	// Props - same as NodeCanvasRightPanel + open for drawer
	const props = defineProps<{
		open?: boolean
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

	// Emits - same as NodeCanvasRightPanel + update:open for drawer
	const emit = defineEmits<{
		'update:open': [value: boolean]
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

	// Drawer state - computed from props
	const isOpen = computed({
		get: () => props.open ?? false,
		set: (value) => emit('update:open', value)
	});

	// Debug: Log initial props
	console.log("🎬 CanvasComponentsDrawer: Component created with props:", {
		open: props.open,
		organizationId: props.organizationId,
		projectId: props.projectId
	});

	// Debug: Watch for open state changes
	watch(() => props.open, (newValue, oldValue) => {
		console.log("🔍 CanvasComponentsDrawer: open prop changed from", oldValue, "to:", newValue);
	}, { immediate: true });

	// State - same as NodeCanvasRightPanel
	const activeTab = ref<string>("templates");
	const templates = ref<any[]>([]);
	const solutions = ref<any[]>([]);
	const hooks = ref<any[]>([]);
	const transports = ref<any[]>([]);
	const isLoading = ref(false);
	const searchQuery = ref("");
	const expandedItems = ref<Set<string>>(new Set());
	const editingItem = ref<string | null>(null);
	const editForm = ref<any>({});
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

	// Save template function - same as NodeCanvasRightPanel
	const saveTemplateFromPanel = async () => {
		if (!activeTemplateOnCanvas.value || !props.canvasNodes) return;

		isSavingTemplate.value = true;
		templateSaveStatus.value = "saving";

		try {
			console.log("💾 Saving template from drawer:", activeTemplateOnCanvas.value.name);

			const saveTemplateNode = props.canvasNodes.find((n: any) => n.type === "saveTemplateNode");

			if (saveTemplateNode) {
				console.log("✅ Found SaveTemplateNode, triggering save via event");
				if (typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("oscar:trigger-template-save", {
						detail: { nodeId: saveTemplateNode.id }
					}));
				}
			} else {
				console.log("⚠️ No SaveTemplateNode found, creating one...");
				const bFolderNode = props.canvasNodes.find((n: any) => n.type === "bFolderSetupNode");

				if (bFolderNode && typeof window !== "undefined") {
					window.dispatchEvent(new CustomEvent("oscar:create-save-template-node", {
						detail: { bFolderNodeId: bFolderNode.id }
					}));
				}
			}

			setTimeout(() => {
				templateSaveStatus.value = "saved";
				isSavingTemplate.value = false;

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
				const { useOscarState } = await import("~/components/Oscar/composables/useOscarState");
				const { useSharedOscarCanvasContext } = await import("~/components/Oscar/composables/useOscarCanvasContext");
				const { clearMessages, addMessage } = useOscarState();
				const { setCanvasContext, setAvailableResources } = useSharedOscarCanvasContext();

				setCanvasContext(
					props.canvasNodes || [],
					props.canvasEdges || [],
					{ x: 0, y: 0, zoom: 1 },
					"Current Canvas",
					""
				);

				setAvailableResources(
					templates.value,
					hooks.value,
					transports.value,
					solutions.value
				);

				clearMessages();

				addMessage("assistant", "👋 **Welcome to OSCAR!**\n\nI'm your supreme automation machine, ready to help with your canvas automation.", {
					actions: [
						{ id: "show-canvas-context", label: "📊 Show Canvas Info", variant: "primary" },
						{ id: "browse-existing", label: "📂 Browse Project", variant: "secondary" }
					]
				});

				addMessage("assistant", "📊 **Current Canvas Context**\n\nHere's what's on your canvas:", {
					widget: {
						name: "OscarCanvasContextCard",
						props: {}
					}
				});

				const { useOscarChainDetection } = await import("~/components/Oscar/composables/useOscarChainDetection");
				const { detectChains } = useOscarChainDetection();

				if (detectChains.value.length > 0) {
					addMessage("assistant", "🔍 **Automation Chains Detected!**\n\nI found some workflow chains on your canvas. Click 'View Nodes' to see each step.", {
						widget: {
							name: "OscarDetectedChainsCard",
							props: {}
						}
					});
				}

				console.log("✅ OSCAR canvas context set and messages initialized");
			} catch (error) {
				console.error("❌ Failed to set OSCAR canvas context:", error);
			}
		}
	});

	// Filtered components - same logic as NodeCanvasRightPanel
	const filteredTemplates = computed(() => {
		let filtered = templates.value;

		if (selectedTemplateType.value !== "all") {
			const selectedType = String(selectedTemplateType.value || '').toLowerCase();
			filtered = filtered.filter((t: any) => {
				const templateType = t.template?.type;
				if (!templateType) return false;
				const typeStr = typeof templateType === 'string' ? templateType : String(templateType);
				return typeStr.toLowerCase() === selectedType;
			});
		}

		if (searchQuery.value) {
			const query = searchQuery.value.toLowerCase();
			filtered = filtered.filter((t: any) => {
				const name = t.name?.toLowerCase() || '';
				const description = t.description?.toLowerCase() || '';
				const templateType = t.template?.type;
				const typeStr = templateType ? (typeof templateType === 'string' ? templateType : String(templateType)).toLowerCase() : '';
				return name.includes(query) || description.includes(query) || typeStr.includes(query);
			});
		}

		return filtered;
	});

	const availableTemplateTypes = computed(() => {
		const types = getTemplateTypes(templates.value);
		// Ensure all types are strings
		return types.map((t: any) => typeof t === 'string' ? t : String(t || '')).filter((t: string) => t.length > 0);
	});

	const getTemplatesByType = (type: string | any) => {
		// Ensure type is a string
		const typeStr = typeof type === 'string' ? type : String(type || '');
		if (typeStr === "all") return templates.value;
		return templates.value.filter((t: any) => {
			const templateType = t.template?.type;
			if (!templateType) return false;
			const templateTypeStr = typeof templateType === 'string' ? templateType : String(templateType);
			return templateTypeStr.toLowerCase() === typeStr.toLowerCase();
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

	// Load all components - same as NodeCanvasRightPanel (abbreviated for space)
	const loadComponents = async () => {
		console.log("🚀 CanvasComponentsDrawer: loadComponents() CALLED");

		if (!props.organizationId) {
			console.warn("⚠️ No organization ID provided - ABORTING");
			return;
		}

		isLoading.value = true;
		try {
			// Load templates
			if (props.projectId) {
				const cachedTemplates = getCachedData(props.projectId, 'templates');
				if (cachedTemplates !== null) {
					templates.value = cachedTemplates;
				} else if (isCacheLoading(props.projectId, 'templates')) {
					await new Promise(resolve => setTimeout(resolve, 500));
					const nowCached = getCachedData(props.projectId, 'templates');
					templates.value = nowCached !== null ? nowCached : [];
				} else {
					setCacheLoading(props.projectId, 'templates', true);
					try {
						const templatesData = await buttClient.findByProjectIdTemplate(props.projectId);
						templates.value = Array.isArray(templatesData) ? templatesData : [];
						
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
						
						setCachedData(props.projectId, 'templates', templates.value);
					} finally {
						setCacheLoading(props.projectId, 'templates', false);
					}
				}
			} else if (props.organizationId) {
				const allTemplates = await buttClient.findAllTemplate();
				templates.value = (allTemplates || []).filter((template: any) => {
					const name = template.name?.toLowerCase() || "";
					const excludePatterns = ["buildit config", "buildit.config", "internal"];
					return !excludePatterns.some((pattern: string) => name.includes(pattern));
				});
			}

			// Load solutions
			if (props.projectId) {
				const cachedSolutions = getCachedData(props.projectId, 'solutions');
				if (cachedSolutions !== null) {
					solutions.value = cachedSolutions;
				} else if (isCacheLoading(props.projectId, 'solutions')) {
					await new Promise(resolve => setTimeout(resolve, 300));
					const nowCached = getCachedData(props.projectId, 'solutions');
					solutions.value = nowCached !== null ? nowCached : [];
				} else {
					setCacheLoading(props.projectId, 'solutions', true);
					try {
						const solutionsData = await buttClient.findByProjectIdSolution(props.projectId);
						solutions.value = Array.isArray(solutionsData) ? solutionsData : [];
						setCachedData(props.projectId, 'solutions', solutions.value);
					} finally {
						setCacheLoading(props.projectId, 'solutions', false);
					}
				}
			} else if (props.organizationId) {
				try {
					const allSolutions = await buttClient.findAllSolution();
					solutions.value = Array.isArray(allSolutions) ? allSolutions : [];
				} catch (error) {
					console.warn("⚠️ Failed to load all solutions:", error);
					solutions.value = [];
				}
			}

			// Load hooks
			try {
				const allHooksCollected: any[] = [];

				try {
					const builditHooks = await buttClient.getByOrganisationId("buildit");
					if (builditHooks && builditHooks.length > 0) {
						allHooksCollected.push(...builditHooks);
					}
				} catch (error) {
					console.warn("⚠️ Error loading buildit default hooks:", error);
				}

				if (props.organizationId) {
					try {
						const userOrgHooks = await buttClient.getByOrganisationId(props.organizationId);
						if (userOrgHooks && userOrgHooks.length > 0) {
							userOrgHooks.forEach((hook: any) => {
								if (!allHooksCollected.find((h: any) => h.id === hook.id)) {
									allHooksCollected.push(hook);
								}
							});
						}
					} catch (error) {
						console.warn("⚠️ Error loading user organization hooks:", error);
					}
				}

				hooks.value = allHooksCollected.map((hook: any) => ({
					...hook,
					name: hook.name || hook.type || "Unnamed Hook"
				}));
			} catch (error) {
				console.error("❌ Error loading hooks:", error);
				hooks.value = [];
			}

			// Load transports
			try {
				const allTransports = await fetchTransports();
				transports.value = (allTransports || []).map((transport: any) => ({
					...transport,
					name: transport.name || transport.type || "Unnamed Transport"
				}));
			} catch (error) {
				console.error("❌ Error loading transports:", error);
				transports.value = [];
			}
		} catch (error) {
			console.error("❌ CanvasComponentsDrawer: Error loading components:", error);
		} finally {
			isLoading.value = false;
		}
	};

	// Expand/collapse handling
	const toggleExpanded = (itemId: string) => {
		if (expandedItems.value.has(itemId)) {
			expandedItems.value.delete(itemId);
		} else {
			expandedItems.value.add(itemId);
		}
		expandedItems.value = new Set(expandedItems.value);
	};

	const isExpanded = (itemId: string) => {
		return expandedItems.value.has(itemId);
	};

	// Edit handling
	const handleComponentEdit = async (component: any, updates: any) => {
		try {
			console.log("💾 Saving component via unified handler:", updates);

			if (updates.template !== undefined) {
				await buttClient.updateTemplate(component.id, {
					name: updates.name,
					description: updates.description,
					template: updates.template
				});
			} else if (component.type === "solution" || updates.status !== undefined) {
				await buttClient.updateSolution(component.id, {
					name: updates.name,
					description: updates.description
				});
			} else if (updates.target !== undefined) {
				await buttClient.updateTransport(component.id, {
					target: updates.target,
					meta: updates.meta || {}
				});
			}

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
				await buttClient.deleteTemplate(item.id);
			} else if (type === "solution") {
				await buttClient.deleteSolution(item.id);
			} else if (type === "hook") {
				console.warn("⚠️ Hook deletion not yet implemented in BAPI");
			} else if (type === "transport") {
				await buttClient.deleteTransport(item.id);
			}

			await loadComponents();

			const { useToast } = await import("#ui/composables/useToast");
			const toast = useToast();
			const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
			toast.add({
				title: `${typeLabel} Deleted`,
				description: `"${item.name}" has been deleted successfully`,
				color: "success",
				icon: "i-lucide-check-circle"
			});
		} catch (error) {
			console.error("❌ Error deleting:", error);

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

		const templateNodes = nodes.filter((n: any) => n.type === "templateNode");
		if (templateNodes.length > 0) {
			const templateNode = templateNodes[0];
			const matchingTemplate = templates.value.find((t: any) => t.id === templateNode.id);
			if (matchingTemplate) {
				activeTemplateOnCanvas.value = matchingTemplate;
			} else {
				activeTemplateOnCanvas.value = {
					id: templateNode.id,
					name: templateNode.data?.templateName || templateNode.data?.label || "Active Template"
				};
			}
		} else {
			activeTemplateOnCanvas.value = null;
		}
	}, { deep: true, immediate: true });

	watch(() => props.saveStatus, (status) => {
		if (status) {
			templateSaveStatus.value = status;
		}
	});

	// Status helper functions
	const getTemplateStatusClass = () => {
		switch (templateSaveStatus.value) {
		case "saving": return "bg-yellow-500/10 border-yellow-500/20";
		case "saved": return "bg-green-500/10 border-green-500/20";
		case "error": return "bg-red-500/10 border-red-500/20";
		default: return "bg-muted/30";
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

	const getTemplateStatusBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
		switch (templateSaveStatus.value) {
		case "saving": return "secondary";
		case "saved": return "default";
		case "error": return "destructive";
		default: return "outline";
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
		console.log("➕ DRAWER: ADD TEMPLATE TO CANVAS CLICKED");
		console.log("Template:", template);
		console.log("Template.name:", template.name);
		console.log("Template.id:", template.id);
		console.log("═══════════════════════════════════════════");
		activeTemplateOnCanvas.value = template;
		templateSaveStatus.value = "idle";
		console.log("📤 Emitting addComponentNode event with type: 'template'");
		emit("addComponentNode", "template", template);
		console.log("✅ Event emitted");
	};

	const addSolutionToCanvas = (solution: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("➕ DRAWER: ADD SOLUTION TO CANVAS CLICKED");
		console.log("Solution:", solution);
		console.log("Solution.name:", solution.name);
		console.log("Solution.id:", solution.id);
		console.log("═══════════════════════════════════════════");
		console.log("📤 Emitting addComponentNode event with type: 'solution'");
		emit("addComponentNode", "solution", solution);
		console.log("✅ Event emitted");
	};

	const addHookToCanvas = (hook: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("➕ DRAWER: ADD HOOK TO CANVAS CLICKED");
		console.log("Hook:", hook);
		console.log("Hook.name:", hook.name);
		console.log("Hook.id:", hook.id);
		console.log("═══════════════════════════════════════════");
		console.log("📤 Emitting addComponentNode event with type: 'hook'");
		emit("addComponentNode", "hook", hook);
		console.log("✅ Event emitted");
	};

	const addTransportToCanvas = (transport: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("➕ DRAWER: ADD TRANSPORT TO CANVAS CLICKED");
		console.log("Transport:", transport);
		console.log("Transport.name:", transport.name);
		console.log("Transport.id:", transport.id);
		console.log("═══════════════════════════════════════════");
		console.log("📤 Emitting addComponentNode event with type: 'transport'");
		emit("addComponentNode", "transport", transport);
		console.log("✅ Event emitted");
	};

	const handleAddComponentNodeFromPanel = (componentType: string, componentData: any) => {
		console.log("🔧 CanvasComponentsDrawer: Received add component request:", componentType, componentData);
		emit("addComponentNode", componentType, componentData);
	};

	// Edge handler functions
	const handleUpdateEdge = (edgeId: string, edgeData: any) => {
		console.log("🔗 CanvasComponentsDrawer: Updating edge:", edgeId, edgeData);
		emit("updateEdge", edgeId, edgeData);
	};

	const handleDeleteEdge = (edgeId: string) => {
		console.log("🗑️ CanvasComponentsDrawer: Deleting edge:", edgeId);
		emit("deleteEdge", edgeId);
	};

	const handleCreateEdge = (edgeData: any) => {
		console.log("➕ CanvasComponentsDrawer: Creating edge:", edgeData);
		emit("createEdge", edgeData);
	};

	// Chain Flow Controller handlers
	const handleUpdateNodePositions = (positions: Record<string, { x: number, y: number }>) => {
		console.log("📐 CanvasComponentsDrawer: Updating node positions:", positions);
		emit("updateNodePositions", positions);
	};

	const handleUpdateMultipleEdges = (edgeIds: string[], updates: any) => {
		console.log("🔗 CanvasComponentsDrawer: Updating multiple edges:", edgeIds.length);
		edgeIds.forEach((edgeId: string) => {
			emit("updateEdge", edgeId, updates);
		});
	};

	const handleCreateMultipleEdges = (edges: any[]) => {
		console.log("➕ CanvasComponentsDrawer: Creating multiple edges:", edges.length);
		edges.forEach((edge: any) => {
			emit("createEdge", edge);
		});
	};

	const handleDeleteMultipleEdges = (edgeIds: string[]) => {
		console.log("🗑️ CanvasComponentsDrawer: Deleting multiple edges:", edgeIds.length);
		edgeIds.forEach((edgeId: string) => {
			emit("deleteEdge", edgeId);
		});
	};

	const handleSaveChainTemplate = async (template: any) => {
		console.log("💾 CanvasComponentsDrawer: Saving chain template:", template);
	};

	const handleAnimateChainFlow = (sequence: string[], duration: number, originalColor: string) => {
		console.log("🎬 CanvasComponentsDrawer: Animating chain flow");
		emit("animateChainFlow", sequence, duration, originalColor);
	};

	const handleUpdateDefaultConnectionStyle = (style: any) => {
		console.log("🎨 CanvasComponentsDrawer: Updating default connection style:", style);
		chainFlowStyle.value = style;
		emit("updateDefaultConnectionStyle", style);
	};

	const openConnectionEditor = (edge: any) => {
		console.log("🔗 CanvasComponentsDrawer: Opening connection editor for:", edge);
		selectedConnection.value = edge;
		showConnectionEditor.value = true;
		activeTab.value = "connections";
	};

	const closeConnectionEditor = () => {
		showConnectionEditor.value = false;
		selectedConnection.value = null;
	};

	const handleConnectionUpdate = (edgeId: string, updates: any) => {
		console.log("🔗 CanvasComponentsDrawer: Updating connection (Apply clicked):", edgeId, updates);
		emit("updateEdge", edgeId, updates);
		closeConnectionEditor();
	};

	const handleConnectionLiveUpdate = (edgeId: string, updates: any) => {
		console.log("🎨 CanvasComponentsDrawer: Live updating connection:", edgeId);
		emit("updateEdge", edgeId, updates);
		if (selectedConnection.value && selectedConnection.value.id === edgeId) {
			selectedConnection.value = {
				...selectedConnection.value,
				...updates
			};
		}
	};

	const handleConnectionDelete = (edgeId: string) => {
		console.log("🗑️ CanvasComponentsDrawer: Deleting connection:", edgeId);
		emit("deleteEdge", edgeId);
		closeConnectionEditor();
	};

	const handleAddConnectionToChain = (edgeId: string, chainStyle: any) => {
		console.log("➕ CanvasComponentsDrawer: Adding connection to chain:", edgeId);
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
			console.log("🔄 CanvasComponentsDrawer: Debounced reload triggered");
			loadComponents();
		}, 300);
	};

	// Watch for projectId changes and reload (debounced)
	watch(() => props.projectId, (newProjectId, oldProjectId) => {
		if (newProjectId && newProjectId !== oldProjectId) {
			console.log("🔄 Project ID changed:", { old: oldProjectId, new: newProjectId });
			templates.value = [];
			solutions.value = [];
			hooks.value = [];
			transports.value = [];
			debouncedReload();
		}
	});

	// Watch for organizationId changes and reload (debounced)
	watch(() => props.organizationId, (newOrgId, oldOrgId) => {
		if (newOrgId && newOrgId !== oldOrgId) {
			console.log("🔄 Organization ID changed:", { old: oldOrgId, new: newOrgId });
			templates.value = [];
			solutions.value = [];
			hooks.value = [];
			transports.value = [];
			debouncedReload();
		}
	});

	// Load data when drawer opens
	watch(() => props.open, (open) => {
		console.log("🔍 CanvasComponentsDrawer: open prop watcher triggered, open =", open);
		if (open) {
			console.log("📦 Loading components because drawer opened");
			loadComponents();
		}
	});

	// Load data on mount
	onMounted(() => {
		console.log("🎬 CanvasComponentsDrawer mounted, open =", props.open);
		if (props.open) {
			loadComponents();
		}
	});

	onBeforeUnmount(() => {
		if (reloadDebounceTimer) {
			clearTimeout(reloadDebounceTimer);
			reloadDebounceTimer = null;
		}
		templates.value = [];
		solutions.value = [];
		hooks.value = [];
		transports.value = [];
		console.log("✅ CanvasComponentsDrawer: Cleanup complete");
	});

	// Expose methods
	defineExpose({
		loadComponents,
		reloadComponents: loadComponents,
		getAvailableHooks: () => hooks.value,
		getAvailableTransports: () => transports.value,
		openConnectionEditor
	});
</script>


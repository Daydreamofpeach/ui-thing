<template>
	<aside class="flex h-full border-r max-w-[336px]">
		<!-- Fixed Icon Sidebar - 16px wide -->
		<div class="flex w-16 flex-col items-center bg-muted/30 py-4 shrink-0">
			<!-- Logo/Header -->
			<div class="mb-10">
				<NuxtLink to="#" class="flex items-center justify-center">
					<Icon name="lucide:network" class="size-8 text-foreground" />
				</NuxtLink>
			</div>

			<!-- Navigation Icons -->
			<nav class="flex flex-1 flex-col gap-2">
				<UiTooltip
					v-for="tab in mainTabs"
					:key="tab.id"
				>
					<UiTooltipTrigger as-child>
						<UiButton
							variant="ghost"
							size="icon"
							class="!flex !items-center !justify-center !w-9 !h-9"
							:class="{ 
								'bg-secondary text-primary': activeTab === tab.id,
								'text-foreground/70 hover:text-foreground hover:bg-accent': activeTab !== tab.id
							}"
							@click="activeTab = tab.id"
						>
							<Icon :name="tab.icon" class="size-[18px]" />
						</UiButton>
					</UiTooltipTrigger>
					<UiTooltipContent side="right">{{ tab.title }}</UiTooltipContent>
				</UiTooltip>
			</nav>

			<UiDivider class="my-2" />

			<!-- Settings Icon -->
			<UiTooltip>
				<UiTooltipTrigger as-child>
					<UiButton 
						variant="ghost" 
						size="icon"
						class="!flex !items-center !justify-center !w-9 !h-9 text-foreground/70 hover:text-foreground hover:bg-accent"
					>
						<Icon name="lucide:settings" class="size-[18px]" />
					</UiButton>
				</UiTooltipTrigger>
				<UiTooltipContent side="right">Settings</UiTooltipContent>
			</UiTooltip>

			<!-- User Avatar Dropdown -->
			<UiDropdownMenu>
				<UiDropdownMenuTrigger as-child>
					<UiAvatar :src="userAvatar" class="mt-4 size-8 cursor-pointer">
						<UiAvatarImage :src="userAvatar" :alt="userName" />
						<UiAvatarFallback>{{ userInitials }}</UiAvatarFallback>
					</UiAvatar>
				</UiDropdownMenuTrigger>
				<UiDropdownMenuContent side="right">
					<UiDropdownMenuLabel class="flex flex-col">
						<span>{{ userName }}</span>
						<span class="text-sm font-normal text-muted-foreground">{{ globalUserEmail }}</span>
					</UiDropdownMenuLabel>
					<UiDropdownMenuSeparator />
					<UiDropdownMenuItem title="View profile" icon="lucide:user" />
					<UiDropdownMenuItem title="Edit profile" icon="lucide:pen" />
					<UiDropdownMenuItem title="Change password" icon="lucide:lock" />
					<UiDropdownMenuItem title="Delete account" icon="lucide:trash" />
					<UiDropdownMenuSeparator />
					<UiDropdownMenuItem variant="destructive" title="Logout" icon="lucide:log-out" />
				</UiDropdownMenuContent>
			</UiDropdownMenu>
		</div>

		<!-- Content Panel - Slides in from right when tab is active -->
		<div v-if="activeTab" class="w-[320px] bg-background">
			<UiScrollArea class="h-full">
				<div class="flex h-full flex-col p-4">
					<!-- Panel Header -->
					<div class="mb-6">
						<div class="mb-2 flex items-center gap-2">
							<Icon :name="activeTabData.icon" class="size-5 text-primary" />
							<h2 class="font-semibold">{{ activeTabData.title }}</h2>
						</div>
						<p class="text-sm text-muted-foreground">{{ activeTabData.description }}</p>
					</div>

					<!-- Tab Content -->
					<!-- Nodes Tab Content -->
					<div v-if="activeTab === 'nodes'" class="flex flex-1 flex-col gap-4">
						<!-- Search Bar -->
						<SearchBar
							v-model="nodeSearchQuery"
							placeholder="Search nodes..."
							@update:model-value="handleSearchInput"
						/>

						<!-- Category Icon Tabs -->
						<UiToggleGroup
							v-model="activeNodeCategory"
							type="single"
							class="flex flex-wrap gap-2 justify-center"
						>
							<UiTooltip
								v-for="category in categories"
								:key="category.id"
							>
								<UiTooltipTrigger as-child>
									<UiToggleGroupItem
										:value="category.id"
										class="size-12 p-0 flex items-center justify-center hover:bg-accent transition-colors !flex"
									>
										<Icon 
											:name="category.icon?.replace('i-lucide-', 'lucide:') || category.icon" 
											class="size-5 text-foreground shrink-0"
										/>
									</UiToggleGroupItem>
								</UiTooltipTrigger>
								<UiTooltipContent>
									{{ category.name }}
								</UiTooltipContent>
							</UiTooltip>
						</UiToggleGroup>

						<!-- Node Grid -->
						<nav class="flex flex-1 flex-col gap-1 overflow-y-auto">
							<UiTooltip
								v-for="node in nodesInCurrentCategory"
								:key="node.id"
							>
								<UiTooltipTrigger as-child>
									<UiButton
										variant="outline"
										size="sm"
										class="w-full justify-start gap-3 px-2"
										:style="node.color ? { borderColor: node.color } : {}"
										draggable="true"
										@click="handleNodeClick(node)"
										@dragstart="startDrag(node, $event)"
										@dblclick="handleNodeDoubleClick(node)"
									>
										<Icon v-if="node.icon" :name="node.icon?.replace('i-lucide-', 'lucide:') || node.icon" class="size-4 text-muted-foreground shrink-0" />
										<span class="flex-1 text-left">{{ node.name }}</span>
									</UiButton>
								</UiTooltipTrigger>
								<UiTooltipContent>
									Add {{ node.name }} Node
								</UiTooltipContent>
							</UiTooltip>
						</nav>

						<!-- Quick Actions -->
						<div class="flex flex-col gap-2 pt-4 border-t mt-auto">
							<UiButton
								variant="outline"
								size="sm"
								class="w-full justify-start"
								@click="$emit('clearCanvas')"
							>
								<Icon name="lucide:trash-2" class="size-4" />
								Clear Canvas
							</UiButton>
							<UiButton
								variant="outline"
								size="sm"
								class="w-full justify-start"
								@click="$emit('fitView')"
							>
								<Icon name="lucide:maximize" class="size-4" />
								Fit to View
							</UiButton>
							<UiButton
								variant="outline"
								size="sm"
								class="w-full justify-start"
								@click="$emit('exportCanvas')"
							>
								<Icon name="lucide:download" class="size-4" />
								Export
							</UiButton>
						</div>
					</div>

					<!-- Canvas Tab Content -->
					<div v-if="activeTab === 'canvas'" class="flex flex-1 flex-col gap-4 overflow-y-auto">
						<!-- Current Canvas Name -->
						<UiCard>
							<UiCardHeader>
								<UiCardTitle class="flex items-center gap-2">
									<Icon name="lucide:file-text" class="size-4" />
									Current Canvas
								</UiCardTitle>
							</UiCardHeader>
							<UiCardContent>
								<UiInput
									v-model="editableCanvasName"
									placeholder="Canvas Name"
									@blur="updateCanvasName"
									@keyup.enter="updateCanvasName"
								/>
							</UiCardContent>
						</UiCard>

						<!-- Loading Indicator -->
						<UiCard v-if="isLoading">
							<UiCardContent class="flex items-center gap-2 py-4">
								<Icon name="lucide:loader-2" class="animate-spin size-4" />
								<span>Loading canvases...</span>
							</UiCardContent>
						</UiCard>

						<!-- Saved Canvases List -->
						<UiCard v-else-if="savedCanvases.length > 0">
							<UiCardHeader>
								<div class="flex items-center justify-between">
									<UiCardTitle class="flex items-center gap-2">
										<Icon name="lucide:folder" class="size-4" />
										Saved Canvases ({{ savedCanvases.length }})
									</UiCardTitle>
									<UiButton
										variant="ghost"
										size="sm"
										@click="isSelectMode = !isSelectMode"
									>
										<Icon :name="isSelectMode ? 'lucide:check-square' : 'lucide:square'" class="size-4" />
									</UiButton>
								</div>
							</UiCardHeader>
							<UiCardContent>
								<!-- Select All Checkbox (visible in select mode) -->
								<div v-if="isSelectMode && savedCanvases.length > 0" class="flex items-center gap-2 mb-4 pb-4 border-b">
									<input
										type="checkbox"
										:checked="allCanvasesSelected"
										:indeterminate="someCanvasesSelected"
										@change="toggleSelectAll"
										class="size-4"
									>
									<label class="text-sm cursor-pointer">
										{{ allCanvasesSelected ? 'Deselect All' : 'Select All' }}
									</label>
									<span v-if="selectedCanvasCount > 0" class="text-xs text-muted-foreground ml-auto">
										{{ selectedCanvasCount }} selected
									</span>
								</div>

								<!-- Canvas List -->
								<div class="space-y-2">
									<div
										v-for="canvas in savedCanvases"
										:key="canvas.id"
										class="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent transition-colors"
										:class="{ 'bg-primary/10 border-primary': canvas.id === currentCanvasId, 'bg-accent': selectedCanvasIds.has(canvas.id) }"
									>
										<input
											v-if="isSelectMode"
											type="checkbox"
											:checked="selectedCanvasIds.has(canvas.id)"
											@change="toggleCanvasSelection(canvas.id)"
											class="size-4"
										>
										<button
											v-else
											class="flex-1 text-left flex items-center gap-2"
											:class="{ 'font-semibold': canvas.id === currentCanvasId }"
											@click="loadSavedCanvas(canvas.id)"
											@contextmenu.prevent="showCanvasContextMenu($event, canvas)"
										>
											<Icon name="lucide:file-text" class="size-4 text-muted-foreground" />
											<span class="text-sm">{{ canvas.name }}</span>
											<span v-if="canvas.id === currentCanvasId" class="ml-auto">
												<Icon name="lucide:check" class="size-4 text-primary" />
											</span>
										</button>
									</div>
								</div>

								<!-- Delete Selected Button (visible in select mode) -->
								<UiButton
									v-if="isSelectMode && selectedCanvasCount > 0"
									variant="destructive"
									size="sm"
									class="w-full mt-4"
									@click="deleteSelectedCanvases"
								>
									<Icon name="lucide:trash-2" class="size-4" />
									Delete Selected ({{ selectedCanvasCount }})
								</UiButton>
							</UiCardContent>
						</UiCard>

						<!-- New Canvas Button -->
						<UiCard class="mt-auto">
							<UiCardContent class="p-4">
								<UiButton
									variant="outline"
									class="w-full"
									@click="toggleNewCanvasDropdown"
								>
									<Icon name="lucide:plus" class="size-4" />
									New Canvas
								</UiButton>

								<!-- New Canvas Form -->
								<div v-if="showNewCanvasDropdown" class="mt-4 space-y-2">
									<UiInput
										v-model="newCanvasName"
										placeholder="Canvas name"
										@keyup.enter="createNewCanvas"
									/>
									<div class="flex gap-2">
										<UiButton
											variant="ghost"
											size="sm"
											class="flex-1"
											@click="showNewCanvasDropdown = false"
										>
											Cancel
										</UiButton>
										<UiButton
											size="sm"
											class="flex-1"
											:disabled="!newCanvasName.trim()"
											@click="createNewCanvas"
										>
											Create
										</UiButton>
									</div>
								</div>
							</UiCardContent>
						</UiCard>

						<!-- Project Canvas Modal Button -->
						<UiCard>
							<UiCardContent class="p-4">
								<UiButton
									variant="outline"
									class="w-full"
									@click="openProjectCanvasModal"
								>
									<Icon name="lucide:monitor-play" class="size-4" />
									Project Management Canvas
								</UiButton>
							</UiCardContent>
						</UiCard>
					</div>

					<!-- Tests Tab Content -->
					<div v-if="activeTab === 'tests'" class="flex flex-1 flex-col overflow-y-auto">
						<UiCard>
							<UiCardHeader>
								<UiCardTitle class="flex items-center gap-2">
									<Icon name="lucide:flask-conical" class="size-4" />
									State Management Tests
								</UiCardTitle>
							</UiCardHeader>
							<UiCardContent class="space-y-4">
								<Phase1Test />
								<Phase2Test />
								<Phase3Test />
								<Phase4Test />
							</UiCardContent>
						</UiCard>
					</div>

					<!-- Views Tab Content -->
					<div v-if="activeTab === 'views'" class="flex flex-1 flex-col overflow-y-auto">
						<ViewManagementPanel
							v-if="organizationId && currentUserId"
							:organization-id="organizationId"
							:project-id="projectId"
							:current-user-id="currentUserId"
							:user-group-ids="userGroupIds"
							:all-nodes="nodes"
							:saved-canvases="savedCanvases"
							:current-canvas-id="currentCanvasId"
							:canvas-panel-ref="canvasPanelRef"
							@switch-to-original-panel="activeTab = 'canvas'"
							@view-switched="handleViewSwitched"
							@view-created="handleViewCreatedRefresh"
							@view-updated="handleViewUpdatedRefresh"
							@view-deleted="handleViewDeletedRefresh"
							@load-canvas="loadSavedCanvas"
						/>
						<UiCard v-else>
							<UiCardContent class="flex flex-col items-center justify-center py-8">
								<Icon name="lucide:alert-circle" class="size-12 text-yellow-400/50 mb-3" />
								<p class="text-sm text-muted-foreground mb-4 text-center">
									View management requires organization context
								</p>
							</UiCardContent>
						</UiCard>
					</div>
				</div>
			</UiScrollArea>
		</div>

		<!-- Project Canvas Modal -->
		<ProjectCanvasModal
			v-model:open="isProjectCanvasModalOpen"
		/>
	</aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useCanvasViews } from "~/components/canvas/composables/useCanvasViews";
import { useOscarData } from "~/composables/useOscarData";
import { useGlobalUserContext } from "~/composables/useGlobalUserContext";
import { useNodeMetadata } from "~/components/canvas/composables/useNodeMetadata";
import { useNodeComponentRegistry } from "~/components/canvas/composables/useNodeComponentRegistry";
import SearchBar from "~/components/Ui/SearchBar.vue";
import UiButton from "~/components/Ui/Button.vue";
import UiCard from "~/components/Ui/Card/Card.vue";
import UiCardContent from "~/components/Ui/Card/Content.vue";
import UiCardHeader from "~/components/Ui/Card/Header.vue";
import UiCardTitle from "~/components/Ui/Card/Title.vue";
import UiInput from "~/components/Ui/Input.vue";
import UiScrollArea from "~/components/Ui/ScrollArea/ScrollArea.vue";
import UiDivider from "~/components/Ui/Divider.vue";
import UiAvatar from "~/components/Ui/Avatar/Avatar.vue";
import UiAvatarImage from "~/components/Ui/Avatar/Image.vue";
import UiAvatarFallback from "~/components/Ui/Avatar/Fallback.vue";
import UiToggleGroup from "~/components/Ui/ToggleGroup/ToggleGroup.vue";
import UiToggleGroupItem from "~/components/Ui/ToggleGroup/ToggleGroupItem.vue";
import UiTooltip from "~/components/Ui/Tooltip/Tooltip.vue";
import UiTooltipTrigger from "~/components/Ui/Tooltip/Trigger.vue";
import UiTooltipContent from "~/components/Ui/Tooltip/Content.vue";
import UiDropdownMenu from "~/components/Ui/DropdownMenu/DropdownMenu.vue";
import UiDropdownMenuTrigger from "~/components/Ui/DropdownMenu/Trigger.vue";
import UiDropdownMenuContent from "~/components/Ui/DropdownMenu/Content.vue";
import UiDropdownMenuLabel from "~/components/Ui/DropdownMenu/Label.vue";
import UiDropdownMenuSeparator from "~/components/Ui/DropdownMenu/Separator.vue";
import UiDropdownMenuItem from "~/components/Ui/DropdownMenu/Item.vue";
import Phase1Test from "~/components/canvas/stores/core/__tests__/Phase1Test.vue";
import Phase2Test from "~/components/canvas/stores/core/__tests__/Phase2Test.vue";
import Phase3Test from "~/components/canvas/stores/persistence/__tests__/Phase3Test.vue";
import Phase4Test from "~/components/canvas/stores/organization/__tests__/Phase4Test.vue";
import ViewManagementPanel from "~/components/canvas/views/ViewManagementPanel.vue";
import ProjectCanvasModal from "~/components/Dashboard/ProjectCanvasModal.vue";

// Types
type ViewportType = {
	x: number;
	y: number;
	zoom: number;
};

type TabConfig = {
	id: "nodes" | "canvas" | "tests" | "views";
	title: string;
	icon: string;
	description: string;
};

// Props
const props = defineProps<{
	nodes?: any[]
	edges?: any[]
	viewport?: ViewportType
	canvasPanelRef?: any
}>();

// Emits
const emit = defineEmits<{
	addNode: [nodeType: string]
	clearCanvas: []
	fitView: []
	exportCanvas: []
	loadCanvas: [canvasData: any]
	canvasNameChanged: [name: string]
	autosave: [canvasData: any]
}>();

// State
const activeTab = ref<"nodes" | "canvas" | "tests" | "views" | null>("nodes");
const activeNodeCategory = ref<string>("shapes");
const showNewCanvasDropdown = ref(false);
const newCanvasName = ref("");
const sidebarRef = ref<HTMLElement | null>(null);
const editableCanvasName = ref("");
const contextMenuCanvas = ref<any>(null);
const contextMenuPosition = ref({ x: 0, y: 0 });
const nodeSearchQuery = ref("");
const selectedCanvasIds = ref<Set<string>>(new Set());
const isSelectMode = ref(false);
const isProjectCanvasModalOpen = ref(false);

// Tab configurations
const mainTabs: TabConfig[] = [
	{
		id: "nodes",
		title: "Nodes",
		icon: "lucide:shapes",
		description: "Browse and add nodes to your canvas"
	},
	{
		id: "canvas",
		title: "Canvas",
		icon: "lucide:layers",
		description: "Manage your saved canvases"
	},
	{
		id: "tests",
		title: "Tests",
		icon: "lucide:flask-conical",
		description: "State management and component tests"
	},
	{
		id: "views",
		title: "Views",
		icon: "lucide:eye",
		description: "Manage canvas views and permissions"
	}
];

const activeTabData = computed(() => {
	return mainTabs.find(tab => tab.id === activeTab.value) || mainTabs[0];
});

// Global organization and project context
const { currentOrganization: _currentOrganization, selectedProject: _selectedProject, selectedOrganisationId, selectedProjectId } = useOscarData();
const {
	currentUserEmail: globalUserEmail,
	currentUserIdentifier
} = useGlobalUserContext();

// Canvas persistence using BApi views
const {
	savedCanvases,
	currentCanvasId,
	currentCanvasName,
	isLoading,
	loadAllCanvases,
	createNewCanvas: createNewCanvasApi,
	loadCanvas: loadCanvasApi,
	saveCanvas: saveCanvasApi,
	deleteCanvas: deleteCanvasApi,
	setCurrentCanvasName
} = useCanvasViews();

// Composables - Node Metadata System
const { getNodesByCategory, getCategories } = useNodeMetadata();
const { isNodeTypeRegistered } = useNodeComponentRegistry();

// Computed values for view management
const organizationId = computed(() => {
	const orgId = selectedOrganisationId.value?.toString() || "";
	return orgId;
});

const projectId = computed(() => {
	const projId = selectedProjectId.value?.toString() || "";
	return projId;
});

const currentUserId = computed(() => {
	const userId = currentUserIdentifier.value;
	return userId;
});

const userGroupIds = computed(() => []);

// User avatar and name
const userName = computed(() => {
	const email = globalUserEmail.value || "";
	return email ? email.split("@")[0] : "User";
});

const userInitials = computed(() => {
	const name = userName.value || "";
	const parts = name.split(" ").filter(Boolean);
	if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
	if (parts.length === 1) return (parts[0][0] || "U").toUpperCase();
	return (globalUserEmail.value?.[0] || "U").toUpperCase();
});

const userAvatar = computed(() => {
	const name = encodeURIComponent(userName.value || "User");
	return `https://ui-avatars.com/api/?name=${name}&background=22272a&color=ffffff&size=64`;
});

// Computed - Dynamic node lists from metadata
const categories = computed(() => getCategories());

const nodesInCurrentCategory = computed(() => {
	let nodes = getNodesByCategory(activeNodeCategory.value as any)
		.filter((node) => isNodeTypeRegistered(node.id));

	// Apply search filter
	if (nodeSearchQuery.value) {
		const query = nodeSearchQuery.value.toLowerCase();
		nodes = nodes.filter((node) =>
			node.name.toLowerCase().includes(query)
			|| node.description?.toLowerCase().includes(query)
			|| node.id.toLowerCase().includes(query)
		);
	}

	return nodes;
});

// Computed - Selection helpers
const selectedCanvasCount = computed(() => selectedCanvasIds.value.size);

const allCanvasesSelected = computed(() => {
	return savedCanvases.value.length > 0 && selectedCanvasIds.value.size === savedCanvases.value.length;
});

const someCanvasesSelected = computed(() => {
	return selectedCanvasCount.value > 0 && !allCanvasesSelected.value;
});

// Node interaction methods
const handleSearchInput = () => {
	console.log("🔍 Searching for:", nodeSearchQuery.value);
};

const handleNodeClick = (node: any) => {
	console.log("➕ Node clicked - adding to canvas:", node.name);
	emit("addNode", node.id);
};

const handleNodeDoubleClick = (node: any) => {
	console.log("➕ Node double-clicked - adding to canvas:", node.name);
	emit("addNode", node.id);
};

const startDrag = (node: any, event: DragEvent) => {
	if (event.dataTransfer) {
		event.dataTransfer.setData("application/json", JSON.stringify({
			type: "node",
			nodeType: node.id,
			metadata: node
		}));
		event.dataTransfer.effectAllowed = "copy";
		console.log("🎯 Started dragging node:", node.name);
	}
};

// Canvas management methods
const updateCanvasName = async () => {
	setCurrentCanvasName(editableCanvasName.value);
	emit("canvasNameChanged", editableCanvasName.value);

	if (currentCanvasId.value && props.nodes && props.nodes.length > 0) {
		await saveCanvasApi(
			props.nodes || [],
			props.edges || [],
			props.viewport || { x: 0, y: 0, zoom: 1 }
		);
	}
};

const toggleNewCanvasDropdown = () => {
	showNewCanvasDropdown.value = !showNewCanvasDropdown.value;
};

const openProjectCanvasModal = () => {
	isProjectCanvasModalOpen.value = true;
};

const createNewCanvas = async () => {
	if (newCanvasName.value.trim()) {
		const newCanvas = await createNewCanvasApi(newCanvasName.value.trim());
		newCanvasName.value = "";
		showNewCanvasDropdown.value = false;
		if (newCanvas) {
			emit("loadCanvas", newCanvas);
		}
	}
};

const loadSavedCanvas = async (canvasId: string) => {
	const canvas = savedCanvases.value.find((c) => c.id === canvasId);
	if (canvas) {
		await loadCanvasApi(canvasId);
		emit("loadCanvas", canvas);
	}
};

const toggleCanvasSelection = (canvasId: string) => {
	if (selectedCanvasIds.value.has(canvasId)) {
		selectedCanvasIds.value.delete(canvasId);
	} else {
		selectedCanvasIds.value.add(canvasId);
	}
};

const toggleSelectAll = () => {
	if (allCanvasesSelected.value) {
		selectedCanvasIds.value.clear();
	} else {
		savedCanvases.value.forEach((canvas) => {
			selectedCanvasIds.value.add(canvas.id);
		});
	}
};

const deleteSelectedCanvases = async () => {
	for (const canvasId of selectedCanvasIds.value) {
		await deleteCanvasApi(canvasId);
	}
	selectedCanvasIds.value.clear();
	isSelectMode.value = false;
	await loadAllCanvases();
};

const showCanvasContextMenu = (event: MouseEvent, canvas: any) => {
	contextMenuCanvas.value = canvas;
	contextMenuPosition.value = { x: event.clientX, y: event.clientY };
	// Context menu implementation can be added here
};

// View management handlers
const handleViewSwitched = (view: any) => {
	console.log("👁️ View switched:", view);
};

const handleViewCreatedRefresh = () => {
	console.log("✅ View created");
};

const handleViewUpdatedRefresh = () => {
	console.log("✅ View updated");
};

const handleViewDeletedRefresh = () => {
	console.log("✅ View deleted");
};

// Sync editable canvas name with current canvas name
watch(currentCanvasName, (newValue) => {
	editableCanvasName.value = newValue;
});

// Autosave when canvas data changes
let autosaveTimeout: NodeJS.Timeout | null = null;

const autosaveCanvas = async () => {
	try {
		if (!currentCanvasId.value || !props.nodes || props.nodes.length === 0) {
			return;
		}

		await saveCanvasApi(
			props.nodes || [],
			props.edges || [],
			props.viewport || { x: 0, y: 0, zoom: 1 }
		);

		emit("autosave", {
			nodes: props.nodes,
			edges: props.edges,
			viewport: props.viewport
		});
	} catch (error) {
		console.error("❌ Autosave failed:", error);
	}
};

// Watch for canvas data changes and autosave
watch(() => [props.nodes, props.edges, props.viewport], () => {
	if (autosaveTimeout) {
		clearTimeout(autosaveTimeout);
	}

	autosaveTimeout = setTimeout(() => {
		autosaveCanvas();
	}, 1000);
}, { deep: true });

// Initialize
onMounted(async () => {
	// Load all saved canvases from the API
	await loadAllCanvases();

	// Try to load the last edited canvas
	const { loadLastEditedCanvas } = useCanvasViews();
	const lastCanvas = await loadLastEditedCanvas();
	if (lastCanvas) {
		emit("loadCanvas", lastCanvas);
	}
});

onUnmounted(() => {
	if (autosaveTimeout) {
		clearTimeout(autosaveTimeout);
	}
});
</script>

<style scoped>
@import "./NodeSidebarPanel.css";
</style>

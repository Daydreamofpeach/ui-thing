<template>
	<UiDialog :open="isOpen" @update:open="handleOpenChange">
		<UiDialogContent class="max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0">
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
						<UIcon name="i-lucide-monitor-play" class="size-5 text-primary" />
					</div>
					<div>
						<UiDialogTitle class="text-xl font-bold">
							BuildIt Studio
						</UiDialogTitle>
						<UiDialogDescription class="text-sm">
							Project Management Canvas
						</UiDialogDescription>
					</div>
				</div>
				<div v-if="organization" class="flex items-center gap-2">
					<UIcon name="i-lucide-building-2" class="size-4 text-muted-foreground" />
					<span class="text-sm text-muted-foreground">#{{ organization.id }}</span>
				</div>
			</div>

			<!-- Content -->
			<div v-if="!organization" class="flex-1 flex items-center justify-center p-8">
				<div class="text-center space-y-4">
					<UIcon name="i-lucide-alert-triangle" class="size-12 text-yellow-400/50 mx-auto" />
					<h3 class="text-lg font-semibold">No organization selected</h3>
					<p class="text-sm text-muted-foreground">
						Select an organization from the dashboard to access its project canvas.
					</p>
				</div>
			</div>

			<div v-else class="flex-1 min-h-0 overflow-hidden flex">
				<!-- Left Sidebar - Node Palette -->
				<div class="w-64 bg-muted border-r flex flex-col overflow-hidden">
					<div class="p-4 border-b">
						<h4 class="text-sm font-semibold mb-3">Node Palette</h4>
						<p class="text-xs text-muted-foreground mb-2">
							Click buttons below to add nodes to the canvas
						</p>
					</div>
					<div class="flex-1 overflow-y-auto p-4 space-y-4">
						<!-- Node Palette using ToggleGroup -->
						<div class="flex items-center justify-center">
							<UiToggleGroup type="multiple" class="flex flex-wrap gap-2 justify-center">
								<UiHoverCard
									v-for="nodeConfig in nodeConfigs"
									:key="nodeConfig.type"
								>
									<UiHoverCardTrigger as-child>
										<UiToggleGroupItem
											:value="nodeConfig.type"
											class="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border bg-background shadow-xs hover:shadow-md transition-shadow"
											:style="nodeConfig.color ? { borderColor: nodeConfig.color } : {}"
											@click="addNodeToCanvas(nodeConfig.type)"
										>
											<UIcon :name="nodeConfig.icon" class="h-8 w-8" :style="nodeConfig.iconColor ? { color: nodeConfig.iconColor } : {}" />
										</UiToggleGroupItem>
									</UiHoverCardTrigger>
									<UiHoverCardContent class="h-[460px] w-80 overflow-hidden rounded-lg p-0">
										<div class="group relative flex h-full w-full flex-col justify-end overflow-hidden">
											<!-- Node Preview Background -->
											<div 
												class="absolute inset-0 h-full w-full"
												:style="getPreviewBackgroundStyle(nodeConfig.color)"
											/>
											<div class="absolute inset-0 h-full w-full bg-background/50" />
											
											<!-- Preview Content -->
											<div class="relative h-[60%] w-full rounded-t-2xl bg-background border-t p-4 text-foreground transition-all group-hover:h-[70%]">
												<div class="flex items-center gap-3 mb-3">
													<div 
														class="w-12 h-12 rounded-lg flex items-center justify-center"
														:style="nodeConfig.color ? { background: nodeConfig.color } : { background: 'rgba(59, 130, 246, 0.2)' }"
													>
														<UIcon :name="nodeConfig.icon" class="h-6 w-6" :style="nodeConfig.iconColor ? { color: nodeConfig.iconColor } : { color: '#3b82f6' }" />
													</div>
													<div>
														<p class="text-lg leading-none font-semibold">{{ nodeConfig.label }}</p>
														<small class="text-sm opacity-70">{{ nodeConfig.category }}</small>
													</div>
												</div>
												
												<p v-if="nodeConfig.description" class="text-sm text-muted-foreground mb-4">
													{{ nodeConfig.description }}
												</p>
												
												<!-- Node Type Badge -->
												<div class="flex items-center gap-2 mb-4">
													<UiBadge variant="outline" class="text-xs">
														{{ nodeConfig.type }}
													</UiBadge>
												</div>
												
												<div class="mt-auto hidden transition-all group-hover:block">
													<UiButton 
														class="w-full"
														:style="nodeConfig.color ? { background: nodeConfig.color, borderColor: nodeConfig.color } : {}"
														@click.stop="addNodeToCanvas(nodeConfig.type)"
													>
														<UIcon name="i-lucide-plus" class="size-4 mr-2" />
														Add to Canvas
													</UiButton>
												</div>
											</div>
										</div>
									</UiHoverCardContent>
								</UiHoverCard>
							</UiToggleGroup>
						</div>
					</div>
				</div>

				<!-- Main Canvas Area -->
				<div class="flex-1 relative overflow-hidden bg-background">
					<!-- Help Indicator -->
					<div class="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
						<div class="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 text-xs">
							<UIcon name="i-lucide-info" class="size-3" />
							Press <kbd class="px-1.5 py-0.5 rounded bg-muted border">Esc</kbd> to close | Drag nodes from left panel | Connect nodes to create relationships
						</div>
					</div>

					<!-- Canvas Component -->
					<ClientOnly>
						<template #fallback>
							<div class="h-full w-full flex items-center justify-center">
								<div class="text-center">
									<UIcon name="i-lucide-loader-2" class="size-6 animate-spin mx-auto mb-2 text-primary" />
									<div class="text-sm text-muted-foreground">Initializing canvas...</div>
								</div>
							</div>
						</template>
						<CanvasPanel
							v-if="organization?.id"
							ref="canvasPanelRef"
							:project-id="organization.id"
							:organization-id="organization.id"
						/>
					</ClientOnly>
				</div>
			</div>

			<!-- Loading Overlay -->
			<div v-if="isInitializing" class="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
				<div class="flex flex-col items-center gap-3 p-6 rounded-lg border bg-background">
					<UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-primary" />
					<span class="text-sm font-medium">Preparing canvas...</span>
				</div>
			</div>
		</UiDialogContent>
	</UiDialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import type { WatchStopHandle } from "vue";
import CanvasPanel from "~/components/canvas/CanvasPanel.vue";
// CanvasSearch will be auto-imported by Nuxt - use component name directly in template
import { useCanvasPersistence } from "~/components/canvas/composables/useCanvasPersistence";
import UiDialog from "~/components/Ui/Dialog/Dialog.vue";
import UiDialogContent from "~/components/Ui/Dialog/Content.vue";
import UiDialogTitle from "~/components/Ui/Dialog/Title.vue";
import UiDialogDescription from "~/components/Ui/Dialog/Description.vue";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
import { useOscarData } from "~/composables/useOscarData";
import { useNodeMetadata } from "~/components/canvas/composables/useNodeMetadata";
import UiToggleGroup from "~/components/Ui/ToggleGroup/ToggleGroup.vue";
import UiToggleGroupItem from "~/components/Ui/ToggleGroup/ToggleGroupItem.vue";
import UiHoverCard from "~/components/Ui/HoverCard/HoverCard.vue";
import UiHoverCardTrigger from "~/components/Ui/HoverCard/Trigger.vue";
import UiHoverCardContent from "~/components/Ui/HoverCard/Content.vue";
import UiBadge from "~/components/Ui/Badge.vue";
import UiButton from "~/components/Ui/Button.vue";

interface Props {
	open: boolean
}

const props = defineProps<Props>();

const emit = defineEmits<{
	"update:open": [value: boolean]
}>();

const isOpen = computed({
	get: () => props.open,
	set: (value) => emit("update:open", value)
});

const handleOpenChange = (value: boolean) => {
	isOpen.value = value;
};

// Get organization from context
const { currentOrganization } = useOscarData();
const selectedOrgId = useSelectedOrganisationId();

const organization = computed(() => {
	if (currentOrganization.value) {
		return currentOrganization.value;
	}
	// Fallback: create a minimal organization object from selected org ID
	if (selectedOrgId.value) {
		return { id: selectedOrgId.value };
	}
	return null;
});

const canvasPanelRef = ref<any>(null);
const isCanvasInitialized = ref(false);
const isInitializing = ref(false);
const isCanvasReady = ref(false);
let stopAutoSave: WatchStopHandle | null = null;

// Canvas persistence
const {
	saveCanvas,
	setCurrentCanvasName,
	savedCanvases
} = useCanvasPersistence();

// Unique canvas ID for this organization's project management canvas
const projectCanvasId = computed(() => {
	if (!organization.value?.id) return "";
	return `project_management_canvas_${organization.value.id}`;
});

// Get node metadata
const { getNodeMetadata, getCategoryMetadata } = useNodeMetadata();

// Available node types that can be added with metadata
const availableNodeTypes = [
	"projectNode",
	"userManagementNode", 
	"taskNode",
	"orbitCardNode",
	"solutionNode",
	"integrationConnectionNode",
	"setupProjectNode",
	"ideStatusNode"
];

// Build node configs with metadata
const nodeConfigs = computed(() => {
	return availableNodeTypes.map(type => {
		const metadata = getNodeMetadata(type);
		const categoryMeta = metadata ? getCategoryMetadata(metadata.category) : null;
		
		return {
			type,
			label: metadata?.name || type,
			icon: metadata?.icon || "i-lucide-cube",
			color: metadata?.color || "rgba(59, 130, 246, 0.2)",
			iconColor: extractColorFromRgba(metadata?.color || "rgba(59, 130, 246, 0.7)"),
			description: metadata?.description || `Add a ${metadata?.name || type} node to the canvas`,
			category: categoryMeta?.name || metadata?.category || "Node"
		};
	});
});

// Extract solid color from rgba for icon
const extractColorFromRgba = (rgba: string): string => {
	if (!rgba) return "#3b82f6";
	const match = rgba.match(/rgba?\(([^)]+)\)/);
	if (match) {
		const parts = match[1].split(",").map(p => p.trim());
		if (parts.length >= 3) {
			// Convert to hex or return rgb
			const r = parseInt(parts[0]);
			const g = parseInt(parts[1]);
			const b = parseInt(parts[2]);
			return `rgb(${r}, ${g}, ${b})`;
		}
	}
	return rgba;
};

// Get preview background style with proper gradient
const getPreviewBackgroundStyle = (color: string | undefined) => {
	if (!color) {
		return { background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)' };
	}
	// Extract rgba values and create gradient with different opacity
	const match = color.match(/rgba?\(([^)]+)\)/);
	if (match) {
		const parts = match[1].split(",").map(p => p.trim());
		if (parts.length >= 3) {
			const r = parts[0];
			const g = parts[1];
			const b = parts[2];
			return { 
				background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.2) 0%, rgba(${r}, ${g}, ${b}, 0.05) 100%)` 
			};
		}
	}
	return { background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)' };
};

// Get all nodes from the canvas panel
const canvasNodes = computed(() => {
	if (!canvasPanelRef.value) {
		return [];
	}

	const allNodesRef = canvasPanelRef.value.allNodes;
	const nodes = allNodesRef?.value || allNodesRef || [];
	return Array.isArray(nodes) ? nodes : [];
});

// Handle canvas node selection from search (navigate to existing node)
const handleNodeSelect = (node: any) => {
	if (canvasPanelRef.value?.vueFlowFitView) {
		canvasPanelRef.value.vueFlowFitView({
			nodes: [node.id],
			duration: 600,
			padding: 0.8,
			maxZoom: 0.5,
			minZoom: 0.2
		});
	}
};

// Add node to canvas
const addNodeToCanvas = async (nodeType: string) => {
	console.log("➕ [ProjectCanvasModal] Adding node:", nodeType);
	console.log("🔍 [ProjectCanvasModal] Canvas readiness check:", {
		isCanvasReady: isCanvasReady.value,
		hasCanvasPanelRef: !!canvasPanelRef.value,
		hasHandleAddNode: !!canvasPanelRef.value?.handleAddNode
	});

	if (!isCanvasReady.value || !canvasPanelRef.value?.handleAddNode) {
		console.warn("⏳ [ProjectCanvasModal] Canvas not ready yet, waiting...");
		
		// Wait for canvas to be ready (up to 3 seconds)
		for (let i = 0; i < 30; i++) {
			await new Promise(resolve => setTimeout(resolve, 100));
			if (canvasPanelRef.value?.handleAddNode) {
				console.log("✅ [ProjectCanvasModal] Canvas ready, adding node");
				canvasPanelRef.value.handleAddNode(nodeType);
				return;
			}
		}
		
		console.error("❌ [ProjectCanvasModal] Canvas not ready after waiting");
		console.error("   Canvas ref:", canvasPanelRef.value);
		console.error("   Available methods:", canvasPanelRef.value ? Object.keys(canvasPanelRef.value) : "none");
		return;
	}

	console.log("✅ [ProjectCanvasModal] Calling handleAddNode for:", nodeType);
	canvasPanelRef.value.handleAddNode(nodeType);
};

// Handle adding new node from search
const handleNodeAdd = (nodeType: string) => {
	addNodeToCanvas(nodeType);
};

// Handle escape key to close modal
const handleKeyDown = (event: KeyboardEvent) => {
	if (event.key === "Escape" && isOpen.value) {
		isOpen.value = false;
	}
};

// Watch for canvas ref to become available
watch(() => canvasPanelRef.value, (newVal) => {
	if (newVal && newVal.handleAddNode) {
		isCanvasReady.value = true;
		console.log("✅ [ProjectCanvasModal] Canvas ref is now available and ready");
		console.log("   Has handleAddNode:", !!newVal.handleAddNode);
		console.log("   Available methods:", Object.keys(newVal));
	} else {
		isCanvasReady.value = false;
	}
}, { immediate: true, deep: true });

// Poll for canvas ref (similar to CanvasSection)
let pollInterval: ReturnType<typeof setInterval> | null = null;

const startPollingForCanvas = () => {
	if (pollInterval) {
		clearInterval(pollInterval);
	}
	
	// Poll for canvas to be ready
	const maxPolls = 50; // 5 seconds max
	let pollCount = 0;
	pollInterval = setInterval(() => {
		pollCount++;
		if (canvasPanelRef.value?.handleAddNode) {
			isCanvasReady.value = true;
			console.log("✅ [ProjectCanvasModal] Canvas detected via polling");
			if (pollInterval) {
				clearInterval(pollInterval);
				pollInterval = null;
			}
		} else if (pollCount >= maxPolls) {
			console.warn("⚠️ [ProjectCanvasModal] Canvas not ready after polling");
			if (pollInterval) {
				clearInterval(pollInterval);
				pollInterval = null;
			}
		}
	}, 100);
};

// Watch for modal open state and start polling
watch(() => isOpen.value, (open) => {
	if (open && organization.value?.id) {
		console.log("🔄 [ProjectCanvasModal] Modal opened, starting canvas polling");
		startPollingForCanvas();
	} else {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
		isCanvasReady.value = false;
	}
});

const disposeAutoSave = () => {
	if (stopAutoSave) {
		stopAutoSave();
		stopAutoSave = null;
	}
};

// Load canvas when view is initialized
const loadCanvasForProject = async () => {
	if (!projectCanvasId.value || !canvasPanelRef.value) return;

	try {
		const existingCanvas = savedCanvases.value.find((c: any) => c.id === projectCanvasId.value);

		if (existingCanvas) {
			if (canvasPanelRef.value.loadCanvasData) {
				canvasPanelRef.value.loadCanvasData(existingCanvas);
			}
		} else {
			setCurrentCanvasName(`${organization.value?.name || "Organization"} - Project Management`);
		}
	} catch (error) {
		console.error("❌ Failed to load canvas:", error);
	}
};

// Auto-save canvas when nodes or edges change
const setupAutoSave = () => {
	disposeAutoSave();

	if (!canvasPanelRef.value) return;

	stopAutoSave = watchEffect(() => {
		const nodes = canvasNodes.value;
		const edges = canvasPanelRef.value?.allEdges?.value || [];
		const viewport = canvasPanelRef.value?.viewport?.value || { x: 0, y: 0, zoom: 1 };

		if (nodes.length > 0 && isCanvasInitialized.value && projectCanvasId.value) {
			saveCanvas(nodes, edges, viewport, true, projectCanvasId.value);
		}
	});
};

// Manual save function
const saveCanvasNow = async () => {
	if (!canvasPanelRef.value || !projectCanvasId.value) return;

	const nodes = canvasNodes.value;
	const edges = canvasPanelRef.value.allEdges?.value || [];
	const viewport = canvasPanelRef.value.viewport?.value || { x: 0, y: 0, zoom: 1 };

	await saveCanvas(nodes, edges, viewport, false, projectCanvasId.value);
};

const initializeCanvas = async () => {
	if (!organization.value?.id) {
		isCanvasInitialized.value = false;
		isInitializing.value = false;
		disposeAutoSave();
		return;
	}

	isInitializing.value = true;
	isCanvasInitialized.value = false;

	try {
		disposeAutoSave();
		await nextTick();
		await loadCanvasForProject();
		setupAutoSave();
		isCanvasInitialized.value = true;
	} catch (error) {
		console.error("[ProjectCanvasModal] Failed to initialize canvas", error);
	} finally {
		isInitializing.value = false;
	}
};

watch(() => organization.value?.id, async () => {
	if (isOpen.value) {
		await initializeCanvas();
	}
}, { immediate: false });

watch(() => isOpen.value, async (newValue) => {
	if (newValue) {
		await initializeCanvas();
		window.addEventListener("keydown", handleKeyDown);
	} else {
		window.removeEventListener("keydown", handleKeyDown);
		if (canvasNodes.value.length > 0) {
			await saveCanvasNow();
		}
		disposeAutoSave();
	}
});

onMounted(() => {
	if (isOpen.value) {
		window.addEventListener("keydown", handleKeyDown);
		startPollingForCanvas();
	}
});

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeyDown);
	if (pollInterval) {
		clearInterval(pollInterval);
		pollInterval = null;
	}
	disposeAutoSave();
	if (canvasNodes.value.length > 0) {
		saveCanvasNow();
	}
});
</script>

<style scoped>
kbd {
	font-family: monospace;
	font-size: 0.75rem;
}
</style>

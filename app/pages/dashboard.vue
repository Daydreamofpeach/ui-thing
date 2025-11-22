<template>
	<NuxtLayout name="divideddashboard">
		<template #navbar>
			<div class="flex items-center gap-2 px-4 py-2">
				<div class="min-w-0 flex-1">
					<Mainnav />
				</div>
				<div class="shrink-0">
					<UserAvatarMenu />
				</div>
			</div>
		</template>
		<template #left>
			<!-- Canvas Sidebar - Alone on the left -->
						<NodeSidebarPanel
							:nodes="canvasNodes"
							:edges="canvasEdges"
							:viewport="canvasViewport"
							:canvas-panel-ref="canvasPanelRef"
							@addNode="onAddNode"
							@clearCanvas="onClearCanvas"
							@fitView="onFitView"
							@exportCanvas="onExportCanvas"
							@loadCanvas="onLoadCanvas"
							@canvasNameChanged="onCanvasNameChanged"
							@autosave="onAutosave"
						/>
		</template>

		<!-- Top (center) panel - Canvas always visible -->
		<template #default>
			<div class="h-full w-full relative bg-background">
				<CanvasSection ref="canvasSectionRef" />
		</div>
		</template>

		<!-- Right panel - Dashboard tabs, Organisation/Project selection and tab content -->
		<template #right>
			<div class="h-full flex flex-col border-l">
				<!-- Dashboard Tabs -->
				<div class="flex-shrink-0">
					<DashboardTabs v-model="tab" />
				</div>
				<!-- Organisation/Project Panel -->
				<div class="flex-shrink-0 p-4 border-b">
					<OrganisationProjectPanel />
				</div>
				<!-- Tab content -->
				<div class="flex-1 min-h-0 overflow-auto">
					<DashboardMain ref="dashboardMainRef" :current-tab="tab" />
				</div>
			</div>
		</template>
	</NuxtLayout>

	<!-- Note: right and navbar slots can be provided later -->
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from "vue";

// Shared state for the dashboard tab so inner components can switch tabs
const tab = useState<string>("dashboardTab", () => "Tasks");

definePageMeta({
	layout: false,
	middleware: ["auth"],
	name: "dashboard",
});

useHead({
	title: "Dashboard | Buildit",
});

import DashboardTabs from "~/components/dashboard/DashboardTabs.vue";
import DashboardMain from "~/components/dashboard/DashboardMain.vue";
import OrganisationProjectPanel from "~/components/dashboard/OrganisationProjectPanel.vue";
import UserAvatarMenu from "~/components/Ui/UserAvatarMenu.vue";
import NodeSidebarPanel from "~/components/canvas/panels/NodeSidebarPanel.vue";
import CanvasSection from "~/components/dashboard/sections/CanvasSection.vue";
import { computed } from "vue";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
import { useProjectSelection } from "~/composables/useProjectSelection";

const dashboardMainRef = ref<any | null>(null);
const canvasPanelRef = ref<any | null>(null);
const canvasSectionRef = ref<any | null>(null);
const selectedOrgId = useSelectedOrganisationId();
const { selectedProjectId } = useProjectSelection();

// Canvas state from CanvasPanel
const canvasNodes = computed(() => {
	if (!canvasPanelRef.value) return [];
	// allNodes is already a ref, so we access .value
	return canvasPanelRef.value.allNodes?.value || [];
});
const canvasEdges = computed(() => {
	if (!canvasPanelRef.value) return [];
	// allEdges is already a ref, so we access .value
	return canvasPanelRef.value.allEdges?.value || [];
});
const canvasViewport = computed(() => {
	if (!canvasPanelRef.value) return { x: 0, y: 0, zoom: 1 };
	// viewport is already a ref, so we access .value
	return canvasPanelRef.value.viewport?.value || { x: 0, y: 0, zoom: 1 };
});

// Sidebar handlers -> Canvas methods
async function onAddNode(nodeType: string) {
	console.log("➕ Dashboard: Adding node:", nodeType);
	console.log("🔍 Canvas ref check:", {
		hasCanvasSectionRef: !!canvasSectionRef.value,
		hasCanvasRef: !!canvasSectionRef.value?.canvasRef,
		hasCanvasPanelRef: !!canvasPanelRef.value,
		hasHandleAddNode: !!canvasPanelRef.value?.handleAddNode
	});
	
	// Try to get ref from canvasSection if not already set
	if (!canvasPanelRef.value && canvasSectionRef.value) {
		// Try multiple ways to get the canvas ref
		const canvasInstance = canvasSectionRef.value.canvasRef?.value || 
		                      canvasSectionRef.value.canvasPanelRef?.value ||
		                      canvasSectionRef.value.canvasPanelRef;
		
		if (canvasInstance) {
			canvasPanelRef.value = canvasInstance;
		console.log("✅ Canvas ref retrieved from canvasSection");
		} else {
			// Wait for canvas to be ready
			console.log("⏳ Canvas not ready, waiting...");
			for (let i = 0; i < 50; i++) {
				await new Promise(resolve => setTimeout(resolve, 100));
				const readyCanvas = canvasSectionRef.value?.canvasRef?.value || 
				                  canvasSectionRef.value?.canvasPanelRef?.value ||
				                  canvasSectionRef.value?.canvasPanelRef;
				if (readyCanvas?.handleAddNode) {
					canvasPanelRef.value = readyCanvas;
					console.log("✅ Canvas ref retrieved after waiting");
					break;
				}
			}
		}
	}
	
	// Also try using CanvasSection's handleAddNode method directly
	if (canvasSectionRef.value?.handleAddNode) {
		console.log("✅ Using CanvasSection.handleAddNode");
		canvasSectionRef.value.handleAddNode(nodeType);
		return;
	}
	
	if (canvasPanelRef.value?.handleAddNode) {
		console.log("✅ Using CanvasPanelRef.handleAddNode");
		canvasPanelRef.value.handleAddNode(nodeType);
	} else {
		console.error("❌ Canvas ref not available for adding node");
		console.error("   CanvasPanelRef:", canvasPanelRef.value);
		console.error("   CanvasSectionRef:", canvasSectionRef.value);
		console.error("   CanvasSection methods:", canvasSectionRef.value ? Object.keys(canvasSectionRef.value) : "null");
	}
}

function onClearCanvas() {
	canvasPanelRef.value?.clearAllNodes?.();
}

function onFitView() {
	canvasPanelRef.value?.fitView?.();
}

function onExportCanvas() {
	const data = { nodes: canvasNodes.value, edges: canvasEdges.value };
	navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
}

async function onLoadCanvas(canvasData: any) {
	console.log("📥 Dashboard: Loading canvas data:", canvasData);
	
	if (!canvasData) {
		console.warn("⚠️ Dashboard: No canvas data provided");
		return;
	}
	
	// Use CanvasSection's loadCanvasData method - it handles waiting for ClientOnly
	if (canvasSectionRef.value?.loadCanvasData) {
		try {
			await canvasSectionRef.value.loadCanvasData(canvasData);
			console.log("✅ Dashboard: Canvas data loaded via CanvasSection");
			
			// Also update canvasPanelRef if available for other operations
			nextTick(() => {
				const canvasInstance = canvasSectionRef.value?.canvasRef?.value;
				if (canvasInstance && !canvasPanelRef.value) {
					canvasPanelRef.value = canvasInstance;
					console.log("✅ Dashboard: Canvas ref connected");
				}
			});
			return;
		} catch (error) {
			console.error("❌ Dashboard: Error loading canvas via CanvasSection:", error);
		}
	}
	
	// If CanvasSection ref not available yet, wait for it
	console.log("⏳ Dashboard: CanvasSection ref not available, waiting...");
	let attempts = 0;
	const maxAttempts = 50; // 5 seconds
	
	while (attempts < maxAttempts) {
		await new Promise(resolve => setTimeout(resolve, 100));
		attempts++;
		
		if (canvasSectionRef.value?.loadCanvasData) {
			try {
				await canvasSectionRef.value.loadCanvasData(canvasData);
				console.log(`✅ Dashboard: Canvas data loaded after ${attempts} attempts`);
				
				// Update canvasPanelRef
				nextTick(() => {
					const canvasInstance = canvasSectionRef.value?.canvasRef?.value;
					if (canvasInstance && !canvasPanelRef.value) {
						canvasPanelRef.value = canvasInstance;
					}
				});
				return;
			} catch (error) {
				console.error("❌ Dashboard: Error loading canvas after wait:", error);
				return;
			}
		}
	}
	
	console.warn("⚠️ Dashboard: CanvasSection not available after waiting. CanvasSection ref:", !!canvasSectionRef.value, "loadCanvasData:", !!canvasSectionRef.value?.loadCanvasData);
}

function onCanvasNameChanged(name: string) {
	canvasPanelRef.value?.updateCanvasName?.(name);
}

function onAutosave(canvasData: any) {
	// Autosave is handled by CanvasPanel
	console.log("Autosave triggered:", canvasData);
}


// Watch for canvasSectionRef to become available and connect canvasPanelRef
let canvasRefWatcherStop: (() => void) | null = null;
let checkInterval: ReturnType<typeof setInterval> | null = null;

watch(() => canvasSectionRef.value, (section) => {
	// Clean up previous watcher and interval
	if (canvasRefWatcherStop) {
		canvasRefWatcherStop();
		canvasRefWatcherStop = null;
	}
	if (checkInterval) {
		clearInterval(checkInterval);
		checkInterval = null;
	}
	
	if (!section) return;
	
	// Watch the canvasRef.value - this will fire when CanvasPanel mounts inside ClientOnly
	canvasRefWatcherStop = watch(() => section.canvasRef?.value, (canvasInstance) => {
		if (canvasInstance && canvasInstance !== canvasPanelRef.value) {
			canvasPanelRef.value = canvasInstance;
			console.log("✅ Dashboard: Canvas ref connected via watcher");
		}
	}, { immediate: true });
	
	// Also poll as fallback (in case watcher doesn't work)
	let pollCount = 0;
	const maxPolls = 100; // 10 seconds
	checkInterval = setInterval(() => {
		pollCount++;
		const canvasInstance = section.canvasRef?.value;
		if (canvasInstance && canvasInstance !== canvasPanelRef.value) {
			canvasPanelRef.value = canvasInstance;
			console.log("✅ Dashboard: Canvas ref connected via polling");
			if (checkInterval) {
				clearInterval(checkInterval);
				checkInterval = null;
			}
			if (canvasRefWatcherStop) {
				canvasRefWatcherStop();
				canvasRefWatcherStop = null;
			}
		} else if (pollCount >= maxPolls) {
			if (checkInterval) {
				clearInterval(checkInterval);
				checkInterval = null;
			}
		}
	}, 100);
}, { immediate: true });

// Cleanup on unmount
onBeforeUnmount(() => {
	if (canvasRefWatcherStop) {
		canvasRefWatcherStop();
	}
	if (checkInterval) {
		clearInterval(checkInterval);
	}
});

// Auto-add organisation node when organisation is selected
let lastOrgId = ref<string | null>(null);
watch(selectedOrgId, (newOrgId) => {
	if (newOrgId && newOrgId !== lastOrgId.value && canvasPanelRef.value) {
		console.log("🏢 Organisation selected, adding organisation node:", newOrgId);
		lastOrgId.value = newOrgId;
		
		// Check if organisation node already exists
		const existingOrgNode = canvasNodes.value.find((n: any) => 
			(n.type === 'organisationNode' || n.type === 'organizationNode') && n.data?.organisationId === newOrgId
		);
		
		if (!existingOrgNode && canvasPanelRef.value.addNodeWithData) {
			// Add organisation node using addNodeWithData
			canvasPanelRef.value.addNodeWithData('organisationNode', {
				organisationId: newOrgId,
				label: `Organisation ${newOrgId}`,
				position: { x: 100, y: 100 }
			});
		}
	}
}, { immediate: true });

// Auto-add project node when project is selected
let lastProjectId = ref<string | null>(null);
watch(selectedProjectId, (newProjectId) => {
	if (newProjectId && newProjectId !== lastProjectId.value && canvasPanelRef.value) {
		console.log("📁 Project selected, adding project node:", newProjectId);
		lastProjectId.value = newProjectId;
		
		// Check if project node already exists
		const existingProjectNode = canvasNodes.value.find((n: any) => 
			n.type === 'projectNode' && n.data?.projectId === newProjectId
		);
		
		if (!existingProjectNode && canvasPanelRef.value.addNodeWithData) {
			// Find the organisation node to connect to
			const orgNode = canvasNodes.value.find((n: any) => 
				(n.type === 'organisationNode' || n.type === 'organizationNode') && n.data?.organisationId === selectedOrgId.value
			);
			
			// Add project node using addNodeWithData
			const projectNode = canvasPanelRef.value.addNodeWithData('projectNode', {
				projectId: newProjectId,
				organisationId: selectedOrgId.value,
				label: `Project ${newProjectId}`,
				position: orgNode ? { 
					x: orgNode.position.x + 300, 
					y: orgNode.position.y 
				} : { x: 400, y: 100 }
			});
			
			// Connect project node to organisation node if org node exists
			if (orgNode && projectNode && canvasPanelRef.value.addEdge) {
				nextTick(() => {
					canvasPanelRef.value.addEdge({
						source: orgNode.id,
						target: projectNode.id || projectNode,
						type: 'smoothstep',
						animated: true
					});
				});
			}
		}
	}
}, { immediate: true });
</script>

<style scoped>
/* Scrollbar styling for sidebar scroll container */
.sidebar-scroll-container::-webkit-scrollbar {
	width: 8px;
}

.sidebar-scroll-container::-webkit-scrollbar-track {
	background: rgba(var(--color-neutral-rgb), 0.05);
	border-radius: 4px;
}

.sidebar-scroll-container::-webkit-scrollbar-thumb {
	background: rgba(var(--color-primary-rgb), 0.3);
	border-radius: 4px;
	transition: background 0.2s;
}

.sidebar-scroll-container::-webkit-scrollbar-thumb:hover {
	background: rgba(var(--color-primary-rgb), 0.5);
}

/* Firefox scrollbar */
.sidebar-scroll-container {
	scrollbar-width: thin;
	scrollbar-color: rgba(var(--color-primary-rgb), 0.3) rgba(var(--color-neutral-rgb), 0.05);
}
</style>


<template>
	<div class="fixed inset-0 z-0 bg-background">
		<!-- Top info bar -->
		<div class="w-full border-b px-4 py-2 flex items-center justify-between">
			<div class="text-sm text-muted-foreground">
				<span class="font-medium text-foreground">Canvas</span>
				<span class="mx-2">•</span>
				<span>Project ID:</span>
				<span class="font-mono text-foreground ml-1">{{ projectId || '—' }}</span>
				<span class="mx-2">•</span>
				<span>Organisation ID:</span>
				<span class="font-mono text-foreground ml-1">{{ organisationId || '—' }}</span>
			</div>
			<div class="text-xs text-muted-foreground">
				Read-only identifiers shown for context
			</div>
		</div>

		<ClientOnly>
			<UiSplitter class="h-full w-full">
				<!-- Left: Sidebar -->
				<UiSplitterPanel collapsible :collapsed-size="0" :min-size="0" :default-size="22">
					<div class="h-full overflow-hidden">
						<CanvasManagementSidebar
							:canvas-panel-ref="canvasRef"
							@add-node="onAddNode"
						/>
					</div>
				</UiSplitterPanel>
				<UiSplitterHandle with-handle />

				<!-- Center: Canvas -->
				<UiSplitterPanel :default-size="56">
					<div class="h-full w-full overflow-hidden">
						<CanvasPanel 
							ref="canvasRef" 
							:project-id="projectId" 
							:organization-id="organisationId"
						/>
					</div>
				</UiSplitterPanel>
				<UiSplitterHandle with-handle />

				<!-- Right: Project/Task/User management panel -->
				<UiSplitterPanel collapsible :collapsed-size="0" :min-size="0" :default-size="22">
					<div class="h-full overflow-auto">
						<NodeCanvasRightPanel :project-id="projectId" :organization-id="organisationId" />
					</div>
				</UiSplitterPanel>
			</UiSplitter>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import UiSplitter from "~/components/Ui/Splitter/Splitter.vue";
import UiSplitterPanel from "~/components/Ui/Splitter/Panel.vue";
import UiSplitterHandle from "~/components/Ui/Splitter/Handle.vue";
import CanvasPanel from "~/components/canvas/CanvasPanel.vue";
import CanvasManagementSidebar from "~/components/canvas/panels/CanvasManagementSidebar.vue";
import NodeCanvasRightPanel from "~/components/canvas/panels/NodeCanvasRightPanel.vue";
import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";

definePageMeta({
	middleware: ["auth"],
	name: "canvas",
});

useHead({ title: "Canvas | Buildit" });

const route = useRoute();
const projectId = computed(() => String(route.query.projectId || ""));
const organisationId = computed(() => {
	// Prefer explicit query param, fallback to global selection
	return String((route.query.organisationId as string) || useSelectedOrganisationId().value || "");
});

const canvasRef = ref<any | null>(null);
const canvasNodes = computed(() => canvasRef.value?.allNodes?.value || []);
const canvasEdges = computed(() => canvasRef.value?.allEdges?.value || []);
const canvasViewport = computed(() => canvasRef.value?.viewport?.value || { x: 0, y: 0, zoom: 1 });

// Sidebar handlers -> Canvas methods
function onAddNode(nodeType: string) {
	canvasRef.value?.handleAddNode?.(nodeType);
}
function onFitView() {
	canvasRef.value?.fitView?.();
}
function onClearCanvas() {
	canvasRef.value?.clearAllNodes?.();
}
function onExportCanvas() {
	// optionally expose export in CanvasPanel; placeholder: copy JSON to clipboard
	const data = { nodes: canvasNodes.value, edges: canvasEdges.value };
	navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
}
function onLoadCanvas(canvasData: any) {
	canvasRef.value?.loadCanvasData?.(canvasData);
}
function onCanvasNameChanged(name: string) {
	canvasRef.value?.updateCanvasName?.(name);
}
function onAutosave(canvasData: any) {
	// could persist via views API if desired
}
</script>

<style scoped>
</style>


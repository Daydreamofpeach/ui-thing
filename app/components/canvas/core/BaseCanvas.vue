<template>
	<div class="base-canvas-wrapper" style="width: 100%; height: 100%;">
		<!-- Vue Flow Container - Always render with explicit size -->
		<div class="vue-flow-wrapper" style="width: 100%; height: 100%; position: relative;">
			<!-- Fallback content if canvas is empty -->
			<div v-if="nodes.length === 0" class="flex items-center justify-center h-full text-muted-foreground" style="position: absolute; inset: 0; z-index: 10;">
				<div class="text-center">
					<Icon name="lucide:plus-circle" class="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
					<h3 class="text-lg font-semibold mb-2">
						No Schematics
					</h3>
					<p class="text-sm">
						Use the sidebar to add nodes and start building your workflow
					</p>
				</div>
			</div>

			<VueFlow
				ref="vueFlowRef"
				:nodes="nodes"
				:edges="edges"
				:node-types="_props.nodeTypes"
				:min-zoom="minZoom"
				:max-zoom="maxZoom"
				:auto-connect="autoConnect"
				:nodes-draggable="nodesDraggable"
				:zoom-on-scroll="zoomOnScroll"
				:pan-on-scroll="panOnScroll"
				:fit-view-on-init="fitViewOnInit"
				:zoom-on-double-click="zoomOnDoubleClick"
				:zoom-on-pinch="zoomOnPinch"
				class="vue-flow-container"
				style="width: 100%; height: 100%;"
				@nodes-change="emit('nodesChange', $event)"
				@node-click="handleNodeClick"
				@ready="handleReady"
			>
				<Background
					variant="dots"
					:gap="20"
					:size="3"
					:pattern-color="patternColor"
				/>

				<MiniMap
					:node-color="nodeColor"
					:node-stroke-width="2"
					mask-color="rgba(59, 130, 246, 0.2)"
					mask-stroke-color="rgba(59, 130, 246, 0.6)"
					:mask-stroke-width="2"
					:pannable="true"
					:zoomable="true"
					position="bottom-right"
					class="dark-minimap"
				/>

				<Controls />

				<!-- Forward all named slots to VueFlow -->
				<template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
					<slot :name="name" v-bind="slotProps" />
				</template>
			</VueFlow>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Background } from "@vue-flow/background";
	import { Controls } from "@vue-flow/controls";
	import { VueFlow } from "@vue-flow/core";
	import { MiniMap } from "@vue-flow/minimap";
	import { computed, ref, watch } from "vue";
	import Icon from "~/components/Ui/Icon.vue";

	interface Props {
		nodes: any[]
		edges: any[]
		nodeTypes?: any
		nodeColor?: (node: any) => string
		minZoom?: number
		maxZoom?: number
		autoConnect?: boolean
		nodesDraggable?: boolean
		zoomOnScroll?: boolean
		panOnScroll?: boolean
		fitViewOnInit?: boolean
		zoomOnDoubleClick?: boolean
		zoomOnPinch?: boolean
	}

	const _props = withDefaults(defineProps<Props>(), {
		nodeTypes: () => ({}),
		minZoom: 0.05,
		maxZoom: 5,
		autoConnect: false,
		nodesDraggable: true,
		zoomOnScroll: true,
		panOnScroll: false,
		fitViewOnInit: false,
		zoomOnDoubleClick: true,
		zoomOnPinch: true,
		nodeColor: () => () => "#6366f1"
	});

	const emit = defineEmits<{
		nodesChange: [changes: any[]]
		connectionCreated: [edge: any]
		nodeClicked: [node: any]
		nodeClick: [node: any]
		edgeClicked: [edge: any]
		viewportChange: [viewport: any]
	}>();

	const vueFlowRef = ref<any>(null);
	const isReady = ref(false);

	// Theme-aware pattern color for background dots
	// Use CSS variable with opacity - VueFlow Background component accepts CSS color strings
	const patternColor = computed(() => {
		// Use muted-foreground with low opacity for subtle pattern
		return "hsl(var(--muted-foreground) / 0.1)";
	});

	/**
	 * Handle VueFlow ready event
	 */
	const handleReady = (instance: any) => {
		isReady.value = true;
		vueFlowRef.value = instance;
		console.log("✅ BaseCanvas: VueFlow is ready");
		emit("ready", instance);
	};

	/**
	 * Handle node click
	 */
	const handleNodeClick = ({ node }: { node: any }) => {
		console.log("🖱️ BaseCanvas: Node clicked:", node.id, node.type);
		emit("nodeClick", node);
		emit("nodeClicked", node);
	};

	// Debug: Watch nodes prop
	watch(() => _props.nodes, (newNodes) => {
		console.log(`🎨 BaseCanvas: Nodes updated, count: ${newNodes?.length || 0}`, newNodes);
	}, { immediate: true });

	// Expose ref and ready state
	defineExpose({
		vueFlowRef,
		isReady
	});
</script>

<style scoped>
	.base-canvas-wrapper {
		height: 100%;
		width: 100%;
		min-height: 0;
		position: relative;
	}

	.vue-flow-container {
		height: 100% !important;
		width: 100% !important;
	}
</style>

<style>
	/* Dark minimap styling - Fix positioning and appearance */
	.dark-minimap {
		position: absolute !important;
		bottom: 20px !important;
		right: 20px !important;
		background: rgba(17, 24, 39, 0.95) !important;
		border: 1px solid rgba(59, 130, 246, 0.4) !important;
		border-radius: 8px !important;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
		padding: 8px !important;
		z-index: 10 !important;
		width: 200px !important;
		height: 150px !important;
		min-width: auto !important;
		min-height: auto !important;
		max-width: 100% !important;
		max-height: 100% !important;
	}

	.dark-minimap canvas {
		border-radius: 4px !important;
		background: rgba(0, 0, 0, 0.6) !important;
	}

	.dark-minimap svg {
		border-radius: 4px !important;
	}

	/* Style minimap viewport indicator */
	.dark-minimap .react-flow__minimap-mask {
		fill: rgba(59, 130, 246, 0.1) !important;
		stroke: rgba(59, 130, 246, 0.6) !important;
		stroke-width: 2 !important;
	}
</style>
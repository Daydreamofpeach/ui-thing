<template>
	<div class="config-panel-node-wrapper">
		<!-- Provide a minimal VueFlow context -->
		<VueFlow
			:nodes="[nodeProps]"
			:edges="[]"
			:nodes-draggable="false"
			:zoom-on-scroll="false"
			:pan-on-scroll="false"
			:zoom-on-double-click="false"
			:zoom-on-pinch="false"
			:fit-view-on-init="false"
			class="invisible-vueflow"
		>
			<template #[`node-${nodeProps.type}`]="slotProps">
				<slot :node-props="slotProps" />
			</template>
		</VueFlow>
	</div>
</template>

<script setup lang="ts">
	import { VueFlow } from "@vue-flow/core";
	import "@vue-flow/core/dist/style.css";

	interface Props {
		nodeProps: any;
	}

	defineProps<Props>();
</script>

<style scoped>
.config-panel-node-wrapper {
	width: 100%;
	min-height: 400px;
	display: flex;
	align-items: flex-start;
	justify-content: center;
}

/* Hide all VueFlow UI */
.invisible-vueflow {
	width: 100% !important;
	height: auto !important;
	min-height: 400px !important;
	background: transparent !important;
}

.invisible-vueflow :deep(.vue-flow__background),
.invisible-vueflow :deep(.vue-flow__controls),
.invisible-vueflow :deep(.vue-flow__minimap),
.invisible-vueflow :deep(.vue-flow__attribution),
.invisible-vueflow :deep(.vue-flow__handle),
.invisible-vueflow :deep(.connection-handle),
.invisible-vueflow :deep([class*="handle"]) {
	display: none !important;
	opacity: 0 !important;
	pointer-events: none !important;
}

.invisible-vueflow :deep(.vue-flow__pane) {
	cursor: default !important;
	pointer-events: none !important;
}

.invisible-vueflow :deep(.vue-flow__transformationpane) {
	pointer-events: none !important;
}

.invisible-vueflow :deep(.vue-flow__node) {
	pointer-events: auto !important;
	position: static !important;
	transform: none !important;
	cursor: default !important;
}

.invisible-vueflow :deep(.vue-flow__node) * {
	pointer-events: auto !important;
}

/* Hide all VueFlow node decorations */
.invisible-vueflow :deep(.vue-flow__node-default),
.invisible-vueflow :deep(.vue-flow__node-input),
.invisible-vueflow :deep(.vue-flow__node-output) {
	padding: 0 !important;
	border: none !important;
	background: transparent !important;
}

/* Ensure node is not draggable */
.invisible-vueflow :deep(.vue-flow__node.draggable) {
	cursor: default !important;
}

/* Center the node */
.invisible-vueflow :deep(.vue-flow__viewport) {
	transform: none !important;
}

.invisible-vueflow :deep(.vue-flow__transformationpane) {
	transform: none !important;
}
</style>


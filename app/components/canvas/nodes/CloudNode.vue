<template>
	<div v-if="customNodeProps" class="shape-node programming-icon">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<div class="cloud-visual">
			<div class="cloud-shape" />
			<input
				v-model="customNodeProps.data.text"
				class="shape-content editable-label"
				placeholder="Cloud"
				@blur="updateNodeData(customNodeProps.id, 'text', customNodeProps.data.text)"
			>
		</div>
		<NodeResizer
			v-if="customNodeProps.selected"
			:min-width="80"
			:min-height="60"
		/>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";

interface Props {
	customNodeProps: any;
	updateNodeData: (nodeId: string, key: string, value: any) => void;
}

defineProps<Props>();
</script>

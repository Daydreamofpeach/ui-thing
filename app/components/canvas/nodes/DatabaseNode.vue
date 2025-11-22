<template>
	<div v-if="customNodeProps" class="shape-node programming-icon">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<div class="database-visual">
			<div class="database-top" />
			<div class="database-body" />
			<div class="database-bottom" />
			<input
				v-model="customNodeProps.data.text"
				class="shape-content editable-label"
				placeholder="Database"
				@blur="updateNodeData(customNodeProps.id, 'text', customNodeProps.data.text)"
			>
		</div>
		<NodeResizer
			v-if="customNodeProps.selected"
			:min-width="60"
			:min-height="80"
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

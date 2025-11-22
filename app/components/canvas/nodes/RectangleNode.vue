<template>
	<div v-if="customNodeProps" class="shape-node rectangle-shape">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />
		
		<div class="rectangle-shape-visual">
			<input
				v-model="customNodeProps.data.text"
				class="shape-content editable-label"
				placeholder="Rectangle"
				@blur="updateNodeData(customNodeProps.id, 'text', customNodeProps.data.text)"
			>
		</div>
		<NodeResizer
			v-if="customNodeProps.selected"
			:min-width="50"
			:min-height="30"
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


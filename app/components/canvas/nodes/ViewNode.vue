<template>
	<div v-if="customNodeProps" class="enhanced-node view-node">
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />
		<NodeResizer v-if="customNodeProps.selected" :min-width="200" :min-height="120" />
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:eye" class="w-4 h-4 text-green-600" />
				<h3 class="text-sm font-semibold text-green-600">
					{{ customNodeProps.data?.label || 'View Node' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full" :class="customNodeProps.data?.viewType ? 'bg-green-500' : 'bg-gray-500'" />
				<span class="text-xs" :class="customNodeProps.data?.viewType ? 'text-green-500/70' : 'text-gray-500/70'">
					{{ customNodeProps.data?.viewType ? 'Configured' : 'Not Configured' }}
				</span>
			</div>
		</div>
		<div class="node-details">
			<div class="detail-row">
				<span class="detail-label">View Type</span>
				<span class="detail-value">{{ customNodeProps.data?.viewType || 'No view selected' }}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Status</span>
				<span class="detail-value" :class="getStatusClass(customNodeProps.data?.status)">
					{{ customNodeProps.data?.status || 'Inactive' }}
				</span>
			</div>
		</div>
		<div class="node-actions">
			<button
				v-if="!customNodeProps.data?.viewType"
				class="configure-view-button"
				@click="openViewSelector(customNodeProps.id)"
			>
				<Icon name="lucide:settings" class="w-3 h-3" />
				Configure View
			</button>
			<div v-else class="configured-indicator">
				<Icon name="lucide:check-circle" class="w-3 h-3" />
				Configured
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { Handle, Position } from "@vue-flow/core";
	import { NodeResizer } from "@vue-flow/node-resizer";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		openViewSelector: (nodeId: string) => void
		getStatusClass: (status: string) => string
	}

	defineProps<Props>();
</script>

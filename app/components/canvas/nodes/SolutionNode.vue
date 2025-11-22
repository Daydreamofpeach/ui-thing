<template>
	<div v-if="customNodeProps" class="enhanced-node solution-node">
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />
		<NodeResizer v-if="customNodeProps.selected" :min-width="200" :min-height="120" />
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:puzzle" class="w-4 h-4 text-emerald-500" />
				<h3 class="text-sm font-semibold text-emerald-500">
					{{ customNodeProps.data?.label || 'Solution Node' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full" :class="customNodeProps.data?.solutionId ? 'bg-emerald-500' : 'bg-gray-500'" />
				<span class="text-xs" :class="customNodeProps.data?.solutionId ? 'text-emerald-500/70' : 'text-gray-500/70'">
					{{ customNodeProps.data?.solutionId ? 'Configured' : 'Not Configured' }}
				</span>
			</div>
		</div>
		<div class="node-details">
			<div class="detail-row">
				<span class="detail-label">Solution Name</span>
				<span class="detail-value">{{ customNodeProps.data?.solutionName || 'No solution' }}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Type</span>
				<span class="detail-value">{{ customNodeProps.data?.solutionType || 'feature' }}</span>
			</div>
			<div v-if="customNodeProps.data?.description" class="detail-row">
				<span class="detail-label">Description</span>
				<span class="detail-value text-xs">{{ customNodeProps.data?.description }}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Status</span>
				<span class="detail-value" :class="getStatusClass(customNodeProps.data?.status)">
					{{ customNodeProps.data?.status || 'Inactive' }}
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Handle, Position } from "@vue-flow/core";
	import { NodeResizer } from "@vue-flow/node-resizer";

	const props = defineProps<{
		customNodeProps: any
		updateNodeData?: (nodeId: string, key: string, value: any) => void
	}>();

	const getStatusClass = (status: string) => {
		if (!status) return "text-gray-500";
		const statusLower = status.toLowerCase();
		if (statusLower === "active" || statusLower === "configured") return "text-emerald-500";
		if (statusLower === "inactive" || statusLower === "pending") return "text-yellow-500";
		return "text-gray-500";
	};
</script>

<style scoped>
.enhanced-node {
	background: rgba(17, 24, 39, 0.95);
	border: 1.5px solid rgba(16, 185, 129, 0.3);
	border-radius: 12px;
	padding: 16px;
	min-width: 220px;
	box-shadow:
		0 4px 12px rgba(0, 0, 0, 0.3),
		inset 0 1px 0 rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.enhanced-node:hover {
	border-color: rgba(16, 185, 129, 0.5);
	box-shadow:
		0 8px 24px rgba(16, 185, 129, 0.2),
		inset 0 1px 0 rgba(255, 255, 255, 0.15);
	transform: translateY(-2px);
}

.node-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
	padding-bottom: 8px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.node-details {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.detail-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 8px;
}

.detail-label {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.5);
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	flex-shrink: 0;
}

.detail-value {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.9);
	font-weight: 600;
	text-align: right;
	word-break: break-word;
}

.connection-handle {
	width: 10px;
	height: 10px;
	background: rgba(16, 185, 129, 0.6);
	border: 2px solid rgba(16, 185, 129, 0.9);
	transition: all 0.2s ease;
}

.connection-handle:hover {
	width: 12px;
	height: 12px;
	background: rgba(16, 185, 129, 0.8);
	border-color: rgba(16, 185, 129, 1);
	box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}
</style>


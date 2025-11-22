<template>
	<div v-if="customNodeProps" class="enhanced-node github-node">
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />
		<NodeResizer v-if="customNodeProps.selected" :min-width="200" :min-height="120" />
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:github" class="w-4 h-4 text-gray-600" />
				<h3 class="text-sm font-semibold text-gray-600">
					{{ customNodeProps.data?.label || 'GitHub Node' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full" :class="customNodeProps.data?.repository ? 'bg-gray-500' : 'bg-gray-500'" />
				<span class="text-xs" :class="customNodeProps.data?.repository ? 'text-gray-500/70' : 'text-gray-500/70'">
					{{ customNodeProps.data?.repository ? 'Connected' : 'Not Connected' }}
				</span>
			</div>
		</div>
		<div class="node-details">
			<div class="detail-row">
				<span class="detail-label">Repository</span>
				<span class="detail-value">{{ customNodeProps.data?.repository || 'No repository connected' }}</span>
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
				v-if="!customNodeProps.data?.repository"
				class="connect-github-button"
				@click="connectGitHubRepositoryWrapper(customNodeProps.id)"
			>
				<Icon name="lucide:link" class="w-3 h-3" />
				Connect Repository
			</button>
			<div v-else class="configured-indicator">
				<Icon name="lucide:check-circle" class="w-3 h-3" />
				Connected
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
		getStatusClass: (status: string) => string
		connectGitHubRepositoryWrapper: (nodeId: string) => void
	}

	defineProps<Props>();
</script>

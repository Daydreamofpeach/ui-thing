<template>
	<div class="viewport-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Node Resizer (only show when selected) -->
		<NodeResizer
			v-if="nodeProps?.selected"
			:min-width="300"
			:min-height="200"
		/>

		<!-- Header -->
		<div class="viewport-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:monitor" class="w-4 h-4 text-blue-600" />
				<h3 class="text-sm font-semibold text-blue-600">
					{{ nodeProps?.data?.label || 'Viewport' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full" :class="hasData ? 'bg-blue-500' : 'bg-gray-500'"></div>
				<span class="text-xs" :class="hasData ? 'text-blue-500/70' : 'text-gray-500/70'">
					{{ hasData ? 'Data Available' : 'No Data' }}
				</span>
			</div>
		</div>

		<!-- Data Display Area -->
		<div class="viewport-content">
			<div v-if="!hasData" class="no-data-state">
				<Icon name="lucide:database-x" class="w-8 h-8 text-gray-400 mb-2" />
				<p class="text-sm text-gray-500">No data connected</p>
				<p class="text-xs text-gray-400">Connect a data source to view content</p>
			</div>
			
			<div v-else class="data-display">
				<!-- Data Source Info -->
				<div class="data-source-info">
					<div class="flex items-center gap-2 mb-2">
						<Icon :name="getSourceIcon(connectedData?.sourceType)" class="w-4 h-4 text-gray-600" />
						<span class="text-xs font-medium text-gray-600">{{ connectedData?.sourceType || 'Unknown' }} Data</span>
						<span class="text-xs text-gray-500">•</span>
						<span class="text-xs text-gray-500">{{ formatTimestamp(connectedData?.timestamp) }}</span>
					</div>
				</div>

				<!-- Data Content -->
				<div class="data-content">
					<DataDisplaySection
						:data="connectedData?.data"
						:view-type="nodeProps?.data?.viewType || 'json'"
						:format="nodeProps?.data?.format || 'output'"
					/>
				</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="viewport-actions">
			<button
				class="action-button refresh-button"
				@click="$emit('refresh-data', nodeProps?.id)"
				:disabled="!hasData"
			>
				<Icon name="lucide:refresh-cw" class="w-3 h-3" />
				Refresh
			</button>
			<button
				class="action-button export-button"
				@click="$emit('export-data', nodeProps?.id)"
				:disabled="!hasData"
			>
				<Icon name="lucide:download" class="w-3 h-3" />
				Export
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import { NodeResizer } from '@vue-flow/node-resizer';
import DataDisplaySection from '@canvas/viewers/DataDisplaySection.vue';

interface Props {
	nodeProps?: any;
	connectedData?: {
		sourceType: string;
		data: any;
		timestamp: string;
	};
}

const props = withDefaults(defineProps<Props>(), {
	nodeProps: undefined,
	connectedData: undefined
});

const emit = defineEmits<{
	'refresh-data': [nodeId: string];
	'export-data': [nodeId: string];
}>();

const hasData = computed(() => {
	return props.connectedData?.data != null;
});

const getSourceIcon = (sourceType?: string) => {
	const icons: Record<string, string> = {
		github: 'simple-icons:github',
		git: 'lucide:git-branch',
		api: 'lucide:globe',
		command: 'lucide:terminal',
		event: 'lucide:zap',
		hook: 'lucide:webhook',
		transport: 'lucide:send',
		template: 'lucide:layout-template',
		view: 'lucide:layout-grid'
	};
	return icons[sourceType?.toLowerCase() || ''] || 'lucide:database';
};

const formatTimestamp = (timestamp?: string) => {
	if (!timestamp) return 'Unknown time';
	const date = new Date(timestamp);
	return date.toLocaleTimeString();
};
</script>

<style scoped>
.viewport-node {
	background-color: white;
	border: 2px solid #dbeafe;
	border-radius: 0.5rem;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	min-width: 300px;
	min-height: 200px;
	display: flex;
	flex-direction: column;
}

.viewport-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem;
	border-bottom: 1px solid #dbeafe;
	background-color: rgba(239, 246, 255, 0.5);
}

.viewport-content {
	flex: 1;
	padding: 0.75rem;
	overflow: hidden;
}

.no-data-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	text-align: center;
}

.data-display {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.data-source-info {
	border-bottom: 1px solid #e5e7eb;
	padding-bottom: 0.5rem;
	margin-bottom: 0.75rem;
}

.data-content {
	flex: 1;
	overflow: auto;
}

.viewport-actions {
	display: flex;
	gap: 0.5rem;
	padding: 0.75rem;
	border-top: 1px solid #dbeafe;
	background-color: rgba(239, 246, 255, 0.5);
}

.action-button {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	padding: 0.375rem 0.75rem;
	font-size: 0.75rem;
	font-weight: 500;
	border-radius: 0.375rem;
	transition: all 0.15s ease-in-out;
}

.refresh-button {
	background-color: #dbeafe;
	color: #1d4ed8;
}

.refresh-button:hover:not(:disabled) {
	background-color: #bfdbfe;
}

.refresh-button:disabled {
	background-color: #f3f4f6;
	color: #9ca3af;
}

.export-button {
	background-color: #dcfce7;
	color: #15803d;
}

.export-button:hover:not(:disabled) {
	background-color: #bbf7d0;
}

.export-button:disabled {
	background-color: #f3f4f6;
	color: #9ca3af;
}

.connection-handle {
	width: 0.75rem;
	height: 0.75rem;
	background-color: #3b82f6;
	border: 2px solid white;
	border-radius: 50%;
}
</style>

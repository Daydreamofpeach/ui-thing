<template>
	<div v-if="customNodeProps" class="enhanced-node command-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

		<!-- Node Resizer (only show when selected) -->
		<NodeResizer
			v-if="customNodeProps.selected"
			:min-width="200"
			:min-height="120"
		/>

		<!-- Header -->
		<div class="node-header">
			<div class="flex items-center gap-2">
				<Icon name="lucide:terminal" class="w-4 h-4 text-blue-600" />
				<h3 class="text-sm font-semibold text-blue-600">
					{{ customNodeProps.data?.label || 'Command Node' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full" :class="customNodeProps.data?.commandName ? 'bg-blue-500' : 'bg-gray-500'" />
				<span class="text-xs" :class="customNodeProps.data?.commandName ? 'text-blue-500/70' : 'text-gray-500/70'">
					{{ customNodeProps.data?.commandName ? 'Configured' : 'Not Configured' }}
				</span>
			</div>
		</div>

		<!-- Node Details -->
		<div class="node-details">
			<div class="detail-row">
				<span class="detail-label">Command</span>
				<span class="detail-value">{{ customNodeProps.data?.commandName || 'No command selected' }}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Category</span>
				<span class="detail-value">{{ getCommandCategory(customNodeProps.data?.commandName) }}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Type</span>
				<span class="detail-value">{{ customNodeProps.data?.commandType || 'PowerShell' }}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Status</span>
				<span class="detail-value" :class="getStatusClass(customNodeProps.data?.status)">
					{{ customNodeProps.data?.status || 'Inactive' }}
				</span>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="node-actions">
			<button
				class="action-button configure-command-button"
				@click="openCommandSelector(customNodeProps.id)"
			>
				{{ customNodeProps.data?.commandName ? 'Change Command' : 'Configure Command' }}
			</button>
			<button
				v-if="customNodeProps.data?.commandName"
				class="action-button test-command-button"
				@click="testCommand(customNodeProps.id)"
			>
				Test Command
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";

interface Props {
	customNodeProps: any;
	getCommandCategory: (commandName?: string) => string;
	getStatusClass: (status?: string) => string;
	openCommandSelector: (nodeId: string) => void;
	testCommand: (nodeId: string) => void;
}

defineProps<Props>();
</script>


<template>
	<div v-if="customNodeProps" class="enhanced-node event-node">
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
				<Icon name="lucide:zap" class="w-4 h-4 text-orange-600" />
				<h3 class="text-sm font-semibold text-orange-600">
					{{ customNodeProps.data?.label || 'Event Node' }}
				</h3>
			</div>
			<div class="flex items-center gap-1">
				<div class="w-2 h-2 rounded-full" :class="customNodeProps.data?.eventName ? 'bg-orange-500' : 'bg-gray-500'" />
				<span class="text-xs" :class="customNodeProps.data?.eventName ? 'text-orange-500/70' : 'text-gray-500/70'">
					{{ customNodeProps.data?.eventName ? 'Configured' : 'Not Configured' }}
				</span>
			</div>
		</div>

		<!-- Node Details -->
		<div class="node-details">
			<div class="detail-row">
				<span class="detail-label">Event Type</span>
				<span class="detail-value">{{ customNodeProps.data?.eventName || 'No event selected' }}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Category</span>
				<span class="detail-value">{{ getEventCategory(customNodeProps.data?.eventName) }}</span>
			</div>
			<div class="detail-row">
				<span class="detail-label">Trigger</span>
				<span class="detail-value">{{ customNodeProps.data?.trigger || 'Manual' }}</span>
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
				class="action-button configure-event-button"
				@click="openEventSelector(customNodeProps.id)"
			>
				{{ customNodeProps.data?.eventName ? 'Change Event' : 'Configure Event' }}
			</button>
			<button
				v-if="customNodeProps.data?.eventName"
				class="action-button test-event-button"
				@click="testEvent(customNodeProps.id)"
			>
				Test Event
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { Handle, Position } from "@vue-flow/core";
	import { NodeResizer } from "@vue-flow/node-resizer";

	interface Props {
		customNodeProps: any
		getEventCategory: (eventName?: string) => string
		getStatusClass: (status?: string) => string
		openEventSelector: (nodeId: string) => void
		testEvent: (nodeId: string) => void
	}

	defineProps<Props>();
</script>

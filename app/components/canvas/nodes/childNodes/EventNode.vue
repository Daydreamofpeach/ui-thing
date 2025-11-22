<template>
	<div class="event-node-container">
		<!-- Event Node -->
		<div class="enhanced-node event-node" :class="{ selected }">
			<!-- Connection Handles -->
			<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
			<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
			<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
			<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />

			<!-- Node Resizer (only show when selected) -->
			<NodeResizer v-if="selected" :min-width="200" :min-height="120" />

			<!-- Header -->
			<div class="node-header">
				<div class="flex items-center gap-2">
					<Icon name="lucide:zap" class="w-4 h-4 text-orange-600" />
					<h3 class="text-sm font-semibold text-orange-600">
						{{ data?.label || 'Event Node' }}
					</h3>
				</div>
				<div class="flex items-center gap-1">
					<div class="w-2 h-2 rounded-full" :class="data?.eventName ? 'bg-orange-500' : 'bg-gray-500'" />
					<span class="text-xs" :class="data?.eventName ? 'text-orange-500/70' : 'text-gray-500/70'">
						{{ data?.eventName ? 'Configured' : 'Not Configured' }}
					</span>
				</div>
			</div>

			<!-- Node Details -->
			<div class="node-details">
				<div class="detail-row">
					<span class="detail-label">Event Type</span>
					<span class="detail-value">{{ data?.eventName || 'No event selected' }}</span>
				</div>
				<div class="detail-row">
					<span class="detail-label">Category</span>
					<span class="detail-value">{{ getEventCategory(data?.eventName) }}</span>
				</div>
				<div class="detail-row">
					<span class="detail-label">Trigger</span>
					<span class="detail-value">{{ data?.trigger || 'Manual' }}</span>
				</div>
				<div class="detail-row">
					<span class="detail-label">Status</span>
					<span class="detail-value" :class="getStatusClass(data?.status)">
						{{ data?.status || 'Inactive' }}
					</span>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="node-actions">
				<button
					class="action-button configure-button"
					@click="openEventSelector"
				>
					{{ data?.eventName ? 'Change Event' : 'Configure Event' }}
				</button>
				<button
					v-if="data?.eventName"
					class="action-button test-button"
					@click="testEvent"
				>
					Test Event
				</button>
			</div>
		</div>

		<!-- Events Modal -->
		<EventsModal
			v-model:open="eventsModalOpen"
			:current-event="data?.eventName"
			@select="handleEventSelect"
		/>
	</div>
</template>

<script setup lang="ts">
	import { Handle, Position } from "@vue-flow/core";
	import { ref } from "vue";
	import EventsModal from "@canvas/modals/EventsModal.vue";

	// Props
	const props = defineProps<{
		id: string
		data: {
			label?: string
			eventName?: string
			trigger?: string
			status?: "active" | "inactive" | "error"
		}
		selected?: boolean
	}>();

	// Emits
	const emit = defineEmits<{
		updateData: [key: string, value: any]
	}>();

	// State
	const eventsModalOpen = ref(false);

	// Methods
	function openEventSelector() {
		eventsModalOpen.value = true;
	}

	function handleEventSelect(eventName: string) {
		emit("updateData", "eventName", eventName);
		emit("updateData", "status", "active");
	}

	function testEvent() {
		console.log("Testing event:", props.data?.eventName);
	// TODO: Implement event testing logic
	}

	function getEventCategory(eventName?: string): string {
		if (!eventName) return "None";

		if (eventName.startsWith("github:")) return "GitHub";
		if (eventName.startsWith("jira:")) return "Jira";
		if (eventName.startsWith("bitbucket:")) return "Bitbucket";
		if (eventName.startsWith("ci:")) return "CI/CD";
		if (eventName.startsWith("on")) return "User Events";
		if (eventName.includes("Template")) return "Templating";

		return "Miscellaneous";
	}

	function getStatusClass(status?: string): string {
		switch (status) {
		case "active":
			return "text-green-400";
		case "error":
			return "text-red-400";
		case "inactive":
		default:
			return "text-gray-400";
		}
	}
</script>

<style scoped>
.event-node-container {
	position: relative;
}

.event-node {
	border-color: rgba(249, 115, 22, 0.3);
}

.event-node.selected {
	border-color: rgba(249, 115, 22, 0.6);
	box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
}

.event-node .node-header {
	background: rgba(249, 115, 22, 0.1);
	border-color: rgba(249, 115, 22, 0.2);
}

.configure-button {
	background: rgba(249, 115, 22, 0.15);
	border: 1px solid rgba(249, 115, 22, 0.3);
	color: rgba(249, 115, 22, 0.9);
	padding: 0.5rem 0.75rem;
	border-radius: 0.375rem;
	font-size: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.configure-button:hover {
	background: rgba(249, 115, 22, 0.25);
	border-color: rgba(249, 115, 22, 0.5);
	color: rgb(249, 115, 22);
	transform: translateY(-1px);
}

.test-button {
	background: rgba(34, 197, 94, 0.15);
	border: 1px solid rgba(34, 197, 94, 0.3);
	color: rgba(34, 197, 94, 0.9);
	padding: 0.5rem 0.75rem;
	border-radius: 0.375rem;
	font-size: 0.75rem;
	cursor: pointer;
	transition: all 0.2s ease;
}

.test-button:hover {
	background: rgba(34, 197, 94, 0.25);
	border-color: rgba(34, 197, 94, 0.5);
	color: rgb(34, 197, 94);
	transform: translateY(-1px);
}
</style>

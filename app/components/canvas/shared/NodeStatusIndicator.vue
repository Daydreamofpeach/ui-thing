<template>
	<div class="status-indicator-wrapper">
		<div 
			class="status-dot"
			:class="`status-${status}`"
		/>
		<span class="status-label">{{ displayLabel }}</span>
	</div>
</template>

<script setup lang="ts">
	import { computed, inject, type Ref, type ComputedRef } from 'vue';

	interface Props {
		status: 'idle' | 'running' | 'success' | 'error' | 'warning'
		statusLabel?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		status: 'idle',
		statusLabel: undefined
	});

	// Optionally inject node state for theming
	const nodeState = inject<{
		themeColor: ComputedRef<string>
	} | null>('nodeState', null);

	// Compute the label to display
	const displayLabel = computed(() => props.statusLabel || props.status);
</script>

<style scoped>
.status-indicator-wrapper {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.status-dot {
	width: 0.5rem;
	height: 0.5rem;
	border-radius: 50%;
	transition: all 0.3s ease;
}

.status-dot.status-idle {
	background: rgb(107, 114, 128);
}

.status-dot.status-running {
	background: rgb(234, 179, 8);
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-dot.status-success {
	background: rgb(34, 197, 94);
}

.status-dot.status-error {
	background: rgb(239, 68, 68);
}

.status-dot.status-warning {
	background: rgb(251, 146, 60);
}

.status-label {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	text-transform: capitalize;
}

@keyframes pulse {
	0%, 100% { 
		opacity: 1;
		transform: scale(1);
	}
	50% { 
		opacity: 0.5;
		transform: scale(1.1);
	}
}
</style>


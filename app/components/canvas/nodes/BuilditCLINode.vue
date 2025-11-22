<template>
	<div class="buildit-cli-node">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
		<Handle id="top" type="target" :position="Position.Top" class="connection-handle" />
		<Handle id="bottom" type="source" :position="Position.Bottom" class="connection-handle" />
		
		<!-- Node Resizer -->
		<NodeResizer :min-width="400" :min-height="300" color="rgba(59, 130, 246, 0.5)" />
		
		<div class="cli-panel glassmorphic-panel p-4 rounded-xl border border-primary/20 shadow-lg shadow-primary/10 backdrop-blur-md">
			<h3 class="text-lg font-semibold text-white/90 mb-3 flex items-center gap-2">
				<Icon name="i-lucide-terminal" class="w-5 h-5 text-primary" />
				Buildit CLI
			</h3>
			<p class="text-white/70 mb-4 text-sm">Check and install the Buildit CLI for project automation.</p>
			
			<!-- CLI Status -->
			<div class="cli-status mb-4">
				<CLIStatusCard
					@cli-installed="handleCliInstalled"
					@cli-checked="handleCliChecked"
					@cli-error="handleCliError"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { NodeResizer } from '@vue-flow/node-resizer';
import CLIStatusCard from '~/components/canvas/shared/CLIStatusCard.vue';

interface Props {
	customNodeProps: {
		id: string;
		data: {
			label?: string;
			cliInstalled?: boolean;
			cliVersion?: string;
		};
	};
}

const props = defineProps<Props>();

const emit = defineEmits([
	'cli-installed',
	'cli-checked',
	'cli-error'
]);

// Event handlers for CLI actions
const handleCliInstalled = (data: any) => {
	emit('cli-installed', data);
};

const handleCliChecked = (data: any) => {
	emit('cli-checked', data);
};

const handleCliError = (data: any) => {
	emit('cli-error', data);
};
</script>

<style scoped>
.buildit-cli-node {
	position: relative;
	min-width: 400px;
}

.cli-panel {
	background: rgba(17, 24, 39, 0.95);
	max-height: 400px;
	overflow: hidden;
}

.connection-handle {
	width: 8px;
	height: 8px;
	background: rgba(59, 130, 246, 0.8);
	border: 2px solid white;
	border-radius: 50%;
	transition: all 0.2s ease;
}

.connection-handle:hover {
	background: rgba(59, 130, 246, 1);
	transform: scale(1.2);
}

/* Scrollbar styling */
.cli-output::-webkit-scrollbar {
	width: 6px;
}

.cli-output::-webkit-scrollbar-track {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 3px;
}

.cli-output::-webkit-scrollbar-thumb {
	background: rgba(59, 130, 246, 0.5);
	border-radius: 3px;
}

.cli-output::-webkit-scrollbar-thumb:hover {
	background: rgba(59, 130, 246, 0.7);
}

/* Button hover effects */
button:hover:not(:disabled) {
	transform: translateY(-1px);
}

button:active:not(:disabled) {
	transform: translateY(0);
}
</style>

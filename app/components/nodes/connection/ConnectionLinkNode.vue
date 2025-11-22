<template>
	<div class="connection-link-node glassmorphic-panel p-4 min-w-[200px] max-w-[300px]">
		<!-- Node Header -->
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
					<UIcon name="i-lucide-link" class="w-4 h-4 text-orange-500" />
				</div>
				<div>
					<h3 class="text-sm font-semibold text-white">{{ node.data?.name || 'Connection Link' }}</h3>
					<p class="text-xs text-white/60">Node connection</p>
				</div>
			</div>
			<div class="flex items-center gap-1">
				<button
					@click="handleConfigure"
					class="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
					title="Configure"
				>
					<UIcon name="i-lucide-settings" class="w-3 h-3" />
				</button>
				<button
					@click="handleDelete"
					class="p-1 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
					title="Delete"
				>
					<UIcon name="i-lucide-trash-2" class="w-3 h-3" />
				</button>
			</div>
		</div>

		<!-- Node Content -->
		<div class="space-y-2">
			<div v-if="node.data?.description" class="text-xs text-white/70 mb-2">
				{{ node.data.description }}
			</div>
			
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-xs">
					<UIcon name="i-lucide-arrow-right" class="w-3 h-3 text-orange-500" />
					<span class="text-white/60">From:</span>
					<span class="text-white font-medium truncate">{{ sourceNodeName || 'No source' }}</span>
				</div>
				
				<div class="flex items-center gap-2 text-xs">
					<UIcon name="i-lucide-arrow-left" class="w-3 h-3 text-orange-500" />
					<span class="text-white/60">To:</span>
					<span class="text-white font-medium truncate">{{ targetNodeName || 'No target' }}</span>
				</div>
			</div>

			<!-- Connection Status -->
			<div class="flex items-center gap-2 mt-3">
				<div 
					class="w-2 h-2 rounded-full"
					:class="{
						'bg-gray-500': connectionStatus === 'disconnected',
						'bg-yellow-500 animate-pulse': connectionStatus === 'connecting',
						'bg-green-500': connectionStatus === 'connected',
						'bg-red-500': connectionStatus === 'error'
					}"
				></div>
				<span class="text-xs text-white/60 capitalize">{{ connectionStatus }}</span>
			</div>

			<!-- Connection Stats -->
			<div v-if="connectionStats" class="mt-3 pt-2 border-t border-white/10">
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div class="text-center">
						<div class="text-white/60">Messages</div>
						<div class="text-white font-medium">{{ connectionStats.messages }}</div>
					</div>
					<div class="text-center">
						<div class="text-white/60">Latency</div>
						<div class="text-white font-medium">{{ connectionStats.latency }}ms</div>
					</div>
				</div>
			</div>

			<!-- Connection Actions -->
			<div class="mt-3 pt-2 border-t border-white/10">
				<div class="flex gap-1">
					<button
						@click="testConnection"
						class="flex-1 px-2 py-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded hover:bg-orange-500/30 transition-colors"
						:disabled="connectionStatus === 'connecting'"
					>
						<UIcon name="i-lucide-play" class="w-3 h-3 mr-1" />
						Test
					</button>
					<button
						@click="monitorConnection"
						class="flex-1 px-2 py-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors"
					>
						<UIcon name="i-lucide-activity" class="w-3 h-3 mr-1" />
						Monitor
					</button>
				</div>
			</div>
		</div>

		<!-- Connection Points -->
		<div class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 border-2 border-white rounded-full"></div>
		<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-500 border-2 border-white rounded-full"></div>
		<div class="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-orange-500 border-2 border-white rounded-full"></div>
		<div class="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-orange-500 border-2 border-white rounded-full"></div>
	</div>
</template>

<script lang="ts" setup>
	import { ref, reactive, computed } from "vue";

	// Props
	const props = defineProps<{
		id: string;
		type: string;
		position: { x: number; y: number };
		data: {
			id: string;
			type: string;
			name: string;
			description?: string;
			sourceNodeId: string;
			targetNodeId: string;
		};
		draggable: boolean;
		selectable: boolean;
		node: any;
	}>();

	// Emits
	const emit = defineEmits<{
		configure: [nodeId: string];
		delete: [nodeId: string];
	}>();

	// State
	const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
	const connectionStats = reactive({
		messages: 0,
		latency: 0
	});

	// Mock node names (in a real app, these would come from a store or parent component)
	const sourceNodeName = computed(() => {
		// This would typically look up the actual node name from a store
		return `Node ${props.data.sourceNodeId.slice(-4)}`;
	});

	const targetNodeName = computed(() => {
		// This would typically look up the actual node name from a store
		return `Node ${props.data.targetNodeId.slice(-4)}`;
	});

	// Methods
	const handleConfigure = () => {
		emit('configure', props.id);
	};

	const handleDelete = () => {
		emit('delete', props.id);
	};

	const testConnection = async () => {
		connectionStatus.value = 'connecting';
		
		// Simulate connection test
		setTimeout(() => {
			connectionStatus.value = 'connected';
			connectionStats.latency = Math.floor(Math.random() * 100) + 10;
		}, 1500);
	};

	const monitorConnection = () => {
		// Simulate connection monitoring
		console.log('Monitoring connection:', props.data.sourceNodeId, '->', props.data.targetNodeId);
		
		// Simulate message flow
		setInterval(() => {
			if (connectionStatus.value === 'connected') {
				connectionStats.messages += Math.floor(Math.random() * 3);
			}
		}, 2000);
	};

	// Initialize connection test
	testConnection();
</script>

<style scoped>
	.connection-link-node {
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(249, 115, 22, 0.2);
		border-radius: 1rem;
		transition: all 0.3s ease;
		position: relative;
	}

	.connection-link-node:hover {
		background: rgba(var(--color-neutral-rgb), 0.12);
		border-color: rgba(249, 115, 22, 0.3);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(249, 115, 22, 0.1);
	}

	/* Connection points */
	.connection-link-node > div:last-child {
		pointer-events: none;
	}

	/* Status animation */
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>


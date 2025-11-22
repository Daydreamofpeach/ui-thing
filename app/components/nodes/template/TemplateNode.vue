<template>
	<div class="template-node glassmorphic-panel p-4 min-w-[200px] max-w-[300px]">
		<!-- Node Header -->
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
					<UIcon name="i-lucide-layout-template" class="w-4 h-4 text-purple-500" />
				</div>
				<div>
					<h3 class="text-sm font-semibold text-white">{{ node?.data?.name || 'Template Node' }}</h3>
					<p class="text-xs text-white/60">{{ node?.data?.templateType || 'component' }} template</p>
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
			<div v-if="node?.data?.description" class="text-xs text-white/70 mb-2">
				{{ node?.data?.description }}
			</div>
			
			<div class="space-y-1">
				<div class="flex items-center gap-2 text-xs">
					<UIcon name="i-lucide-folder" class="w-3 h-3 text-purple-500" />
					<span class="text-white/60">Path:</span>
					<span class="text-white font-medium truncate">{{ node?.data?.templatePath || 'No path' }}</span>
				</div>
				
				<div class="flex items-center gap-2 text-xs">
					<UIcon name="i-lucide-layers" class="w-3 h-3 text-indigo-500" />
					<span class="text-white/60">Type:</span>
					<span class="text-white font-medium capitalize">{{ node?.data?.templateType || 'component' }}</span>
				</div>
			</div>

			<!-- Template Status -->
			<div class="flex items-center gap-2 mt-3">
				<div 
					class="w-2 h-2 rounded-full"
					:class="{
						'bg-gray-500': templateStatus === 'idle',
						'bg-yellow-500 animate-pulse': templateStatus === 'generating',
						'bg-green-500': templateStatus === 'ready',
						'bg-red-500': templateStatus === 'error'
					}"
				></div>
				<span class="text-xs text-white/60 capitalize">{{ templateStatus }}</span>
			</div>

			<!-- Template Stats -->
			<div v-if="templateStats" class="mt-3 pt-2 border-t border-white/10">
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div class="text-center">
						<div class="text-white/60">Generated</div>
						<div class="text-white font-medium">{{ templateStats.generated }}</div>
					</div>
					<div class="text-center">
						<div class="text-white/60">Size</div>
						<div class="text-white font-medium">{{ templateStats.size }}KB</div>
					</div>
				</div>
			</div>

			<!-- Template Actions -->
			<div class="mt-3 pt-2 border-t border-white/10">
				<div class="flex gap-1">
					<button
						@click="generateTemplate"
						class="flex-1 px-2 py-1 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/30 transition-colors"
						:disabled="templateStatus === 'generating'"
					>
						<UIcon name="i-lucide-play" class="w-3 h-3 mr-1" />
						Generate
					</button>
					<button
						@click="previewTemplate"
						class="flex-1 px-2 py-1 text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded hover:bg-indigo-500/30 transition-colors"
					>
						<UIcon name="i-lucide-eye" class="w-3 h-3 mr-1" />
						Preview
					</button>
				</div>
			</div>
		</div>

		<!-- Connection Points (hidden in config panel) -->
		<div v-if="node?.draggable !== false" class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-500 border-2 border-white rounded-full"></div>
		<div v-if="node?.draggable !== false" class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-500 border-2 border-white rounded-full"></div>
		<div v-if="node?.draggable !== false" class="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-purple-500 border-2 border-white rounded-full"></div>
		<div v-if="node?.draggable !== false" class="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-purple-500 border-2 border-white rounded-full"></div>
	</div>
</template>

<script lang="ts" setup>
	import { ref, reactive, computed } from "vue";

	// Props - Support both old and new formats
	const props = defineProps<{
		// New format (via customNodeProps)
		customNodeProps?: any;
		updateNodeData?: (nodeId: string, key: string, value: any) => void;
		
		// Old format (direct props)
		id?: string;
		type?: string;
		position?: { x: number; y: number };
		data?: any;
		draggable?: boolean;
		selectable?: boolean;
		node?: any;
	}>();

	// Emits
	const emit = defineEmits<{
		configure: [nodeId: string];
		delete: [nodeId: string];
	}>();

	// Computed node accessor - works with both formats
	const node = computed(() => {
		if (props.customNodeProps) {
			return props.customNodeProps;
		}
		return props.node || {
			id: props.id,
			type: props.type,
			position: props.position,
			data: props.data,
			draggable: props.draggable,
			selectable: props.selectable
		};
	});

	// State
	const templateStatus = ref<'idle' | 'generating' | 'ready' | 'error'>('idle');
	const templateStats = reactive({
		generated: 0,
		size: 0
	});

	// Methods
	const handleConfigure = () => {
		console.log("🔧 TemplateNode: Configure clicked for:", node.value?.id);
		emit('configure', node.value?.id || '');
	};

	const handleDelete = () => {
		console.log("🗑️ TemplateNode: Delete clicked for:", node.value?.id);
		emit('delete', node.value?.id || '');
	};

	const generateTemplate = async () => {
		templateStatus.value = 'generating';
		
		// Simulate template generation
		setTimeout(() => {
			templateStatus.value = 'ready';
			templateStats.generated += 1;
			templateStats.size = Math.floor(Math.random() * 50) + 10;
		}, 2000);
	};

	const previewTemplate = () => {
		// Simulate template preview
		console.log('Previewing template:', node.value.data?.templatePath);
	};
</script>

<style scoped>
	.template-node {
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(147, 51, 234, 0.2);
		border-radius: 1rem;
		transition: all 0.3s ease;
		position: relative;
	}

	.template-node:hover {
		background: rgba(var(--color-neutral-rgb), 0.12);
		border-color: rgba(147, 51, 234, 0.3);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(147, 51, 234, 0.1);
	}

	/* Connection points */
	.template-node > div:last-child {
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


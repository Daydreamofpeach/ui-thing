<template>
	<div class="tool-icon-row">
		<div class="section-label" v-if="label">
			<UIcon :name="labelIcon" class="w-4 h-4" />
			<span>{{ label }}</span>
		</div>
		<div class="icons-container">
			<ToolIcon
				v-for="tool in tools"
				:key="tool.name"
				:tool="tool"
				:theme-color="themeColor"
				@action="handleAction"
			/>
			
			<!-- Empty State -->
			<div v-if="tools.length === 0" class="empty-state">
				<UIcon name="i-lucide-inbox" class="w-6 h-6 opacity-30" />
				<span class="empty-text">{{ emptyMessage }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import ToolIcon from './ToolIcon.vue';

	interface Props {
		tools: any[]
		label?: string
		labelIcon?: string
		themeColor?: string
		emptyMessage?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		label: '',
		labelIcon: 'i-lucide-box',
		themeColor: 'rgba(139, 92, 246, 1)',
		emptyMessage: 'No tools available'
	});

	const emit = defineEmits<{
		action: [data: { tool: any, action: string }]
	}>();

	function handleAction(data: { tool: any, action: string }) {
		emit('action', data);
	}
</script>

<style scoped>
.tool-icon-row {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1.25rem;
	background: rgba(0, 0, 0, 0.15);
	border-radius: 0.875rem;
	border: 1px solid rgba(255, 255, 255, 0.05);
}

.section-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.05em;
	color: rgba(255, 255, 255, 0.7);
	padding-bottom: 0.5rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.icons-container {
	display: flex;
	flex-wrap: wrap;
	gap: 2rem;
	padding: 1rem 0;
	min-height: 180px;
	align-items: flex-start;
	justify-content: center;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	width: 100%;
	padding: 2rem;
	opacity: 0.5;
}

.empty-text {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.5);
}
</style>


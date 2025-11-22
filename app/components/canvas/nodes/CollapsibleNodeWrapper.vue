<template>
	<div class="collapsible-node-wrapper">
		<!-- Collapsed State -->
		<div v-if="isCollapsed" class="collapsed-state">
			<div class="collapsed-header">
				<div class="collapsed-info">
					<UIcon :name="icon" class="w-4 h-4" :class="iconColor" />
					<span class="collapsed-title">{{ title }}</span>
					<div class="collapsed-badge">{{ badge }}</div>
				</div>
				<button class="expand-button" @click="toggleCollapsed" title="Expand node">
					<UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
				</button>
			</div>
			<div v-if="description" class="collapsed-description">
				{{ description }}
			</div>
		</div>

		<!-- Expanded State -->
		<div v-else class="expanded-state">
			<div class="expanded-header">
				<div class="header-info">
					<UIcon :name="icon" class="w-4 h-4" :class="iconColor" />
					<span class="header-title">{{ title }}</span>
				</div>
				<button class="collapse-button" @click="toggleCollapsed" title="Collapse node">
					<UIcon name="i-lucide-chevron-up" class="w-4 h-4" />
				</button>
			</div>
			<div class="expanded-content">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, watch } from "vue";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		title: string
		description?: string
		badge?: string
		icon?: string
		iconColor?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		description: "",
		badge: "Not Run",
		icon: "i-lucide-box",
		iconColor: "text-blue-400"
	});

	const emit = defineEmits<{
		'expanded': []
		'collapsed': []
	}>();

	const isCollapsed = ref(props.customNodeProps.data?.collapsed !== false);

	// Watch for external changes to collapsed state
	watch(() => props.customNodeProps.data?.collapsed, (newValue) => {
		if (newValue !== undefined) {
			isCollapsed.value = newValue;
		}
	});

	const toggleCollapsed = () => {
		isCollapsed.value = !isCollapsed.value;
		props.updateNodeData(props.customNodeProps.id, "collapsed", isCollapsed.value);
		
		if (!isCollapsed.value) {
			emit('expanded');
		} else {
			emit('collapsed');
		}
	};
</script>

<style scoped>
.collapsible-node-wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

/* Collapsed State */
.collapsed-state {
	padding: 12px 16px;
	background: rgba(var(--color-neutral-rgb), 0.1);
	border-radius: 8px;
	border: 2px solid rgba(var(--color-primary-rgb), 0.2);
	transition: all 0.2s ease;
}

.collapsed-state:hover {
	border-color: rgba(var(--color-primary-rgb), 0.4);
	background: rgba(var(--color-neutral-rgb), 0.15);
}

.collapsed-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.collapsed-info {
	display: flex;
	align-items: center;
	gap: 10px;
	flex: 1;
	min-width: 0;
}

.collapsed-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: white;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.collapsed-badge {
	padding: 2px 8px;
	background: rgba(156, 163, 175, 0.2);
	border: 1px solid rgba(156, 163, 175, 0.3);
	border-radius: 12px;
	font-size: 0.7rem;
	font-weight: 600;
	color: rgba(156, 163, 175, 1);
	text-transform: uppercase;
	letter-spacing: 0.5px;
	white-space: nowrap;
}

.collapsed-description {
	margin-top: 8px;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	line-height: 1.4;
}

.expand-button {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(var(--color-primary-rgb), 0.15);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 6px;
	color: var(--color-primary);
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.expand-button:hover {
	background: rgba(var(--color-primary-rgb), 0.25);
	border-color: var(--color-primary);
	transform: scale(1.1);
}

/* Expanded State */
.expanded-state {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
}

.expanded-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), rgba(var(--color-neutral-rgb), 0.05));
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-info {
	display: flex;
	align-items: center;
	gap: 10px;
}

.header-title {
	font-size: 0.875rem;
	font-weight: 700;
	color: white;
}

.collapse-button {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(239, 68, 68, 0.15);
	border: 1px solid rgba(239, 68, 68, 0.3);
	border-radius: 6px;
	color: rgba(239, 68, 68, 0.9);
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.collapse-button:hover {
	background: rgba(239, 68, 68, 0.25);
	border-color: rgba(239, 68, 68, 0.5);
	transform: scale(1.1);
}

.expanded-content {
	flex: 1;
	overflow: auto;
	min-height: 0;
}
</style>


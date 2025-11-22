<template>
	<UTooltip
		:text="script.description || 'No description'"
		:popper="{ placement: 'left' }"
		:disabled="!script.description"
	>
		<div class="script-list-item" :class="{ 'has-description': !!script.description }">
			<div class="script-info">
				<div class="script-header">
					<UIcon name="i-lucide-terminal" class="script-icon" />
					<span class="script-name">{{ script.name }}</span>
					<span v-if="script.order !== undefined" class="script-order">
						#{{ script.order }}
					</span>
				</div>
				<div v-if="script.description" class="script-description-preview">
					{{ truncateDescription(script.description) }}
				</div>
			</div>
			<div class="script-actions">
				<button
					class="script-action-btn edit"
					title="Open script editor"
					@click.stop="$emit('open-editor', script)"
				>
					<UIcon name="i-lucide-pencil" class="w-3 h-3" />
				</button>
				<slot name="actions" :script="script" />
			</div>
		</div>
	</UTooltip>
</template>

<script setup lang="ts">
	interface Props {
		script: {
			name: string
			description?: string
			order?: number
			command?: string
		}
	}

	defineProps<Props>();

	defineEmits<{
		"open-editor": [script: any]
	}>();

	const truncateDescription = (desc: string): string => {
		if (!desc) return "";
		return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc;
	};
</script>

<style scoped>
.script-list-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	background: rgba(0, 0, 0, 0.2);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	transition: all 0.2s ease;
	gap: 12px;
}

.script-list-item.has-description {
	border-left: 3px solid rgba(168, 85, 247, 0.4);
}

.script-list-item:hover {
	background: rgba(168, 85, 247, 0.08);
	border-color: rgba(168, 85, 247, 0.3);
	transform: translateX(2px);
}

.script-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.script-header {
	display: flex;
	align-items: center;
	gap: 6px;
}

.script-icon {
	width: 14px;
	height: 14px;
	color: rgba(168, 85, 247, 0.8);
	flex-shrink: 0;
}

.script-name {
	font-size: 0.8rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	font-family: monospace;
}

.script-order {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 2px 6px;
	background: rgba(59, 130, 246, 0.15);
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 10px;
	font-size: 0.65rem;
	font-weight: 700;
	color: rgba(59, 130, 246, 1);
	margin-left: auto;
}

.script-description-preview {
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.5);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.script-actions {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
}

.script-action-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(168, 85, 247, 0.12);
	border: 1px solid rgba(168, 85, 247, 0.25);
	border-radius: 5px;
	color: rgba(168, 85, 247, 1);
	cursor: pointer;
	transition: all 0.2s ease;
}

.script-action-btn.edit:hover {
	background: rgba(168, 85, 247, 0.2);
	border-color: rgba(168, 85, 247, 0.4);
	transform: scale(1.1);
	box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
}
</style>

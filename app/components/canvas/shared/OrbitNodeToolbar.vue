<template>
	<div class="orbit-node-toolbar">
		<!-- Add Template Button -->
		<button
			type="button"
			class="toolbar-add-btn"
			:title="'Add Template with Intent Selection'"
			:aria-label="'Add Template with Intent Selection'"
			@click.stop="onAddTemplate"
		>
			<UIcon name="i-lucide-plus" class="w-4 h-4" />
		</button>
	</div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
	addTemplate: []
}>();

const onAddTemplate = () => {
	emit('addTemplate');
};
</script>

<style scoped>
.orbit-node-toolbar {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 0;
	margin: 0;
}

.toolbar-add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 6px;
	border: 1px solid rgba(148, 163, 184, 0.2);
	background: rgba(168, 85, 247, 0.08);
	color: rgba(196, 181, 253, 0.8);
	cursor: pointer;
	transition: all 0.15s ease;
	flex-shrink: 0;
}

.toolbar-add-btn:hover {
	background: rgba(168, 85, 247, 0.15);
	color: rgba(196, 181, 253, 0.95);
	border-color: rgba(168, 85, 247, 0.4);
	box-shadow: 0 0 8px rgba(168, 85, 247, 0.2);
}

.toolbar-add-btn:active {
	transform: scale(0.95);
	background: rgba(168, 85, 247, 0.2);
}
</style>


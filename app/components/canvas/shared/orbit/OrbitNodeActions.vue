<template>
	<div class="orbit-node-actions">
		<!-- Open Node Button -->
		<button
			v-if="!isOpen"
			type="button"
			class="orbit-action-btn orbit-action-btn--open"
			:aria-label="`Open ${itemLabel}`"
			:title="`Open ${itemLabel}`"
			@click.stop="handleOpen"
		>
			<UIcon name="i-lucide-maximize-2" class="w-4 h-4" />
			<span class="action-label">Open</span>
		</button>

		<!-- Close Node Button -->
		<button
			v-if="isOpen"
			type="button"
			class="orbit-action-btn orbit-action-btn--close"
			:aria-label="`Close ${itemLabel}`"
			:title="`Close ${itemLabel}`"
			@click.stop="handleClose"
		>
			<UIcon name="i-lucide-minimize-2" class="w-4 h-4" />
			<span class="action-label">Close</span>
		</button>
	</div>
</template>

<script setup lang="ts">
interface Props {
	nodeId: string
	isOpen: boolean
	itemLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
	itemLabel: "node"
});

const emit = defineEmits<{
	open: [nodeId: string]
	close: [nodeId: string]
}>();

const handleOpen = () => {
	emit("open", props.nodeId);
};

const handleClose = () => {
	emit("close", props.nodeId);
};
</script>

<style scoped>
.orbit-node-actions {
	display: flex;
	align-items: center;
	gap: 4px;
}

.orbit-action-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 8px;
	border-radius: 4px;
	border: 1px solid rgba(148, 163, 184, 0.2);
	background: rgba(0, 0, 0, 0.3);
	color: rgba(255, 255, 255, 0.7);
	font-size: 11px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s ease;
	white-space: nowrap;
}

.orbit-action-btn:hover {
	background: rgba(0, 0, 0, 0.5);
	border-color: rgba(148, 163, 184, 0.4);
	color: rgba(255, 255, 255, 0.9);
}

.orbit-action-btn--open {
	border-color: rgba(34, 197, 94, 0.3);
	color: rgba(134, 239, 172, 0.8);
}

.orbit-action-btn--open:hover {
	background: rgba(34, 197, 94, 0.1);
	border-color: rgba(34, 197, 94, 0.5);
	color: rgba(134, 239, 172, 1);
}

.orbit-action-btn--close {
	border-color: rgba(239, 68, 68, 0.3);
	color: rgba(248, 113, 113, 0.8);
}

.orbit-action-btn--close:hover {
	background: rgba(239, 68, 68, 0.1);
	border-color: rgba(239, 68, 68, 0.5);
	color: rgba(248, 113, 113, 1);
}

.action-label {
	font-size: 10px;
	letter-spacing: 0.2px;
	text-transform: uppercase;
}
</style>


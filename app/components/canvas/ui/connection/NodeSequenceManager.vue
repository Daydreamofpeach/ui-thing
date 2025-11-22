<template>
	<div class="node-sequence-manager">
		<div class="sequence-header">
			<div class="header-content">
				<UIcon name="i-lucide-list-ordered" class="size-3" />
				<span class="header-title">Automation Sequence</span>
			</div>
			<span class="node-count">{{ sequence.length }} nodes</span>
		</div>

		<div v-if="sequence.length === 0" class="empty-state">
			<UIcon name="i-lucide-mouse-pointer-click" class="size-8 text-white/20" />
			<p class="empty-text">Select nodes to build your automation sequence</p>
		</div>

		<div v-else class="sequence-list">
			<div
				v-for="(nodeId, index) in sequence"
				:key="nodeId"
				class="sequence-item"
				draggable="true"
				@dragstart="handleDragStart(index)"
				@dragover.prevent
				@drop="handleDrop(index)"
				@dragenter="handleDragEnter(index)"
				@dragleave="handleDragLeave"
			>
				<div class="sequence-number">
					{{ index + 1 }}
				</div>
				<div class="sequence-node-info">
					<UIcon :name="getNodeIcon(getNode(nodeId))" class="size-3" />
					<span class="sequence-node-name">{{ getNodeName(nodeId) }}</span>
				</div>
				<div class="sequence-actions">
					<button
						v-if="index > 0"
						class="move-btn"
						title="Move up"
						@click="moveUp(index)"
					>
						<UIcon name="i-lucide-chevron-up" class="size-3" />
					</button>
					<button
						v-if="index < sequence.length - 1"
						class="move-btn"
						title="Move down"
						@click="moveDown(index)"
					>
						<UIcon name="i-lucide-chevron-down" class="size-3" />
					</button>
					<button
						class="remove-btn"
						title="Remove from sequence"
						@click="removeNode(index)"
					>
						<UIcon name="i-lucide-x" class="size-3" />
					</button>
				</div>
				<div v-if="index < sequence.length - 1" class="flow-arrow">
					<UIcon name="i-lucide-arrow-down" class="size-3 text-primary" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	interface Props {
		sequence: string[];
		nodes: any[];
	}

	const props = defineProps<Props>();

	const emit = defineEmits<{
		"update:sequence": [sequence: string[]];
	}>();

	const draggedIndex = ref<number | null>(null);

	const getNode = (nodeId: string) => {
		return props.nodes.find((n: any) => n.id === nodeId);
	};

	const getNodeName = (nodeId: string) => {
		const node = getNode(nodeId);
		return node?.data?.label || node?.type || nodeId;
	};

	const getNodeIcon = (node: any) => {
		if (!node) return "i-lucide-circle";
		const iconMap: Record<string, string> = {
			templateNode: "i-lucide-layout-template",
			browserNode: "i-lucide-globe",
			formsPanelNode: "i-lucide-file-text",
			transportNode: "i-lucide-send",
			hookNode: "i-lucide-webhook",
			viewportNode: "i-lucide-monitor",
			userNode: "i-lucide-user"
		};
		return iconMap[node.type] || "i-lucide-circle";
	};

	const handleDragStart = (index: number) => {
		draggedIndex.value = index;
	};

	const handleDragEnter = (index: number) => {
		// Visual feedback could be added here
	};

	const handleDragLeave = () => {
		// Clear visual feedback
	};

	const handleDrop = (targetIndex: number) => {
		if (draggedIndex.value === null || draggedIndex.value === targetIndex) return;

		const newSequence = [...props.sequence];
		const draggedNode = newSequence[draggedIndex.value];
		newSequence.splice(draggedIndex.value, 1);
		newSequence.splice(targetIndex, 0, draggedNode);

		emit("update:sequence", newSequence);
		draggedIndex.value = null;
	};

	const moveUp = (index: number) => {
		if (index === 0) return;
		const newSequence = [...props.sequence];
		[newSequence[index - 1], newSequence[index]] = [newSequence[index], newSequence[index - 1]];
		emit("update:sequence", newSequence);
	};

	const moveDown = (index: number) => {
		if (index === props.sequence.length - 1) return;
		const newSequence = [...props.sequence];
		[newSequence[index], newSequence[index + 1]] = [newSequence[index + 1], newSequence[index]];
		emit("update:sequence", newSequence);
	};

	const removeNode = (index: number) => {
		const newSequence = [...props.sequence];
		newSequence.splice(index, 1);
		emit("update:sequence", newSequence);
	};
</script>

<style scoped>
	.node-sequence-manager {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.sequence-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.header-title {
		font-size: 11px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.node-count {
		font-size: 10px;
		font-weight: 600;
		color: rgba(var(--color-primary-rgb), 0.9);
		padding: 2px 8px;
		background: rgba(var(--color-primary-rgb), 0.15);
		border-radius: 10px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 30px 20px;
		gap: 8px;
	}

	.empty-text {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.5);
		text-align: center;
		margin: 0;
	}

	.sequence-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-height: 400px;
		overflow-y: auto;
	}

	.sequence-list::-webkit-scrollbar {
		width: 4px;
	}

	.sequence-list::-webkit-scrollbar-thumb {
		background: rgba(var(--color-primary-rgb), 0.3);
		border-radius: 2px;
	}

	.sequence-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 6px;
		cursor: grab;
		transition: all 0.2s ease;
	}

	.sequence-item:hover {
		background: rgba(var(--color-primary-rgb), 0.08);
		border-color: rgba(var(--color-primary-rgb), 0.2);
		transform: translateX(2px);
	}

	.sequence-item:active {
		cursor: grabbing;
		opacity: 0.8;
	}

	.sequence-number {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(var(--color-primary-rgb), 0.2);
		border: 2px solid rgba(var(--color-primary-rgb), 0.4);
		border-radius: 50%;
		font-size: 13px;
		font-weight: 800;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.sequence-node-info {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.sequence-node-name {
		font-size: 12px;
		font-weight: 600;
		color: white;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sequence-actions {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.move-btn,
	.remove-btn {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.move-btn:hover {
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		color: var(--color-primary);
	}

	.remove-btn:hover {
		background: rgba(239, 68, 68, 0.15);
		border-color: rgba(239, 68, 68, 0.3);
		color: rgba(239, 68, 68, 1);
	}

	.flow-arrow {
		position: absolute;
		left: 50%;
		bottom: -12px;
		transform: translateX(-50%);
		z-index: 1;
	}
</style>


<template>
	<div class="canvas-toolbar">
		<div class="toolbar-section">
			<button
				class="toolbar-button"
				title="Components"
				@click="openComponentsDrawer"
			>
				<Icon name="lucide:layers" class="w-4 h-4" />
			</button>
			<button
				class="toolbar-button"
				title="Fit to View"
				@click="fitView"
			>
				<Icon name="lucide:maximize" class="w-4 h-4" />
			</button>
			<button
				class="toolbar-button"
				title="Clear Canvas"
				@click="clearAllNodes"
			>
				<Icon name="lucide:trash-2" class="w-4 h-4" />
			</button>
			<button
				class="toolbar-button"
				title="Toggle JSON View"
				@click="toggleJsonView"
			>
				<Icon name="lucide:code" class="w-4 h-4" />
			</button>
		</div>
		<div class="toolbar-section">
			<div class="node-count">
				{{ allNodes.length }} nodes, {{ allEdges.length }} connections
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	// Props
	interface Props {
		allNodes: any[]
		allEdges: any[]
		fitView: () => void
		clearAllNodes: () => void
		toggleJsonView: () => void
		openComponentsDrawer?: () => void
	}

	const props = defineProps<Props>();

	const openComponentsDrawer = () => {
		console.log("🔘 CanvasToolbar: Components button clicked");
		if (props.openComponentsDrawer) {
			console.log("✅ Calling openComponentsDrawer function");
			props.openComponentsDrawer();
		} else {
			console.warn("⚠️ openComponentsDrawer prop not provided");
		}
	};
</script>

<style scoped>
	.canvas-toolbar {
		position: absolute;
		top: 16px;
		right: 16px;
		z-index: 10;
		display: flex;
		gap: 12px;
		align-items: center;
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 12px;
		padding: 8px 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.toolbar-section {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: rgba(var(--color-neutral-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.8);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.toolbar-button:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		color: white;
		transform: translateY(-1px);
	}

	.node-count {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
		white-space: nowrap;
	}
</style>

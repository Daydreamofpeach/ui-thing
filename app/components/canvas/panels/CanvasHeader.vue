<template>
	<div class="canvas-header">
		<div class="canvas-title-section">
			<input
				v-model="canvasDisplayName"
				type="text"
				class="canvas-title-input"
				@blur="updateCanvasName"
				@keyup.enter="updateCanvasName"
			/>
		</div>
		<div class="canvas-actions">
			<button
				@click="emit('close')"
				class="close-button"
				title="Close Canvas"
			>
				<Icon name="mdi:close" class="w-5 h-5" />
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	// Props
	interface Props {
		initialName?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		initialName: 'Untitled Canvas'
	});

	// Emits
	const emit = defineEmits<{
		close: []
		nameChanged: [name: string]
	}>();

	// State
	const canvasDisplayName = ref(props.initialName);

	// Methods
	const updateCanvasName = () => {
		emit('nameChanged', canvasDisplayName.value);
		console.log("Updating canvas name to:", canvasDisplayName.value);
	};

	// Expose methods
	defineExpose({
		canvasDisplayName,
		updateCanvasName
	});
</script>

<style scoped>
	.canvas-header {
		position: absolute;
		top: 20px;
		left: 20px;
		right: 20px;
		z-index: 10;
		pointer-events: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.canvas-title-section {
		pointer-events: auto;
	}

	.canvas-title-input {
		background: rgba(var(--color-neutral-rgb), 0.12);
		backdrop-filter: blur(24px) saturate(1.8);
		border: 1px solid rgba(var(--color-primary-rgb), 0.25);
		border-radius: 8px;
		padding: 12px 16px;
		color: white;
		font-size: 18px;
		font-weight: 700;
		transition: all 0.3s ease;
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.15),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		min-width: 200px;
		max-width: 400px;
	}

	.canvas-title-input:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.5);
		background: rgba(var(--color-neutral-rgb), 0.15);
		box-shadow: 
			0 6px 20px rgba(0, 0, 0, 0.2),
			0 0 0 1px rgba(var(--color-primary-rgb), 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}

	.canvas-title-input::placeholder {
		color: rgba(255, 255, 255, 0.5);
		font-weight: 600;
	}

	.canvas-actions {
		pointer-events: auto;
		display: flex;
		gap: 8px;
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: rgba(var(--color-neutral-rgb), 0.1);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.8);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.close-button:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.4);
		color: #ef4444;
		transform: translateY(-1px);
	}
</style>

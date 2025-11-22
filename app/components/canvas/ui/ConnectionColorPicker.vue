<template>
	<div class="color-picker">
		<div class="color-picker-header">
			<label class="color-picker-label">Color</label>
		</div>
		<div class="color-options">
			<div
				v-for="color in predefinedColors"
				:key="color.name"
				class="color-option"
				:class="{ active: modelValue === color.value }"
				:style="{ backgroundColor: color.value }"
				:title="color.name"
				@click="$emit('update:modelValue', color.value)"
			>
				<UIcon v-if="modelValue === color.value" name="i-lucide-check" class="color-check" />
			</div>
			<div class="color-option custom-color">
				<input
					type="color"
					:value="modelValue"
					class="color-input"
					@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
				>
			</div>
		</div>
		<div class="color-value">
			<input
				:value="modelValue"
				type="text"
				class="color-text-input"
				placeholder="#000000"
				@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
			>
		</div>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		modelValue: string
	}>();

	defineEmits<{
		'update:modelValue': [value: string]
	}>();

	const predefinedColors = [
		{ name: "Orange", value: "#f97316" },
		{ name: "Blue", value: "#3b82f6" },
		{ name: "Green", value: "#10b981" },
		{ name: "Red", value: "#ef4444" },
		{ name: "Purple", value: "#8b5cf6" },
		{ name: "Pink", value: "#ec4899" },
		{ name: "Yellow", value: "#f59e0b" },
		{ name: "Indigo", value: "#6366f1" },
		{ name: "Gray", value: "#6b7280" },
		{ name: "White", value: "#ffffff" }
	];
</script>

<style scoped>
	.color-picker {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.color-picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.color-picker-label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.color-options {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 6px;
	}

	.color-option {
		width: 28px;
		height: 28px;
		border-radius: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid transparent;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.color-option::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		transition: all 0.3s ease;
		transform: translate(-50%, -50%);
	}

	.color-option:hover {
		transform: scale(1.15);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.color-option:hover::before {
		width: 100%;
		height: 100%;
	}

	.color-option.active {
		border-color: rgba(255, 255, 255, 0.8);
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3);
		transform: scale(1.1);
	}

	.color-check {
		font-size: 12px;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
	}

	.custom-color {
		background: linear-gradient(45deg, #000 25%, transparent 25%), 
					linear-gradient(-45deg, #000 25%, transparent 25%), 
					linear-gradient(45deg, transparent 75%, #000 75%), 
					linear-gradient(-45deg, transparent 75%, #000 75%);
		background-size: 8px 8px;
		background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
	}

	.color-input {
		width: 100%;
		height: 100%;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		opacity: 0;
	}

	.color-value {
		margin-top: 4px;
	}

	.color-text-input {
		width: 100%;
		padding: 6px 8px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 3px;
		color: white;
		font-size: 10px;
		font-family: monospace;
		transition: all 0.2s ease;
	}

	.color-text-input:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
	}
</style>

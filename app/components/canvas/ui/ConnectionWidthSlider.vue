<template>
	<div class="width-slider">
		<div class="slider-header">
			<label class="slider-label">Width</label>
			<span class="slider-value">{{ modelValue }}px</span>
		</div>
		<div class="slider-container">
			<input
				:value="modelValue"
				type="range"
				min="1"
				max="20"
				step="1"
				class="slider"
				@input="$emit('update:modelValue', parseInt(($event.target as HTMLInputElement).value))"
			>
			<div class="slider-track">
				<div
					class="slider-fill"
					:style="{ width: `${((modelValue - 1) / 19) * 100}%` }"
				/>
			</div>
		</div>
		<div class="preset-widths">
			<button
				v-for="preset in presetWidths"
				:key="preset"
				type="button"
				class="preset-button"
				:class="{ active: modelValue === preset }"
				@click="$emit('update:modelValue', preset)"
			>
				{{ preset }}px
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		modelValue: number
	}>();

	defineEmits<{
		"update:modelValue": [value: number]
	}>();

	const presetWidths = [1, 2, 4, 6, 8];
</script>

<style scoped>
	.width-slider {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.slider-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.slider-label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.slider-value {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 600;
		min-width: 30px;
		text-align: right;
	}

	.slider-container {
		position: relative;
		height: 20px;
		display: flex;
		align-items: center;
	}

	.slider {
		width: 100%;
		height: 6px;
		background: transparent;
		outline: none;
		appearance: none;
		cursor: pointer;
		position: relative;
		z-index: 2;
	}

	.slider::-webkit-slider-thumb {
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(var(--color-primary-rgb), 0.9);
		cursor: pointer;
		border: 2px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 6px rgba(var(--color-primary-rgb), 0.15);
	}

	.slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(var(--color-primary-rgb), 0.9);
		cursor: pointer;
		border: 2px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 4px rgba(var(--color-primary-rgb), 0.1);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slider-track {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		transform: translateY(-50%);
		pointer-events: none;
	}

	.slider-fill {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		background: linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.4), rgba(var(--color-primary-rgb), 0.6));
		border-radius: 3px;
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 0 8px rgba(var(--color-primary-rgb), 0.3);
	}

	.preset-widths {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.preset-button {
		padding: 6px 10px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.6);
		font-size: 9px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		min-width: 44px;
		text-align: center;
		position: relative;
		overflow: hidden;
	}

	.preset-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.5s ease;
	}

	.preset-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);
		transform: translateY(-1px);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.preset-button:hover::before {
		left: 100%;
	}

	.preset-button.active {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		color: rgba(var(--color-primary-rgb), 1);
		box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.2);
		transform: scale(1.05);
	}
</style>

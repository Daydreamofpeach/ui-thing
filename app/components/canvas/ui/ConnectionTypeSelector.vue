<template>
	<div class="type-selector">
		<div class="type-header">
			<label class="type-label">Connection Type</label>
		</div>
		<div class="type-options">
			<div
				v-for="type in connectionTypes"
				:key="type.value"
				class="type-option"
				:class="{ active: modelValue === type.value }"
				:title="type.description"
				@click="$emit('update:modelValue', type.value)"
			>
				<div class="type-preview" :class="type.value">
					<div class="preview-line"></div>
				</div>
				<span class="type-name">{{ type.name }}</span>
			</div>
		</div>
		<div v-if="showAdvanced" class="advanced-settings">
			<div class="advanced-setting">
				<label class="setting-label">Curvature</label>
				<input
					:value="curvature"
					type="range"
					min="0"
					max="1"
					step="0.1"
					class="curvature-slider"
					@input="$emit('update:curvature', parseFloat(($event.target as HTMLInputElement).value))"
				>
				<span class="curvature-value">{{ curvature }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		modelValue: string
		curvature?: number
		showAdvanced?: boolean
	}>();

	defineEmits<{
		'update:modelValue': [value: string]
		'update:curvature': [value: number]
	}>();

	const connectionTypes = [
		{ 
			name: "Smooth Step", 
			value: "smoothstep", 
			description: "Sharp corners with smooth curves at bends" 
		},
		{ 
			name: "Straight", 
			value: "straight", 
			description: "Direct straight line connection" 
		},
		{ 
			name: "Step", 
			value: "step", 
			description: "Right-angled connections" 
		},
		{ 
			name: "Bezier", 
			value: "default", 
			description: "Smooth curved bezier connection" 
		}
	];
</script>

<style scoped>
	.type-selector {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	.type-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.type-label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.type-options {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		width: 100%;
		min-height: 60px;
	}

	.type-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 8px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 5px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
		min-height: 50px;
	}

	.type-option::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
		transition: left 0.5s ease;
	}

	.type-option:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}

	.type-option:hover::before {
		left: 100%;
	}

	.type-option.active {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		box-shadow: 0 2px 8px rgba(var(--color-primary-rgb), 0.2);
		transform: scale(1.02);
	}

	.type-preview {
		width: 40px;
		height: 20px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.preview-line {
		width: 30px;
		height: 2px;
		background: rgba(255, 255, 255, 0.4);
		position: relative;
	}

	.type-option.active .preview-line {
		background: rgba(var(--color-primary-rgb), 0.8);
	}

	.type-option.smoothstep .preview-line::before,
	.type-option.smoothstep .preview-line::after {
		content: '';
		position: absolute;
		width: 8px;
		height: 2px;
		background: inherit;
		top: 0;
	}

	.type-option.smoothstep .preview-line::before {
		left: -8px;
		transform: rotate(-20deg);
	}

	.type-option.smoothstep .preview-line::after {
		right: -8px;
		transform: rotate(20deg);
	}

	.type-option.step .preview-line {
		border-radius: 0;
	}

	.type-option.default .preview-line {
		border-radius: 1px;
	}

	.type-name {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.85);
		font-weight: 600;
		text-align: center;
		line-height: 1.2;
		white-space: nowrap;
	}

	.type-option.active .type-name {
		color: rgba(var(--color-primary-rgb), 1);
	}

	.advanced-settings {
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}

	.advanced-setting {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.setting-label {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 600;
		min-width: 60px;
	}

	.curvature-slider {
		flex: 1;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		outline: none;
		appearance: none;
		border-radius: 2px;
		cursor: pointer;
	}

	.curvature-slider::-webkit-slider-thumb {
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: rgba(var(--color-primary-rgb), 0.8);
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.curvature-slider::-moz-range-thumb {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: rgba(var(--color-primary-rgb), 0.8);
		cursor: pointer;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.curvature-value {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.8);
		min-width: 25px;
		text-align: center;
	}
</style>

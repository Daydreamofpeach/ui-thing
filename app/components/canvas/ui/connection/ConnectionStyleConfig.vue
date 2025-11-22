<template>
	<div class="connection-style-config">
		<div class="config-section">
			<label class="config-label">
				<UIcon name="i-lucide-palette" class="size-3" />
				Connection Color
			</label>
			<div class="color-picker-wrapper">
				<input 
					type="color" 
					:value="modelValue.color"
					@input="updateColor"
					class="color-input"
				/>
				<span class="color-value">{{ modelValue.color }}</span>
			</div>
		</div>

		<div class="config-section">
			<label class="config-label">
				<UIcon name="i-lucide-sparkles" class="size-3" />
				Animation Type
			</label>
			<select 
				:value="modelValue.animationType"
				@change="updateAnimationType"
				class="config-select"
			>
				<option value="flow">Flow</option>
				<option value="pulse">Pulse</option>
				<option value="wave">Wave</option>
				<option value="dash">Dash</option>
				<option value="glow">Glow</option>
				<option value="particle">Particle</option>
				<option value="beam">Beam</option>
				<option value="laser">Laser</option>
			</select>
		</div>

		<div class="config-section">
			<label class="config-label">
				<UIcon name="i-lucide-gauge" class="size-3" />
				Animation Speed
			</label>
			<select 
				:value="modelValue.animationSpeed"
				@change="updateAnimationSpeed"
				class="config-select"
			>
				<option value="slow">Slow</option>
				<option value="normal">Normal</option>
				<option value="fast">Fast</option>
			</select>
		</div>

		<div class="config-section">
			<label class="config-label">
				<UIcon name="i-lucide-minus" class="size-3" />
				Line Width
			</label>
			<div class="slider-wrapper">
				<input 
					type="range" 
					min="1" 
					max="8" 
					step="0.5"
					:value="modelValue.strokeWidth"
					@input="updateStrokeWidth"
					class="config-slider"
				/>
				<span class="slider-value">{{ modelValue.strokeWidth }}px</span>
			</div>
		</div>

		<div class="config-section">
			<label class="config-label">
				<UIcon name="i-lucide-move" class="size-3" />
				Connection Type
			</label>
			<select 
				:value="modelValue.type"
				@change="updateType"
				class="config-select"
			>
				<option value="smoothstep">Smooth Step</option>
				<option value="step">Step</option>
				<option value="straight">Straight</option>
				<option value="simplebezier">Bezier</option>
			</select>
		</div>

		<div class="config-section">
			<label class="config-label">
				<UIcon name="i-lucide-toggle-left" class="size-3" />
				Animated
			</label>
			<div class="toggle-wrapper">
				<input 
					type="checkbox" 
					:checked="modelValue.animated"
					@change="updateAnimated"
					class="config-checkbox"
				/>
				<span class="toggle-label">{{ modelValue.animated ? 'Yes' : 'No' }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	interface ConnectionStyle {
		color: string;
		animationType: string;
		animationSpeed: string;
		strokeWidth: number;
		type: string;
		animated: boolean;
	}

	interface Props {
		modelValue: ConnectionStyle;
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		"update:modelValue": [value: ConnectionStyle];
	}>();

	const updateColor = (event: Event) => {
		const target = event.target as HTMLInputElement;
		emit("update:modelValue", { ...props.modelValue, color: target.value });
	};

	const updateAnimationType = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		emit("update:modelValue", { ...props.modelValue, animationType: target.value });
	};

	const updateAnimationSpeed = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		emit("update:modelValue", { ...props.modelValue, animationSpeed: target.value });
	};

	const updateStrokeWidth = (event: Event) => {
		const target = event.target as HTMLInputElement;
		emit("update:modelValue", { ...props.modelValue, strokeWidth: parseFloat(target.value) });
	};

	const updateType = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		emit("update:modelValue", { ...props.modelValue, type: target.value });
	};

	const updateAnimated = (event: Event) => {
		const target = event.target as HTMLInputElement;
		emit("update:modelValue", { ...props.modelValue, animated: target.checked });
	};
</script>

<style scoped>
	.connection-style-config {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.config-section {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.config-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.color-picker-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.color-input {
		width: 60px;
		height: 32px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.2);
		cursor: pointer;
	}

	.color-value {
		font-size: 11px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
		font-family: monospace;
	}

	.config-select {
		padding: 6px 10px;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		color: white;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.config-select:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.4);
	}

	.slider-wrapper {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.config-slider {
		flex: 1;
		height: 4px;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.1);
		cursor: pointer;
	}

	.slider-value {
		font-size: 11px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		min-width: 40px;
		text-align: right;
	}

	.toggle-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.config-checkbox {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.toggle-label {
		font-size: 12px;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
	}
</style>


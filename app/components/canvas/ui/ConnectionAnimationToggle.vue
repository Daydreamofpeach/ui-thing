<template>
	<div class="animation-toggle">
		<button
			type="button"
			class="animation-button"
			:class="{ active: modelValue }"
			@click="$emit('update:modelValue', !modelValue)"
		>
			<div class="button-content">
				<UIcon
					:name="modelValue ? getAnimationIcon(animationType || 'flow') : 'i-lucide-pause-circle'"
					class="animation-icon"
				/>
				<span class="animation-text">
					{{ modelValue ? `${getAnimationName(animationType || 'flow')}` : 'Static' }}
				</span>
			</div>
			<div class="animation-indicator" :class="{ active: modelValue }">
				<div class="animation-dot" />
			</div>
		</button>
		<div v-if="modelValue" class="animation-settings">
			<div class="animation-setting">
				<label class="setting-label">Effect</label>
				<select
					:value="animationType"
					class="effect-select"
					@change="$emit('update:animationType', ($event.target as HTMLSelectElement).value as any)"
				>
					<option value="flow">
						Flow
					</option>
					<option value="pulse">
						Pulse
					</option>
					<option value="wave">
						Wave
					</option>
					<option value="dash">
						Dashed
					</option>
					<option value="glow">
						Glow
					</option>
					<option value="bounce">
						Bounce
					</option>
					<option value="particle">
						Particle
					</option>
					<option value="beam">
						Beam
					</option>
					<option value="light">
						Light
					</option>
					<option value="laser">
						Laser
					</option>
				</select>
			</div>
			<div class="animation-setting">
				<label class="setting-label">Speed</label>
				<select
					:value="animationSpeed"
					class="speed-select"
					@change="$emit('update:animationSpeed', ($event.target as HTMLSelectElement).value as any)"
				>
					<option value="slow">
						Slow
					</option>
					<option value="normal">
						Normal
					</option>
					<option value="fast">
						Fast
					</option>
				</select>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { getAnimationIcon, getAnimationName } from "~/utils/connectionAnimations";

	defineProps<{
		modelValue: boolean
		animationSpeed?: "slow" | "normal" | "fast"
		animationType?: "flow" | "pulse" | "wave" | "dash" | "glow" | "bounce" | "particle" | "beam" | "light" | "laser"
	}>();

	defineEmits<{
		"update:modelValue": [value: boolean]
		"update:animationSpeed": [value: "slow" | "normal" | "fast"]
		"update:animationType": [value: "flow" | "pulse" | "wave" | "dash" | "glow" | "bounce" | "particle" | "beam" | "light" | "laser"]
	}>();
</script>

<style scoped>
	.animation-toggle {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.animation-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 5px;
		color: rgba(255, 255, 255, 0.6);
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
	}

	.animation-button:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.animation-button.active {
		background: rgba(var(--color-primary-rgb), 0.1);
		border-color: rgba(var(--color-primary-rgb), 0.3);
		color: rgba(var(--color-primary-rgb), 1);
	}

	.button-content {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.animation-icon {
		font-size: 14px;
	}

	.animation-text {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.animation-indicator {
		width: 20px;
		height: 12px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		position: relative;
		transition: all 0.2s ease;
	}

	.animation-indicator.active {
		background: rgba(var(--color-primary-rgb), 0.3);
	}

	.animation-dot {
		width: 8px;
		height: 8px;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 50%;
		position: absolute;
		top: 2px;
		left: 2px;
		transition: all 0.2s ease;
	}

	.animation-indicator.active .animation-dot {
		transform: translateX(8px);
		background: rgba(var(--color-primary-rgb), 1);
	}

	.animation-settings {
		padding-left: 8px;
		border-left: 2px solid rgba(255, 255, 255, 0.1);
	}

	.animation-setting {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.setting-label {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 600;
	}

	.effect-select,
	.speed-select {
		padding: 6px 8px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 4px;
		color: white;
		font-size: 10px;
		cursor: pointer;
		min-width: 70px;
		appearance: none;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
		background-position: right 6px center;
		background-repeat: no-repeat;
		background-size: 14px;
		padding-right: 26px;
	}

	.effect-select {
		min-width: 80px;
	}

	.effect-select:focus,
	.speed-select:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background-color: rgba(0, 0, 0, 0.3);
		box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.08);
	}

	.effect-select:hover,
	.speed-select:hover {
		background-color: rgba(0, 0, 0, 0.25);
		border-color: rgba(255, 255, 255, 0.15);
	}

	.effect-select option,
	.speed-select option {
		background: rgba(30, 41, 59, 0.95);
		color: white;
		padding: 8px;
	}
</style>

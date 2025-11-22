<template>
	<div class="color-picker-component">
		<label v-if="label" class="color-label">
			{{ label }}
		</label>
		
		<div class="color-picker-container">
			<!-- Color Preview -->
			<div class="color-preview-wrapper">
				<div
					class="color-preview"
					:style="{ background: modelValue || defaultColor }"
					@click="showPicker = !showPicker"
				>
					<span class="color-value">{{ modelValue || defaultColor }}</span>
				</div>
			</div>

			<!-- Predefined Colors -->
			<div v-if="showPicker || showPresets" class="color-presets">
				<button
					v-for="color in presetColors"
					:key="color.value"
					class="preset-color"
					:class="{ active: modelValue === color.value }"
					:style="{ background: color.value }"
					:title="color.name"
					@click="selectColor(color.value)"
				>
					<UIcon v-if="modelValue === color.value" name="i-lucide-check" class="size-3 text-white" />
				</button>
			</div>

			<!-- Custom Color Input -->
			<div v-if="showPicker || allowCustom" class="custom-color-input">
				<input
					:value="modelValue || defaultColor"
					type="color"
					class="color-input"
					@input="handleColorChange"
				>
				<input
					:value="modelValue || defaultColor"
					type="text"
					placeholder="#000000"
					class="color-text-input"
					@input="handleTextInput"
				>
			</div>

			<!-- Opacity Slider (optional) -->
			<div v-if="showOpacity" class="opacity-slider">
				<label class="opacity-label">Opacity: {{ opacity }}%</label>
				<input
					:value="opacity"
					type="range"
					min="0"
					max="100"
					class="opacity-range"
					@input="handleOpacityChange"
				>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref } from "vue";

	interface ColorPreset {
		name: string
		value: string
	}

	const props = withDefaults(defineProps<{
		modelValue?: string
		label?: string
		defaultColor?: string
		showPresets?: boolean
		showOpacity?: boolean
		allowCustom?: boolean
		presetColors?: ColorPreset[]
	}>(), {
		defaultColor: "#3b82f6",
		showPresets: true,
		showOpacity: false,
		allowCustom: true,
		presetColors: () => [
			{ name: "Blue", value: "#3b82f6" },
			{ name: "Purple", value: "#a855f7" },
			{ name: "Pink", value: "#ec4899" },
			{ name: "Red", value: "#ef4444" },
			{ name: "Orange", value: "#f97316" },
			{ name: "Yellow", value: "#eab308" },
			{ name: "Green", value: "#22c55e" },
			{ name: "Teal", value: "#14b8a6" },
			{ name: "Cyan", value: "#06b6d4" },
			{ name: "Indigo", value: "#6366f1" },
			{ name: "Violet", value: "#8b5cf6" },
			{ name: "Fuchsia", value: "#d946ef" }
		]
	});

	const emit = defineEmits<{
		"update:modelValue": [value: string]
		"update:opacity": [value: number]
	}>();

	const showPicker = ref(false);
	const opacity = ref(50);

	const selectColor = (color: string) => {
		emit("update:modelValue", color);
		showPicker.value = false;
	};

	const handleColorChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		emit("update:modelValue", target.value);
	};

	const handleTextInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const value = target.value;
		if (value.match(/^#[0-9A-F]{6}$/i)) {
			emit("update:modelValue", value);
		}
	};

	const handleOpacityChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value);
		opacity.value = value;
		emit("update:opacity", value);
	};
</script>

<style scoped>
.color-picker-component {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.color-label {
	font-size: 0.85rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

.color-picker-container {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.color-preview-wrapper {
	width: 100%;
}

.color-preview {
	width: 100%;
	height: 50px;
	border-radius: 8px;
	border: 2px solid rgba(255, 255, 255, 0.2);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;
	position: relative;
}

.color-preview:hover {
	border-color: rgba(255, 255, 255, 0.4);
	transform: scale(1.02);
}

.color-value {
	background: rgba(0, 0, 0, 0.6);
	padding: 4px 12px;
	border-radius: 4px;
	color: white;
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: uppercase;
}

.color-presets {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 8px;
}

.preset-color {
	width: 100%;
	aspect-ratio: 1;
	border-radius: 6px;
	border: 2px solid rgba(255, 255, 255, 0.2);
	cursor: pointer;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
}

.preset-color:hover {
	border-color: rgba(255, 255, 255, 0.6);
	transform: scale(1.1);
}

.preset-color.active {
	border-color: white;
	border-width: 3px;
	transform: scale(1.05);
}

.custom-color-input {
	display: flex;
	gap: 8px;
	align-items: center;
}

.color-input {
	width: 60px;
	height: 40px;
	border: none;
	border-radius: 6px;
	cursor: pointer;
}

.color-text-input {
	flex: 1;
	padding: 8px 12px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	color: white;
	font-size: 0.85rem;
}

.color-text-input:focus {
	outline: none;
	border-color: rgba(59, 130, 246, 0.5);
}

.opacity-slider {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.opacity-label {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.7);
}

.opacity-range {
	width: 100%;
	height: 6px;
	border-radius: 3px;
	background: rgba(255, 255, 255, 0.1);
	appearance: none;
	cursor: pointer;
}

.opacity-range::-webkit-slider-thumb {
	appearance: none;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: #3b82f6;
	cursor: pointer;
	transition: all 0.2s;
}

.opacity-range::-webkit-slider-thumb:hover {
	background: #60a5fa;
	transform: scale(1.2);
}
</style>


<template>
	<div class="mode-selection" :style="containerStyle">
		<button
			v-for="mode in modes"
			:key="mode.value"
			class="mode-button"
			:class="{ active: modelValue === mode.value }"
			:style="getButtonStyle(mode.value)"
			@click="handleModeChange(mode.value)"
		>
			<UIcon v-if="mode.icon" :name="mode.icon" class="w-4 h-4" />
			<span>{{ mode.label }}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
	import { computed } from "vue";

	export interface ModeOption {
		value: string
		label: string
		icon?: string
	}

	interface Props {
		modelValue: string
		modes?: ModeOption[]
		activeColor?: string
		inactiveColor?: string
		backgroundColor?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		modes: () => [
			{ value: "select", label: "Select Existing", icon: "i-lucide-list" },
			{ value: "create", label: "Create New", icon: "i-lucide-plus-circle" }
		],
		activeColor: "6, 182, 212", // cyan-500 RGB
		inactiveColor: "255, 255, 255",
		backgroundColor: "rgba(0, 0, 0, 0.2)"
	});

	const emit = defineEmits<{
		"update:modelValue": [value: string]
	}>();

	const containerStyle = computed(() => ({
		backgroundColor: props.backgroundColor
	}));

	const getButtonStyle = (modeValue: string) => {
		if (props.modelValue === modeValue) {
			return {
				backgroundColor: `rgba(${props.activeColor}, 0.2)`,
				borderColor: `rgba(${props.activeColor}, 0.4)`,
				color: `rgb(${props.activeColor})`,
				boxShadow: `0 4px 12px rgba(${props.activeColor}, 0.2)`
			};
		}
		return {};
	};

	const handleModeChange = (value: string) => {
		emit("update:modelValue", value);
	};
</script>

<style scoped>
.mode-selection {
	display: flex;
	gap: 0.5rem;
	padding: 0.5rem;
	background: rgba(0, 0, 0, 0.2);
	border-radius: 0.5rem;
	margin: 0.5rem 1rem;
	flex-shrink: 0;
}

.mode-button {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.mode-button:hover {
	background: rgba(255, 255, 255, 0.08);
	color: rgba(255, 255, 255, 0.9);
	border-color: rgba(255, 255, 255, 0.2);
}

/* Active state styles applied via :style binding */
</style>

<template>
	<button
		:type="type"
		:disabled="disabled || loading"
		class="form-button"
		:class="[buttonClass, variantClass]"
		:style="buttonStyle"
		@click="handleClick"
	>
		<UIcon v-if="loading" name="i-lucide-loader-2" class="w-4 h-4 animate-spin" />
		<UIcon v-else-if="icon" :name="icon" class="w-4 h-4" />
		<span>{{ loading ? loadingText : label }}</span>
	</button>
</template>

<script setup lang="ts">
	import { computed } from "vue";
	import UIcon from "~/components/Ui/Icon.vue";

	interface Props {
		type?: "button" | "submit" | "reset"
		label?: string
		loadingText?: string
		icon?: string
		loading?: boolean
		disabled?: boolean
		buttonClass?: string
		variant?: "primary" | "secondary" | "danger"
		themeColor?: string
	}

	const props = withDefaults(defineProps<Props>(), {
		type: "button",
		label: "Submit",
		loadingText: "Loading...",
		icon: undefined,
		loading: false,
		disabled: false,
		buttonClass: "",
		variant: "primary",
		themeColor: "var(--color-primary-rgb)"
	});

	const emit = defineEmits<{
		click: [event: MouseEvent]
	}>();

	const variantClass = computed(() => {
		return `form-button--${props.variant}`;
	});

	const buttonStyle = computed(() => {
		if (props.variant === "primary") {
			return {
				background: `linear-gradient(135deg, rgba(${props.themeColor}, 0.2), rgba(${props.themeColor}, 0.1))`,
				borderColor: `rgba(${props.themeColor}, 0.4)`,
				color: `rgba(${props.themeColor}, 0.9)`
			};
		}
		return {};
	});

	const handleClick = (event: MouseEvent) => {
		if (!props.disabled && !props.loading) {
			emit("click", event);
		}
	};
</script>

<style scoped>
.form-button {
	width: 100%;
	padding: 1rem 1.5rem;
	border: 1px solid;
	border-radius: 0.75rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	backdrop-filter: blur(12px);
}

/* Primary variant styles applied via :style binding */
.form-button--primary:hover:not(:disabled) {
	transform: translateY(-2px);
	filter: brightness(1.2);
	box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.2);
}

.form-button--secondary {
	background: rgba(255, 255, 255, 0.05);
	border-color: rgba(255, 255, 255, 0.2);
	color: rgba(255, 255, 255, 0.8);
}

.form-button--secondary:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.3);
	color: white;
	transform: translateY(-2px);
}

.form-button--danger {
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
	border-color: rgba(239, 68, 68, 0.4);
	color: rgba(239, 68, 68, 0.9);
}

.form-button--danger:hover:not(:disabled) {
	background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.2));
	border-color: rgba(239, 68, 68, 0.6);
	color: rgb(239, 68, 68);
	transform: translateY(-2px);
}

.form-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
}

.form-button:active:not(:disabled) {
	transform: scale(0.98);
}
</style>

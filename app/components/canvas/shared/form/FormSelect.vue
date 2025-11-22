<template>
	<select
		:value="modelValue"
		:disabled="disabled"
		class="form-select"
		:class="selectClass"
		@change="handleChange"
		@click.stop
		@mousedown.stop
	>
		<slot />
	</select>
</template>

<script setup lang="ts">
	interface Props {
		modelValue?: string | number
		disabled?: boolean
		selectClass?: string
	}

	withDefaults(defineProps<Props>(), {
		modelValue: "",
		disabled: false,
		selectClass: ""
	});

	const emit = defineEmits<{
		"update:modelValue": [value: string]
	}>();

	const handleChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		emit("update:modelValue", target.value);
	};
</script>

<style scoped>
.form-select {
	width: 100%;
	padding: 0.75rem 1rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 0.5rem;
	color: white;
	font-size: 0.9375rem;
	font-weight: 500;
	line-height: 1.5;
	transition: all 0.2s ease;
	backdrop-filter: blur(12px);
	cursor: pointer;
}

.form-select option {
	background: #000000;
	background-color: #000000;
	color: white;
	font-size: 0.9375rem;
	padding: 0.75rem;
	line-height: 1.5;
	font-weight: 500;
}

.form-select option:hover {
	background: #000000;
	background-color: #000000;
	color: var(--color-primary);
}

.form-select option:checked,
.form-select option:focus {
	background: #000000;
	background-color: #000000;
	color: var(--color-primary);
	font-weight: 600;
}

.form-select:focus {
	outline: none;
	border: 1px solid rgba(var(--color-primary-rgb), 0.5);
	background: rgba(0, 0, 0, 0.4);
	box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.15);
}

.form-select:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>

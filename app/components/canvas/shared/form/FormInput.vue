<template>
	<input
		:value="modelValue"
		:type="type"
		:placeholder="placeholder"
		:disabled="disabled"
		class="form-input"
		:class="inputClass"
		@input="handleInput"
	>
</template>

<script setup lang="ts">
	interface Props {
		modelValue?: string
		type?: string
		placeholder?: string
		disabled?: boolean
		inputClass?: string
	}

	withDefaults(defineProps<Props>(), {
		modelValue: "",
		type: "text",
		placeholder: "",
		disabled: false,
		inputClass: ""
	})

	const emit = defineEmits<{
		"update:modelValue": [value: string]
	}>()

	const handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement
		emit("update:modelValue", target.value)
	}
</script>

<style scoped>
.form-input {
	width: 100%;
	padding: 0.75rem 1rem;
	background: rgba(17, 24, 39, 0.8);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	border-radius: 0.5rem;
	color: white;
	font-size: 0.9375rem;
	font-weight: 500;
	line-height: 1.5;
	transition: all 0.2s ease;
	backdrop-filter: blur(12px);
}

.form-input::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

.form-input:focus {
	outline: none;
	border: 1px solid rgba(var(--color-primary-rgb), 0.4);
	background: rgba(var(--color-neutral-rgb), 0.12);
	box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.form-input:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>


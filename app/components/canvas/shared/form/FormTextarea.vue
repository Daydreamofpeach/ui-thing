<template>
	<textarea
		:value="modelValue"
		:placeholder="placeholder"
		:rows="rows"
		:disabled="disabled"
		class="form-textarea"
		:class="textareaClass"
		@input="handleInput"
	/>
</template>

<script setup lang="ts">
	interface Props {
		modelValue?: string
		placeholder?: string
		rows?: number
		disabled?: boolean
		textareaClass?: string
	}

	withDefaults(defineProps<Props>(), {
		modelValue: "",
		placeholder: "",
		rows: 3,
		disabled: false,
		textareaClass: ""
	});

	const emit = defineEmits<{
		"update:modelValue": [value: string]
	}>();

	const handleInput = (event: Event) => {
		const target = event.target as HTMLTextAreaElement;
		emit("update:modelValue", target.value);
	};
</script>

<style scoped>
.form-textarea {
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
	resize: vertical;
	min-height: 4rem;
	font-family: inherit;
}

.form-textarea::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

.form-textarea:focus {
	outline: none;
	border: 1px solid rgba(var(--color-primary-rgb), 0.4);
	background: rgba(var(--color-neutral-rgb), 0.12);
	box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.form-textarea:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>

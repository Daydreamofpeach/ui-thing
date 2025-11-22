<template>
	<div class="property-field">
		<label v-if="label" class="property-label">
			{{ label }}
			<span v-if="required" class="required-asterisk">*</span>
		</label>
		<div class="property-input-wrapper">
			<slot>
				<input
					:value="modelValue"
					:type="type"
					:placeholder="placeholder"
					:disabled="disabled"
					class="property-input"
					@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
				>
			</slot>
		</div>
		<div v-if="description" class="property-description">
			{{ description }}
		</div>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		label?: string
		description?: string
		required?: boolean
		type?: string
		placeholder?: string
		disabled?: boolean
		modelValue?: any
	}>();

	defineEmits<{
		'update:modelValue': [value: any]
	}>();
</script>

<style scoped>
	.property-field {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.property-label {
		font-size: 10px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.required-asterisk {
		color: rgba(239, 68, 68, 1);
	}

	.property-input-wrapper {
		position: relative;
	}

	.property-input {
		width: 100%;
		padding: 8px;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 5px;
		color: white;
		font-size: 11px;
		transition: all 0.2s ease;
	}

	.property-input:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(0, 0, 0, 0.3);
	}

	.property-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.property-description {
		font-size: 9px;
		color: rgba(255, 255, 255, 0.4);
		line-height: 1.3;
	}
</style>

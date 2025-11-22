<template>
	<div class="forms-panel-content">
		<FormAutomationController
			:forms="forms"
			@refresh-forms="$emit('refreshForms')"
			@form-selected="$emit('formSelected', $event)"
			@create-form="$emit('createForm')"
			@attach-hook="$emit('attachHook', $event)"
			@add-form-builder-node="$emit('addFormBuilderNode')"
		/>
	</div>
</template>

<script setup lang="ts">
import FormAutomationController from "./FormAutomationController.vue";

interface Form {
	id: string
	title?: string
	description?: string
	createdAt?: string
	json?: any
	html?: string
	css?: string
	fields?: any[]
	lastModified?: string
}

interface Props {
	forms?: Form[]
}

withDefaults(defineProps<Props>(), {
	forms: () => []
});

defineEmits<{
	refreshForms: []
	formSelected: [form: Form]
	createForm: []
	attachHook: [form: Form]
	addFormBuilderNode: []
}>();
</script>

<style scoped>
.forms-panel-content {
	padding: 1.5rem;
	width: 100%;
}
</style>

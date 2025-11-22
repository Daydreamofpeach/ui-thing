<template>
	<div class="project-form">
		<!-- Project Name -->
		<div class="form-field">
			<label class="form-label">Project Name</label>
			<input
				v-model="localData.name"
				type="text"
				class="form-input"
				placeholder="Enter project name"
				:disabled="isLoading"
				@input="updateField('name', localData.name)"
				@click.stop
				@mousedown.stop
				@keydown.stop
			>
		</div>

		<!-- Description -->
		<div class="form-field">
			<label class="form-label">Description</label>
			<textarea
				v-model="localData.description"
				class="form-input form-textarea"
				placeholder="Enter project description"
				rows="3"
				:disabled="isLoading"
				@input="updateField('description', localData.description)"
				@click.stop
				@mousedown.stop
				@keydown.stop
			/>
		</div>

		<!-- Submit Button -->
		<button
			class="submit-button"
			:disabled="isLoading || !isValid"
			@click="handleSubmit"
		>
			<UIcon
				v-if="isLoading"
				name="i-lucide-loader-2"
				class="size-4 animate-spin"
			/>
			<UIcon
				v-else
				name="i-lucide-plus"
				class="size-4"
			/>
			<span>{{ isLoading ? "Creating..." : "Create Project" }}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";

	interface Props {
		mode?: "create" | "edit"
		projectData?: {
			name?: string
			description?: string
		}
		isLoading?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		mode: "create",
		projectData: () => ({}),
		isLoading: false
	});

	const emit = defineEmits<{
		updateField: [key: string, value: any]
		submit: []
	}>();

	// Local form data
	const localData = ref({
		name: props.projectData?.name || "",
		description: props.projectData?.description || ""
	});

	// Track if user has started editing
	const userHasEdited = ref(false);

	// Watch for prop changes - only update if user hasn't started editing
	watch(() => props.projectData, (newData, _oldData) => {
		// Only update if this is the initial load or if user hasn't started editing
		if (newData && !userHasEdited.value) {
			localData.value = {
				name: newData.name || "",
				description: newData.description || ""
			};
		}
	}, { deep: true, immediate: true });

	// Validation
	const isValid = computed(() => {
		return localData.value.name.trim() !== "";
	});

	// Update field
	const updateField = (key: string, value: any) => {
		userHasEdited.value = true;
		emit("updateField", key, value);
	};

	// Submit form
	const handleSubmit = () => {
		if (!isValid.value || props.isLoading) return;
		emit("submit");
	};
</script>

<style scoped>
	.project-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		color: white;
		font-size: 0.875rem;
		transition: all 0.2s ease;
	}

	.form-input:focus {
		outline: none;
		border-color: rgba(var(--color-primary-rgb), 0.5);
		background: rgba(0, 0, 0, 0.4);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
	}

	.form-textarea {
		resize: vertical;
		min-height: 60px;
		pointer-events: auto !important;
		user-select: text !important;
	}

	.form-input:disabled,
	.form-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.submit-button {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(var(--color-primary-rgb), 0.2);
		border: 1px solid rgba(var(--color-primary-rgb), 0.4);
		border-radius: 0.5rem;
		color: var(--color-primary);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 0.5rem;
	}

	.submit-button:hover:not(:disabled) {
		background: rgba(var(--color-primary-rgb), 0.3);
		border-color: rgba(var(--color-primary-rgb), 0.6);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
	}

	.submit-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

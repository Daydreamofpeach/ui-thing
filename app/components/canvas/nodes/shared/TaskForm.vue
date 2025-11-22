<template>
	<div class="task-form">
		<!-- Task Name -->
		<div class="form-field">
			<label class="form-label">Task Name</label>
			<input
				v-model="localData.name"
				type="text"
				class="form-input"
				placeholder="Enter task name"
				:disabled="isLoading"
				@input="updateName"
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
				placeholder="Describe the task..."
				rows="3"
				:disabled="isLoading"
				@input="updateDescription"
				@click.stop
				@mousedown.stop
				@keydown.stop
			/>
		</div>

		<!-- Assign Users (Optional) -->
		<div v-if="availableUsers && availableUsers.length > 0" class="form-field">
			<label class="form-label">
				<UIcon name="i-lucide-users" class="size-3.5" />
				Assign to Users (Optional)
			</label>
			<div class="users-preview">
				<div
					v-for="user in availableUsers.slice(0, 5)"
					:key="user.id"
					class="user-chip"
					:title="user.name || user.email"
				>
					<UIcon name="i-lucide-user" class="size-3" />
					<span class="user-chip-name">{{ getUserDisplayName(user) }}</span>
				</div>
				<div v-if="availableUsers.length > 5" class="user-count">
					+{{ availableUsers.length - 5 }} more
				</div>
			</div>
			<p class="form-hint">
				You can assign users after creating the task
			</p>
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
			<span>{{ isLoading ? "Creating..." : "Create Task" }}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";

	interface Props {
		mode?: "create" | "edit"
		taskData?: {
			name?: string
			description?: string
		}
		isLoading?: boolean
		availableUsers?: any[]
	}

	const props = withDefaults(defineProps<Props>(), {
		mode: "create",
		taskData: () => ({}),
		isLoading: false,
		availableUsers: () => []
	});

	const emit = defineEmits<{
		updateField: [key: string, value: any]
		submit: []
	}>();

	// Local form data
	const localData = ref({
		name: props.taskData?.name || "",
		description: props.taskData?.description || ""
	});

	// Watch for prop changes to update local data
	watch(() => props.taskData, (newTaskData) => {
		if (newTaskData) {
			// Only update if the value has actually changed to avoid cursor jumping
			if (newTaskData.name !== localData.value.name) {
				localData.value.name = newTaskData.name || "";
			}
			if (newTaskData.description !== localData.value.description) {
				localData.value.description = newTaskData.description || "";
			}
		}
	}, { deep: true });

	// Check if form is valid (only name is required)
	const isValid = computed(() => {
		return localData.value.name?.trim().length > 0;
	});

	// Emit individual field updates
	function updateName() {
		console.log("📝 TaskForm: Name updated to:", localData.value.name);
		emit("updateField", "name", localData.value.name);
	}

	function updateDescription() {
		console.log("📝 TaskForm: Description updated to:", localData.value.description);
		emit("updateField", "description", localData.value.description);
	}

	// Handle form submission
	function handleSubmit() {
		if (!isValid.value || props.isLoading) return;
		
		console.log("📝 TaskForm: Submitting with data:", {
			name: localData.value.name,
			description: localData.value.description
		});
		
		// Emit final updates to ensure everything is saved
		updateName();
		updateDescription();
		
		// Small delay to ensure updates are processed
		setTimeout(() => {
			emit("submit");
		}, 50);
	}

	function getUserDisplayName(user: any): string {
		return user.name || user.firstName || user.email?.split("@")[0] || "Unknown";
	}
</script>

<style scoped>
.task-form {
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
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.7);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.form-input {
	width: 100%;
	padding: 0.75rem;
	background: rgba(0, 0, 0, 0.4);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.875rem;
	transition: all 0.2s ease;
}

.form-input::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

.form-input:focus {
	outline: none;
	border-color: rgba(99, 102, 241, 0.6);
	background: rgba(0, 0, 0, 0.6);
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.form-textarea {
	resize: vertical;
	min-height: 5rem;
	line-height: 1.5;
	font-family: inherit;
}

.users-preview {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex-wrap: wrap;
	padding: 0.75rem;
	background: rgba(99, 102, 241, 0.1);
	border: 1px solid rgba(99, 102, 241, 0.2);
	border-radius: 0.5rem;
}

.user-chip {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.375rem 0.625rem;
	background: rgba(99, 102, 241, 0.2);
	border: 1px solid rgba(99, 102, 241, 0.3);
	border-radius: 0.375rem;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.8);
}

.user-chip-name {
	max-width: 6rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.user-count {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	font-weight: 500;
}

.form-hint {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	margin-top: 0.25rem;
}

.submit-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	width: 100%;
	padding: 0.75rem 1rem;
	background: rgba(99, 102, 241, 0.8);
	color: white;
	border: 1px solid rgba(99, 102, 241, 0.4);
	border-radius: 0.5rem;
	font-size: 0.875rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
	background: rgba(99, 102, 241, 1);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	transform: translateY(-1px);
}

.submit-button:active:not(:disabled) {
	transform: translateY(0);
}

.submit-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>

<template>
	<div class="user-form">
		<!-- User Name -->
		<div class="form-field">
			<label class="form-label">User Name</label>
			<input
				v-model="localData.name"
				type="text"
				class="form-input"
				placeholder="Enter user name"
				@input="updateField('name', localData.name)"
			>
		</div>

		<!-- Email -->
		<div class="form-field">
			<label class="form-label">Email</label>
			<input
				v-model="localData.email"
				type="email"
				class="form-input"
				placeholder="user@example.com"
				@input="updateField('email', localData.email)"
			>
		</div>

		<!-- Role -->
		<div class="form-field">
			<label class="form-label">Role</label>
			<FormSelect
				v-model="localData.role"
				@update:model-value="updateField('role', $event)"
			>
				<option value="member">Member</option>
				<option value="developer">Developer</option>
				<option value="admin">Admin</option>
				<option value="owner">Owner</option>
				<option value="guest">Guest</option>
			</FormSelect>
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
				name="i-lucide-user-plus"
				class="size-4"
			/>
			<span>{{ isLoading ? "Creating..." : "Create User" }}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, watch } from "vue";
	import FormSelect from "../../shared/form/FormSelect.vue";

	interface Props {
		mode?: "create" | "edit"
		userData?: {
			name?: string
			email?: string
			role?: string
		}
		isLoading?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		mode: "create",
		userData: () => ({}),
		isLoading: false
	});

	const emit = defineEmits<{
		"update-field": [key: string, value: any]
		submit: []
	}>();

	// Local form data
	const localData = ref({
		name: props.userData?.name || "",
		email: props.userData?.email || "",
		role: props.userData?.role || "member"
	});

	// Watch for prop changes
	watch(() => props.userData, (newData) => {
		if (newData) {
			localData.value = {
				name: newData.name || "",
				email: newData.email || "",
				role: newData.role || "member"
			};
		}
	}, { deep: true, immediate: true });

	// Validation
	const isValid = computed(() => {
		return localData.value.name.trim() !== "" 
			&& localData.value.email.trim() !== ""
			&& /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localData.value.email);
	});

	// Update field
	const updateField = (key: string, value: any) => {
		emit("update-field", key, value);
	};

	// Submit form
	const handleSubmit = () => {
		if (!isValid.value || props.isLoading) return;
		emit("submit");
	};
</script>

<style scoped>
	.user-form {
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

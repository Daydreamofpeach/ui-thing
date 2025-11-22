<template>
	<div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black backdrop-blur-sm" @click="handleClose" />

		<!-- Modal Content -->
		<div class="relative w-full max-w-2xl mx-4">
			<div class="glassmorphic-panel p-6 border border-primary/20 rounded-xl">
				<!-- Modal Header -->
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-3">
						<Icon name="lucide:truck" class="size-6 text-primary" />
						<h3 class="text-xl font-semibold text-white">
							{{ isEditMode ? 'Edit Transport' : 'Create New Transport' }}
						</h3>
					</div>
					<button
						class="text-white/60 hover:text-white transition-colors"
						@click="handleClose"
					>
						<Icon name="lucide:x" class="size-5" />
					</button>
				</div>

				<!-- Transport Form -->
				<form @submit.prevent="handleSubmit" class="space-y-6">
					<!-- Basic Information -->
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Transport Name *
							</label>
							<input
								v-model="formData.name"
								type="text"
								placeholder="Enter transport name"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none"
								required
								:disabled="isSubmitting"
							>
						</div>

						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Description
							</label>
							<textarea
								v-model="formData.description"
								placeholder="Describe your transport"
								rows="3"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none resize-none"
								:disabled="isSubmitting"
							></textarea>
						</div>

						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Transport Type *
							</label>
							<select
								v-model="formData.type"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white focus:border-primary/60 focus:outline-none"
								required
								:disabled="isSubmitting"
							>
								<option value="">Select transport type</option>
								<option
									v-for="type in availableTypes"
									:key="type.value"
									:value="type.value"
								>
									{{ type.label }}
								</option>
							</select>
						</div>

						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Target *
							</label>
							<input
								v-model="formData.target"
								type="text"
								:placeholder="getTargetPlaceholder"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none"
								required
								:disabled="isSubmitting"
							>
							<p v-if="getTargetHelpText" class="text-xs text-white/50 mt-1">
								{{ getTargetHelpText }}
							</p>
						</div>

						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Hook (Optional)
							</label>
							<input
								v-model="formData.hook"
								type="text"
								placeholder="Hook identifier"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none"
								:disabled="isSubmitting"
							>
							<p class="text-xs text-white/50 mt-1">
								Optional hook identifier to associate with this transport
							</p>
						</div>
					</div>

					<!-- Error Display -->
					<div v-if="formError" class="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
						<p class="text-red-400 text-sm">{{ formError }}</p>
					</div>

					<!-- Actions -->
					<div class="flex justify-end gap-3 pt-4 border-t border-white/10">
						<button
							type="button"
							class="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
							@click="handleClose"
							:disabled="isSubmitting"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-6 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							:disabled="!isFormValid || isSubmitting"
						>
							<Icon v-if="isSubmitting" name="lucide:loader-2" class="size-4 mr-2 animate-spin" />
							{{ isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Transport' : 'Create Transport') }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { computed, watch } from 'vue'
	import { useTransportForm } from '~/composables/useTransportForm'
	import { useTransports } from '~/composables/useTransports'
	import type { Transport } from '~/composables/useTransports'

	interface Props {
		isOpen: boolean
		transport?: Transport | null
		availableTypes?: Array<{ label: string; value: string }>
	}

	interface Emits {
		close: []
		created: [transport: Transport]
		updated: [transport: Transport]
	}

	const props = withDefaults(defineProps<Props>(), {
		transport: null,
		availableTypes: () => []
	})

	const emit = defineEmits<Emits>()

	// Composables
	const { 
		formData, 
		isSubmitting, 
		formError, 
		defaultTransportTypes,
		isFormValid,
		getTargetPlaceholder,
		getTargetHelpText,
		resetForm,
		populateForm,
		toCreateData,
		toUpdateData
	} = useTransportForm()

	const { createTransport, updateTransport } = useTransports()

	// Computed
	const isEditMode = computed(() => !!props.transport)

	const availableTypes = computed(() => {
		return props.availableTypes.length > 0 ? props.availableTypes : defaultTransportTypes
	})

	// Watch for transport changes to populate form
	watch(() => props.transport, (newTransport) => {
		if (newTransport) {
			populateForm(newTransport)
		} else {
			resetForm()
		}
	}, { immediate: true })

	// Watch for modal open/close to reset form
	watch(() => props.isOpen, (isOpen) => {
		if (isOpen && !props.transport) {
			resetForm()
		}
	})

	// Handlers
	const handleClose = () => {
		if (!isSubmitting.value) {
			emit('close')
		}
	}

	const handleSubmit = async () => {
		if (!isFormValid.value || isSubmitting.value) return

		isSubmitting.value = true
		formError.value = null

		try {
			if (isEditMode.value && props.transport?.id) {
				// Update existing transport
				const updateData = toUpdateData()
				const updatedTransport = await updateTransport(props.transport.id, updateData)
				emit('updated', updatedTransport)
			} else {
				// Create new transport
				const createData = toCreateData()
				const createdTransport = await createTransport(createData)
				emit('created', createdTransport)
			}

			emit('close')
		} catch (error) {
			console.error('Error submitting transport form:', error)
			formError.value = error instanceof Error ? error.message : 'An error occurred'
		} finally {
			isSubmitting.value = false
		}
	}
</script>

<style scoped>
	/* Glassmorphic Panel */
	.glassmorphic-panel {
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(var(--color-neutral-rgb), 0.12);
		transition: all 0.3s ease;
		border-radius: 1rem;
	}

	/* Glassmorphic Input Styles */
	.glassmorphic-input {
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}

	.glassmorphic-input:focus {
		background: rgba(0, 0, 0, 0.4);
		border-color: rgba(var(--color-primary-rgb), 0.6);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
	}

	.glassmorphic-input option {
		background: rgba(0, 0, 0, 0.9);
		color: white;
	}

	.glassmorphic-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>


<template>
	<div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center">
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black backdrop-blur-sm" @click="handleClose" />

		<!-- Modal Content -->
		<div class="relative w-full max-w-4xl mx-4">
			<div class="glassmorphic-panel p-6 border border-primary/20 rounded-xl max-h-[90vh] overflow-y-auto">
				<!-- Modal Header -->
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-3">
						<Icon name="lucide:hook" class="size-6 text-primary" />
						<h3 class="text-xl font-semibold text-white">
							Create New Hook
						</h3>
					</div>
					<button
						class="text-white/60 hover:text-white transition-colors"
						@click="handleClose"
					>
						<Icon name="lucide:x" class="size-5" />
					</button>
				</div>

				<!-- Hook Form -->
				<form @submit.prevent="handleSubmit" class="space-y-6">
					<!-- Basic Information -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Hook Name *
							</label>
							<input
								v-model="formData.name"
								type="text"
								placeholder="Enter hook name"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none"
								required
								:disabled="isSubmitting"
							>
						</div>

						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Hook Type *
							</label>
							<select
								v-model="formData.type"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white focus:border-primary/60 focus:outline-none"
								required
								:disabled="isSubmitting"
							>
								<option value="">Select hook type</option>
								<option
									v-for="type in availableTypes"
									:key="type.value"
									:value="type.value"
								>
									{{ type.label }}
								</option>
							</select>
						</div>
					</div>

					<div>
						<label class="block text-sm font-medium text-white/80 mb-2">
							Description
						</label>
						<textarea
							v-model="formData.description"
							placeholder="Describe your hook"
							rows="3"
							class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none resize-none"
							:disabled="isSubmitting"
						></textarea>
					</div>

					<!-- Configuration -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Priority
							</label>
							<select
								v-model="formData.priority"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white focus:border-primary/60 focus:outline-none"
								:disabled="isSubmitting"
							>
								<option
									v-for="priority in priorityOptions"
									:key="priority.value"
									:value="priority.value"
								>
									{{ priority.label }}
								</option>
							</select>
						</div>

						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Organisation ID
							</label>
							<input
								v-model="formData.organisationId"
								type="text"
								placeholder="Organisation ID (optional)"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none"
								:disabled="isSubmitting"
							>
						</div>
					</div>

					<!-- Trigger Events -->
					<div>
						<label class="block text-sm font-medium text-white/80 mb-2">
							Trigger Events *
						</label>
						<div class="space-y-3">
							<!-- Event Selection -->
							<div class="flex gap-2">
								<select
									v-model="selectedEvent"
									class="glassmorphic-input flex-1 px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white focus:border-primary/60 focus:outline-none"
									:disabled="isSubmitting"
								>
									<option value="">Select an event to add</option>
									<option
										v-for="event in eventTypes"
										:key="event.value"
										:value="event.value"
									>
										{{ event.label }}
									</option>
								</select>
								<button
									type="button"
									class="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg transition-colors"
									@click="addSelectedEvent"
									:disabled="!selectedEvent || isSubmitting"
								>
									<Icon name="lucide:plus" class="size-4" />
								</button>
							</div>

							<!-- Selected Events -->
							<div v-if="formData.trigger.events.length > 0" class="space-y-2">
								<p class="text-sm text-white/60">Selected Events:</p>
								<div class="flex flex-wrap gap-2">
									<div
										v-for="event in formData.trigger.events"
										:key="event"
										class="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-sm text-primary"
									>
										<span>{{ getEventLabel(event) }}</span>
										<button
											type="button"
											class="text-primary/70 hover:text-primary"
											@click="removeEvent(event)"
											:disabled="isSubmitting"
										>
											<Icon name="lucide:x" class="size-3" />
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Retry Configuration -->
					<div>
						<label class="block text-sm font-medium text-white/80 mb-2">
							Retry Configuration
						</label>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label class="block text-xs text-white/60 mb-1">Max Retries</label>
								<input
									v-model.number="formData.retryConfig.maxRetries"
									type="number"
									min="0"
									max="10"
									class="glassmorphic-input w-full px-3 py-2 rounded-lg border border-primary/30 bg-black/20 text-white focus:border-primary/60 focus:outline-none"
									:disabled="isSubmitting"
								>
							</div>
							<div>
								<label class="block text-xs text-white/60 mb-1">Retry Delay (ms)</label>
								<input
									v-model.number="formData.retryConfig.retryDelay"
									type="number"
									min="100"
									max="60000"
									step="100"
									class="glassmorphic-input w-full px-3 py-2 rounded-lg border border-primary/30 bg-black/20 text-white focus:border-primary/60 focus:outline-none"
									:disabled="isSubmitting"
								>
							</div>
							<div>
								<label class="block text-xs text-white/60 mb-1">Backoff Multiplier</label>
								<input
									v-model.number="formData.retryConfig.backoffMultiplier"
									type="number"
									min="1"
									max="10"
									step="0.1"
									class="glassmorphic-input w-full px-3 py-2 rounded-lg border border-primary/30 bg-black/20 text-white focus:border-primary/60 focus:outline-none"
									:disabled="isSubmitting"
								>
							</div>
						</div>
					</div>

					<!-- Enable/Disable -->
					<div class="flex items-center gap-3">
						<input
							v-model="formData.enabled"
							type="checkbox"
							id="hook-enabled"
							class="w-4 h-4 text-primary bg-black/20 border-primary/30 rounded focus:ring-primary/60 focus:ring-2"
							:disabled="isSubmitting"
						>
						<label for="hook-enabled" class="text-sm font-medium text-white/80">
							Enable this hook
						</label>
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
							{{ isSubmitting ? 'Creating...' : 'Create Hook' }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { computed, watch, ref } from 'vue'
	import { useHookForm } from '~/composables/useHookForm'
	import { useHooks } from '~/composables/useHooks'
	import type { Hook } from '~/composables/useHooks'

	interface Props {
		isOpen: boolean
		availableTypes?: Array<{ label: string; value: string }>
		organisationId?: string
	}

	interface Emits {
		close: []
		created: [hook: Hook]
	}

	const props = withDefaults(defineProps<Props>(), {
		availableTypes: () => [],
		organisationId: ''
	})

	const emit = defineEmits<Emits>()

	// Composables
	const { 
		formData, 
		isSubmitting, 
		formError, 
		defaultHookTypes,
		priorityOptions,
		eventTypes,
		isFormValid,
		resetForm,
		toCreateData,
		addEvent,
		removeEvent
	} = useHookForm()

	const { createHook } = useHooks()

	// Local state
	const selectedEvent = ref('')

	// Computed
	const availableTypes = computed(() => {
		return props.availableTypes.length > 0 ? props.availableTypes : defaultHookTypes
	})

	// Watch for modal open/close to reset form
	watch(() => props.isOpen, (isOpen) => {
		if (isOpen) {
			resetForm()
			// Set organisation ID if provided
			if (props.organisationId) {
				formData.organisationId = props.organisationId
			}
		}
	})

	// Methods
	const addSelectedEvent = () => {
		if (selectedEvent.value) {
			addEvent(selectedEvent.value)
			selectedEvent.value = ''
		}
	}

	const getEventLabel = (eventValue: string): string => {
		const event = eventTypes.find(e => e.value === eventValue)
		return event?.label || eventValue
	}

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
			// Create new hook
			const createData = toCreateData()
			const createdHook = await createHook(createData)
			emit('created', createdHook)

			emit('close')
		} catch (error) {
			console.error('Error submitting hook form:', error)
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



<template>
	<Teleport to="body">
		<div v-if="isOpen" class="rename-modal-overlay">
			<!-- Backdrop -->
			<div class="rename-modal-backdrop" @click="handleBackdropClick" />

			<!-- Modal Container -->
			<div class="rename-modal-container" :class="{ 'rename-modal-open': isOpen }">
				<!-- Modal Header -->
				<div class="modal-header">
					<div class="header-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</div>
					<div class="header-content">
						<h3 class="header-title">
							Rename Canvas
						</h3>
						<p class="header-subtitle">
							Update your canvas name
						</p>
					</div>
					<button
						class="modal-close-button"
						@click="handleCancel"
						aria-label="Close rename modal"
					>
						<svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Modal Body -->
				<div class="modal-body">
					<div class="rename-content">
						<div class="rename-message">
							<h4 class="rename-title">
								Enter New Name
							</h4>
							<p class="rename-description">
								Choose a descriptive name for your canvas workflow
							</p>
						</div>

						<!-- Input Field -->
						<div class="input-group">
							<label class="input-label">Canvas Name</label>
							<input
								v-model="newName"
								type="text"
								class="name-input"
								placeholder="Enter canvas name..."
								:disabled="isRenaming"
								@keyup.enter="handleRename"
								@keyup.escape="handleCancel"
							>
						</div>

						<div class="rename-actions">
							<button
								:disabled="isRenaming || !newName.trim()"
								class="rename-button rename-button-primary"
								@click="handleRename"
							>
								<svg v-if="isRenaming" class="button-icon animate-spin" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
								</svg>
								<svg v-else class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								{{ isRenaming ? "Saving..." : "Save" }}
							</button>

							<button
								:disabled="isRenaming"
								class="rename-button rename-button-secondary"
								@click="handleCancel"
							>
								<svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
								Cancel
							</button>
						</div>

						<!-- Error Message -->
						<div v-if="errorMessage" class="error-message">
							<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>{{ errorMessage }}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import { computed, onUnmounted, ref, watch } from "vue";

	interface Props {
		open?: boolean
		canvasId?: string
		currentName?: string
		closeOnBackdrop?: boolean
		closeOnEscape?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		open: false,
		canvasId: "",
		currentName: "",
		closeOnBackdrop: true,
		closeOnEscape: true
	});

	const emit = defineEmits<{
		close: []
		confirm: [canvasId: string, newName: string]
		success: []
		error: [error: string]
	}>();

	const isOpen = computed(() => props.open);
	const isRenaming = ref(false);
	const errorMessage = ref("");
	const newName = ref(props.currentName);

	// Watch for modal open/close
	watch(isOpen, (open) => {
		if (open) {
			errorMessage.value = "";
			newName.value = props.currentName;
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";

			// Auto-focus input after modal opens
			setTimeout(() => {
				const input = document.querySelector(".name-input") as HTMLInputElement;
				if (input) {
					input.focus();
					input.select();
				}
			}, 100);
		} else {
			errorMessage.value = "";
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		}
	});

	// Watch for currentName changes
	watch(() => props.currentName, (name) => {
		if (name && isOpen.value) {
			newName.value = name;
		}
	});

	const handleRename = async () => {
		const trimmedName = newName.value.trim();

		if (!trimmedName) {
			errorMessage.value = "Canvas name cannot be empty";
			return;
		}

		if (trimmedName === props.currentName) {
			handleCancel();
			return;
		}

		try {
			isRenaming.value = true;
			errorMessage.value = "";

			// Emit confirm event to parent
			emit("confirm", props.canvasId || "", trimmedName);

			// Wait a bit for the rename to complete
			await new Promise((resolve) => setTimeout(resolve, 300));

			emit("success");
			handleCancel();
		} catch (err) {
			const error = err instanceof Error ? err.message : "Failed to rename canvas";
			errorMessage.value = error;
			emit("error", error);
		} finally {
			isRenaming.value = false;
		}
	};

	const handleCancel = () => {
		newName.value = props.currentName;
		emit("close");
	};

	const handleBackdropClick = () => {
		if (props.closeOnBackdrop && !isRenaming.value) {
			handleCancel();
		}
	};

	// Handle escape key
	const handleEscape = (event: KeyboardEvent) => {
		if (event.key === "Escape" && props.closeOnEscape && isOpen.value && !isRenaming.value) {
			handleCancel();
		}
	};

	// Cleanup on unmount
	onUnmounted(() => {
		document.removeEventListener("keydown", handleEscape);
		document.body.style.overflow = "";
	});
</script>

<style scoped>
	/* Base Modal Styles */
	.rename-modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.rename-modal-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(8px);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;
		animation: backdropFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.rename-modal-container {
		position: relative;
		width: 100%;
		max-width: 450px;
		background: rgba(15, 15, 15, 0.98);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.75rem;
		overflow: hidden;
		box-shadow:
			0 25px 80px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(59, 130, 246, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		transform: scale(0.95);
		opacity: 0;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.rename-modal-open {
		transform: scale(1);
		opacity: 1;
	}

	/* Header Styles */
	.modal-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		border-bottom: 1px solid rgba(59, 130, 246, 0.2);
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
		position: relative;
	}

	.header-icon {
		flex-shrink: 0;
	}

	.icon-svg {
		width: 2.5rem;
		height: 2.5rem;
		color: rgba(59, 130, 246, 0.8);
	}

	.header-content {
		flex: 1;
	}

	.header-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
		margin: 0 0 0.25rem 0;
	}

	.header-subtitle {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.modal-close-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 0.375rem;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.modal-close-button:hover {
		background: rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.95);
		transform: scale(1.1);
	}

	.close-icon {
		width: 1.125rem;
		height: 1.125rem;
	}

	/* Body Styles */
	.modal-body {
		padding: 1.5rem;
	}

	.rename-content {
		text-align: center;
	}

	.rename-message {
		margin-bottom: 1.5rem;
	}

	.rename-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
		margin: 0 0 0.5rem 0;
	}

	.rename-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		line-height: 1.6;
	}

	/* Input Styles */
	.input-group {
		margin-bottom: 1.5rem;
		text-align: left;
	}

	.input-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 0.5rem;
	}

	.name-input {
		width: 100%;
		padding: 0.75rem 1rem;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.5rem;
		color: white;
		font-size: 0.9375rem;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.name-input:focus {
		outline: none;
		background: rgba(0, 0, 0, 0.5);
		border-color: rgba(59, 130, 246, 0.5);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.name-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.name-input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	/* Action Buttons */
	.rename-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.rename-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: none;
	}

	.rename-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.button-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.rename-button-primary {
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.3);
		color: rgba(59, 130, 246, 0.9);
	}

	.rename-button-primary:hover:not(:disabled) {
		background: rgba(59, 130, 246, 0.3);
		border-color: rgba(59, 130, 246, 0.5);
		color: rgba(59, 130, 246, 1);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.rename-button-secondary {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.7);
	}

	.rename-button-secondary:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.3);
		color: rgba(255, 255, 255, 0.9);
	}

	/* Error Message */
	.error-message {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		color: rgba(239, 68, 68, 0.9);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.error-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	/* Animations */
	@keyframes backdropFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.rename-modal-container {
			max-width: none;
			margin: 1rem;
		}

		.modal-header {
			padding: 1.25rem;
		}

		.modal-body {
			padding: 1.25rem;
		}
	}
</style>


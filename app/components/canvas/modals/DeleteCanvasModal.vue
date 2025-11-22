<template>
	<Teleport to="body">
		<div v-if="isOpen" class="delete-modal-overlay">
			<!-- Backdrop -->
			<div class="delete-modal-backdrop" @click="handleBackdropClick" />

			<!-- Modal Container -->
			<div class="delete-modal-container" :class="{ 'delete-modal-open': isOpen }">
				<!-- Modal Header -->
				<div class="modal-header">
					<div class="header-icon">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="icon-svg">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</div>
					<div class="header-content">
						<h3 class="header-title">
							Delete Canvas
						</h3>
						<p class="header-subtitle">
							This action cannot be undone
						</p>
					</div>
					<button
						class="modal-close-button"
						@click="handleCancel"
						aria-label="Close delete modal"
					>
						<svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Modal Body -->
				<div class="modal-body">
					<div class="delete-content">
						<div class="warning-icon">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="warning-svg">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>

						<div class="delete-message">
							<h4 class="delete-title">
								Confirm Deletion
							</h4>
							<p class="delete-description">
								Are you sure you want to delete <strong>"{{ canvasName }}"</strong>?
								All nodes, edges, and configurations will be permanently removed.
							</p>
						</div>

						<div class="delete-actions">
							<button
								:disabled="isDeleting"
								class="delete-button delete-button-danger"
								@click="handleDelete"
							>
								<svg v-if="isDeleting" class="button-icon animate-spin" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
								</svg>
								<svg v-else class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
								{{ isDeleting ? "Deleting..." : "Delete Canvas" }}
							</button>

							<button
								:disabled="isDeleting"
								class="delete-button delete-button-secondary"
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
		canvasName?: string
		closeOnBackdrop?: boolean
		closeOnEscape?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		open: false,
		canvasId: "",
		canvasName: "Untitled Canvas",
		closeOnBackdrop: true,
		closeOnEscape: true
	});

	const emit = defineEmits<{
		close: []
		confirm: [canvasId: string]
		success: []
		error: [error: string]
	}>();

	const isOpen = computed(() => props.open);
	const isDeleting = ref(false);
	const errorMessage = ref("");

	// Watch for modal open/close
	watch(isOpen, (open) => {
		if (open) {
			errorMessage.value = "";
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		} else {
			errorMessage.value = "";
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		}
	});

	const handleDelete = async () => {
		try {
			isDeleting.value = true;
			errorMessage.value = "";

			// Emit confirm event to parent
			emit("confirm", props.canvasId || "");

			// Wait a bit for the deletion to complete
			await new Promise((resolve) => setTimeout(resolve, 300));

			emit("success");
			handleCancel();
		} catch (err) {
			const error = err instanceof Error ? err.message : "Failed to delete canvas";
			errorMessage.value = error;
			emit("error", error);
		} finally {
			isDeleting.value = false;
		}
	};

	const handleCancel = () => {
		emit("close");
	};

	const handleBackdropClick = () => {
		if (props.closeOnBackdrop && !isDeleting.value) {
			handleCancel();
		}
	};

	// Handle escape key
	const handleEscape = (event: KeyboardEvent) => {
		if (event.key === "Escape" && props.closeOnEscape && isOpen.value && !isDeleting.value) {
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
	.delete-modal-overlay {
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

	.delete-modal-backdrop {
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

	.delete-modal-container {
		position: relative;
		width: 100%;
		max-width: 450px;
		background: rgba(15, 15, 15, 0.98);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.75rem;
		overflow: hidden;
		box-shadow:
			0 25px 80px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(239, 68, 68, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		transform: scale(0.95);
		opacity: 0;
		transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.delete-modal-open {
		transform: scale(1);
		opacity: 1;
	}

	/* Header Styles */
	.modal-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		border-bottom: 1px solid rgba(239, 68, 68, 0.2);
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
		position: relative;
	}

	.header-icon {
		flex-shrink: 0;
	}

	.icon-svg {
		width: 2.5rem;
		height: 2.5rem;
		color: rgba(239, 68, 68, 0.8);
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

	.delete-content {
		text-align: center;
	}

	.warning-icon {
		margin-bottom: 1.5rem;
	}

	.warning-svg {
		width: 4rem;
		height: 4rem;
		color: rgba(239, 68, 68, 0.8);
		margin: 0 auto;
	}

	.delete-message {
		margin-bottom: 2rem;
	}

	.delete-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
		margin: 0 0 0.75rem 0;
	}

	.delete-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		line-height: 1.6;
	}

	.delete-description strong {
		color: rgba(239, 68, 68, 0.9);
		font-weight: 600;
	}

	/* Action Buttons */
	.delete-actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.delete-button {
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

	.delete-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.button-icon {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.delete-button-danger {
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: rgba(239, 68, 68, 0.9);
	}

	.delete-button-danger:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.3);
		border-color: rgba(239, 68, 68, 0.5);
		color: rgba(239, 68, 68, 1);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
	}

	.delete-button-secondary {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.7);
	}

	.delete-button-secondary:hover:not(:disabled) {
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
		.delete-modal-container {
			max-width: none;
			margin: 1rem;
		}

		.modal-header {
			padding: 1.25rem;
		}

		.modal-body {
			padding: 1.25rem;
		}

		.warning-svg {
			width: 3rem;
			height: 3rem;
		}
	}
</style>

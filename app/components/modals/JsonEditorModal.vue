<template>
	<Teleport to="body">
		<div v-if="isOpen" class="json-editor-modal-overlay">
			<!-- Backdrop -->
			<div class="json-editor-modal-backdrop" @click="handleBackdropClick" />

			<!-- Modal Container -->
			<div class="json-editor-modal-container" :class="{ 'json-editor-modal-open': isOpen }">
				<!-- Modal Header -->
				<div class="modal-header">
					<div class="header-icon">
						<UIcon name="i-lucide-code" class="size-10" />
					</div>
					<div class="header-content">
						<h3 class="header-title">
							Canvas JSON
						</h3>
						<p class="header-subtitle">
							nodes.json - View and edit your canvas structure
						</p>
					</div>
					<div class="header-actions">
						<button
							class="action-button"
							title="Copy JSON"
							@click="handleCopy"
						>
							<UIcon name="i-lucide-copy" class="size-4" />
						</button>
						<button
							class="action-button"
							title="Download JSON"
							@click="handleDownload"
						>
							<UIcon name="i-lucide-download" class="size-4" />
						</button>
						<button
							class="modal-close-button"
							aria-label="Close JSON editor"
							@click="handleClose"
						>
							<UIcon name="i-lucide-x" class="size-4" />
						</button>
					</div>
				</div>

				<!-- Modal Body -->
				<div class="modal-body">
					<MonacoEditor
						v-model="jsonContent"
						language="json"
						:height="600"
						:readonly="false"
						theme="vs-dark"
						:options="{
							formatOnPaste: true,
							formatOnType: true,
							automaticLayout: true,
							minimap: { enabled: true },
							scrollBeyondLastLine: false,
							wordWrap: 'on',
							lineNumbers: 'on',
							folding: true
						}"
					/>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import { computed, onUnmounted, ref, watch } from "vue";
	import MonacoEditor from "#ui/MonacoEditor.vue";

	interface Props {
		open?: boolean
		jsonData?: string
		closeOnBackdrop?: boolean
		closeOnEscape?: boolean
	}

	const props = withDefaults(defineProps<Props>(), {
		open: false,
		jsonData: "{}",
		closeOnBackdrop: true,
		closeOnEscape: true
	});

	const emit = defineEmits<{
		close: []
		copy: []
		download: []
	}>();

	const isOpen = computed(() => props.open);
	const jsonContent = ref(props.jsonData);

	// Handle escape key
	const handleEscape = (event: KeyboardEvent) => {
		if (event.key === "Escape" && props.closeOnEscape && isOpen.value) {
			handleClose();
		}
	};

	const handleClose = () => {
		emit("close");
	};

	const handleBackdropClick = () => {
		if (props.closeOnBackdrop) {
			handleClose();
		}
	};

	const handleCopy = () => {
		emit("copy");
	};

	const handleDownload = () => {
		emit("download");
	};

	// Watch for prop changes
	watch(() => props.jsonData, (newData) => {
		if (newData && isOpen.value) {
			jsonContent.value = newData;
		}
	});

	// Watch for modal open/close
	watch(isOpen, (open) => {
		if (open) {
			jsonContent.value = props.jsonData;
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		} else {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		}
	});

	// Cleanup on unmount
	onUnmounted(() => {
		document.removeEventListener("keydown", handleEscape);
		document.body.style.overflow = "";
	});
</script>

<style scoped>
	/* Base Modal Styles */
	.json-editor-modal-overlay {
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

	.json-editor-modal-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(8px);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;
		animation: backdropFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.json-editor-modal-container {
		position: relative;
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
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
		display: flex;
		flex-direction: column;
	}

	.json-editor-modal-open {
		transform: scale(1);
		opacity: 1;
	}

	/* Header Styles */
	.modal-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid rgba(59, 130, 246, 0.2);
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%);
		position: relative;
		flex-shrink: 0;
	}

	.header-icon {
		flex-shrink: 0;
		color: rgba(59, 130, 246, 0.8);
	}

	.header-content {
		flex: 1;
		min-width: 0;
	}

	.header-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
		margin: 0 0 0.125rem 0;
	}

	.header-subtitle {
		font-size: 0.8125rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.action-button {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 0.375rem;
		color: rgba(59, 130, 246, 0.9);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-button:hover {
		background: rgba(59, 130, 246, 0.2);
		border-color: rgba(59, 130, 246, 0.4);
		color: rgba(59, 130, 246, 1);
		transform: scale(1.1);
	}

	.modal-close-button {
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

	/* Body Styles */
	.modal-body {
		flex: 1;
		padding: 1.5rem;
		overflow: hidden;
		min-height: 0;
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

	/* Responsive */
	@media (max-width: 640px) {
		.json-editor-modal-container {
			max-width: none;
			margin: 0.5rem;
		}

		.modal-header {
			padding: 1rem;
			flex-wrap: wrap;
		}

		.modal-body {
			padding: 1rem;
		}
	}
</style>



<template>
	<div v-if="isOpen" class="fixed inset-0 z-[99999] flex items-center justify-center">
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="close" />

		<!-- Modal Content -->
		<div class="relative w-full max-w-2xl mx-4">
			<div class="glassmorphic-panel p-6 border border-primary/20 rounded-xl">
				<!-- Modal Header -->
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-3">
						<Icon name="lucide:file-plus" class="size-6 text-primary" />
						<h3 class="text-xl font-semibold text-white">
							Create New Template
						</h3>
					</div>
					<button
						class="text-white/60 hover:text-white transition-colors"
						@click="close"
					>
						<Icon name="lucide:x" class="size-5" />
					</button>
				</div>

				<!-- Template Form -->
				<form class="space-y-6" @submit.prevent="handleCreate">
					<!-- Basic Information -->
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Template Name *
							</label>
							<input
								v-model="templateData.name"
								type="text"
								placeholder="Enter template name"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none"
								required
							>
						</div>

						<div>
							<label class="block text-sm font-medium text-white/80 mb-2">
								Description *
							</label>
							<textarea
								v-model="templateData.description"
								placeholder="Describe your template"
								rows="3"
								class="glassmorphic-input w-full px-4 py-3 rounded-lg border border-primary/30 bg-black/20 text-white placeholder-white/50 focus:border-primary/60 focus:outline-none resize-none"
								required
							/>
						</div>

					</div>

					<!-- Actions -->
					<div class="flex justify-end gap-3 pt-4 border-t border-white/10">
						<button
							type="button"
							class="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
							@click="close"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-6 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							:disabled="!isFormValid || isLoading"
						>
							<Icon v-if="isLoading" name="lucide:loader-2" class="size-4 mr-2 animate-spin" />
							{{ isLoading ? 'Creating...' : 'Create Template' }}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { reactive, computed, watch, ref } from "vue";
	import { useToast } from "#imports";
	import { buttClient } from "~/utils/buttClient";

	// Props
	interface Props {
		isOpen: boolean;
		nodeId?: string;
		projectId?: string;
		canvasData?: {
			nodes: any[];
			edges: any[];
		};
	}

	const props = withDefaults(defineProps<Props>(), {
		isOpen: false,
		nodeId: undefined,
		projectId: undefined,
		canvasData: () => ({ nodes: [], edges: [] })
	});

	// Emits
	const emit = defineEmits<{
		close: [];
		created: [template: any];
		updated: [nodeId: string, templateData: any];
	}>();

	// State
	const isLoading = ref(false);
	const toast = useToast();

	const templateData = reactive({
		name: "",
		description: ""
	});

	// Form Validation
	const isFormValid = computed(() => {
		return (
			templateData.name.trim() !== "" &&
			templateData.description.trim() !== ""
		);
	});

	// Watch for modal open state
	watch(() => props.isOpen, (newValue) => {
		console.log("═══════════════════════════════════════");
		console.log("🎭 TEMPLATE MODAL: isOpen changed");
		console.log("  New value:", newValue);
		console.log("  Node ID:", props.nodeId);
		console.log("  Project ID:", props.projectId);
		console.log("═══════════════════════════════════════");
	});

	// Methods
	const resetForm = () => {
		templateData.name = "";
		templateData.description = "";
	};

	const close = () => {
		resetForm();
		emit("close");
	};

	const handleCreate = async () => {
		if (!isFormValid.value) return;

		isLoading.value = true;

		try {
			// Generate a BUTT identifier
			const buttId = `TEMPLATE.${templateData.name.replace(/\s+/g, "")}.${Date.now()}`;

			// Prepare template data according to BAPI specification
			const payload = {
				name: templateData.name,
				description: templateData.description,
				template: {
					actions: [],
					type: "TEMPLATE",
					projectId: props.projectId,
					canvasData: {
						...props.canvasData,
						nodeId: props.nodeId
					}
				},
				author: "CUSTOM",
				public: false,
				elevated: false,
				meta: {
					projectId: props.projectId,
					butt: buttId,
					nodeId: props.nodeId
				}
			};

			console.log("🔧 Creating template with payload:", JSON.stringify(payload, null, 2));

			// Call the BAPI template creation
			const createdTemplate = await buttClient.createTemplate(payload);

			console.log("✅ Template created successfully:", createdTemplate);

			// Emit the created template
			emit("created", createdTemplate);

			// Update the node if nodeId is provided
			if (props.nodeId) {
				const nodeTemplateData = {
					templateId: createdTemplate.id,
					templateName: createdTemplate.name,
					templateType: createdTemplate.template?.type || "TEMPLATE",
					templateDescription: createdTemplate.description,
					templateAuthor: createdTemplate.author,
					templateButt: buttId
				};
				emit("updated", props.nodeId, nodeTemplateData);
			}

			// Show success toast
			toast.add({
				title: "Success",
				description: `Template "${templateData.name}" created successfully`,
				color: "success"
			});

			// Close modal
			close();

		} catch (error: any) {
			console.error("❌ Error creating template:", error);
			
			// Show error toast
			toast.add({
				title: "Error",
				description: error?.message || "Failed to create template",
				color: "error"
			});
		} finally {
			isLoading.value = false;
		}
	};

	// Reset form when modal opens
	watch(() => props.isOpen, (isOpen) => {
		if (isOpen) {
			resetForm();
		}
	});
</script>

<style scoped>
	.glassmorphic-panel {
		background: rgba(var(--color-neutral-rgb), 0.12);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
	}

	.glassmorphic-input {
		background: rgba(var(--color-neutral-rgb), 0.08);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(var(--color-primary-rgb), 0.2);
	}

	.glassmorphic-input:focus {
		border-color: rgba(var(--color-primary-rgb), 0.4);
		background: rgba(var(--color-neutral-rgb), 0.12);
	}
</style>



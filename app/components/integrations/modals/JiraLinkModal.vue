<template>
	<Teleport to="body">
		<div v-if="props.showModal" class="fixed inset-0 z-50 flex items-center justify-center">
			<!-- Backdrop -->
			<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal" />

			<!-- Modal Content -->
			<div class="relative w-full max-w-2xl mx-4">
				<div class="jira-link-modal glassmorphic-panel p-6 border border-primary/20 border-bottom-3-outset">
					<!-- Modal Header -->
					<div class="flex items-center justify-between mb-6">
						<div class="flex items-center gap-3">
							<div class="jira-icon-container w-12 h-12 flex items-center justify-center bg-primary/20 border border-primary/30 overflow-hidden">
								<Icon name="i-logos-jira" class="size-6 text-primary" />
							</div>
							<div>
								<h3 class="text-xl font-semibold text-white/90">
									Link Jira to Project
								</h3>
								<p class="text-sm text-white/60">
									Select a Jira instance to link to {{ project?.name }}
								</p>
							</div>
						</div>
						<button
							class="modal-close-button glassmorphic-button p-2 transition-all duration-300 hover:scale-110 text-white/60 hover:text-white border border-primary/20"
							@click="closeModal"
						>
							<Icon name="lucide:x" class="size-4" />
						</button>
					</div>

					<!-- Loading State -->
					<div v-if="isLoading" class="text-center py-8">
						<Icon name="lucide:loader-2" class="size-8 text-white/40 mb-3 mx-auto animate-spin" />
						<p class="text-sm text-white/60">
							Loading Jira resources...
						</p>
					</div>

					<!-- Error State -->
					<div v-else-if="error" class="text-center py-8">
						<Icon name="lucide:alert-circle" class="size-8 text-red-400 mb-3 mx-auto" />
						<h4 class="text-base font-medium text-red-400 mb-2">
							Error Loading Jira Resources
						</h4>
						<p class="text-sm text-red-400/60 mb-4">
							{{ error }}
						</p>
						<button
							class="modal-retry-button glassmorphic-button bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 transition-all duration-300 border border-primary/30"
							@click="loadJiraResources"
						>
							<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
							Retry
						</button>
					</div>

					<!-- Jira Resources Selection -->
					<div v-else-if="jiraResources.length > 0" class="space-y-6">
						<!-- Resources List -->
						<div class="space-y-4">
							<h4 class="text-lg font-medium text-white/80 mb-4 flex items-center gap-2">
								<Icon name="lucide:server" class="size-5 text-primary" />
								Available Jira Instances
							</h4>
							<div class="grid gap-3">
								<div
									v-for="resource in jiraResources"
									:key="resource.id"
									class="jira-resource-card glassmorphic-panel p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 border-2 border-gray-600 hover:border-primary"
									:class="selectedResource?.id === resource.id ? 'border-primary bg-primary/10' : ''"
									@click="selectedResource = resource"
								>
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3">
											<div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
												<Icon name="i-logos-jira" class="size-5 text-white" />
											</div>
											<div>
												<h5 class="font-bold text-white">
													{{ resource.name }}
												</h5>
												<p class="text-sm text-gray-400">
													{{ resource.url }}
												</p>
												<div class="flex items-center gap-2 mt-1">
													<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
														Jira
													</span>
													<span v-if="resource.scopes" class="text-xs text-gray-500">
														{{ resource.scopes.length }} scopes
													</span>
												</div>
											</div>
										</div>
										<Icon
											v-if="selectedResource?.id === resource.id"
											name="lucide:check-circle"
											class="text-primary size-5"
										/>
									</div>
								</div>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex justify-end gap-3 pt-4 border-t border-white/10">
							<UiButton
								variant="ghost"
								@click="closeModal"
							>
								Cancel
							</UiButton>
							<UiButton
								variant="default"
								:disabled="!selectedResource || isLinking"
								@click="linkJiraToProject"
							>
								<Icon name="lucide:link" class="size-4 mr-2" />
								Link to Project
							</UiButton>
						</div>
					</div>

					<!-- No Resources State -->
					<div v-else class="text-center py-8">
						<Icon name="i-logos-jira" class="size-8 text-white/40 mb-3 mx-auto" />
						<h4 class="text-lg font-medium text-white/60 mb-2">
							No Jira Resources Found
						</h4>
						<p class="text-sm text-white/40 mb-4">
							No Jira instances were found for this integration.
						</p>
						<button
							class="modal-retry-button glassmorphic-button bg-primary/20 hover:bg-primary/30 text-white px-4 py-2 transition-all duration-300 border border-primary/30"
							@click="loadJiraResources"
						>
							<Icon name="lucide:refresh-cw" class="size-4 mr-2" />
							Refresh
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
	import { ref, watch } from "vue";
	import { buttClient } from "~/utils/buttClient";
	import UiButton from "~/components/Ui/Button.vue";

	// Props
	const props = defineProps<{
		showModal: boolean
		project: any
		integration: any
	}>();

	// Emits
	const emit = defineEmits([
		"close",
		"linked"
	]);

	const { useToast } = await import("#ui/composables/useToast");
	const toast = useToast();

	// Reactive state
	const isLoading = ref(false);
	const error = ref<string | null>(null);
	const jiraResources = ref<any[]>([]);
	const selectedResource = ref<any | null>(null);
	const isLinking = ref(false);

	// Methods
	const loadJiraResources = async () => {
		if (!props.integration?.id) return;

		isLoading.value = true;
		error.value = null;

		try {
			// Get the connection for this integration
			const connections = await buttClient.getConnectionsByIntegrationId(props.integration.id);

			if (connections && connections.length > 0) {
				const connection = connections[0];

				// Extract Jira resources from the connection meta
				if (connection && connection.meta?.resources) {
					// Filter resources by keyword "jira" (case insensitive)
					const resources = connection.meta.resources.filter((resource: any) =>
						resource.name?.toLowerCase().includes("jira")
						|| resource.url?.toLowerCase().includes("jira")
						|| resource.scopes?.some((scope: string) => scope.toLowerCase().includes("jira"))
					);

					jiraResources.value = resources;
				} else {
					jiraResources.value = [];
				}
			} else {
				jiraResources.value = [];
			}
		} catch (err: any) {
			console.error("Error loading Jira resources:", err);
			error.value = err?.message || "Failed to load Jira resources.";
			jiraResources.value = [];
		} finally {
			isLoading.value = false;
		}
	};

	const linkJiraToProject = async () => {
		if (!selectedResource.value || !props.project?.id || !props.integration?.id) return;

		isLinking.value = true;
		try {
			// First, get the connection ID for this integration
			const connections = await buttClient.getConnectionsByIntegrationId(props.integration.id);

			if (!connections || connections.length === 0) {
				throw new Error("No connection found for this integration");
			}

			const connectionId = connections[0].id;

			// Link the integration connection to the project
			const linkResult = await buttClient.linkService(props.project.id, connectionId, {
				meta: {
					selectedResource: selectedResource.value,
					linkedAt: new Date().toISOString()
				}
			});

			console.log("Jira linked successfully:", linkResult);

			// Emit success event
			emit("linked", {
				project: props.project,
				integration: props.integration,
				selectedResource: selectedResource.value,
				linkResult
			});

			// Close modal
			closeModal();
		} catch (err: any) {
			console.error("Error linking Jira to project:", err);
			error.value = err?.message || "Failed to link Jira to project.";
			toast.add({
				title: "Link Failed",
				description: err?.message || "Failed to link Jira to project.",
				color: "error"
			});
		} finally {
			isLinking.value = false;
		}
	};

	const closeModal = () => {
		emit("close");
	};

	// Watch for modal open/close
	watch(() => props.showModal, (isOpen) => {
		if (isOpen && props.integration) {
			loadJiraResources();
		} else {
			// Reset state when modal closes
			jiraResources.value = [];
			selectedResource.value = null;
			error.value = null;
		}
	});
</script>

<style scoped>
/* Modal Styles */
.jira-link-modal {
	background: rgba(var(--color-neutral-rgb), 0.15);
	backdrop-filter: blur(20px) saturate(1.5);
	border: 1px solid rgba(var(--color-primary-rgb), 0.2);
	border-bottom: 3px outset var(--color-primary);
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	animation: modalSlideIn 0.3s ease-out;
	max-height: 90vh;
	overflow-y: auto;
}

@keyframes modalSlideIn {
	from {
		opacity: 0;
		transform: scale(0.9) translateY(-20px);
	}
	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

/* Glassmorphic Button */
.glassmorphic-button {
	background: rgba(var(--color-neutral-rgb), 0.10);
	backdrop-filter: blur(18px) saturate(1.3);
	border: 1.5px solid rgba(var(--color-neutral-rgb), 0.13);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

.glassmorphic-button:hover:not(:disabled) {
	background: rgba(var(--color-primary-rgb), 0.15);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
	background: rgba(0, 0, 0, 0.486);
	border-left: 2px outset var(--color-primary);
}

/* Glassmorphic Panel */
.glassmorphic-panel {
	background: rgba(var(--color-neutral-rgb), 0.05);
	backdrop-filter: blur(15px) saturate(1.2);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.08);
	transition: all 0.3s ease;
}

/* Icon Containers */
.jira-icon-container {
	background: rgba(var(--color-primary-rgb), 0.2);
	border: 1px solid rgba(var(--color-primary-rgb), 0.3);
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
}

/* Jira Resource Cards */
.jira-resource-card {
	transition: all 0.3s ease;
	cursor: pointer;
}

.jira-resource-card:hover {
	background: rgba(var(--color-primary-rgb), 0.1);
	border-color: var(--color-primary);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.2);
}

/* Modal Close Button */
.modal-close-button:hover {
	background: rgba(var(--color-primary-rgb), 0.3);
	border-color: var(--color-primary);
}

/* Retry Button */
.modal-retry-button:hover {
	background: rgba(var(--color-primary-rgb), 0.4);
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
	.jira-link-modal {
		margin: 1rem;
		max-height: 95vh;
	}
}
</style>


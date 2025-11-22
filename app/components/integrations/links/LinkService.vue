<template>
	<div class="link-service">
		<!-- Link Integration to Project -->
		<div class="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
						<Icon name="lucide:link" class="w-5 h-5 text-white" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-neutral-100">
							Link Integration to Project
						</h3>
						<p class="text-sm text-neutral-400">
							Connect an integration to your project
						</p>
					</div>
				</div>
				<button
					v-if="selectedProject"
					:disabled="loadingIntegrations"
					class="flex items-center space-x-2 text-neutral-400 hover:text-neutral-300 transition-colors"
					title="Refresh integrations"
					@click="fetchAvailableIntegrations"
				>
					<Icon name="lucide:refresh-cw" class="w-4 h-4" :class="{ 'animate-spin': loadingIntegrations }" />
					<span class="text-sm">Refresh</span>
				</button>
			</div>

			<!-- Project Selection -->
			<div v-if="!selectedProject" class="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
				<div class="flex items-center space-x-2">
					<Icon name="lucide:alert-triangle" class="w-5 h-5 text-yellow-400" />
					<span class="text-sm text-yellow-300">Please select a project first</span>
				</div>
			</div>

			<div v-else class="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
				<div class="flex items-center space-x-2 mb-2">
					<Icon name="lucide:folder" class="w-5 h-5 text-blue-400" />
					<span class="text-sm font-medium text-blue-300">Selected Project</span>
				</div>
				<p class="text-sm text-neutral-300">
					<strong>{{ selectedProject.name }}</strong>
					{{ selectedProject.description ? ` - ${selectedProject.description}` : '' }}
				</p>
			</div>

			<!-- Available Integrations -->
			<div v-if="selectedProject">
				<div class="flex items-center justify-between mb-4">
					<h4 class="text-base font-semibold text-neutral-200">
						Available Integrations
					</h4>
				</div>

				<!-- Loading State -->
				<div v-if="loadingIntegrations" class="flex items-center justify-center py-8">
					<div class="flex items-center space-x-2 text-neutral-400">
						<Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
						<span>Loading integrations...</span>
					</div>
				</div>

				<!-- Integrations List -->
				<div v-else-if="availableIntegrations.length > 0" class="space-y-3">
					<div
						v-for="integration in availableIntegrations"
						:key="integration.id"
						class="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-all duration-200"
					>
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<div class="w-8 h-8 flex items-center justify-center">
									<Icon :name="getIntegrationIcon(integration.type)" class="w-6 h-6 text-primary" />
								</div>
								<div>
									<h5 class="text-sm font-medium text-neutral-100">
										{{ integration.name }}
									</h5>
									<p class="text-xs text-neutral-400">
										{{ integration.description || 'No description' }}
									</p>
									<div class="flex items-center space-x-2 mt-1">
										<span
											class="inline-flex items-center px-2 py-1 rounded-full text-xs"
											:class="integration.connected ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'"
										>
											Connected
										</span>
										<span class="text-xs text-neutral-500">{{ integration.type }}</span>
									</div>
								</div>
							</div>
							<div class="flex items-center space-x-2">
								<button
									class="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
									:class="integration.isLinked ? 'bg-green-600 hover:bg-green-700 text-white cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 text-white'"
									:disabled="isdisabled || integration.isLinked"
									@click="linkIntegrationToProject(integration)"
								>
									<Icon :name="integration.isLinked ? 'lucide:check-circle' : 'lucide:link'" class="w-3 h-3" />
									<span>{{ integration.isLinked ? 'Linked' : 'Link to Project' }}</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- No Integrations State -->
				<div v-else class="text-center py-8">
					<div class="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
						<Icon name="lucide:puzzle" class="w-6 h-6 text-neutral-500" />
					</div>
					<p class="text-sm text-neutral-400 mb-3">
						No integrations found. This could be because:
					</p>
					<ul class="text-xs text-neutral-500 mb-4 text-left max-w-md mx-auto">
						<li>• No integrations have been set up yet</li>
						<li>• The organization doesn't have any integrations</li>
						<li>• There was an error loading integrations</li>
					</ul>
					<div class="flex flex-col sm:flex-row gap-2 justify-center">
						<button
							class="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
							@click="fetchAvailableIntegrations"
						>
							<Icon name="lucide:refresh-cw" class="w-4 h-4" />
							<span>Retry Loading</span>
						</button>
						<button
							class="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 text-sm transition-colors"
							@click="$emit('goToIntegrations')"
						>
							<Icon name="lucide:arrow-right" class="w-4 h-4" />
							<span>Go to Integrations</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Success Message -->
			<div v-if="recentlyLinked" class="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
				<div class="flex items-center space-x-2">
					<Icon name="lucide:check-circle" class="w-5 h-5 text-green-400" />
					<span class="text-sm text-green-300">Integration linked successfully!</span>
				</div>
			</div>
		</div>

		<!-- Jira Link Modal -->
		<JiraLinkModal
			:show-modal="showJiraModal"
			:project="selectedProject"
			:integration="selectedIntegration"
			@close="closeJiraModal"
			@linked="handleJiraLinked"
		/>

		<!-- GitHub Link Modal -->
		<GitHubLinkModal
			:show-modal="showGitHubModal"
			:project="selectedProject"
			:integration="selectedIntegration"
			@close="closeGitHubModal"
			@linked="handleGitHubLinked"
		/>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { useOrganisations } from "~/composables/useOrganisations";
	import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
	import { buttClient } from "~/utils/buttClient";
	import GitHubLinkModal from "../modals/GitHubLinkModal.vue";
	import JiraLinkModal from "../modals/JiraLinkModal.vue";

	const props = defineProps<{
		selectedProject: any | null
	}>();

	const emit = defineEmits<{
		integrationLinked: [linkData: any]
		goToIntegrations: []
	}>();

	const isdisabled = ref(false);

	const { useToast } = await import("#ui/composables/useToast");
	const toast = useToast();

	// State
	const loadingIntegrations = ref(false);
	const availableIntegrations = ref<any[]>([]);
	const linking = ref<string | null>(null);
	const recentlyLinked = ref(false);
	const showJiraModal = ref(false);
	const showGitHubModal = ref(false);
	const selectedIntegration = ref<any | null>(null);

	// Organization state
	const { organisations } = useOrganisations();
	const selectedOrganisationId = useSelectedOrganisationId();

	// Get current organization's butt
	const currentOrganisationButt = computed(() => {
		if (!selectedOrganisationId.value || !organisations.value.length) return "";
		const currentOrg = organisations.value.find((org) => org.id?.toString() === selectedOrganisationId.value?.toString());
		return currentOrg?.butt || "";
	});

	// Get current organization ID for display
	const _currentOrganisationId = computed(() => {
		return selectedOrganisationId.value || "";
	});

	// Fetch available integrations for the organization
	async function fetchAvailableIntegrations() {
		try {
			loadingIntegrations.value = true;
			console.log("Fetching integrations...");
			console.log("Current organization ID:", selectedOrganisationId.value);
			console.log("Current organization butt:", currentOrganisationButt.value);
			console.log("Organizations:", organisations.value);

			// Use findIntegrationsByOrganisationId to get integrations for the organization
			if (selectedOrganisationId.value) {
				console.log("🔍 Using findIntegrationsByOrganisationId for organization:", selectedOrganisationId.value);
				const orgIntegrations = await buttClient.findIntegrationsByOrganisationId(selectedOrganisationId.value);
				console.log("🔍 findIntegrationsByOrganisationId result:", orgIntegrations);

				availableIntegrations.value = Array.isArray(orgIntegrations)
					? orgIntegrations.map((integration: any) => ({
						...integration,
						connected: integration.connected || false
					}))
					: [];
			} else {
				// Fallback to findAllIntegration if no organization ID
				console.log("No organization ID, falling back to findAllIntegration");
				const allIntegrations = await buttClient.findAllIntegration();
				console.log("All integrations from API:", allIntegrations);

				// If we have a specific organization butt, filter by it
				if (currentOrganisationButt.value) {
					const orgIntegrations = Array.isArray(allIntegrations)
						? allIntegrations.filter((integration: any) => {
							console.log("Checking integration:", integration);
							console.log("Integration butt:", integration.butt);
							console.log("Current org butt:", currentOrganisationButt.value);
							return integration.butt === currentOrganisationButt.value;
						})
						: [];

					console.log("Filtered by organization butt:", orgIntegrations);
					availableIntegrations.value = orgIntegrations.map((integration: any) => ({
						...integration,
						connected: integration.connected || false
					}));
				} else {
					// If no specific organization, show all integrations
					console.log("No organization butt, showing all integrations");
					availableIntegrations.value = Array.isArray(allIntegrations)
						? allIntegrations.map((integration: any) => ({
							...integration,
							connected: integration.connected || false
						}))
						: [];
				}
			}

			console.log("Final available integrations:", availableIntegrations.value);

			// Check link status for each integration
			if (props.selectedProject) {
				console.log(`Checking link statuses for ${availableIntegrations.value.length} integrations for project ${props.selectedProject.id}`);
				for (const integration of availableIntegrations.value) {
					console.log(`Processing integration: ${integration.name} (${integration.type}) with ID: ${integration.id}`);
					integration.isLinked = await checkIfIntegrationLinked(integration);
					console.log(`Integration ${integration.name} isLinked: ${integration.isLinked}`);
				}
			}
		} catch (error: any) {
			console.error("Error fetching integrations:", error);
			availableIntegrations.value = [];

			toast.add({
				title: "Failed to Load Integrations",
				description: error.message || "Could not load integrations for this organization",
				color: "error"
			});
		} finally {
			loadingIntegrations.value = false;
		}
	}

	// Check if integration is linked to project
	const checkIfIntegrationLinked = async (integration: any): Promise<boolean> => {
		if (!props.selectedProject || !props.selectedProject.id || !integration.id) {
			console.log("⚠️ Missing project or integration ID, skipping link check");
			return false;
		}

		try {
			const linkedConnections = await buttClient.linkedConnections(props.selectedProject.id);
			const integrationConnections = await buttClient.getConnectionsByIntegrationId(integration.id);

			console.log(`!!!!!!!! Linked connections !!!!!!!!:`, linkedConnections);
			console.log(`!!!!!!!! Integration connections !!!!!!!!:`, integrationConnections);

			if (linkedConnections && linkedConnections.length > 0 && integrationConnections && integrationConnections.length > 0) {
				const isLinked = linkedConnections.some((linkedConn: any) => {
					return integrationConnections.some((integrationConn: any) => {
						const match = linkedConn.integrationConnectionId === integrationConn.id;
						console.log(`Checking match: ${linkedConn.integrationConnectionId} === ${integrationConn.id} = ${match}`);
						return match;
					});
				});

				console.log(`!!!!!!!! Is linked !!!!!!!!: ${isLinked}`);

				if (isLinked) {
					return true;
				}
			}

			return false;
		} catch (error) {
			console.error("Error checking integration link status:", error);
			return false;
		}
	};

	// Link integration to project
	async function linkIntegrationToProject(integration: any) {
		if (!props.selectedProject || !integration.id) {
			toast.add({
				title: "Error",
				description: "Missing project or integration information",
				color: "error"
			});
			return;
		}

		// For Jira integrations, show the modal instead of immediately linking
		if (integration.type === "ATLASSIAN" || integration.type === "JIRA") {
			selectedIntegration.value = integration;
			showJiraModal.value = true;
			return;
		}

		// For GitHub integrations, show the modal instead of immediately linking
		if (integration.type === "GITHUB") {
			selectedIntegration.value = integration;
			showGitHubModal.value = true;
			return;
		}

		try {
			linking.value = integration.id;
			console.log("Linking integration to project:", {
				projectId: props.selectedProject.id,
				integrationId: integration.id
			});

			// Get connections for this integration
			const connections = await buttClient.getConnectionsByIntegrationId(integration.id);
			const connection = connections[0];

			if (!connection) {
				throw new Error("No connection found for this integration");
			}

			const linkResult = await buttClient.linkService(props.selectedProject.id, connection.id, {});

			console.log("Connection:", connection);
			console.log("Integration linked successfully:", linkResult);

			// Mark integration as linked
			integration.isLinked = true;

			toast.add({
				title: "Integration Linked",
				description: `Successfully linked ${integration.name} to ${props.selectedProject.name}`,
				color: "success"
			});

			// Show success message temporarily
			recentlyLinked.value = true;
			setTimeout(() => {
				recentlyLinked.value = false;
			}, 3000);

			// Emit the link event
			emit("integrationLinked", {
				project: props.selectedProject,
				integration,
				connection,
				linkResult
			});
		} catch (error: any) {
			console.error("Error linking integration to project:", error);
			toast.add({
				title: "Link Failed",
				description: error.message || `Failed to link ${integration.name} to ${props.selectedProject.name}`,
				color: "error"
			});
		} finally {
			linking.value = null;
		}
	}

	// Jira modal methods
	const closeJiraModal = () => {
		showJiraModal.value = false;
		selectedIntegration.value = null;
	};

	const handleJiraLinked = (linkData: any) => {
		console.log("Jira linked:", linkData);

		// Mark integration as linked
		if (selectedIntegration.value) {
			selectedIntegration.value.isLinked = true;
		}

		toast.add({
			title: "Jira Linked Successfully",
			description: `Successfully linked ${linkData.selectedResource.name} to ${props.selectedProject.name}`,
			color: "success"
		});

		// Show success message temporarily
		recentlyLinked.value = true;
		setTimeout(() => {
			recentlyLinked.value = false;
		}, 3000);

		// Emit the link event
		emit("integrationLinked", linkData);

		// Close modal
		closeJiraModal();
	};

	// GitHub modal methods
	const closeGitHubModal = () => {
		showGitHubModal.value = false;
		selectedIntegration.value = null;
	};

	const handleGitHubLinked = (linkData: any) => {
		console.log("GitHub linked:", linkData);

		// Mark integration as linked
		if (selectedIntegration.value) {
			selectedIntegration.value.isLinked = true;
		}

		toast.add({
			title: "GitHub Repository Linked Successfully",
			description: `Successfully linked ${linkData.selectedRepository.name} to ${props.selectedProject.name}`,
			color: "success"
		});

		// Show success message temporarily
		recentlyLinked.value = true;
		setTimeout(() => {
			recentlyLinked.value = false;
		}, 3000);

		// Emit the link event
		emit("integrationLinked", linkData);

		// Close modal
		closeGitHubModal();
	};

	// Get icon based on integration type
	function getIntegrationIcon(type: string): string {
		const iconMap: Record<string, string> = {
			GITHUB: "simple-icons:github",
			ATLASSIAN: "simple-icons:atlassian",
			JIRA: "simple-icons:jira",
			BITBUCKET: "simple-icons:bitbucket",
			DISCORD: "simple-icons:discord",
			GOOGLE: "simple-icons:google",
			SLACK: "simple-icons:slack"
		};
		return iconMap[type?.toUpperCase()] || "lucide:puzzle";
	}

	// Watch for organization changes
	watch(selectedOrganisationId, () => {
		fetchAvailableIntegrations();
	}, { immediate: true });

	// Watch for project changes
	watch(() => props.selectedProject, async () => {
		recentlyLinked.value = false;
		if (props.selectedProject && availableIntegrations.value.length === 0) {
			fetchAvailableIntegrations();
		} else if (props.selectedProject && availableIntegrations.value.length > 0) {
			// Re-check link statuses when project changes
			for (const integration of availableIntegrations.value) {
				integration.isLinked = await checkIfIntegrationLinked(integration);
			}
		}
	});

	// Lifecycle
	onMounted(() => {
		if (currentOrganisationButt.value) {
			fetchAvailableIntegrations();
		}
	});

	// Expose methods for parent component
	defineExpose({
		fetchAvailableIntegrations,
		availableIntegrations: computed(() => availableIntegrations.value)
	});
</script>

<style scoped>
/* Custom styles if needed */
</style>


<template>
	<div class="linked-connections">
		<!-- Linked Connections Display -->
		<div class="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center space-x-3">
					<div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
						<Icon name="lucide:layout-grid" class="w-5 h-5 text-white" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-neutral-100">
							Linked Integrations
						</h3>
						<p class="text-sm text-neutral-400">
							View and manage integrations linked to your project
						</p>
					</div>
				</div>
				<button
					:disabled="loading"
					class="flex items-center space-x-2 bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-2 rounded-lg font-medium transition-colors"
					@click="refreshLinkedConnections"
				>
					<Icon :name="loading ? 'lucide:loader-2' : 'lucide:refresh-cw'" :class="{ 'animate-spin': loading }" class="w-4 h-4" />
					<span>Refresh</span>
				</button>
			</div>

			<!-- Project Selection -->
			<div v-if="!selectedProject" class="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
				<div class="flex items-center space-x-2">
					<Icon name="lucide:alert-triangle" class="w-5 h-5 text-yellow-400" />
					<span class="text-sm text-yellow-300">Please select a project to view linked integrations</span>
				</div>
			</div>

			<div v-else class="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
				<div class="flex items-center space-x-2 mb-2">
					<Icon name="lucide:folder" class="w-5 h-5 text-blue-400" />
					<span class="text-sm font-medium text-blue-300">Project</span>
				</div>
				<p class="text-sm text-neutral-300">
					<strong>{{ selectedProject.name }}</strong>
					{{ selectedProject.description ? ` - ${selectedProject.description}` : '' }}
				</p>
			</div>

			<!-- Loading State -->
			<div v-if="loading" class="flex items-center justify-center py-8">
				<div class="flex items-center space-x-2 text-neutral-400">
					<Icon name="lucide:loader-2" class="w-5 h-5 animate-spin" />
					<span>Loading linked integrations...</span>
				</div>
			</div>

			<!-- Linked Integrations List -->
			<div v-else-if="allLinkedConnections.length > 0" class="space-y-4">
				<div
					v-for="connection in allLinkedConnections"
					:key="connection.id"
					class="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 hover:border-neutral-600 transition-all duration-200"
				>
					<div class="flex items-start justify-between">
						<div class="flex items-start space-x-3 flex-1">
							<div class="w-8 h-8 flex items-center justify-center">
								<Icon :name="getIntegrationIcon(connection.type)" class="w-6 h-6 text-primary" />
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center space-x-2 mb-1">
									<h5 class="text-sm font-medium text-neutral-100">
										{{ connection.name }}
									</h5>
									<span
										class="inline-flex items-center px-2 py-1 rounded-full text-xs"
										:class="connection.connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'"
									>
										{{ connection.connected ? 'Connected' : 'Disconnected' }}
									</span>
								</div>
								<p class="text-xs text-neutral-400 mb-2">
									{{ connection.description || 'No description available' }}
								</p>
								<div class="flex items-center space-x-4 text-xs text-neutral-500">
									<span>Type: {{ connection.type }}</span>
									<span v-if="connection.createdAt">
										Linked: {{ formatDate(connection.createdAt) }}
									</span>
								</div>

								<!-- Connection Details -->
								<div v-if="connection.userInfo" class="mt-2 p-2 bg-neutral-700/30 rounded text-xs">
									<div class="text-neutral-300">
										Connected as: <strong>{{ connection.userInfo.name || connection.userInfo.login }}</strong>
									</div>
									<div v-if="connection.userInfo.email" class="text-neutral-400">
										{{ connection.userInfo.email }}
									</div>
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex items-center space-x-2 ml-3">
							<button
								class="px-3 py-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors"
								title="View Details"
								@click="viewConnectionDetails(connection)"
							>
								<Icon name="lucide:eye" class="w-4 h-4" />
							</button>
							<button
								:disabled="unlinking === connection.id"
								class="px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
								title="Unlink Integration"
								@click="unlinkConnection(connection)"
							>
								<Icon v-if="unlinking === connection.id" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
								<Icon v-else name="lucide:trash-2" class="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- No Linked Integrations -->
			<div v-else-if="selectedProject" class="text-center py-12">
				<div class="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
					<Icon name="lucide:link-off" class="w-8 h-8 text-neutral-500" />
				</div>
				<h4 class="text-lg font-medium text-neutral-300 mb-2">
					No Linked Integrations
				</h4>
				<p class="text-neutral-500 mb-4">
					This project doesn't have any linked integrations yet.
				</p>
				<button
					class="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
					@click="$emit('linkIntegration')"
				>
					<Icon name="lucide:link" class="w-4 h-4" />
					<span>Link Integration</span>
				</button>
			</div>
		</div>

		<!-- Connection Details Modal -->
		<Teleport to="body">
			<div v-if="showDetailsModal" class="fixed inset-0 z-60 flex items-center justify-center">
				<!-- Backdrop -->
				<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDetailsModal" />

				<!-- Modal Content -->
				<div class="relative w-full max-w-2xl mx-4">
					<div class="glassmorphic-panel p-6 border border-primary/20 border-bottom-3-outset">
						<!-- Header -->
						<div class="flex items-center justify-between mb-6">
							<div class="flex items-center gap-3">
								<div class="w-9 h-9 flex items-center justify-center bg-primary/20 border border-primary/30 overflow-hidden">
									<Icon :name="getIntegrationIcon(selectedConnection?.type)" class="w-5 h-5 text-primary" />
								</div>
								<div>
									<h3 class="text-base font-semibold text-white/90">
										{{ selectedConnection?.name }}
									</h3>
									<p class="text-xs text-white/60">
										Integration Details
									</p>
								</div>
							</div>
							<button class="glassmorphic-button p-2 text-white/60 hover:text-white border border-primary/20" @click="closeDetailsModal">
								✕
							</button>
						</div>

						<!-- Connection Details -->
						<div v-if="selectedConnection" class="space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="block text-xs text-white/60 mb-1">Name</label>
									<div class="text-sm text-white/90">
										{{ selectedConnection.name }}
									</div>
								</div>
								<div>
									<label class="block text-xs text-white/60 mb-1">Type</label>
									<div class="text-sm text-white/90">
										{{ selectedConnection.type }}
									</div>
								</div>
								<div>
									<label class="block text-xs text-white/60 mb-1">Status</label>
									<span
										class="inline-flex items-center px-2 py-1 rounded-full text-xs"
										:class="selectedConnection.connected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'"
									>
										{{ selectedConnection.connected ? 'Connected' : 'Disconnected' }}
									</span>
								</div>
								<div>
									<label class="block text-xs text-white/60 mb-1">Linked Date</label>
									<div class="text-sm text-white/90">
										{{ formatDate(selectedConnection.createdAt) }}
									</div>
								</div>
							</div>

							<div v-if="selectedConnection.description">
								<label class="block text-xs text-white/60 mb-1">Description</label>
								<div class="text-sm text-white/90">
									{{ selectedConnection.description }}
								</div>
							</div>

							<div v-if="selectedConnection.userInfo">
								<label class="block text-xs text-white/60 mb-1">Connected Account</label>
								<div class="p-3 bg-white/5 rounded border border-white/10">
									<div class="text-sm text-white/90">
										{{ selectedConnection.userInfo.name || selectedConnection.userInfo.login }}
									</div>
									<div v-if="selectedConnection.userInfo.email" class="text-xs text-white/60">
										{{ selectedConnection.userInfo.email }}
									</div>
								</div>
							</div>
						</div>

						<!-- Footer -->
						<div class="flex justify-end pt-6 border-t border-white/10 mt-6">
							<button class="glassmorphic-button px-3 py-2 text-sm text-white/80 hover:text-white border border-primary/20" @click="closeDetailsModal">
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
	import { computed, onMounted, ref, watch } from "vue";
	import { buttClient } from "~/utils/buttClient";

	const props = defineProps<{
		selectedProject: any | null
		recentlyLinkedConnections?: any[]
	}>();

	const emit = defineEmits<{
		linkIntegration: []
		connectionUnlinked: [connection: any]
		connectionsRefreshed: []
	}>();

	const { useToast } = await import("#ui/composables/useToast");
	const toast = useToast();

	// State
	const loading = ref(false);
	const linkedConnections = ref<any[]>([]);
	const unlinking = ref<string | null>(null);
	const showDetailsModal = ref(false);
	const selectedConnection = ref<any | null>(null);

	// Combine fetched connections with recently linked ones
	const allLinkedConnections = computed(() => {
		const fetched = linkedConnections.value || [];
		const recent = props.recentlyLinkedConnections || [];

		// Combine and deduplicate by id
		const combined = [...fetched, ...recent];
		const unique = combined.filter((connection, index, self) =>
			index === self.findIndex((c) => c.id === connection.id)
		);

		return unique;
	});

	// Fetch linked connections for the selected project
	async function fetchLinkedConnections() {
		if (!props.selectedProject?.id) {
			linkedConnections.value = [];
			return;
		}

		try {
			loading.value = true;
			console.log("Fetching linked connections for project:", props.selectedProject.id);

			// Get the organization ID from the project
			const organizationId = props.selectedProject.organisationId || props.selectedProject.organizationId;
			if (!organizationId) {
				console.warn("No organization ID found in project:", props.selectedProject);
				toast.add({
					title: "Missing Organization",
					description: "Project is missing organization information",
					color: "warning"
				});
				linkedConnections.value = [];
				return;
			}

			console.log("🔍 Organization ID:", organizationId);

			// Use findIntegrationsByOrganisationId to get all integrations for the organization
			const integrations = await buttClient.findIntegrationsByOrganisationId(organizationId);
			console.log("🔍 findIntegrationsByOrganisationId result:", integrations);

			// Then get the linked connections for the specific project
			const connections = await buttClient.linkedConnections(props.selectedProject.id);
			console.log("🔍 linkedConnections result:", connections);

			// Process and combine the data
			const linkedConnectionsList = Array.isArray(connections) ? connections : [connections].filter(Boolean);
			
			// Map the linked connections with integration details
			const enrichedConnections = linkedConnectionsList.map(connection => {
				// Find the corresponding integration details
				const integration = integrations?.find((int: any) => 
					int.id === connection.integrationConnectionId || 
					int.id === connection.integrationId ||
					int.integrationConnectionId === connection.integrationConnectionId
				);

				return {
					...connection,
					// Add integration details if found
					...(integration && {
						name: integration.name || connection.name,
						type: integration.type || connection.type,
						description: integration.description || connection.description,
						userInfo: integration.userInfo || connection.userInfo,
						connected: true
					})
				};
			});

			linkedConnections.value = enrichedConnections;
			console.log("Fetched and enriched linked connections:", linkedConnections.value);
		} catch (error: any) {
			console.error("Error fetching linked connections:", error);

			// If the API endpoint is having issues (500 error), show a helpful message
			if (error.message?.includes("500")) {
				console.warn("API endpoint returned 500 error - this appears to be a server-side issue");
				toast.add({
					title: "API Endpoint Issue",
					description: "The API endpoint is currently experiencing issues. This is a server-side problem that needs to be resolved by the API team.",
					color: "warning"
				});
			} else {
				toast.add({
					title: "Failed to Load Connections",
					description: error.message || "Could not load linked integrations for this project",
					color: "error"
				});
			}

			linkedConnections.value = [];
		} finally {
			loading.value = false;
		}
	}

	// Refresh linked connections
	async function refreshLinkedConnections() {
		await fetchLinkedConnections();
		toast.add({
			title: "Connections Refreshed",
			description: "Linked integrations list has been updated",
			color: "success"
		});
		emit("connectionsRefreshed");
	}

	// View connection details
	function viewConnectionDetails(connection: any) {
		selectedConnection.value = connection;
		showDetailsModal.value = true;
	}

	// Close details modal
	function closeDetailsModal() {
		showDetailsModal.value = false;
		selectedConnection.value = null;
	}

	// Unlink connection from project
	async function unlinkConnection(connection: any) {
		if (!props.selectedProject?.id || !connection.id) {
			toast.add({
				title: "Error",
				description: "Missing project or connection information",
				color: "error"
			});
			return;
		}

		// eslint-disable-next-line no-alert
		if (!confirm(`Are you sure you want to unlink ${connection.name} from ${props.selectedProject.name}?`)) {
			return;
		}

		try {
			unlinking.value = connection.id;
			console.log("Unlinking connection from project:", {
				projectId: props.selectedProject.id,
				connectionId: connection.id
			});

			await buttClient.unlinkService(props.selectedProject.id, connection.id);

			console.log("Connection unlinked successfully");

			toast.add({
				title: "Integration Unlinked",
				description: `Successfully unlinked ${connection.name} from ${props.selectedProject.name}`,
				color: "success"
			});

			// Remove from local list
			linkedConnections.value = linkedConnections.value.filter((c) => c.id !== connection.id);

			// Emit the unlink event
			emit("connectionUnlinked", connection);
		} catch (error: any) {
			console.error("Error unlinking connection from project:", error);
			toast.add({
				title: "Unlink Failed",
				description: error.message || `Failed to unlink ${connection.name} from ${props.selectedProject.name}`,
				color: "error"
			});
		} finally {
			unlinking.value = null;
		}
	}

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

	// Format date for display
	function formatDate(date: string | Date): string {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric"
		});
	}

	// Watch for project changes
	watch(() => props.selectedProject, () => {
		fetchLinkedConnections();
	}, { immediate: true });

	// Lifecycle
	onMounted(() => {
		if (props.selectedProject) {
			fetchLinkedConnections();
		}
	});

	// Expose methods for parent component
	defineExpose({
		refreshLinkedConnections,
		fetchLinkedConnections,
		linkedConnections: computed(() => linkedConnections.value),
		allLinkedConnections,
		addGitHubConnection: (repository: any, integration: any) => {
			// Add GitHub connection to the list
			linkedConnections.value.push({
				id: repository.id,
				name: repository.name,
				type: integration.type,
				description: repository.description,
				connected: true,
				createdAt: new Date().toISOString(),
				userInfo: {
					login: repository.owner?.login,
					name: repository.owner?.name
				}
			});
			fetchLinkedConnections();
		}
	});
</script>

<style scoped>
/* Custom styles if needed */
.glassmorphic-panel {
	background: rgba(var(--color-neutral-rgb), 0.05);
	backdrop-filter: blur(15px) saturate(1.2);
	border: 1px solid rgba(var(--color-neutral-rgb), 0.08);
	transition: all 0.3s ease;
}

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
}
</style>


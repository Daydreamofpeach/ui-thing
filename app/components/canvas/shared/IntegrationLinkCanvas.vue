<template>
	<div class="integration-link-canvas">
		<!-- Header -->
		<div class="link-header">
			<div class="header-icon">
				<UIcon name="i-lucide-link" class="size-6" />
			</div>
			<div class="header-text">
				<h3 class="header-title">Link Integration to Project</h3>
				<p class="header-description">Connect an integration to your project</p>
			</div>
			<button
				v-if="selectedProject"
				:disabled="loadingIntegrations"
				class="refresh-button"
				title="Refresh integrations"
				@click="fetchAvailableIntegrations"
			>
				<UIcon
					name="i-lucide-refresh-cw"
					class="size-4"
					:class="{ 'animate-spin': loadingIntegrations }"
				/>
			</button>
		</div>

		<!-- Project Selection Alert -->
		<div v-if="!selectedProject" class="alert-card warning">
			<UIcon name="i-lucide-alert-triangle" class="size-5 alert-icon" />
			<div class="alert-content">
				<span class="alert-text">Please select a project first</span>
			</div>
		</div>

		<!-- Selected Project Display -->
		<div v-else class="project-card">
			<UIcon name="i-lucide-folder" class="size-5 project-icon" />
			<div class="project-info">
				<span class="project-label">Selected Project</span>
				<p class="project-name">
					<strong>{{ selectedProject.name }}</strong>
					<span v-if="selectedProject.description" class="project-desc">
						- {{ selectedProject.description }}
					</span>
				</p>
			</div>
		</div>

		<!-- Available Integrations Section -->
		<div v-if="selectedProject">
			<div class="section-header">
				<span class="section-title">Available Integrations</span>
			</div>

			<!-- Loading State -->
			<div v-if="loadingIntegrations" class="loading-state">
				<UIcon name="i-lucide-loader-2" class="size-6 animate-spin" />
				<span class="loading-text">Loading integrations...</span>
			</div>

			<!-- Integrations List -->
			<div v-else-if="availableIntegrations.length > 0" class="integrations-list">
				<div
					v-for="integration in availableIntegrations"
					:key="integration.id"
					class="integration-card"
					:class="{ 'integration-linked': integration.isLinked }"
				>
					<div class="card-content">
						<div class="card-icon-wrapper">
							<Icon :name="getIntegrationIcon(integration.type)" class="card-icon" />
						</div>
						<div class="card-info">
							<h5 class="card-title">{{ integration.name }}</h5>
							<p class="card-description">{{ integration.description || 'No description' }}</p>
							<div class="card-badges">
								<span class="badge connected">Connected</span>
								<span class="badge type">{{ integration.type }}</span>
							</div>
						</div>
						<button
							class="link-button"
							:class="{ 'linked': integration.isLinked }"
							:disabled="isdisabled || integration.isLinked"
							@click="linkIntegrationToProject(integration)"
						>
							<UIcon
								:name="integration.isLinked ? 'i-lucide-check-circle' : 'i-lucide-link'"
								class="size-4"
							/>
							<span>{{ integration.isLinked ? 'Linked' : 'Link to Project' }}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="empty-state">
				<div class="empty-icon">
					<UIcon name="i-lucide-puzzle" class="size-8" />
				</div>
				<p class="empty-title">No integrations found</p>
				<p class="empty-message">This could be because:</p>
				<ul class="empty-reasons">
					<li>• No integrations have been set up yet</li>
					<li>• The organization doesn't have any integrations</li>
					<li>• There was an error loading integrations</li>
				</ul>
				<div class="empty-actions">
					<button class="empty-action-btn" @click="fetchAvailableIntegrations">
						<UIcon name="i-lucide-refresh-cw" class="size-4" />
						<span>Retry Loading</span>
					</button>
					<button class="empty-action-btn primary" @click="$emit('goToIntegrations')">
						<UIcon name="i-lucide-arrow-right" class="size-4" />
						<span>Go to Integrations</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Success Message -->
		<div v-if="recentlyLinked" class="alert-card success">
			<UIcon name="i-lucide-check-circle" class="size-5 alert-icon" />
			<div class="alert-content">
				<span class="alert-text">Integration linked successfully!</span>
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
	import { useToast } from "#imports";
	import { computed, onMounted, ref, watch } from "vue";
	import { useOrganisations } from "~/composables/useOrganisations";
	import { useSelectedOrganisationId } from "~/composables/useSelectedOrganisationId";
	import { buttClient } from "~/utils/buttClient";
	import GitHubLinkModal from "@components/integrations/modals/GitHubLinkModal.vue";
	import JiraLinkModal from "@components/integrations/modals/JiraLinkModal.vue";

	const props = defineProps<{
		selectedProject: any | null
	}>();

	const emit = defineEmits<{
		integrationLinked: [linkData: any]
		goToIntegrations: []
	}>();

	const isdisabled = ref(false);
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

	// Fetch available integrations for the organization
	async function fetchAvailableIntegrations() {
		try {
			loadingIntegrations.value = true;
			console.log("Fetching integrations...");
			console.log("Current organization ID:", selectedOrganisationId.value);

			// Use findIntegrationsByOrganisationId to get integrations for the organization
			if (selectedOrganisationId.value) {
				const orgIntegrations = await buttClient.findIntegrationsByOrganisationId(selectedOrganisationId.value);

				availableIntegrations.value = Array.isArray(orgIntegrations)
					? orgIntegrations.map((integration: any) => ({
						...integration,
						connected: integration.connected || false
					}))
					: [];
			} else {
				// Fallback to findAllIntegration if no organization ID
				const allIntegrations = await buttClient.findAllIntegration();

				// If we have a specific organization butt, filter by it
				if (currentOrganisationButt.value) {
					const orgIntegrations = Array.isArray(allIntegrations)
						? allIntegrations.filter((integration: any) => integration.butt === currentOrganisationButt.value)
						: [];

					availableIntegrations.value = orgIntegrations.map((integration: any) => ({
						...integration,
						connected: integration.connected || false
					}));
				} else {
					availableIntegrations.value = Array.isArray(allIntegrations)
						? allIntegrations.map((integration: any) => ({
							...integration,
							connected: integration.connected || false
						}))
						: [];
				}
			}

			// Check link status for each integration
			if (props.selectedProject) {
				for (const integration of availableIntegrations.value) {
					integration.isLinked = await checkIfIntegrationLinked(integration);
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
			return false;
		}

		try {
			const linkedConnections = await buttClient.linkedConnections(props.selectedProject.id);
			const integrationConnections = await buttClient.getConnectionsByIntegrationId(integration.id);

			if (linkedConnections && linkedConnections.length > 0 && integrationConnections && integrationConnections.length > 0) {
				const isLinked = linkedConnections.some((linkedConn: any) => {
					return integrationConnections.some((integrationConn: any) => {
						return linkedConn.integrationConnectionId === integrationConn.id;
					});
				});

				return isLinked;
			}

			return false;
		} catch (error) {
			console.error("Error checking integration link status:", error);
			return false;
		}
	}

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
		return iconMap[type?.toUpperCase()] || "heroicons:puzzle-piece";
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
/* Container */
.integration-link-canvas {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	padding: 1rem;
}

/* Header */
.link-header {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1.25rem;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 0.75rem;
}

.header-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 3rem;
	height: 3rem;
	background: rgba(147, 51, 234, 0.15);
	border: 1px solid rgba(147, 51, 234, 0.3);
	border-radius: 0.75rem;
	color: rgb(147, 51, 234);
	flex-shrink: 0;
}

.header-text {
	flex: 1;
}

.header-title {
	font-size: 1.125rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 0.25rem;
}

.header-description {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.6);
}

.refresh-button {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	color: rgba(255, 255, 255, 0.7);
	cursor: pointer;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.refresh-button:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.06);
	border-color: rgba(255, 255, 255, 0.15);
	color: var(--color-primary);
}

.refresh-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Alert Cards */
.alert-card {
	display: flex;
	align-items: center;
	gap: 0.875rem;
	padding: 1rem;
	border-radius: 0.5rem;
	border: 1px solid;
}

.alert-card.warning {
	background: rgba(245, 158, 11, 0.1);
	border-color: rgba(245, 158, 11, 0.3);
}

.alert-card.success {
	background: rgba(16, 185, 129, 0.1);
	border-color: rgba(16, 185, 129, 0.3);
}

.alert-icon {
	flex-shrink: 0;
}

.alert-card.warning .alert-icon {
	color: rgb(245, 158, 11);
}

.alert-card.success .alert-icon {
	color: rgb(16, 185, 129);
}

.alert-content {
	flex: 1;
}

.alert-text {
	font-size: 0.875rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.9);
}

/* Project Card */
.project-card {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	background: rgba(59, 130, 246, 0.1);
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-radius: 0.5rem;
}

.project-icon {
	flex-shrink: 0;
	color: rgb(59, 130, 246);
}

.project-info {
	flex: 1;
}

.project-label {
	display: block;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgb(59, 130, 246);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	margin-bottom: 0.25rem;
}

.project-name {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.9);
}

.project-name strong {
	font-weight: 600;
}

.project-desc {
	color: rgba(255, 255, 255, 0.7);
}

/* Section Header */
.section-header {
	margin-bottom: 0.75rem;
	padding: 0 0.25rem;
}

.section-title {
	font-size: 0.9375rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
}

/* Loading State */
.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.75rem;
	padding: 3rem 1rem;
}

.loading-text {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.6);
}

/* Integrations List */
.integrations-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

/* Integration Card */
.integration-card {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 0.75rem;
	transition: all 0.2s ease;
	overflow: hidden;
}

.integration-card:hover {
	background: rgba(255, 255, 255, 0.05);
	border-color: rgba(255, 255, 255, 0.12);
}

.integration-card.integration-linked {
	border-color: rgba(16, 185, 129, 0.3);
	background: rgba(16, 185, 129, 0.05);
}

.card-content {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
}

.card-icon-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	background: rgba(var(--color-primary-rgb), 0.1);
	border: 1px solid rgba(var(--color-primary-rgb), 0.2);
	border-radius: 0.5rem;
	flex-shrink: 0;
}

.card-icon {
	width: 1.5rem;
	height: 1.5rem;
	color: var(--color-primary);
}

.card-info {
	flex: 1;
	min-width: 0;
}

.card-title {
	font-size: 0.9375rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	margin-bottom: 0.25rem;
}

.card-description {
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 0.5rem;
	line-height: 1.4;
}

.card-badges {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}

.badge {
	padding: 0.25rem 0.625rem;
	border-radius: 0.375rem;
	font-size: 0.6875rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.025em;
	border: 1px solid;
}

.badge.connected {
	background: rgba(16, 185, 129, 0.15);
	border-color: rgba(16, 185, 129, 0.3);
	color: rgb(16, 185, 129);
}

.badge.type {
	background: rgba(99, 102, 241, 0.15);
	border-color: rgba(99, 102, 241, 0.3);
	color: rgb(99, 102, 241);
}

/* Link Button */
.link-button {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 1rem;
	background: rgba(147, 51, 234, 0.15);
	border: 1px solid rgba(147, 51, 234, 0.3);
	border-radius: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 600;
	color: rgb(147, 51, 234);
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
	flex-shrink: 0;
}

.link-button:hover:not(:disabled) {
	background: rgba(147, 51, 234, 0.25);
	border-color: rgba(147, 51, 234, 0.4);
	transform: translateY(-1px);
}

.link-button.linked {
	background: rgba(16, 185, 129, 0.15);
	border-color: rgba(16, 185, 129, 0.3);
	color: rgb(16, 185, 129);
	cursor: not-allowed;
}

.link-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
	transform: none;
}

/* Empty State */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 3rem 1rem;
	text-align: center;
}

.empty-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 4rem;
	height: 4rem;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 50%;
	margin-bottom: 1rem;
	color: rgba(255, 255, 255, 0.3);
}

.empty-title {
	font-size: 0.9375rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.7);
	margin-bottom: 0.5rem;
}

.empty-message {
	font-size: 0.875rem;
	color: rgba(255, 255, 255, 0.5);
	margin-bottom: 0.75rem;
}

.empty-reasons {
	list-style: none;
	padding: 0;
	margin: 0 0 1.5rem 0;
	font-size: 0.8125rem;
	color: rgba(255, 255, 255, 0.4);
	text-align: left;
	max-width: 20rem;
}

.empty-reasons li {
	padding: 0.25rem 0;
}

.empty-actions {
	display: flex;
	gap: 0.75rem;
	justify-content: center;
	flex-wrap: wrap;
}

.empty-action-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.625rem 1rem;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 0.5rem;
	font-size: 0.8125rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.8);
	cursor: pointer;
	transition: all 0.2s ease;
}

.empty-action-btn:hover {
	background: rgba(255, 255, 255, 0.06);
	border-color: rgba(255, 255, 255, 0.15);
}

.empty-action-btn.primary {
	background: rgba(var(--color-primary-rgb), 0.15);
	border-color: rgba(var(--color-primary-rgb), 0.3);
	color: var(--color-primary);
}

.empty-action-btn.primary:hover {
	background: rgba(var(--color-primary-rgb), 0.25);
	border-color: rgba(var(--color-primary-rgb), 0.4);
}
</style>


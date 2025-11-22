<template>
	<div class="integration-node-container node-container">
		<!-- Connection Handles -->
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<!-- Circular Icon Above Node -->
		<div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
			<UIcon name="i-lucide-puzzle" class="size-8" :style="{ color: themeColor }" />
		</div>

		<!-- Shared Header -->
		<NodeHeader
			title="INTEGRATION SETUP"
			:title-color="themeColor"
			:theme-color="themeColor"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="true"
			close-button-label="Delete integration node"
			@close="handleClose"
		/>

		<!-- Integration Panel -->
		<NodePanel
			panel-class="integration-config-container"
			:scrollbar-color="scrollbarColor"
		>
			<!-- Connected Integrations List (Top) -->
			<div v-if="createdIntegrations.length > 0" class="connected-integrations-section">
				<div class="section-header">
					<UIcon name="i-lucide-plug" class="size-4 text-primary" />
					<span class="section-title">Your Integrations</span>
					<span class="count-badge">{{ createdIntegrations.length }}</span>
				</div>
				<div class="integrations-list">
					<button
						v-for="integration in createdIntegrations"
						:key="integration.id"
						class="integration-item"
						@click="handleIntegrationClick(integration)"
					>
						<div class="integration-item-header">
							<div class="integration-icon">
								<Icon :name="getIntegrationIcon(integration.type)" class="size-6 text-primary" />
							</div>
							<div class="integration-info">
								<span class="integration-name">{{ integration.name }}</span>
								<span class="integration-type">{{ integration.type }}</span>
							</div>
						</div>
						<UBadge
							:color="integration.connected ? 'success' : 'warning'"
							:label="integration.connected ? 'Connected' : 'Setup Required'"
							size="xs"
						/>
					</button>
				</div>
			</div>

			<!-- Divider -->
			<div v-if="createdIntegrations.length > 0" class="section-divider">
				<span class="divider-text">Add New Integration</span>
			</div>

			<!-- Integration Setup with New UI -->
			<IntegrationSetupCanvas
				@integrationCreated="handleIntegrationCreated"
			/>
		</NodePanel>
	</div>
</template>

<script setup lang="ts">
	import { useToast } from "#imports";
	import { buttClient } from "@utils/buttClient";
	import IntegrationSetupCanvas from "@canvas/shared/IntegrationSetupCanvas.vue";
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onMounted, ref } from "vue";
	import "./styles/nodeContainer.css";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		organisationId?: string
		integrationCreated?: (integrationData: any, nodeId: string) => void
		createChildIntegrationDetailNode?: (parentNodeId: string, integrationData: any) => void
	}

	const props = withDefaults(defineProps<Props>(), {
		organisationId: "",
		integrationCreated: undefined,
		createChildIntegrationDetailNode: undefined
	});

	const emit = defineEmits<{
		closeNode: [nodeId: string]
	}>();

	// State
	const createdIntegrations = ref<any[]>([]);
	const isLoadingIntegrations = ref(false);

	// Theme color (purple for integrations)
	const themeColor = computed(() => "#a855f7"); // Purple
	const activeColorRGB = computed(() => "168, 85, 247");
	const scrollbarColor = computed(() => themeColor.value);

	const customNodeProps = computed(() => props.customNodeProps || {});

	// Handle integration created
	const handleIntegrationCreated = (integration: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔌 INTEGRATION CREATED IN NODE");
		console.log("  Integration:", integration);
		console.log("  Node ID:", customNodeProps.value.id);
		console.log("═══════════════════════════════════════════");

		// Update node data
		if (customNodeProps.value.data) {
			customNodeProps.value.data.integrationId = integration.id;
			customNodeProps.value.data.integrationName = integration.name;
			customNodeProps.value.data.integrationType = integration.type;
			customNodeProps.value.data.configured = true;
			console.log("✅ Node data updated with integration info");
		}

		// Refresh the integrations list
		fetchCreatedIntegrations();

		// Emit to parent if handler provided
		if (props.integrationCreated) {
			props.integrationCreated(integration, customNodeProps.value.id);
		}

		// Show success message
		useToast().add({
			title: "Integration Created",
			description: `${integration.name} has been added successfully`,
			color: "success"
		});
	};

	// Handle close button click
	const handleClose = () => {
		emit("closeNode", customNodeProps.value.id);
	};

	// Fetch created integrations for the organization
	async function fetchCreatedIntegrations() {
		if (!props.organisationId) {
			console.warn("⚠️ IntegrationConnectionNode: No organisation ID provided");
			return;
		}

		isLoadingIntegrations.value = true;
		try {
			console.log("🔍 IntegrationConnectionNode: Fetching integrations for org:", props.organisationId);
			const integrations = await buttClient.findAllIntegration();
			
			// Filter by organization
			createdIntegrations.value = integrations.filter(
				(int: any) => int.organisationId === props.organisationId
			);
			
			console.log("✅ Found", createdIntegrations.value.length, "integrations");
		} catch (error) {
			console.error("❌ Failed to fetch integrations:", error);
			createdIntegrations.value = [];
		} finally {
			isLoadingIntegrations.value = false;
		}
	}

	// Handle clicking on an integration to view details
	const handleIntegrationClick = (integration: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔌 INTEGRATION CLICKED IN NODE");
		console.log("  Integration:", integration);
		console.log("  Node ID:", customNodeProps.value.id);
		console.log("═══════════════════════════════════════════");

		if (props.createChildIntegrationDetailNode) {
			console.log("👶 Creating child integration detail node");
			props.createChildIntegrationDetailNode(customNodeProps.value.id, integration);
		} else {
			console.warn("⚠️ No createChildIntegrationDetailNode handler provided");
		}
	};

	// Get icon based on integration type
	const getIntegrationIcon = (type: string): string => {
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
	};

	// Lifecycle
	onMounted(() => {
		console.log("🎬 IntegrationConnectionNode mounted");
		console.log("  Organisation ID:", props.organisationId);
		fetchCreatedIntegrations();
	});
</script>

<style scoped>
/* Integration-specific styling */
.integration-node-container {
	min-width: 500px;
}

.integration-config-container {
	padding: 1rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

/* Connected Integrations Section */
.connected-integrations-section {
	background: rgba(168, 85, 247, 0.05);
	border: 1px solid rgba(168, 85, 247, 0.2);
	border-radius: 0.75rem;
	padding: 1rem;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 0.75rem;
	padding-bottom: 0.5rem;
	border-bottom: 1px solid rgba(168, 85, 247, 0.2);
}

.section-title {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	flex: 1;
}

.count-badge {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 1.5rem;
	height: 1.5rem;
	padding: 0 0.375rem;
	background: rgba(168, 85, 247, 0.2);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.75rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(168, 85, 247, 0.9);
}

.integrations-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	max-height: 12rem;
	overflow-y: auto;
}

/* Custom scrollbar */
.integrations-list::-webkit-scrollbar {
	width: 6px;
}

.integrations-list::-webkit-scrollbar-track {
	background: rgba(0, 0, 0, 0.2);
	border-radius: 3px;
}

.integrations-list::-webkit-scrollbar-thumb {
	background: rgba(168, 85, 247, 0.4);
	border-radius: 3px;
}

.integrations-list::-webkit-scrollbar-thumb:hover {
	background: rgba(168, 85, 247, 0.6);
}

.integration-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.5rem;
	transition: all 0.2s ease;
	cursor: pointer;
}

.integration-item:hover {
	transform: translateX(4px);
	background: rgba(168, 85, 247, 0.1);
	border-color: rgba(168, 85, 247, 0.5);
	box-shadow: 0 2px 8px rgba(168, 85, 247, 0.2);
}

.integration-item-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	flex: 1;
	min-width: 0;
}

.integration-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	background: rgba(168, 85, 247, 0.2);
	border: 1px solid rgba(168, 85, 247, 0.3);
	border-radius: 0.5rem;
	flex-shrink: 0;
}

.integration-info {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	min-width: 0;
	flex: 1;
}

.integration-name {
	font-size: 0.875rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.9);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.integration-type {
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.5);
	text-transform: uppercase;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* Section Divider */
.section-divider {
	position: relative;
	text-align: center;
	margin: 1rem 0;
}

.section-divider::before {
	content: "";
	position: absolute;
	left: 0;
	top: 50%;
	width: 100%;
	height: 1px;
	background: rgba(255, 255, 255, 0.1);
}

.divider-text {
	position: relative;
	display: inline-block;
	padding: 0 1rem;
	background: rgba(0, 0, 0, 0.4);
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(255, 255, 255, 0.5);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

/* Integration setup styling is now handled by IntegrationSetupCanvas component */

.integration-config-container :deep(.integration-card) {
	max-width: 100%;
}
</style>


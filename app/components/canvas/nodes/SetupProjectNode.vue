<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-settings"
		title="INTEGRATION SETUP"
		:title-color="themeColor"
		:theme-color="themeColor"
		:show-edit-button="false"
		:show-close-button="true"
		:show-default-header="true"
		:background-color="undefined"
		:border-color="borderColor"
		:min-width="900"
		:min-height="700"
		:default-collapsed="false"
		:node-class="'setup-project-node'"
		@close="handleClose"
	>
		<!-- Setup Content -->
		<NodePanel
			panel-class="setup-project-container"
			:scrollbar-color="scrollbarColor"
		>
			<StepNavigation
				:current-step="currentStepNumber"
				:total-steps="3"
				:theme-color="themeColor"
				:show-next-button="repositoryIntegrations.length > 0"
				:can-progress="repositoryIntegrations.length > 0"
				next-button-label="Continue to Environment"
				@next="createEnvironmentNode"
				@stepClick="handleStepClick"
			/>

			<section class="oscar-hero">
				<div class="oscar-hero__figure">
					<img :src="oscarMini" alt="Oscar's avatar" class="oscar-hero__image" />
				</div>
				<div class="oscar-hero__content">
					<h4 class="oscar-hero__title">Oscar's Advice</h4>
					<p class="oscar-hero__body">
						Link the integrations that are important for this project. Once everything is connected, continue to environment setup to pull dependencies.
					</p>
				</div>
			</section>

			<IntegrationSetupCanvas
				:exclude-types="existingIntegrationTypes"
				@integrationCreated="handleIntegrationCreated"
			/>

			<section v-if="linkedIntegrations.length > 0" class="integrations-section">
				<header class="section-header">
					<UIcon name="i-lucide-plug-2" class="size-5" :style="{ color: themeColor }" />
					<div class="section-header__text">
						<h4>Current Integrations</h4>
						<p>Linked services available for this project.</p>
					</div>
				</header>

				<div class="integrations-list">
					<button
						v-for="integration in linkedIntegrations"
						:key="integration.id"
						class="integration-item"
						@click="handleIntegrationClick(integration)"
					>
						<div class="integration-item-header">
							<div class="integration-icon">
								<Icon :name="getIntegrationIcon(integration.integration?.type)" class="size-5" />
							</div>
							<div class="integration-info">
								<span class="integration-name">{{ getIntegrationName(integration) }}</span>
								<span class="integration-type">{{ integration.integration?.type }}</span>
							</div>
						</div>
						<UBadge
							:color="integration.integration?.connected ? 'success' : 'warning'"
							:label="integration.integration?.connected ? 'Connected' : 'Setup Required'"
							size="xs"
						/>
					</button>
				</div>
			</section>

			<section v-else class="empty-state">
				<UIcon name="i-lucide-plug" class="size-12 text-white/20" />
				<p class="text-sm text-white/50">
					No integrations linked yet
				</p>
				<p class="text-xs text-white/40">
					Add an integration above to get started.
				</p>
			</section>

			<!-- Project Members Section -->
			<section class="members-section">
				<div class="section-header">
					<UIcon name="i-lucide-users" class="size-5" :style="{ color: themeColor }" />
					<h3 class="section-title">Project Members</h3>
					<span class="count-badge">{{ projectMembers.length }}</span>
				</div>

				<div v-if="projectMembers.length > 0" class="members-list">
					<div
						v-for="member in projectMembers"
						:key="member.id"
						class="member-item"
					>
						<div class="member-avatar">
							{{ (member.firstName?.charAt(0) || member.email?.charAt(0) || "?").toUpperCase() }}
						</div>
						<div class="member-info">
							<p class="member-name">{{ member.firstName }} {{ member.lastName }}</p>
							<p class="member-email">{{ member.email }}</p>
						</div>
						<div class="member-role">
							{{ member.role || "Member" }}
						</div>
					</div>
				</div>

				<button
					class="invite-button"
					@click="handleInviteUser"
				>
					<UIcon name="i-lucide-user-plus" class="size-4" />
					Invite Team Member
				</button>
			</section>
		</NodePanel>
	</BaseNodeTemplate>
</template>

<script setup lang="ts">
import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
import IntegrationSetupCanvas from "@canvas/shared/IntegrationSetupCanvas.vue";
import NodePanel from "@canvas/shared/NodePanel.vue";
import StepNavigation from "@canvas/shared/StepNavigation.vue";
import { buttClient } from "@utils/buttClient";
import { computed, onMounted, ref, watch } from "vue";
import { useInjectCanvasState } from "@canvas/composables/useCanvasState";
import oscarMini from "@/assets/oscarMini.png";
import "../nodes/styles/nodeContainer.css";

interface Props {
	customNodeProps: any
	updateNodeData: (nodeId: string, key: string, value: any) => void
	organisationId?: string
	projectId?: string
	projectName?: string
	onIntegrationCreated?: (integration: any) => void
	createChildProjectEnvironmentNode?: (setupNodeId: string, envData: any) => void
}

const props = withDefaults(defineProps<Props>(), {
	organisationId: "",
	projectId: "",
	projectName: "",
	onIntegrationCreated: undefined,
	createChildProjectEnvironmentNode: undefined
});

const emit = defineEmits<{
	closeNode: [nodeId: string]
	integrationCreated: [integration: any]
	inviteUser: []
}>();

const canvasState = useInjectCanvasState();

const currentStepNumber = ref(2);
const linkedIntegrations = ref<any[]>([]);

const themeColor = computed(() =>
	props.customNodeProps?.data?.themeColor
		|| props.customNodeProps?.data?.nodeColor
		|| "var(--color-primary)"
);
const borderColor = computed(() => {
	const color = themeColor.value;
	if (typeof color === 'string' && color.startsWith('var(')) {
		return "rgba(16, 185, 129, 0.3)"; // Default green border
	}
	return `${color}50`; // Add opacity
});
const scrollbarColor = computed(() => themeColor.value);

const resolvedProjectId = computed(() =>
	props.projectId
		|| props.customNodeProps?.data?.projectId
		|| props.customNodeProps?.data?.selectedProjectId
		|| canvasState?.getProjectContext()?.projectId
		|| null
);

const resolvedProjectName = computed(() =>
	props.projectName
		|| props.customNodeProps?.data?.projectName
		|| canvasState?.getProjectContext()?.projectName
		|| ""
);

const connectedIde = computed(() => {
	const canvasIde = canvasState?.getPrimaryIde();
	if (canvasIde) {
		return canvasIde;
	}
	return props.customNodeProps?.data?.connectedIde || null;
});

const existingIntegrationTypes = computed(() =>
	linkedIntegrations.value
		.map((connection: any) => connection.integration?.type?.toUpperCase())
		.filter(Boolean)
);

const repositoryIntegrations = computed(() =>
	linkedIntegrations.value.filter((connection: any) => {
		const type = connection.integrationConnection?.type
			|| connection.integration?.type
			|| connection.meta?.integration?.type;
		return type === "GITHUB" || type === "BITBUCKET";
	})
);

async function loadLinkedIntegrations() {
	const projectId = resolvedProjectId.value;
	if (!projectId) {
		console.warn("⚠️ SetupProjectNode: No project ID provided");
		return;
	}

	try {
		const connections = await buttClient.linkedConnections(projectId);
		linkedIntegrations.value = Array.isArray(connections) ? connections : [];
	} catch (error) {
		console.error("❌ SetupProjectNode: Failed to load integrations", error);
		linkedIntegrations.value = [];
	}
}

function getIntegrationName(connection: any): string {
	return connection.integration?.name
		|| connection.meta?.integration?.name
		|| connection.integration?.type
		|| "Integration";
}

function getIntegrationIcon(type?: string) {
	switch ((type || "").toUpperCase()) {
		case "GITHUB":
			return "simple-icons:github";
		case "BITBUCKET":
			return "simple-icons:bitbucket";
		case "GITLAB":
			return "simple-icons:gitlab";
		default:
			return "i-lucide-plug";
	}
}

function getRepositoryUrl(connection: any): string {
	return connection.meta?.repository?.html_url
		|| connection.meta?.repository?.url
		|| connection.meta?.repository?.links?.html?.href
		|| connection.meta?.repository?.web_url
		|| connection.url
		|| connection.repositoryUrl
		|| "";
}

function handleIntegrationClick(connection: any) {
	console.log("🔌 Integration clicked:", connection);
}

async function handleIntegrationCreated(integration: any) {
	console.log("✅ SetupProjectNode: Integration created", integration);
	await loadLinkedIntegrations();

	emit("integrationCreated", integration);
	props.onIntegrationCreated?.(integration);
}

function createEnvironmentNode() {
	if (!props.createChildProjectEnvironmentNode) {
		console.warn("⚠️ No createChildProjectEnvironmentNode handler provided");
		return;
	}

	const repositories = repositoryIntegrations.value.map((connection: any) => ({
		name: getIntegrationName(connection),
		url: getRepositoryUrl(connection),
		type: connection.integration?.type,
		branch: connection.meta?.repository?.default_branch || "main",
		id: connection.id
	}));

	if (canvasState) {
		repositories.forEach((repo) => canvasState.addRepository(repo));
	}

	const environmentData = {
		projectId: resolvedProjectId.value,
		projectName: resolvedProjectName.value,
		connectedIde: connectedIde.value,
		repositories
	};

	props.createChildProjectEnvironmentNode(props.customNodeProps.id, environmentData);
}

// Project members state
const projectMembers = ref<any[]>([]);

async function loadProjectMembers() {
	const projectId = resolvedProjectId.value;
	const orgId = props.organisationId || props.customNodeProps?.data?.organisationId;
	
	if (!projectId || !orgId) {
		console.warn("⚠️ SetupProjectNode: No project or organization ID provided");
		return;
	}

	try {
		// Fetch project members from API
		const members = await buttClient.getProjectMembers?.(projectId) || [];
		projectMembers.value = Array.isArray(members) ? members : [];
	} catch (error) {
		console.error("❌ SetupProjectNode: Failed to load project members", error);
		projectMembers.value = [];
	}
}

const handleStepClick = (step: number) => {
	console.log("🔢 Step clicked:", step);
};

function handleClose() {
	emit("closeNode", props.customNodeProps.id);
}

function handleInviteUser() {
	console.log("👤 Invite user clicked for project:", resolvedProjectId.value);
	// Emit event to open invite user modal
	emit("inviteUser");
}

watch(resolvedProjectId, () => {
	loadLinkedIntegrations();
	loadProjectMembers();
});

onMounted(() => {
	loadLinkedIntegrations();
	loadProjectMembers();
});
</script>

<style scoped>
.setup-project-node :deep(.base-node-template) {
	border-color: rgba(16, 185, 129, 0.5);
}

:deep(.setup-project-container) {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	padding: 0 1.25rem 1.5rem;
	height: 100%;
	max-height: 100%;
	overflow: hidden;
}

.integrations-section {
	padding: 1.25rem;
	border-radius: 0.85rem;
	background: rgba(0, 0, 0, 0.22);
	border: 1px solid rgba(var(--color-primary-rgb), 0.35);
	box-shadow: 0 18px 44px rgba(var(--color-primary-rgb), 0.25);
}

.section-header {
	display: flex;
	align-items: flex-start;
	gap: 1rem;
	margin-bottom: 1rem;
}

.section-header__text {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}

.section-header__text h4 {
	font-size: 1rem;
	font-weight: 600;
	color: rgba(236, 253, 245, 0.95);
}

.section-header__text p {
	font-size: 0.825rem;
	color: rgba(209, 250, 229, 0.75);
}

.integrations-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.integration-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	padding: 0.9rem 1rem;
	border-radius: 0.75rem;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(var(--color-primary-rgb), 0.35);
	transition: all 0.2s ease;
	text-align: left;
}

.integration-item:hover {
	background: rgba(255, 255, 255, 0.08);
	transform: translateY(-2px);
	border-color: rgba(var(--color-primary-rgb), 0.45);
	box-shadow: 0 12px 28px rgba(var(--color-primary-rgb), 0.28);
}

.integration-item-header {
	display: flex;
	align-items: center;
	gap: 0.85rem;
	flex: 1;
	min-width: 0;
}

.integration-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 0.65rem;
	background: rgba(var(--color-primary-rgb), 0.2);
	border: 1px solid rgba(var(--color-primary-rgb), 0.4);
	color: rgba(var(--color-primary-rgb), 0.95);
	flex-shrink: 0;
}

.integration-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	min-width: 0;
}

.integration-name {
	font-size: 0.9rem;
	font-weight: 600;
	color: rgba(236, 253, 245, 0.95);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.integration-type {
	font-size: 0.75rem;
	color: rgba(110, 231, 183, 0.75);
	text-transform: uppercase;
	letter-spacing: 0.06em;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	padding: 3rem 1rem;
	text-align: center;
	border-radius: 0.85rem;
	background: rgba(0, 0, 0, 0.2);
	border: 1px dashed rgba(16, 185, 129, 0.25);
}

.oscar-hero {
	display: flex;
	align-items: center;
	gap: 1.25rem;
	padding: 1.1rem 1.25rem;
	border-radius: 0.85rem;
	background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.28), rgba(var(--color-primary-rgb), 0.12));
	border: 1px solid rgba(var(--color-primary-rgb), 0.35);
	box-shadow: 0 18px 44px rgba(var(--color-primary-rgb), 0.28);
}

.oscar-hero__figure {
	flex-shrink: 0;
	width: 72px;
	height: 72px;
	border-radius: 50%;
	background: rgba(var(--color-primary-rgb), 0.22);
	border: 1px solid rgba(var(--color-primary-rgb), 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.oscar-hero__image {
	width: 64px;
	height: 64px;
	object-fit: contain;
}

.oscar-hero__content {
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	color: rgba(255, 247, 237, 0.92);
}

.oscar-hero__title {
	font-size: 0.95rem;
	font-weight: 600;
}

.oscar-hero__body {
	font-size: 0.82rem;
	color: rgba(255, 237, 213, 0.88);
	line-height: 1.45;
}

/* Project Members Section */
.members-section {
	padding: 1.25rem;
	border-radius: 0.85rem;
	background: rgba(0, 0, 0, 0.22);
	border: 1px solid rgba(168, 85, 247, 0.35);
	box-shadow: 0 18px 44px rgba(168, 85, 247, 0.15);
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

.members-section .section-header {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0;
}

.members-section .section-title {
	font-size: 1rem;
	font-weight: 600;
	color: rgba(236, 253, 245, 0.95);
	flex: 1;
}

.count-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 1.75rem;
	height: 1.5rem;
	padding: 0 0.5rem;
	border-radius: 0.375rem;
	background: rgba(168, 85, 247, 0.2);
	border: 1px solid rgba(168, 85, 247, 0.4);
	font-size: 0.75rem;
	font-weight: 600;
	color: rgba(196, 181, 253, 0.9);
}

.members-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	max-height: 200px;
	overflow-y: auto;
}

.member-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.75rem;
	border-radius: 0.65rem;
	background: rgba(168, 85, 247, 0.08);
	border: 1px solid rgba(168, 85, 247, 0.2);
	transition: all 0.2s ease;
}

.member-item:hover {
	background: rgba(168, 85, 247, 0.12);
	border-color: rgba(168, 85, 247, 0.4);
}

.member-avatar {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 2.25rem;
	height: 2.25rem;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(124, 58, 237, 0.2));
	border: 1px solid rgba(168, 85, 247, 0.4);
	color: rgba(196, 181, 253, 0.95);
	font-weight: 600;
	font-size: 0.875rem;
	flex-shrink: 0;
}

.member-info {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	min-width: 0;
	flex: 1;
}

.member-name {
	font-size: 0.875rem;
	font-weight: 500;
	color: rgba(236, 253, 245, 0.95);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin: 0;
}

.member-email {
	font-size: 0.75rem;
	color: rgba(210, 180, 254, 0.65);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin: 0;
}

.member-role {
	font-size: 0.7rem;
	font-weight: 600;
	color: rgba(168, 85, 247, 0.8);
	text-transform: uppercase;
	letter-spacing: 0.05em;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	background: rgba(168, 85, 247, 0.1);
	white-space: nowrap;
	flex-shrink: 0;
}

.invite-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	border-radius: 0.65rem;
	background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(124, 58, 237, 0.08));
	border: 1px solid rgba(168, 85, 247, 0.4);
	color: rgba(196, 181, 253, 0.95);
	font-size: 0.9rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.invite-button:hover {
	background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(124, 58, 237, 0.12));
	border-color: rgba(168, 85, 247, 0.6);
	color: rgba(196, 181, 253, 1);
	box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
}

.invite-button:active {
	transform: scale(0.98);
}
</style>

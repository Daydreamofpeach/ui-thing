<template>
	<div class="project-details">
		<!-- Project Info Card -->
		<div class="project-info-card">
			<div class="project-header">
				<div class="project-header-main">
					<div class="project-icon" :style="iconStyle">
						<UIcon name="i-lucide-folder-kanban" class="size-6" />
					</div>
					<div class="project-info">
						<h3 class="project-name-large">
							{{ project.name || "Unnamed Project" }}
						</h3>
						<p v-if="project.description" class="project-description-large">
							{{ project.description }}
						</p>
					</div>
				</div>
				<div class="project-header-actions">
					<button
						class="header-circle-button header-circle-button--primary"
						title="Add Task"
						@click="handleAddTask"
					>
						<UIcon name="i-lucide-plus" class="size-5" />
						<span class="sr-only">Add Task</span>
					</button>
					<button
						class="header-circle-button header-circle-button--neutral"
						title="Change Project"
						@click="handleChangeProject"
					>
						<UIcon name="i-lucide-refresh-cw" class="size-5" />
						<span class="sr-only">Change Project</span>
					</button>
				</div>
			</div>

			<!-- Setup Hero -->
			<div v-if="!showInstallButton" class="setup-hero">
				<div class="setup-hero-figure">
					<img :src="oscarMini" alt="Oscar's avatar" class="setup-hero-image" />
				</div>
				<div class="setup-hero-content">
					<h4 class="setup-hero-title">
						Oscar's Advice
					</h4>
					<p class="setup-hero-body">
						Start the guided setup to connect an IDE, link repositories, and prepare build templates so this project is ready to install.
					</p>
					<button
						class="hero-setup-button"
						@click="handleSetupProject"
					>
						<UIcon name="i-lucide-settings" class="size-4" />
						Configure Automated Project Installation
					</button>
				</div>
			</div>

			<!-- Project Quick Links -->
			<div class="project-quick-links">
				<button
					class="quick-link-button"
					:class="{ active: activeTab === 'users' }"
					title="View project users"
					@click="activeTab = 'users'"
				>
					<div class="quick-link-icon">
						<UIcon name="i-lucide-users" class="size-5" />
						<span v-if="(project.assignedUsers?.length || 0) > 0" class="quick-link-badge">
							{{ project.assignedUsers?.length || 0 }}
						</span>
					</div>
					<span class="quick-link-label">Users</span>
				</button>
				<button
					class="quick-link-button"
					:class="{ active: activeTab === 'tasks' }"
					title="View project tasks"
					@click="activeTab = 'tasks'"
				>
					<div class="quick-link-icon">
						<UIcon name="i-lucide-list-checks" class="size-5" />
						<span v-if="computedTasksLength > 0" class="quick-link-badge">
							{{ computedTasksLength }}
						</span>
					</div>
					<span class="quick-link-label">Tasks</span>
				</button>
				<button
					class="quick-link-button"
					:class="{ active: activeTab === 'integrations' }"
					title="View project integrations"
					@click="activeTab = 'integrations'"
				>
					<div class="quick-link-icon">
						<UIcon name="i-lucide-plug" class="size-5" />
						<span v-if="configuredIntegrations.length > 0" class="quick-link-badge">
							{{ configuredIntegrations.length }}
						</span>
					</div>
					<span class="quick-link-label">Integrations</span>
				</button>
				<button
					class="quick-link-button"
					:class="{ active: activeTab === 'tools' }"
					title="View project tools"
					@click="activeTab = 'tools'"
				>
					<div class="quick-link-icon">
						<UIcon name="i-lucide-wrench" class="size-5" />
						<span v-if="connectedIDEs.length > 0" class="quick-link-badge">
							{{ connectedIDEs.length }}
						</span>
					</div>
					<span class="quick-link-label">Tools</span>
				</button>
			</div>
		</div>

		<!-- Action Buttons -->
		<div v-if="showInstallButton" class="project-top-actions">
			<!-- Setup or Install Button -->
			<button
				class="action-button install"
				:class="{ disabled: !isInstallReady }"
				:disabled="!isInstallReady"
				:title="!isInstallReady ? 'Save environment setup first' : 'Install project with saved configuration'"
				@click="handleInstallProject"
			>
				<UIcon name="i-lucide-download" class="size-4" />
				{{ isInstallReady ? 'Install Project' : 'Install (Save First)' }}
			</button>
		</div>

		<!-- Users Section -->
		<div v-if="activeTab === 'users'" class="users-section">
			<div class="section-header">
				<UIcon name="i-lucide-users" class="size-4 text-primary" />
				<span class="section-title">Project Members</span>
				<span v-if="project.assignedUsers && project.assignedUsers.length > 0" class="count-badge">
					{{ project.assignedUsers.length }}
				</span>
			</div>
			<div v-if="project.assignedUsers && project.assignedUsers.length > 0" class="users-list">
				<button
					v-for="user in project.assignedUsers"
					:key="user.id"
					class="user-item"
					:style="getUserItemStyle(user)"
					@click="handleUserClick(user)"
				>
					<div class="user-item-header">
						<div class="user-avatar" :style="getUserAvatarStyle(user)">
							<UIcon name="i-lucide-user" class="size-4" />
						</div>
						<div class="user-info">
							<span class="user-name">{{ getUserDisplayName(user) }}</span>
							<span v-if="user.email" class="user-email">{{ user.email }}</span>
						</div>
					</div>
					<div class="user-role-badge" :style="getUserRoleBadgeStyle(user)">
						{{ getUserRole(user) }}
					</div>
				</button>
			</div>
			<div v-else class="empty-state">
				<UIcon name="i-lucide-user-x" class="size-8 text-white/20" />
				<p class="text-sm text-white/50">
					No users assigned yet
				</p>
			</div>
		</div>

		<!-- Tasks Section -->
		<div v-if="activeTab === 'tasks'" class="tasks-section">
			<div class="section-header">
				<UIcon name="i-lucide-list-checks" class="size-4 text-primary" />
				<span class="section-title">Project Tasks</span>
				<span v-if="project.tasks && project.tasks.length > 0" class="count-badge">
					{{ filteredTasks.length }} / {{ project.tasks.length }}
				</span>
			</div>

			<!-- Task Filters -->
			<div v-if="project.tasks && project.tasks.length > 0" class="task-filters">
				<div class="filter-group">
					<button
						class="filter-button"
						:class="{ active: taskFilter === 'all' }"
						@click="taskFilter = 'all'"
					>
						<UIcon name="i-lucide-list" class="size-3.5" />
						All
					</button>
					<button
						class="filter-button"
						:class="{ active: taskFilter === 'assigned' }"
						@click="taskFilter = 'assigned'"
					>
						<UIcon name="i-lucide-user-check" class="size-3.5" />
						Assigned
					</button>
					<button
						class="filter-button"
						:class="{ active: taskFilter === 'unassigned' }"
						@click="taskFilter = 'unassigned'"
					>
						<UIcon name="i-lucide-user-x" class="size-3.5" />
						Unassigned
					</button>
				</div>
				<select
					v-if="project.assignedUsers && project.assignedUsers.length > 0"
					v-model="selectedUserFilter"
					class="user-filter-select"
				>
					<option value="">
						All Users
					</option>
					<option
						v-for="user in project.assignedUsers"
						:key="user.id"
						:value="user.id"
					>
						{{ getUserDisplayName(user) }}
					</option>
				</select>
			</div>

			<div v-if="filteredTasks.length > 0" class="tasks-list">
				<div
					v-for="task in filteredTasks"
					:key="task.id"
					class="task-item-enhanced"
					:style="getTaskItemStyle(task)"
				>
					<!-- Task Main Info (Clickable) -->
					<button
						class="task-main-content"
						@click="handleTaskClick(task)"
					>
						<div class="task-item-header">
							<div class="task-icon" :style="getTaskIconStyle(task)">
								<UIcon name="i-lucide-check-square" class="size-4" />
							</div>
							<div class="task-info">
								<span class="task-name">{{ getTaskDisplayName(task) }}</span>
								<span v-if="task.description" class="task-description">{{ getCleanTaskDescription(task) }}</span>
							</div>
						</div>
						<div class="task-status-badge" :style="getTaskStatusBadgeStyle(task)">
							{{ getTaskStatus(task) }}
						</div>
					</button>

					<!-- Task Actions Row -->
					<div class="task-actions-row">
						<!-- Assigned Users -->
						<div class="task-assigned-users">
							<div v-if="getTaskAssignedUsers(task).length > 0" class="assigned-chips">
								<button
									v-for="user in getTaskAssignedUsers(task).slice(0, 2)"
									:key="user.id"
									class="user-chip"
									:title="`${user.name} - Click to view task orbit`"
									@click.stop="handleOpenUserOrbit(user)"
								>
									<UIcon name="i-lucide-user" class="size-3" />
									<span>{{ getUserDisplayName(user).slice(0, 10) }}</span>
								</button>
								<span v-if="getTaskAssignedUsers(task).length > 2" class="more-users">
									+{{ getTaskAssignedUsers(task).length - 2 }}
								</span>
							</div>
							<span v-else class="unassigned-label">
								<UIcon name="i-lucide-user-x" class="size-3" />
								Unassigned
							</span>
						</div>

						<!-- Quick Assign Dropdown -->
						<div class="quick-assign-wrapper">
							<button
								class="quick-assign-button"
								:title="getTaskAssignedUsers(task).length > 0 ? 'Manage assignments' : 'Assign user'"
								@click.stop="toggleTaskAssignMenu(task.id)"
							>
								<UIcon name="i-lucide-user-plus" class="size-3.5" />
							</button>

							<!-- Assignment Menu -->
							<div
								v-if="activeAssignMenu === task.id"
								class="assign-menu"
								@click.stop
							>
								<div class="assign-menu-header">
									<span>Assign Users</span>
									<button class="close-menu" @click="activeAssignMenu = null">
										<UIcon name="i-lucide-x" class="size-3.5" />
									</button>
								</div>
								<div class="assign-menu-list">
									<button
										v-for="user in project.assignedUsers"
										:key="user.id"
										class="assign-menu-item"
										:class="{ assigned: isUserAssignedToTask(task, user.id) }"
										@click="toggleUserAssignment(task, user)"
									>
										<div class="user-info-compact">
											<UIcon name="i-lucide-user" class="size-3.5" />
											<span>{{ getUserDisplayName(user) }}</span>
										</div>
										<UIcon
											:name="isUserAssignedToTask(task, user.id) ? 'i-lucide-check-circle' : 'i-lucide-circle'"
											class="size-4"
											:class="isUserAssignedToTask(task, user.id) ? 'text-green-400' : 'text-white/30'"
										/>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div v-else class="empty-state">
				<UIcon name="i-lucide-clipboard-x" class="size-8 text-white/20" />
				<p class="text-sm text-white/50">
					No tasks match your filters
				</p>
				<button
					class="empty-action-button"
					@click="taskFilter = 'all'; selectedUserFilter = ''"
				>
					<UIcon name="i-lucide-refresh-cw" class="size-4" />
					Clear Filters
				</button>
			</div>

			<div v-if="!project.tasks || project.tasks.length === 0" class="empty-state">
				<UIcon name="i-lucide-clipboard-x" class="size-8 text-white/20" />
				<p class="text-sm text-white/50">
					No tasks yet
				</p>
				<button
					class="empty-action-button"
					@click="handleAddTask"
				>
					<UIcon name="i-lucide-plus-circle" class="size-4" />
					Create First Task
				</button>
			</div>
		</div>

		<!-- Integrations Section -->
		<div v-if="activeTab === 'integrations'" class="integrations-section">
			<!-- Connected Integrations List -->
			<div v-if="projectIntegrations && projectIntegrations.length > 0" class="integrations-list-section">
				<div class="section-header">
					<UIcon name="i-lucide-plug" class="size-4 text-primary" />
					<span class="section-title">Connected Integrations</span>
					<span class="count-badge">{{ projectIntegrations.length }}</span>
				</div>
				<div class="integrations-list">
					<button
						v-for="integration in projectIntegrations"
						:key="integration.id"
						class="integration-item"
						@click="handleIntegrationClick(integration)"
					>
						<div class="integration-item-header">
							<div class="integration-icon">
								<Icon :name="getIntegrationIcon(integration.type)" class="size-5 text-primary" />
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
			<div v-if="projectIntegrations && projectIntegrations.length > 0" class="section-divider">
				<span class="divider-text">Add New Integration</span>
			</div>

			<!-- Integration Setup -->
			<div class="integration-setup-section">
				<IntegrationSetupCanvas
					@integrationCreated="handleIntegrationCreatedInProject"
				/>
			</div>
		</div>

		<!-- Tools Section -->
		<div v-if="activeTab === 'tools'" class="tools-section">
			<div class="tools-grid-header">
				<UIcon name="i-lucide-monitor" class="size-5 text-primary" />
				<div class="tools-grid-header__text">
					<span class="tools-grid-title">Editors & Developer Tools</span>
					<span class="tools-grid-subtitle">Link installed tools to this project or launch them instantly.</span>
				</div>
			</div>

			<div v-if="ideToolItems.length" class="tool-circle-section">
				<div class="tool-circle-section-header">
					<span class="tool-circle-section-title">Code Editors & IDEs</span>
					<span class="tool-circle-section-subtitle">Link IDE templates to open projects faster.</span>
				</div>
				<div class="tool-circle-grid">
					<div
						v-for="tool in ideToolItems"
						:key="tool.id"
						class="tool-circle-card"
					>
						<button
							class="tool-circle-button"
							:class="{
								'tool-circle-button--linked': tool.isLinked,
								'tool-circle-button--install': !tool.isInstalled
							}"
							:title="toolTooltip(tool)"
							@click="handleToolCircleClick(tool)"
						>
							<div class="tool-circle-content">
								<UIcon :name="tool.icon" class="tool-circle-icon" />
							</div>
							<div class="tool-circle-hover-icon">
								<UIcon :name="toolHoverIcon(tool)" class="size-5" />
							</div>
						</button>

						<button
							v-if="tool.canOpen"
							class="tool-open-button"
							:title="`Open ${tool.name}`"
							@click.stop="handleOpenIdeCircle(tool)"
						>
							<UIcon name="i-lucide-external-link" class="size-4" />
						</button>

						<div class="tool-circle-label">
							<span class="tool-circle-name">{{ tool.name }}</span>
							<span
								class="tool-circle-status"
								:class="{
									'tool-circle-status--linked': tool.isLinked,
									'tool-circle-status--install': !tool.isInstalled
								}"
							>
								{{ toolStatusLabel(tool) }}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div v-if="developerToolItems.length" class="tool-circle-section">
				<div class="tool-circle-section-header">
					<span class="tool-circle-section-title">Developer Tooling</span>
					<span class="tool-circle-section-subtitle">Keep core build tools linked for automation workflows.</span>
				</div>
				<div class="tool-circle-grid">
					<div
						v-for="tool in developerToolItems"
						:key="tool.id"
						class="tool-circle-card"
					>
						<button
							class="tool-circle-button"
							:class="{
								'tool-circle-button--linked': tool.isLinked,
								'tool-circle-button--install': !tool.isInstalled
							}"
							:title="toolTooltip(tool)"
							@click="handleToolCircleClick(tool)"
						>
							<div class="tool-circle-content">
								<UIcon :name="tool.icon" class="tool-circle-icon" />
							</div>
							<div class="tool-circle-hover-icon">
								<UIcon :name="toolHoverIcon(tool)" class="size-5" />
							</div>
						</button>

						<div class="tool-circle-label">
							<span class="tool-circle-name">{{ tool.name }}</span>
							<span
								class="tool-circle-status"
								:class="{
									'tool-circle-status--linked': tool.isLinked,
									'tool-circle-status--install': !tool.isInstalled
								}"
							>
								{{ toolStatusLabel(tool) }}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div v-if="ideToolItems.length === 0 && developerToolItems.length === 0" class="empty-state">
				<UIcon name="i-lucide-plug" class="size-8 text-white/20" />
				<p class="text-sm text-white/50">
					No developer tools detected yet
				</p>
			</div>
		</div>

		<!-- IDE Template Selection Modal -->
		<IdeTemplateSelectionModal
			v-model:open="showIdeTemplateModal"
			:ide-name="selectedIdeForTemplates?.name || ''"
			:project-id="project.id"
			:organization-users="project.assignedUsers || []"
			:existing-templates="existingLinkedTemplates"
			@template-selected="handleTemplateSelected"
		/>
	</div>
</template>

<script setup lang="ts">
import { useInjectCanvasState } from "@canvas/composables/useCanvasState";
import { useTemplateUnlink } from "@canvas/composables/useTemplateUnlink";
import IntegrationSetupCanvas from "@canvas/shared/IntegrationSetupCanvas.vue";
import { buttClient } from "@utils/buttClient";
import { useTauriShellCommand } from "#imports";
import { computed, onMounted, ref, watch } from "vue";
import oscarMini from "@/assets/oscarMini.png";
import IdeTemplateSelectionModal from "../../modals/IdeTemplateSelectionModal.vue";

interface Props {
	project: any
	themeColor?: string
	showInstallButton?: boolean
	isInstallReady?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	themeColor: "#3b82f6",
	showInstallButton: false,
	isInstallReady: false
});

const emit = defineEmits<{
	changeProject: []
	setupProject: []
	installProject: []
	userClick: [user: any]
	addTask: []
	taskClick: [task: any]
	integrationClick: [integration: any]
	integrationCreated: [integration: any]
	openUserOrbit: [user: any]
	taskUserAssigned: [taskId: string, userId: string]
	taskUserUnassigned: [taskId: string, userId: string]
	ideConnected: [ide: any]
	ideDisconnected: [ideId: string]
	openIde: [ide: any]
	openProjectInIde: [ide: any]
}>();
// Debug logging for button visibility
console.log("═══════════════════════════════════════════");
console.log("📊 PROJECT DETAILS COMPONENT");
console.log("  Project Name:", props.project?.name);
console.log("  showInstallButton prop:", props.showInstallButton);
console.log("  isInstallReady prop:", props.isInstallReady);
console.log("  Should show Setup button:", !props.showInstallButton);
console.log("  Should show Install button:", props.showInstallButton);
console.log("  Install button enabled:", props.isInstallReady);
console.log("═══════════════════════════════════════════");

// Watch for prop changes
watch(() => props.showInstallButton, (newVal, oldVal) => {
	console.log("🔄 showInstallButton changed:", { from: oldVal, to: newVal });
});

watch(() => props.isInstallReady, (newVal, oldVal) => {
	console.log("🔄 isInstallReady changed:", { from: oldVal, to: newVal });
});

// State for integrations
const projectIntegrations = ref<any[]>([]);

// Task filtering state
const taskFilter = ref<"all" | "assigned" | "unassigned">("all");
const selectedUserFilter = ref<string>("");
const activeAssignMenu = ref<string | null>(null);

// Tab state
const activeTab = ref<"users" | "tasks" | "integrations" | "tools">("users");

// Configured integrations
const configuredIntegrations = computed(() => {
	return projectIntegrations.value.filter((i: any) => i.status === "connected" || i.configured);
});

// Connected IDEs
const connectedIDEs = computed(() => {
	return props.project.connectedIDEs || [];
});

// Available IDEs for icon row (with status checking)
const availableIDEs = ref<any[]>([
	{
		name: "VS Code",
		status: "checking",
		icon: "i-logos-visual-studio-code",
		openCommand: "code",
		checkCommand: "$ErrorActionPreference = 'SilentlyContinue'; $paths = @(); if ($env:LOCALAPPDATA) { $paths += (Join-Path $env:LOCALAPPDATA 'Programs\\Microsoft VS Code\\Code.exe') }; if ($env:ProgramFiles) { $paths += (Join-Path $env:ProgramFiles 'Microsoft VS Code\\Code.exe') }; if (${env:ProgramFiles(x86)}) { $paths += (Join-Path ${env:ProgramFiles(x86)} 'Microsoft VS Code\\Code.exe') }; $command = Get-Command code -ErrorAction SilentlyContinue; if ($command) { 'found::' + $command.Source } else { $existing = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1; if ($existing) { 'found::' + $existing } else { '' } }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; & \"{path}\" --version 2>$null | Select-Object -First 1",
		downloadUrl: "https://code.visualstudio.com/download",
		executablePath: ""
	},
	{
		name: "Cursor",
		status: "checking",
		icon: "i-lucide-code-2",
		openCommand: "cursor",
		checkCommand: "$ErrorActionPreference = 'SilentlyContinue'; $paths = @(); if ($env:LOCALAPPDATA) { $paths += (Join-Path $env:LOCALAPPDATA 'Programs\\Cursor\\Cursor.exe') }; if ($env:ProgramFiles) { $paths += (Join-Path $env:ProgramFiles 'Cursor\\Cursor.exe') }; if (${env:ProgramFiles(x86)}) { $paths += (Join-Path ${env:ProgramFiles(x86)} 'Cursor\\Cursor.exe') }; $command = Get-Command cursor -ErrorAction SilentlyContinue; if ($command) { 'found::' + $command.Source } else { $existing = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1; if ($existing) { 'found::' + $existing } else { '' } }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; & \"{path}\" --version 2>$null | Select-Object -First 1",
		downloadUrl: "https://www.cursor.so/",
		executablePath: ""
	},
	{
		name: "Visual Studio",
		status: "checking",
		icon: "i-logos-visual-studio",
		openCommand: "devenv",
		checkCommand: "if (Test-Path 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe') { 'found' } else { '' }",
		versionCommand: "$ErrorActionPreference = 'SilentlyContinue'; $vsPath = Get-ChildItem 'C:\\Program Files\\Microsoft Visual Studio\\*\\*\\Common7\\IDE\\devenv.exe' -ErrorAction SilentlyContinue | Select-Object -First 1; if ($vsPath) { $vsPath.Directory.Parent.Parent.Name } else { 'Installed' }",
		downloadUrl: "https://visualstudio.microsoft.com/downloads/",
		executablePath: ""
	}
]);

// Available Developer Tools for icon row (with status checking)
const availableDeveloperTools = ref<any[]>([
	{ name: "Git", status: "checking", icon: "i-logos-git-icon" },
	{ name: "npm", status: "checking", icon: "i-logos-npm-icon" },
	{ name: "Bun", status: "checking", icon: "i-logos-bun" },
	{ name: "pnpm", status: "checking", icon: "i-logos-pnpm" },
	{ name: "Husky", status: "checking", icon: "i-lucide-dog" },
	{ name: "AWS Amplify CLI", status: "checking", icon: "i-logos-aws-amplify" },
	{ name: "AWS CLI", status: "checking", icon: "i-logos-aws" },
	{ name: "ESLint", status: "checking", icon: "i-logos-eslint" },
	{ name: "TypeScript", status: "checking", icon: "i-logos-typescript-icon" }
]);

type ToolCircleType = "ide" | "developer";

interface ToolCircleItem {
	id: string
	name: string
	icon: string
	status: string
	isLinked: boolean
	isInstalled: boolean
	canOpen: boolean
	supportsLink: boolean
	type: ToolCircleType
	source: any
	linkedIde?: any
}

const ideToolItems = computed<ToolCircleItem[]>(() => {
	const baseItems = availableIDEs.value.map((ide) => {
		const linkedIde = connectedIDEs.value.find((connected: any) =>
			connected.name === ide.name
			|| connected.ideCommand === ide.openCommand
		);
		const isInstalled = ide.status === "installed";

		return {
			id: `ide-${ide.name}`,
			name: ide.name,
			icon: ide.icon || "i-lucide-code-2",
			status: ide.status,
			isLinked: Boolean(linkedIde),
			isInstalled,
			canOpen: isInstalled || Boolean(linkedIde),
			supportsLink: true,
			type: "ide" as ToolCircleType,
			source: ide,
			linkedIde
		};
	});

	const unmatchedConnected = connectedIDEs.value.filter(
		(connected: any) => !baseItems.some((item) => item.name === connected.name)
	);

	for (const ide of unmatchedConnected) {
		baseItems.push({
			id: ide.id || `connected-${ide.name}`,
			name: ide.name,
			icon: ide.icon || "i-lucide-code-2",
			status: "installed",
			isLinked: true,
			isInstalled: true,
			canOpen: true,
			supportsLink: true,
			type: "ide" as ToolCircleType,
			source: ide,
			linkedIde: ide
		});
	}

	return baseItems;
});

const developerToolItems = computed<ToolCircleItem[]>(() => {
	return availableDeveloperTools.value.map((tool) => ({
		id: `dev-${tool.name}`,
		name: tool.name,
		icon: tool.icon || "i-lucide-wrench",
		status: tool.status,
		isLinked: false,
		isInstalled: tool.status === "installed",
		canOpen: false,
		supportsLink: true,
		type: "developer" as ToolCircleType,
		source: tool
	}));
});

const parseCheckOutput = (rawOutput: string) => {
	const trimmed = (rawOutput || "").trim();
	if (!trimmed) {
		return { installed: false, executablePath: "" };
	}

	const foundPathMatch = trimmed.match(/found::(.+)/i);
	if (foundPathMatch && foundPathMatch[1]) {
		const rawPath = foundPathMatch[1].trim();
		const cleanedPath = rawPath.replace(/^"(.*)"$/, "$1");
		return { installed: true, executablePath: cleanedPath };
	}

	if (/found/i.test(trimmed)) {
		return { installed: true, executablePath: "" };
	}

	return { installed: false, executablePath: "" };
};

const escapeForPowershell = (value: string) => {
	return value.replace(/`/g, "``").replace(/"/g, "`\"");
};

const resolveVersionCommand = (ide: any) => {
	if (!ide.versionCommand) {
		return "";
	}

	if (!ide.versionCommand.includes("{path}")) {
		return ide.versionCommand;
	}

	const executable = ide.executablePath || ide.openCommand || "";
	if (!executable) {
		return "";
	}

	const escaped = escapeForPowershell(executable);
	return ide.versionCommand.split("{path}").join(escaped);
};

// Check IDE/tool status on mount
const checkToolStatuses = async () => {
	// Check IDEs
	for (const ide of availableIDEs.value) {
		try {
			if (!ide.checkCommand) continue;

			const result = await useTauriShellCommand.create("exec-pwsh", ["-Command", ide.checkCommand]).execute();
			const parsed = parseCheckOutput(result.stdout);
			ide.status = parsed.installed ? "installed" : "not-installed";
			if (parsed.executablePath) {
				ide.executablePath = parsed.executablePath;
			} else if (!parsed.installed) {
				ide.executablePath = "";
			}
			if (!parsed.installed) {
				ide.version = undefined;
			}

			// Get version if installed
			if (ide.status === "installed" && ide.versionCommand) {
				const command = resolveVersionCommand(ide);
				if (command) {
					try {
						const versionResult = await useTauriShellCommand.create("exec-pwsh", ["-Command", command]).execute();
						ide.version = versionResult.stdout.trim() || "Installed";
					} catch (versionError) {
						console.warn(`⚠️ Failed to resolve version for ${ide.name}:`, versionError);
						ide.version = "Installed";
					}
				} else {
					ide.version = "Installed";
				}
			}
		} catch (error) {
			console.error(`Error checking ${ide.name}:`, error);
			ide.status = "not-installed";
			ide.version = undefined;
			ide.executablePath = "";
		}
	}

	// Check Developer Tools
	for (const tool of availableDeveloperTools.value) {
		try {
			let checkCommand = "";
			if (tool.name === "Git") {
				checkCommand = "if (Get-Command git -ErrorAction SilentlyContinue) { 'found' } else { '' }";
			} else if (tool.name === "npm") {
				checkCommand = "if (Get-Command npm -ErrorAction SilentlyContinue) { 'found' } else { '' }";
			} else if (tool.name === "Bun") {
				checkCommand = "if (Get-Command bun -ErrorAction SilentlyContinue) { 'found' } else { '' }";
			} else if (tool.name === "pnpm") {
				checkCommand = "if (Get-Command pnpm -ErrorAction SilentlyContinue) { 'found' } else { '' }";
			} else if (tool.name === "Husky") {
				checkCommand = "if (Get-Command husky -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path '.husky') { 'found' } else { '' }";
			} else if (tool.name === "AWS Amplify CLI") {
				checkCommand = "if (Get-Command amplify -ErrorAction SilentlyContinue) { 'found' } else { '' }";
			} else if (tool.name === "AWS CLI") {
				checkCommand = "if (Get-Command aws -ErrorAction SilentlyContinue) { 'found' } else { '' }";
			} else if (tool.name === "ESLint") {
				checkCommand = "if (Get-Command eslint -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path 'node_modules/.bin/eslint') { 'found' } elseif (Test-Path 'node_modules/.bin/eslint.cmd') { 'found' } else { '' }";
			} else if (tool.name === "TypeScript") {
				checkCommand = "if (Get-Command tsc -ErrorAction SilentlyContinue) { 'found' } elseif (Test-Path 'node_modules/.bin/tsc') { 'found' } elseif (Test-Path 'node_modules/.bin/tsc.cmd') { 'found' } else { '' }";
			}

			const result = await useTauriShellCommand.create("exec-pwsh", ["-Command", checkCommand]).execute();
			const stdout = (result.stdout || "").toLowerCase();
			tool.status = (result.code === 0 && stdout.includes("found")) ? "installed" : "not-installed";
		} catch (error) {
			console.error(`Error checking ${tool.name}:`, error);
			tool.status = "not-installed";
		}
	}
};

// Tabs definition (after configuredIntegrations is defined)
// Status colors
const hexToRgb = (hex: string): string => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return "59, 130, 246";
	const r = Number.parseInt(result[1] || "3b", 16);
	const g = Number.parseInt(result[2] || "82", 16);
	const b = Number.parseInt(result[3] || "f6", 16);
	return `${r}, ${g}, ${b}`;
};

const iconStyle = computed(() => {
	const color = props.themeColor;
	const rgb = hexToRgb(color);
	return {
		backgroundColor: `rgba(${rgb}, 0.2)`,
		borderColor: `rgba(${rgb}, 0.4)`,
		color
	};
});

const computedTasksLength = computed(() => {
	console.log("🔍 ProjectDetails: Computing tasks length");
	console.log("  Project:", props.project);
	console.log("  Project.tasks:", props.project?.tasks);
	console.log("  Is array:", Array.isArray(props.project?.tasks));
	const length = props.project?.tasks?.length || 0;
	console.log("  Tasks length:", length);
	return length;
});

const toolStatusLabel = (tool: ToolCircleItem): string => {
	if (tool.isLinked) return "Installed";
	if (tool.isInstalled) return "Installed: Not Linked";
	if (tool.status === "checking") return "Checking";
	return "Not Installed";
};

const toolHoverIcon = (tool: ToolCircleItem): string => {
	if (!tool.isInstalled) return "i-lucide-download";
	if (!tool.supportsLink) return "i-lucide-info";
	return tool.isLinked ? "i-lucide-unlink" : "i-lucide-link-2";
};

const toolTooltip = (tool: ToolCircleItem): string => {
	if (!tool.isInstalled) return `Install ${tool.name}`;
	if (!tool.supportsLink) return `${tool.name} installed`;
	return tool.isLinked ? `Unlink ${tool.name}` : `Link ${tool.name}`;
};

const handleChangeProject = () => {
	emit("changeProject");
};

const handleSetupProject = () => {
	emit("setupProject");
};

const handleInstallProject = () => {
	emit("installProject");
};

const handleUserClick = (user: any) => {
	console.log("👤 User clicked in ProjectDetails:", user);
	emit("userClick", user);
};

const handleAddTask = () => {
	emit("addTask");
};

const handleTaskClick = (task: any) => {
	console.log("📋 Task clicked in ProjectDetails:", task);
	emit("taskClick", task);
};

const handleIntegrationClick = (integration: any) => {
	console.log("🔌 Integration clicked in ProjectDetails:", integration);
	emit("integrationClick", integration);
};

const handleIntegrationCreatedInProject = (integration: any) => {
	console.log("🔌 Integration created in ProjectDetails:", integration);
	// Refresh integrations list
	fetchProjectIntegrations();
	// Emit to parent
	emit("integrationCreated", integration);
};

// Fetch integrations for the project's organization
async function fetchProjectIntegrations() {
	try {
		if (!props.project?.organisationId && !props.project?.id) {
			console.warn("⚠️ No organization or project ID available");
			return;
		}

		console.log("🔍 ProjectDetails: Fetching integrations");
		const integrations = await buttClient.findAllIntegration();

		// Filter by organization ID
		const orgId = props.project.organisationId || props.project.organizationId;
		projectIntegrations.value = integrations.filter(
			(int: any) => int.organisationId === orgId
		);

		console.log("✅ Found", projectIntegrations.value.length, "integrations");
	} catch (error) {
		console.error("❌ Failed to fetch integrations:", error);
		projectIntegrations.value = [];
	}
}

// User display helpers (same as UserManagementNode)
const getUserDisplayName = (user: any) => {
	return user.name || user.email || "Unnamed User";
};

const getUserRole = (user: any) => {
	return (user.role || "member").toUpperCase();
};

// Role colors
const roleColors: Record<string, string> = {
	admin: "#10b981", // Green
	owner: "#10b981", // Green
	member: "#3b82f6", // Blue
	developer: "#8b5cf6", // Purple
	guest: "#f59e0b" // Amber
};

const getUserRoleColor = (user: any) => {
	const role = (user.role || "member").toLowerCase();
	return roleColors[role] || roleColors.member;
};

const getUserItemStyle = (user: any) => {
	const color = getUserRoleColor(user) || "#3b82f6";
	const rgb = hexToRgb(color);
	return {
		borderColor: `rgba(${rgb}, 0.2)`,
		backgroundColor: `rgba(${rgb}, 0.05)`
	};
};

const getUserAvatarStyle = (user: any) => {
	const color = getUserRoleColor(user) || "#3b82f6";
	const rgb = hexToRgb(color);
	return {
		backgroundColor: `rgba(${rgb}, 0.2)`,
		borderColor: `rgba(${rgb}, 0.4)`,
		color
	};
};

const getUserRoleBadgeStyle = (user: any) => {
	const color = getUserRoleColor(user) || "#3b82f6";
	const rgb = hexToRgb(color);
	return {
		backgroundColor: `rgba(${rgb}, 0.2)`,
		borderColor: `rgba(${rgb}, 0.3)`,
		color
	};
};

// Task display helpers
const taskStatusColors: Record<string, string> = {
	"To Do": "#6366f1",
	"In Progress": "#3b82f6",
	"In Review": "#f59e0b",
	Done: "#10b981",
	Blocked: "#ef4444",
	Cancelled: "#6b7280"
};

const getTaskDisplayName = (task: any): string => {
	return task.name || task.title || "Unnamed Task";
};

const getTaskStatus = (task: any): string => {
	return task.jiraStatus || task.status || "To Do";
};

const getTaskStatusColor = (task: any): string => {
	const status = getTaskStatus(task);
	return taskStatusColors[status] || "#6366f1";
};

const getTaskItemStyle = (task: any) => {
	const color = getTaskStatusColor(task);
	return {
		borderColor: `${color}40`,
		backgroundColor: `${color}10`
	};
};

const getTaskIconStyle = (task: any) => {
	const color = getTaskStatusColor(task);
	return {
		backgroundColor: `${color}20`,
		borderColor: `${color}40`,
		color
	};
};

const getTaskStatusBadgeStyle = (task: any) => {
	const color = getTaskStatusColor(task);
	return {
		backgroundColor: `${color}30`,
		borderColor: `${color}60`,
		color
	};
};

// Integration display helpers
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
// Filtered tasks based on filters
const filteredTasks = computed(() => {
	let tasks = props.project.tasks || [];

	// Filter by assignment status
	if (taskFilter.value === "assigned") {
		tasks = tasks.filter((task: any) => getTaskAssignedUsers(task).length > 0);
	} else if (taskFilter.value === "unassigned") {
		tasks = tasks.filter((task: any) => getTaskAssignedUsers(task).length === 0);
	}

	// Filter by specific user
	if (selectedUserFilter.value) {
		tasks = tasks.filter((task: any) =>
			isUserAssignedToTask(task, selectedUserFilter.value)
		);
	}

	return tasks;
});

// Get assigned users for a task
function getTaskAssignedUsers(task: any): any[] {
	if (!task.description || !props.project.assignedUsers) return [];

	const assignedUsers: any[] = [];
	const desc = task.description || "";

	// Parse [ASSIGNED:userId|userName] metadata
	const assignedMatches = desc.matchAll(/\[ASSIGNED:([^\]|]+)(?:\|[^\]]+)?\]/g);
	for (const match of assignedMatches) {
		const userId = match[1];
		const user = props.project.assignedUsers.find((u: any) => u.id === userId);
		if (user && !assignedUsers.find((u: any) => u.id === userId)) {
			assignedUsers.push(user);
		}
	}

	return assignedUsers;
}

// Get clean description without metadata
function getCleanTaskDescription(task: any): string {
	let desc = task.description || "";
	// Remove [ASSIGNED:...] and [ParentTask:...] metadata
	desc = desc.replace(/\[ASSIGNED:[^\]]+\]/g, "");
	desc = desc.replace(/\[ParentTask:[^\]]+\]/g, "");
	return desc.trim();
}

// Check if user is assigned to task
function isUserAssignedToTask(task: any, userId: string): boolean {
	return getTaskAssignedUsers(task).some((u: any) => u.id === userId);
}

// Toggle task assign menu
function toggleTaskAssignMenu(taskId: string) {
	activeAssignMenu.value = activeAssignMenu.value === taskId ? null : taskId;
}

// Toggle user assignment
async function toggleUserAssignment(task: any, user: any) {
	const isAssigned = isUserAssignedToTask(task, user.id);

	if (isAssigned) {
		emit("taskUserUnassigned", task.id, user.id);
	} else {
		emit("taskUserAssigned", task.id, user.id);
	}

	// Close menu after assignment
	setTimeout(() => {
		activeAssignMenu.value = null;
	}, 300);
}

// Open user orbit view
function handleOpenUserOrbit(user: any) {
	emit("openUserOrbit", user);
}

function handleToolCircleClick(tool: ToolCircleItem) {
	if (!tool.isInstalled) {
		if (tool.type === "ide") {
			handleInstallIde(tool.source);
		} else {
			handleInstallDevTool(tool.source);
		}
		return;
	}

	if (tool.isLinked && tool.linkedIde) {
		if (tool.type === "ide") {
			handleDisconnectIde(tool.linkedIde);
		}
	} else {
		if (tool.type === "ide") {
			handleConnectIdeFromList(tool.source);
		} else {
			handleConnectDevToolFromList(tool.source);
		}
	}
}

function handleOpenIdeCircle(tool: ToolCircleItem) {
	const target = tool.linkedIde ?? tool.source;
	handleOpenIde(target);
}

// IDE handlers
async function handleOpenIde(ide: any) {
	console.log("🚀 Opening IDE from project:", ide);
	// Emit to parent which has the proven working method
	emit("openIde", ide);
}

function handleOpenProjectInIde(ide: any) {
	console.log("📂 Opening project in IDE:", ide);
	emit("openProjectInIde", ide);
}

async function handleDisconnectIde(ide: any) {
	console.log("🔗 Disconnecting IDE from project:", ide);

	const { useToast } = await import("#ui/composables/useToast");
	const toast = useToast();

	// If this IDE has a linked template, unlink it first
	if (ide.templateId && props.project.id) {
		console.log("🔓 Also unlinking associated template:", ide.templateId);

		try {
			const result = await unlinkTemplate({
				projectId: props.project.id,
				templateId: ide.templateId
			});

			if (result.success) {
				console.log("✅ Template unlinked successfully");
				toast.add({
					title: "IDE & Template Disconnected",
					description: `${ide.name} and its template have been disconnected`,
					color: "green"
				});
			}
		} catch (error) {
			console.error("❌ Failed to unlink template:", error);
			// Continue with IDE disconnect even if template unlink fails
		}
	} else {
		toast.add({
			title: "IDE Disconnected",
			description: `${ide.name} has been disconnected`,
			color: "green"
		});
	}

	emit("ideDisconnected", ide.id);
}

// Get IDE item style
function getIdeItemStyle(ide: any) {
	const color = "#8b5cf6"; // Purple for IDEs
	const rgb = hexToRgb(color);
	return {
		borderColor: `rgba(${rgb}, 0.3)`,
		backgroundColor: `rgba(${rgb}, 0.05)`
	};
}

// Inject canvas state
const canvasState = useInjectCanvasState();

// Template unlink composable
const { unlinkTemplate } = useTemplateUnlink();

// State for template selection modal
const showIdeTemplateModal = ref(false);
const selectedIdeForTemplates = ref<any>(null);
const existingLinkedTemplates = ref<any[]>([]);

// Handle connecting IDE from the IDE list
async function handleConnectIdeFromList(ide: any) {
	console.log("═══════════════════════════════════════════");
	console.log("🔗 OPENING IDE TEMPLATE MODAL");
	console.log("  IDE Name:", ide.name);
	console.log("  IDE Version:", ide.version);
	console.log("═══════════════════════════════════════════");

	// Fetch existing linked templates before opening modal
	try {
		console.log("🔍 Fetching existing linked templates for project:", props.project.id);
		const linkedTemplates = await buttClient.linkedTemplates(props.project.id);
		existingLinkedTemplates.value = Array.isArray(linkedTemplates) ? linkedTemplates : [];
		console.log("✅ Found", existingLinkedTemplates.value.length, "existing templates");
	} catch (error) {
		console.error("❌ Failed to fetch existing templates:", error);
		existingLinkedTemplates.value = [];
	}

	// Open template selection modal
	selectedIdeForTemplates.value = ide;
	showIdeTemplateModal.value = true;
}

// Handle connecting developer tool from the list (opens template modal)
async function handleConnectDevToolFromList(tool: any) {
	console.log("═══════════════════════════════════════════");
	console.log("🔗 OPENING DEVELOPER TOOL TEMPLATE MODAL");
	console.log("  Tool Name:", tool.name);
	console.log("═══════════════════════════════════════════");

	try {
		console.log("🔍 Fetching existing linked templates for project:", props.project.id);
		const linkedTemplates = await buttClient.linkedTemplates(props.project.id);
		existingLinkedTemplates.value = Array.isArray(linkedTemplates) ? linkedTemplates : [];
		console.log("✅ Found", existingLinkedTemplates.value.length, "existing templates");
	} catch (error) {
		console.error("❌ Failed to fetch existing templates:", error);
		existingLinkedTemplates.value = [];
	}

	selectedIdeForTemplates.value = tool;
	showIdeTemplateModal.value = true;
}

// Handle installing developer tool
function handleInstallDevTool(tool: any) {
	console.log("📥 Installing developer tool:", tool.name);
	if (tool.downloadUrl) {
		window.open(tool.downloadUrl, "_blank");
	}
}

// Handle template selection from modal (template is already copied by the modal)
async function handleTemplateSelected(copiedTemplate: any) {
	console.log("═══════════════════════════════════════════");
	console.log("✅ COPIED TEMPLATE RECEIVED");
	console.log("  Template ID:", copiedTemplate.id);
	console.log("  Template Name:", copiedTemplate.name);
	console.log("  Template Description:", copiedTemplate.description);
	console.log("  Template Author:", copiedTemplate.author);
	console.log("  Full template object:", copiedTemplate);
	console.log("  IDE:", selectedIdeForTemplates.value.name);
	console.log("  Project ID:", props.project.id);
	console.log("═══════════════════════════════════════════");

	// Link the copied template to project using the new API endpoint
	let linkedSuccessfully = false;
	try {
		console.log("🔗 Linking copied template to project via API...");
		console.log("  Project ID:", props.project.id);
		console.log("  Template ID:", copiedTemplate.id);

		const linkResult = await buttClient.linkTemplate(props.project.id, copiedTemplate.id, {});

		console.log("✅ Copied template linked to project successfully");
		console.log("📋 Link result:", linkResult);
		linkedSuccessfully = true;
	} catch (linkError) {
		console.error("❌ Failed to link template to project:", linkError);
		// Continue with IDE connection even if linking fails
	}

	// Create IDE connection with the copied template
	const ideConnection = {
		id: `ide-${Date.now()}`,
		name: selectedIdeForTemplates.value.name,
		command: selectedIdeForTemplates.value.openCommand,
		ideCommand: selectedIdeForTemplates.value.openCommand,
		version: selectedIdeForTemplates.value.version,
		template: copiedTemplate, // Store the copied template with custom name/description/author
		templateId: copiedTemplate.id,
		templateName: copiedTemplate.name,
		templateDescription: copiedTemplate.description,
		templateAuthor: copiedTemplate.author,
		connectedAt: new Date().toISOString(),
		linkedToProject: linkedSuccessfully
	};

	console.log("📤 IDE Connection object:", ideConnection);

	// Add to canvas state (global)
	if (canvasState) {
		canvasState.addConnectedIde(ideConnection);
		console.log("✅ IDE added to canvas state");

		// Update project context to ensure it has latest info
		const existingContext = canvasState.getProjectContext();
		if (existingContext.projectId) {
			canvasState.setProjectContext(
				existingContext.projectId,
				existingContext.projectName || props.project.name,
				existingContext.organizationId || props.project.organisationId
			);
		}
	}

	// Also emit to parent to update node data
	emit("ideConnected", ideConnection);

	// Refresh existing templates list for next time
	try {
		const updatedLinkedTemplates = await buttClient.linkedTemplates(props.project.id);
		existingLinkedTemplates.value = Array.isArray(updatedLinkedTemplates) ? updatedLinkedTemplates : [];
		console.log("🔄 Refreshed existing templates list:", existingLinkedTemplates.value.length);
	} catch (error) {
		console.warn("⚠️ Failed to refresh existing templates:", error);
	}

	// Close modal
	showIdeTemplateModal.value = false;
	selectedIdeForTemplates.value = null;

	console.log("✅ IDE connection complete with copied template linked");
	console.log("═══════════════════════════════════════════");
}

// Handle installing IDE
function handleInstallIde(ide: any) {
	if (ide.downloadUrl) {
		window.open(ide.downloadUrl, "_blank");
	}
}

// Watch for project changes to refetch integrations
watch(() => props.project, (newProject: any, oldProject: any) => {
	// Refetch integrations if project changed or if integration refresh trigger changed
	if (newProject?.id !== oldProject?.id
		|| newProject?._integrationRefreshTrigger !== oldProject?._integrationRefreshTrigger) {
		console.log("🔄 Project or integrations changed, refetching...");
		fetchProjectIntegrations();
	}
}, { deep: true });

onMounted(() => {
	fetchProjectIntegrations();
	checkToolStatuses();
});

// Expose methods so parent can call them
defineExpose({
	refreshIntegrations: fetchProjectIntegrations
});
</script>

<style scoped>
	.project-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	/* Top Actions */
	.project-top-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		margin-bottom: 0.5rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 0.5rem;
	}

	.action-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.action-button.primary {
		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		font-weight: 600;
	}

	.action-button.primary:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.5);
	}

	.action-button.secondary {
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.03);
		border-color: rgba(255, 255, 255, 0.08);
	}

	.action-button.secondary:hover {
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.12);
	}

	.action-button.install {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.4);
		color: rgb(16, 185, 129);
		font-weight: 600;
	}

	.action-button.install:hover:not(:disabled) {
		background: rgba(16, 185, 129, 0.2);
		border-color: rgba(16, 185, 129, 0.5);
	}

	.action-button.install.disabled,
	.action-button.install:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		color: rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.03);
		border-color: rgba(255, 255, 255, 0.08);
	}

	.project-info-card {
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
	}

	.project-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.project-header-main {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
		min-width: 0;
	}

	.project-header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header-circle-button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 999px;
		border: 1px solid rgba(148, 163, 184, 0.35);
		background: rgba(15, 23, 42, 0.65);
		color: rgba(226, 232, 240, 0.9);
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
		cursor: pointer;
	}

	.header-circle-button--primary {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(56, 189, 248, 0.32));
		border-color: rgba(56, 189, 248, 0.45);
		color: rgba(226, 244, 255, 0.95);
	}

	.header-circle-button--neutral {
		background: rgba(15, 23, 42, 0.55);
	}

	.header-circle-button:hover,
	.header-circle-button:focus-visible {
		transform: translateY(-1px);
		box-shadow: 0 10px 24px rgba(15, 23, 42, 0.35);
		border-color: rgba(59, 130, 246, 0.4);
	}

	.header-circle-button--primary:hover,
	.header-circle-button--primary:focus-visible {
		border-color: rgba(56, 189, 248, 0.65);
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.28), rgba(56, 189, 248, 0.42));
	}

	.project-icon {
		width: 4rem;
		height: 4rem;
		border-radius: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid;
	}

	.project-info {
		flex: 1;
	}

	.project-name-large {
		font-size: 1.125rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	.project-description-large {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		margin: 0.25rem 0 0 0;
	}

	.setup-hero {
		display: flex;
		gap: 1rem;
		margin: 1rem 0;
		padding: 1rem;
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.18), rgba(252, 211, 77, 0.16));
		border: 1px solid rgba(249, 115, 22, 0.35);
		border-radius: 0.75rem;
		align-items: center;
	}

	.setup-hero-figure {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 9999px;
		background: rgba(249, 115, 22, 0.16);
		border: 1px solid rgba(249, 115, 22, 0.35);
	}

	.setup-hero-image {
		width: 3rem;
		height: 3rem;
		object-fit: contain;
	}

	.setup-hero-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.setup-hero-title {
		font-size: 0.95rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
	}

	.setup-hero-body {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
		line-height: 1.5;
	}

	.hero-setup-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.26), rgba(252, 211, 77, 0.18));
		border: 2px solid rgba(249, 115, 22, 0.6);
		border-radius: 0.5rem;
		color: rgba(249, 115, 22, 0.95);
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		align-self: center;
		box-shadow: 0 10px 24px rgba(249, 115, 22, 0.2);
	}

	.hero-setup-button:hover {
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.34), rgba(252, 211, 77, 0.2));
		border-color: rgba(249, 115, 22, 0.75);
		transform: translateY(-2px);
		box-shadow: 0 14px 32px rgba(249, 115, 22, 0.25);
	}

	.project-quick-links {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.75rem;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 0.75rem;
	}

	.quick-link-button {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(148, 163, 184, 0.3);
		background: rgba(15, 23, 42, 0.55);
		color: rgba(226, 232, 240, 0.85);
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 6.5rem;
	}

	.quick-link-button:hover,
	.quick-link-button:focus-visible {
		transform: translateY(-2px);
		border-color: rgba(59, 130, 246, 0.55);
		background: rgba(30, 64, 175, 0.35);
		color: rgba(239, 246, 255, 0.95);
		box-shadow: 0 12px 24px rgba(30, 64, 175, 0.25);
	}

	.quick-link-button.active {
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.24), rgba(56, 189, 248, 0.38));
		border-color: rgba(56, 189, 248, 0.55);
		color: rgba(239, 246, 255, 0.95);
		box-shadow: 0 14px 28px rgba(56, 189, 248, 0.25);
	}

	.quick-link-icon {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.35);
		color: currentColor;
	}

	.quick-link-button.active .quick-link-icon {
		background: rgba(56, 189, 248, 0.25);
		border-color: rgba(56, 189, 248, 0.55);
	}

	.quick-link-badge {
		position: absolute;
		top: -0.4rem;
		right: -0.4rem;
		min-width: 1.5rem;
		height: 1.5rem;
		padding: 0 0.35rem;
		border-radius: 999px;
		background: rgba(59, 130, 246, 0.85);
		color: rgba(241, 245, 249, 0.98);
		font-size: 0.6875rem;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.quick-link-label {
		font-size: 0.8125rem;
		letter-spacing: 0.01em;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.project-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.action-button.primary {
		color: var(--color-primary);
		background: rgba(var(--color-primary-rgb), 0.15);
		border-color: rgba(var(--color-primary-rgb), 0.4);
		font-weight: 600;
	}

	.action-button.primary:hover {
		background: rgba(var(--color-primary-rgb), 0.2);
		border-color: rgba(var(--color-primary-rgb), 0.5);
	}

	.action-button.secondary {
		color: rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.03);
		border-color: rgba(255, 255, 255, 0.08);
	}

	.action-button.secondary:hover {
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(255, 255, 255, 0.12);
	}

	/* Users Section */
	.users-section {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.8);
		flex: 1;
	}

	.count-badge {
		padding: 0.25rem 0.5rem;
		background: rgba(var(--color-primary-rgb), 0.2);
		border: 1px solid rgba(var(--color-primary-rgb), 0.3);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.users-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 300px;
		overflow-y: auto;
		padding-right: 0.25rem;
	}

	/* Custom Scrollbar */
	.users-list::-webkit-scrollbar {
		width: 6px;
	}

	.users-list::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.users-list::-webkit-scrollbar-thumb {
		background: rgba(var(--color-primary-rgb), 0.4);
		border-radius: 3px;
	}

	.users-list::-webkit-scrollbar-thumb:hover {
		background: rgba(var(--color-primary-rgb), 0.6);
	}

	.user-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		text-align: left;
	}

	.user-item:hover {
		background: rgba(255, 255, 255, 0.08);
		transform: translateX(4px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.user-item-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.user-avatar {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid;
		flex-shrink: 0;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
	}

	.user-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-email {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-role-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border: 1px solid;
		flex-shrink: 0;
	}

	/* Tab Content */
	.tab-content {
		margin-top: 1rem;
	}

	/* Tasks Section */
	.tasks-section {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: 0.75rem;
	}

	.tasks-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 20rem;
		overflow-y: auto;
	}

	/* Ensure task items are block-level and spaced */
	.tasks-list > * {
		display: flex !important;
		flex-direction: column !important;
		margin-bottom: 0;
	}

	/* Custom scrollbar for tasks list */
	.tasks-list::-webkit-scrollbar {
		width: 6px;
	}

	.tasks-list::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.tasks-list::-webkit-scrollbar-thumb {
		background: rgba(99, 102, 241, 0.4);
		border-radius: 3px;
	}

	.tasks-list::-webkit-scrollbar-thumb:hover {
		background: rgba(99, 102, 241, 0.6);
	}

	.task-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid;
		border-radius: 0.5rem;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.task-item:hover {
		transform: translateX(4px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.task-item-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.task-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		border: 1px solid;
		flex-shrink: 0;
	}

	.task-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
	}

	.task-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.task-description {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.task-status-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		border: 1px solid;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.empty-action-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.4);
		border-radius: 0.5rem;
		color: rgba(99, 102, 241, 0.9);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 0.5rem;
	}

	.empty-action-button:hover {
		background: rgba(99, 102, 241, 0.3);
		border-color: rgba(99, 102, 241, 0.6);
		transform: translateY(-1px);
	}

	/* Task Filters */
	.task-filters {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		padding: 0.75rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.filter-group {
		display: flex;
		gap: 0.375rem;
		flex: 1;
	}

	.filter-button {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-button:hover {
		background: rgba(99, 102, 241, 0.2);
		border-color: rgba(99, 102, 241, 0.4);
		color: rgba(255, 255, 255, 0.9);
	}

	.filter-button.active {
		background: rgba(99, 102, 241, 0.3);
		border-color: rgba(99, 102, 241, 0.5);
		color: rgba(99, 102, 241, 0.95);
	}

	.user-filter-select {
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 0.375rem;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
		background-size: 1rem;
		transition: all 0.2s ease;
	}

	.user-filter-select:hover {
		border-color: rgba(99, 102, 241, 0.5);
		background-color: rgba(0, 0, 0, 0.6);
	}

	.user-filter-select option {
		background: rgba(0, 0, 0, 0.95);
		color: rgba(255, 255, 255, 0.9);
		padding: 0.5rem;
	}

	/* Enhanced Task Items */
	.task-item-enhanced {
		display: flex !important;
		flex-direction: column !important;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid;
		border-radius: 0.625rem;
		overflow: hidden;
		transition: all 0.2s ease;
		width: 100%;
		min-height: 4rem;
	}

	.task-item-enhanced:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
	}

	.task-main-content {
		display: flex !important;
		flex-direction: row !important;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem;
		width: 100%;
		text-align: left;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.2s ease;
		min-height: 3rem;
	}

	.task-main-content:hover {
		background: rgba(99, 102, 241, 0.05);
	}

	.task-item-header {
		display: flex !important;
		flex-direction: row !important;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.task-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.375rem;
		border: 1px solid;
		flex-shrink: 0;
	}

	.task-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.task-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
	}

	.task-description {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-wrap: break-word;
	}

	.task-actions-row {
		display: flex !important;
		flex-direction: row !important;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.875rem;
		background: rgba(0, 0, 0, 0.2);
		border-top: 1px solid rgba(255, 255, 255, 0.05);
		width: 100%;
	}

	.task-assigned-users {
		display: flex !important;
		flex-direction: row !important;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		flex-wrap: wrap;
	}

	.assigned-chips {
		display: flex !important;
		flex-direction: row !important;
		align-items: center;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.user-chip {
		display: inline-flex !important;
		flex-direction: row !important;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 0.3rem;
		color: rgba(255, 255, 255, 0.85);
		font-size: 0.6875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.user-chip:hover {
		background: rgba(99, 102, 241, 0.3);
		border-color: rgba(99, 102, 241, 0.5);
		transform: scale(1.05);
	}

	.more-users {
		font-size: 0.6875rem;
		color: rgba(255, 255, 255, 0.5);
		font-weight: 500;
	}

	.unassigned-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.6875rem;
		color: rgba(255, 255, 255, 0.4);
		font-style: italic;
	}

	.quick-assign-wrapper {
		position: relative;
	}

	.quick-assign-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: rgba(99, 102, 241, 0.15);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 0.375rem;
		color: rgba(99, 102, 241, 0.9);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.quick-assign-button:hover {
		background: rgba(99, 102, 241, 0.25);
		border-color: rgba(99, 102, 241, 0.5);
	}

	.assign-menu {
		position: absolute;
		right: 0;
		top: calc(100% + 0.5rem);
		width: 16rem;
		max-height: 20rem;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
		z-index: 50;
		overflow: hidden;
	}

	.assign-menu-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: rgba(99, 102, 241, 0.1);
		border-bottom: 1px solid rgba(99, 102, 241, 0.2);
		font-size: 0.8125rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
	}

	.close-menu {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.25rem;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-menu:hover {
		background: rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.9);
	}

	.assign-menu-list {
		max-height: 16rem;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.assign-menu-list::-webkit-scrollbar {
		width: 6px;
	}

	.assign-menu-list::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.assign-menu-list::-webkit-scrollbar-thumb {
		background: rgba(99, 102, 241, 0.4);
		border-radius: 3px;
	}

	.assign-menu-list::-webkit-scrollbar-thumb:hover {
		background: rgba(99, 102, 241, 0.6);
	}

	.assign-menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		background: rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.375rem;
		margin-bottom: 0.375rem;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		text-align: left;
	}

	.assign-menu-item:last-child {
		margin-bottom: 0;
	}

	.assign-menu-item:hover {
		background: rgba(99, 102, 241, 0.15);
		border-color: rgba(99, 102, 241, 0.3);
	}

	.assign-menu-item.assigned {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.3);
	}

	.user-info-compact {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.8125rem;
		font-weight: 500;
	}

	/* Integrations Section */
	.integrations-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.integrations-list-section {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(168, 85, 247, 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
	}

	.integrations-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 15rem;
		overflow-y: auto;
	}

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

	.integration-setup-section {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(168, 85, 247, 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
	}

	.integration-setup-section :deep(.integration-container) {
		min-height: auto;
	}

	.integration-setup-section :deep(.integration-card) {
		max-width: 100%;
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

	/* Tools Section */
	.tools-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.tool-circle-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: rgba(15, 23, 42, 0.45);
		border: 1px solid rgba(148, 163, 184, 0.18);
		border-radius: 0.75rem;
	}

	.tool-circle-section-header {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.tool-circle-section-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: rgba(241, 245, 249, 0.95);
	}

	.tool-circle-section-subtitle {
		font-size: 0.75rem;
		color: rgba(148, 163, 184, 0.7);
	}

	.tools-grid-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border-radius: 0.75rem;
		background: rgba(15, 23, 42, 0.55);
		border: 1px solid rgba(148, 163, 184, 0.2);
	}

	.tools-grid-header__text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.tools-grid-title {
		font-size: 1rem;
		font-weight: 600;
		color: rgba(241, 245, 249, 0.95);
	}

	.tools-grid-subtitle {
		font-size: 0.8125rem;
		color: rgba(148, 163, 184, 0.75);
	}

	.tool-circle-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1.25rem;
	}

	.tool-circle-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding-top: 0.5rem;
	}

	.tool-circle-button {
		position: relative;
		width: 6rem;
		height: 6rem;
		border-radius: 999px;
		border: 1.5px solid rgba(148, 163, 184, 0.35);
		background: rgba(15, 23, 42, 0.55);
		display: grid;
		place-items: center;
		color: rgba(226, 232, 240, 0.9);
		transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
		cursor: pointer;
		overflow: hidden;
	}

	.tool-circle-button:hover {
		transform: translateY(-2px);
		border-color: rgba(56, 189, 248, 0.5);
		box-shadow: 0 12px 24px rgba(15, 23, 42, 0.35);
	}

	.tool-circle-button--linked {
		border-color: rgba(56, 189, 248, 0.75);
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.22), rgba(56, 189, 248, 0.35));
		box-shadow: 0 16px 28px rgba(56, 189, 248, 0.28);
	}

	.tool-circle-button--install {
		opacity: 0.85;
		border-color: rgba(229, 231, 235, 0.2);
		background: rgba(15, 23, 42, 0.35);
	}

	.tool-circle-content {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
	}

	.tool-circle-icon {
		width: 2.5rem;
		height: 2.5rem;
	}

	.tool-circle-hover-icon {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		background: rgba(15, 23, 42, 0.78);
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.tool-circle-button:hover .tool-circle-hover-icon {
		opacity: 1;
	}

	.tool-open-button {
		position: absolute;
		top: 0.15rem;
		right: 0.15rem;
		width: 2rem;
		height: 2rem;
		display: grid;
		place-items: center;
		border-radius: 999px;
		border: 1px solid rgba(56, 189, 248, 0.55);
		background: linear-gradient(135deg, rgba(56, 189, 248, 0.9), rgba(14, 165, 233, 0.9));
		color: #0f172a;
		font-size: 0;
		box-shadow: 0 10px 24px rgba(56, 189, 248, 0.35);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.tool-open-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 14px 32px rgba(56, 189, 248, 0.45);
	}

	.tool-circle-label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: center;
		text-align: center;
	}

	.tool-circle-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(241, 245, 249, 0.95);
	}

	.tool-circle-status {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		background: rgba(148, 163, 184, 0.18);
		color: rgba(148, 163, 184, 0.85);
	}

	.tool-circle-status--linked {
		background: rgba(56, 189, 248, 0.18);
		color: rgba(191, 219, 254, 0.95);
	}

	.tool-circle-status--install {
		background: rgba(248, 113, 113, 0.18);
		color: rgba(254, 226, 226, 0.95);
	}
</style>

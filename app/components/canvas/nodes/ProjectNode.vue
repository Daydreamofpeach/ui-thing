<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-folder-kanban"
		title="PROJECT MANAGEMENT"
		:title-color="themeColor"
		:theme-color="themeColor"
		:show-edit-button="false"
		:show-close-button="true"
		:show-default-header="true"
		:background-color="undefined"
		:border-color="borderColor"
		:min-width="900"
		:min-height="750"
		:max-height="800"
		:default-collapsed="false"
		:node-class="'project-node'"
		@close="handleClose"
	>
		<!-- Project Selection/Configuration -->
		<NodePanel
			v-if="!customNodeProps.data?.selectedProjectId"
			panel-class="project-config-container"
			:scrollbar-color="scrollbarColor"
		>
			<!-- Project Search -->
			<RecordSelector
				class="project-record-selector"
				:records="availableProjects"
				:is-loading="isLoadingProjects"
				:selected-id="selectedProjectId"
				record-type-singular="project"
				record-type-plural="projects"
				:hide-header="true"
				header-icon="i-lucide-folder"
				item-icon="i-lucide-folder-kanban"
				icon-class="text-primary"
				:theme-color="activeColorRGB"
				:show-meta="true"
				@select="selectProject"
				@attach="attachSelectedProject"
			>
				<template #actions>
					<button
						type="button"
						class="create-project-button"
						:class="{ active: showCreateForm }"
						@click="showCreateForm = !showCreateForm"
					>
						<UIcon :name="showCreateForm ? 'i-lucide-x' : 'i-lucide-plus-circle'" class="size-4" />
						<span>{{ showCreateForm ? 'Close' : 'Create New Project' }}</span>
					</button>
					<div v-if="showCreateForm" class="create-project-section">
						<div class="create-project-header">
							<UIcon name="i-lucide-plus-circle" class="size-4 text-primary" />
							<span>Create New Project</span>
						</div>
						<ProjectForm
							mode="create"
							:project-data="{
								name: customNodeProps.data?.projectName,
								description: customNodeProps.data?.description
							}"
							:is-loading="isCreating"
							@update-field="(key: string, value: any) => updateNodeData(customNodeProps.id, `project${key.charAt(0).toUpperCase() + key.slice(1)}`, value)"
							@submit="createProjectFromNode"
						/>
					</div>
				</template>
			<template #item="{ record: project, isSelected }">
				<div class="project-record-item" :class="{ selected: isSelected }">
					<div class="project-record-header">
						<div class="project-icon" :style="getProjectIconStyle(project)">
							<UIcon name="i-lucide-folder-kanban" class="size-3.5" />
						</div>
						<div class="project-info">
							<div class="project-title-row">
								<span class="project-name">{{ getProjectDisplayName(project) }}</span>
								<span class="project-status-badge" :style="getProjectStatusBadgeStyle(project)">
									{{ getProjectStatus(project) }}
								</span>
							</div>
							<div v-if="project.description" class="project-description">
								{{ project.description }}
							</div>
						</div>
						<UIcon
							v-if="isSelected"
							name="i-lucide-check-circle"
							class="size-4 project-check-icon"
						/>
					</div>
				</div>
			</template>
			<template #empty-state>
				<UIcon name="i-lucide-folder" class="w-8 h-8 text-muted-foreground/30" />
				<p class="text-sm text-muted-foreground">
					No projects available
				</p>
				<p class="text-xs text-muted-foreground/60">
					Create a new project below
				</p>
			</template>
		</RecordSelector>

		</NodePanel>

		<!-- Project Status Display (Project Selected) -->
		<NodePanel
			v-else
			panel-class="project-status-display"
			:scrollbar-color="scrollbarColor"
		>
		<ProjectDetails
			ref="projectDetailsRef"
			:project="selectedProjectData"
			:theme-color="themeColor"
			:show-install-button="hasEnvironmentSetup"
			:is-install-ready="isInstallReady"
			@change-project="changeProjectSelection"
			@user-click="handleUserClick"
			@add-task="handleAddTask"
			@task-click="handleTaskClick"
			@integration-click="handleIntegrationClick"
			@integration-created="handleIntegrationCreated"
			@open-user-orbit="handleOpenUserOrbit"
			@task-user-assigned="handleTaskUserAssigned"
			@task-user-unassigned="handleTaskUserUnassigned"
			@setup-project="handleSetupProject"
			@install-project="handleInstallProject"
			@open-ide="handleOpenIde"
			@open-project-in-ide="handleOpenProjectInIde"
			@ide-disconnected="handleIdeDisconnected"
			@ide-connected="handleIdeConnected"
		/>
		</NodePanel>
	</BaseNodeTemplate>
</template>

<script lang="ts" setup>
	import BaseNodeTemplate from "./templates/BaseNodeTemplate.vue";
	import ProjectDetails from "@canvas/nodes/shared/ProjectDetails.vue";
	import ProjectForm from "@canvas/nodes/shared/ProjectForm.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import RecordSelector from "@canvas/shared/RecordSelector.vue";
	import { buttClient } from "@utils/buttClient";
	import { computed, onMounted, ref, watch } from "vue";
	import { useInjectCanvasState } from "@canvas/composables/useCanvasState";
	import { useTauriShellCommand } from "#imports";

	interface Props {
		customNodeProps: any
		updateNodeData: (nodeId: string, key: string, value: any) => void
		organisationId?: string
		createChildProjectNode?: (parentNodeId: string, projectData: any) => void
		projectSelected?: (projectData: any, nodeId: string) => void
		createChildUserNode?: (parentNodeId: string, userData: any) => void
		createChildTaskNode?: (parentNodeId: string, taskData: any) => void
		createChildIntegrationDetailNode?: (parentNodeId: string, integrationData: any) => void
		createChildOrbitNode?: (parentNodeId: string, orbitData: any) => void
		createChildSetupProjectNode?: (parentNodeId: string, projectData: any) => void
		createChildProjectToolsNode?: (parentNodeId: string, projectData: any) => void
		createChildProjectEnvironmentNode?: (parentNodeId: string, envData: any) => void
	}

	const props = withDefaults(defineProps<Props>(), {
		organisationId: "",
		createChildProjectNode: undefined,
		projectSelected: undefined,
		createChildUserNode: undefined,
		createChildTaskNode: undefined,
		createChildIntegrationDetailNode: undefined,
		createChildOrbitNode: undefined,
		createChildSetupProjectNode: undefined,
		createChildProjectToolsNode: undefined,
		createChildProjectEnvironmentNode: undefined
	});

	const emit = defineEmits<{
		closeNode: [nodeId: string]
	}>();

	// Inject canvas state
	const canvasState = useInjectCanvasState();

	// Project selection state
	const selectedProjectId = ref<string | null>(null);
	const availableProjects = ref<any[]>([]);
	const isLoadingProjects = ref(false);
	const isCreating = ref(false);
const showCreateForm = ref(false);

	// Check if project has saved environment setup
	const hasEnvironmentSetup = computed(() => {
		const result = !!props.customNodeProps.data?.environmentSetupSaved;
		return result;
	});

	// Check if install is ready (project saved to API)
	const isInstallReady = computed(() => {
		const result = !!props.customNodeProps.data?.environmentSetupSavedToAPI;
		return result;
	});

	const selectedProjectData = computed(() => {
		if (!props.customNodeProps.data?.selectedProjectId) return null;

		console.log("🔍 ProjectNode: Computing selectedProjectData");
		console.log("  Custom node props data:", props.customNodeProps.data);
		console.log("  Tasks in data:", props.customNodeProps.data.tasks);
		console.log("  Tasks length:", props.customNodeProps.data.tasks?.length || 0);

		const baseProject = availableProjects.value.find((p) => p.id === props.customNodeProps.data.selectedProjectId) || null;
		// Merge base project data with node data (which includes tasks and assignedUsers)
		if (baseProject) {
			const projectData = {
				...baseProject,
				tasks: props.customNodeProps.data.tasks || [],
				assignedUsers: props.customNodeProps.data.assignedUsers || [],
				connectedIDEs: props.customNodeProps.data.connectedIDEs || [],
				description: props.customNodeProps.data.description || baseProject.description,
				status: props.customNodeProps.data.status || baseProject.status
			};
			console.log("✅ Returning merged project data with", projectData.tasks?.length || 0, "tasks");
			return projectData;
		}

		// If project not in availableProjects (shouldn't happen), return from node data
		const projectData = {
			id: props.customNodeProps.data.selectedProjectId,
			name: props.customNodeProps.data.projectName,
			description: props.customNodeProps.data.description,
			status: props.customNodeProps.data.status,
			tasks: props.customNodeProps.data.tasks || [],
			assignedUsers: props.customNodeProps.data.assignedUsers || [],
			connectedIDEs: props.customNodeProps.data.connectedIDEs || []
		};
		console.log("✅ Returning node data with", projectData.tasks?.length || 0, "tasks");
		return projectData;
	});

	// Helper function to convert hex to RGB
	const hexToRgb = (hex: string): string => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return "59, 130, 246"; // Default blue RGB
		const r = Number.parseInt(result[1] || "3b", 16);
		const g = Number.parseInt(result[2] || "82", 16);
		const b = Number.parseInt(result[3] || "f6", 16);
		return `${r}, ${g}, ${b}`;
	};

	// Theme colors based on status
	const statusColors: Record<string, string> = {
		planning: "#f59e0b", // Amber
		active: "#10b981", // Green
		"on-hold": "#f59e0b", // Amber
		completed: "#3b82f6", // Blue
		archived: "#6b7280" // Gray
	};

	// Get status color for a project
	const getProjectStatusColor = (project: any) => {
		const status = (project.status || "planning").toLowerCase();
		return statusColors[status] || statusColors.planning;
	};

	// Default theme color
	const themeColor = computed(() => {
		if (selectedProjectData.value) {
			return getProjectStatusColor(selectedProjectData.value);
		}
		return "#3b82f6"; // Blue default
	});

	const activeColorRGB = computed(() => {
		const color = themeColor.value || "#3b82f6";
		const hex = color.replace("#", "");
		const r = Number.parseInt(hex.substring(0, 2), 16);
		const g = Number.parseInt(hex.substring(2, 4), 16);
		const b = Number.parseInt(hex.substring(4, 6), 16);
		return `${r}, ${g}, ${b}`;
	});

	const scrollbarColor = computed(() => {
		if (themeColor.value) {
			// Convert hex to hsl for theme color
			const hex = themeColor.value.replace('#', '');
			const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
			const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
			const b = Number.parseInt(hex.substring(4, 6), 16) / 255;
			const max = Math.max(r, g, b);
			const min = Math.min(r, g, b);
			let h = 0;
			let s = 0;
			const l = (max + min) / 2;
			if (max !== min) {
				const d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
					case g: h = ((b - r) / d + 2) / 6; break;
					case b: h = ((r - g) / d + 4) / 6; break;
				}
			}
			return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}% / 0.4)`;
		}
		return 'hsl(var(--primary) / 0.4)';
	});

	// Border color for BaseNodeTemplate - use theme primary if no themeColor
	const borderColor = computed(() => {
		if (themeColor.value) {
			return themeColor.value;
		}
		return 'hsl(var(--primary))';
	});


	// Fetch organization projects
	const fetchOrganizationProjects = async () => {
		if (!props.organisationId) {
			console.warn("⚠️ ProjectNode: No organisation ID provided");
			return;
		}

		isLoadingProjects.value = true;
		try {
			console.log("🔧 ProjectNode: Fetching projects for organization:", props.organisationId);

			const allProjects = await buttClient.findAllProject();
			const filteredProjects = Array.isArray(allProjects)
				? allProjects.filter((project) => String(project.organisationId) === String(props.organisationId))
				: [];

			availableProjects.value = filteredProjects;

			console.log(`✅ ProjectNode: Loaded ${availableProjects.value.length} projects`);
		} catch (err: any) {
			console.error("❌ ProjectNode: Error fetching projects:", err);
		} finally {
			isLoadingProjects.value = false;
		}
	};

	// Project display helpers
	const getProjectDisplayName = (project: any) => {
		return project.name || "Unnamed Project";
	};

	const getProjectStatus = (project: any) => {
		return (project.status || "planning").replace("-", " ").toUpperCase();
	};

	const getProjectItemStyle = (project: any) => {
		const color = getProjectStatusColor(project) || "#3b82f6";
		const rgb = hexToRgb(color);
		return {
			borderColor: `rgba(${rgb}, 0.2)`,
			backgroundColor: `rgba(${rgb}, 0.05)`
		};
	};

	const getProjectIconStyle = (project: any) => {
		const color = getProjectStatusColor(project) || "#3b82f6";
		const rgb = hexToRgb(color);
		return {
			backgroundColor: `rgba(${rgb}, 0.2)`,
			borderColor: `rgba(${rgb}, 0.4)`,
			color
		};
	};

	const getProjectStatusBadgeStyle = (project: any) => {
		const color = getProjectStatusColor(project) || "#3b82f6";
		const rgb = hexToRgb(color);
		return {
			backgroundColor: `rgba(${rgb}, 0.2)`,
			borderColor: `rgba(${rgb}, 0.3)`,
			color
		};
	};

	// Select a project
	const selectProject = (project: any) => {
		selectedProjectId.value = project.id;
		console.log("📁 Selected project:", getProjectDisplayName(project));
	};

	// Attach selected project to node
	const attachSelectedProject = async (selectedProject: any) => {
		if (!selectedProject) return;

		console.log("═══════════════════════════════════════════");
		console.log("📁 ATTACHING SELECTED PROJECT TO NODE");
		console.log("  Selected project:", selectedProject);
		console.log("  Project ID:", selectedProject.id);
		console.log("  Project Name:", getProjectDisplayName(selectedProject));
		console.log("  Project Status:", getProjectStatus(selectedProject));
		console.log("═══════════════════════════════════════════");

		// Update node data IMMEDIATELY to show the details view
		props.updateNodeData(props.customNodeProps.id, "selectedProjectId", selectedProject.id);
		props.updateNodeData(props.customNodeProps.id, "projectName", getProjectDisplayName(selectedProject));
		props.updateNodeData(props.customNodeProps.id, "description", selectedProject.description);
		props.updateNodeData(props.customNodeProps.id, "status", selectedProject.status || "planning");
		props.updateNodeData(props.customNodeProps.id, "configured", true);

		// Initialize with empty arrays
		props.updateNodeData(props.customNodeProps.id, "tasks", []);
		props.updateNodeData(props.customNodeProps.id, "assignedUsers", []);

		// Fetch project's tasks in the background using the correct API method
		let projectTasks: any[] = [];
		try {
			console.log("📋 Fetching tasks for project:", selectedProject.id);
			const tasksResult = await buttClient.getTasksByProjectId(selectedProject.id);
			projectTasks = Array.isArray(tasksResult) ? tasksResult : [];
			console.log(`✅ Found ${projectTasks.length} tasks for project`);
			console.log("📋 Task details:", projectTasks.map((t: any) => ({
				id: t.id,
				name: t.name,
				status: t.jiraStatus || t.status
			})));
			// Update tasks
			props.updateNodeData(props.customNodeProps.id, "tasks", projectTasks);
		} catch (err) {
			console.error("❌ Error fetching project tasks:", err);
			props.updateNodeData(props.customNodeProps.id, "tasks", []);
		}

		// Fetch project's users (from organization members) in the background
		const projectUsers: any[] = [];
		try {
			if (props.organisationId) {
				console.log("👥 Fetching users for project from organization:", props.organisationId);
				const org = await buttClient.findByIdOrganisation(props.organisationId);

				// Determine who the organization owner is (PROVEN METHOD from OrganizationDashboardPanel)
				const orgOwnerEmail = (org as any)?.creator || (org as any)?.createdBy || (org as any)?.ownerEmail;
				const orgOwnerId = (org as any)?.creatorId || (org as any)?.ownerId;
				console.log("👑 Organization owner:", { email: orgOwnerEmail, id: orgOwnerId });

				const memberIds = org?.owners || [];

				// Get user details for each member
				if (Array.isArray(memberIds)) {
					for (const id of memberIds) {
						try {
							const user = await (buttClient as any).getUserUser?.(id) || {
								id,
								email: `user-${id}@example.com`,
								name: `User ${id}`
							};

							// Determine role: Owner if matches org creator, otherwise Member (PROVEN METHOD)
							const isOwner = (orgOwnerEmail && user.email === orgOwnerEmail)
								|| (orgOwnerId && id === orgOwnerId)
								|| (memberIds.length === 1);

							console.log(`  User ${user.email}: isOwner=${isOwner}`);

							projectUsers.push({
								id,
								email: user.email,
								name: user.name,
								role: isOwner ? "owner" : "member",
								isOwner,
								isAdmin: isOwner
							});
						} catch (userError) {
							console.warn("⚠️ Failed to fetch user:", id, userError);
						}
					}
				}
				console.log(`✅ Found ${projectUsers.length} users in organization (including owner)`);
				// Update users
				props.updateNodeData(props.customNodeProps.id, "assignedUsers", projectUsers);
				props.updateNodeData(props.customNodeProps.id, "organizationOwnerEmail", orgOwnerEmail);
				props.updateNodeData(props.customNodeProps.id, "organizationOwnerId", orgOwnerId);
			}
		} catch (err) {
			console.error("❌ Error fetching project users:", err);
		}

		console.log("✅ Project attached successfully!");
		console.log("  - Tasks:", projectTasks.length);
		console.log("  - Users:", projectUsers.length);
		console.log("═══════════════════════════════════════════");

		if (props.projectSelected) {
			try {
				props.projectSelected(selectedProject, props.customNodeProps.id);
			} catch (error) {
				console.error("❌ Failed to notify project selection handler:", error);
			}
		}
	};

	// Create project from node data
	const createProjectFromNode = async () => {
		isCreating.value = true;
		try {
			console.log("═══════════════════════════════════════════");
			console.log("🔧 CREATING NEW PROJECT FROM NODE DATA");
			console.log("  Node data:", props.customNodeProps.data);
			console.log("  Organisation ID:", props.organisationId);
			console.log("═══════════════════════════════════════════");

			// Get organization details to get the butt (PROVEN METHOD from ProjectsPost)
			const organizations = await buttClient.findAllOrganisation();
			const organization = organizations.find((org: any) => org.id === props.organisationId);

			if (!organization || !(organization as any).butt) {
				throw new Error("Organization butt not found");
			}

			console.log("✅ Organization found:", organization.name);

			// Create project payload (PROVEN METHOD from ProjectsPost)
			const payload = {
				butt: (organization as any).butt,
				name: props.customNodeProps.data?.projectName || "New Project",
				organisationId: props.organisationId,
				description: props.customNodeProps.data?.projectDescription || null,
				deletedAt: null
			};

			console.log("📤 Creating project with payload:", payload);

			// Create the project via API
			const createdProject = await buttClient.createProject(payload);
			console.log("✅ Project created successfully:", createdProject);

			// Update the available projects list
			availableProjects.value.push(createdProject);

		// Attach the newly created project (this will fetch users)
		await attachSelectedProject(createdProject);

		showCreateForm.value = false;

		console.log("✅ Project created and attached successfully!");
		console.log("═══════════════════════════════════════════");
		} catch (error) {
			console.error("❌ Failed to create project in node:", error);
		} finally {
			isCreating.value = false;
		}
	};

	// Change project selection (allows user to select a different project)
	const changeProjectSelection = () => {
		console.log("🔄 Changing project selection - clearing selectedProjectId");
		props.updateNodeData(props.customNodeProps.id, "selectedProjectId", null);
	};

	// Handle user click to create UserNode (or AdminUserNode for owners)
	const handleUserClick = async (user: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("👤 USER CLICKED IN PROJECT NODE");
		console.log("  User:", user);
		console.log("  User Role:", user.role);
		console.log("  Is Owner:", user.isOwner);
		console.log("  Project Node ID:", props.customNodeProps.id);
		console.log("═══════════════════════════════════════════");

		if (props.createChildUserNode) {
			console.log("👶 Creating child user node from project node");

			// Ensure we pass organization info and all projects for admin users
			const userDataToPass = {
				...user,
				organizationId: props.organisationId,
				organizationOwnerEmail: props.customNodeProps.data?.organizationOwnerEmail,
				organizationOwnerId: props.customNodeProps.data?.organizationOwnerId
			};

			// If user is owner/admin, fetch all org projects
			if (user.isOwner || user.isAdmin) {
				try {
					const allProjects = await buttClient.findAllProject();
					const orgProjects = allProjects.filter((p: any) => p.organisationId === props.organisationId);
					userDataToPass.allOrganizationProjects = orgProjects;
					console.log("👑 Admin user - passing", orgProjects.length, "organization projects");
				} catch (error) {
					console.error("❌ Failed to fetch org projects for admin:", error);
				}
			}

			props.createChildUserNode(props.customNodeProps.id, userDataToPass);
		} else {
			console.warn("⚠️ No createChildUserNode handler provided");
		}
	};

	// Handle add task click to create TaskNode
	const handleAddTask = () => {
		console.log("═══════════════════════════════════════════");
		console.log("📋 ADD TASK CLICKED IN PROJECT NODE");
		console.log("  Project Node ID:", props.customNodeProps.id);
		console.log("  Project ID:", props.customNodeProps.data?.selectedProjectId);
		console.log("═══════════════════════════════════════════");

		if (props.createChildTaskNode) {
			console.log("👶 Creating child task node from project node");
			// Pass project context to the task node
			const projectContext = {
				projectId: props.customNodeProps.data?.selectedProjectId,
				projectName: props.customNodeProps.data?.projectName,
				organisationId: props.organisationId
			};
			props.createChildTaskNode(props.customNodeProps.id, projectContext);
		} else {
			console.warn("⚠️ No createChildTaskNode handler provided");
		}
	};

	const handleTaskClick = (task: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("📋 TASK CLICKED IN PROJECT NODE");
		console.log("  Task:", task);
		console.log("  Project Node ID:", props.customNodeProps.id);
		console.log("═══════════════════════════════════════════");

		if (props.createChildTaskNode) {
			console.log("👶 Creating child task node for existing task");
			// Pass the existing task data to pre-populate the task node
			const taskContext = {
				projectId: props.customNodeProps.data?.selectedProjectId,
				projectName: props.customNodeProps.data?.projectName,
				organisationId: props.organisationId,
				selectedTaskId: task.id,
				taskName: task.name || task.title,
				description: task.description,
				status: task.jiraStatus || task.status,
				priority: task.priority,
				configured: true // Mark as configured so it shows task details
			};
			props.createChildTaskNode(props.customNodeProps.id, taskContext);
		} else {
			console.warn("⚠️ No createChildTaskNode handler provided");
		}
	};

	const handleIntegrationClick = (integration: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔌 INTEGRATION CLICKED IN PROJECT NODE");
		console.log("  Integration:", integration);
		console.log("  Project Node ID:", props.customNodeProps.id);
		console.log("═══════════════════════════════════════════");

		if (props.createChildIntegrationDetailNode) {
			console.log("👶 Creating child integration detail node");
			props.createChildIntegrationDetailNode(props.customNodeProps.id, integration);
		} else {
			console.warn("⚠️ No createChildIntegrationDetailNode handler provided");
		}
	};

	// Reference to ProjectDetails to call its methods
	const projectDetailsRef = ref<any>(null);

	const handleIntegrationCreated = (integration: any) => {
		console.log("🔌 Integration created in project:", integration);
		
		// Trigger refresh in ProjectDetails if it has a refresh method
		if (projectDetailsRef.value?.refreshIntegrations) {
			console.log("🔄 Refreshing ProjectDetails integrations...");
			projectDetailsRef.value.refreshIntegrations();
		}
	};

	// Handle close button click
	const handleClose = () => {
		emit("closeNode", props.customNodeProps.id);
	};

	// Refresh project data to update UI
	const refreshProjectData = async () => {
		if (selectedProjectId.value) {
			// Refetch the project data
			const projects = await buttClient.findAllProject();
			const selectedProject = projects.find((p: any) => p.id === selectedProjectId.value);

			if (selectedProject) {
				availableProjects.value = projects.filter((p: any) => p.organisationId === props.organisationId);
				await attachSelectedProject(selectedProject);
			}
		}
	};

	// Handle opening user orbit (shows user at center with their assigned tasks)
	const handleOpenUserOrbit = async (user: any) => {
		console.log("🌀 Opening user orbit for:", user);

		if (!props.createChildOrbitNode) {
			console.warn("⚠️ No createChildOrbitNode handler provided");
			return;
		}

		try {
			// Fetch all tasks for the project
			const allTasks = selectedProjectData.value?.tasks || [];

			// Filter tasks assigned to this user
			const userTasks = allTasks.filter((task: any) => {
				const desc = task.description || "";
				return desc.includes(`[ASSIGNED:${user.id}|`) || desc.includes(`[ASSIGNED:${user.id}]`);
			});

			console.log(`📋 Found ${userTasks.length} tasks assigned to ${user.name}`);

			const orbitData = {
				centerType: "user",
				userData: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role
				},
				tasks: userTasks,
				projectId: selectedProjectData.value?.id,
				organisationId: props.organisationId
			};

			props.createChildOrbitNode(props.customNodeProps.id, orbitData);
		} catch (error) {
			console.error("❌ Failed to create user orbit:", error);
		}
	};

	// Handle task user assignment
	const handleTaskUserAssigned = async (taskId: string, userId: string) => {
		console.log("👤 Assigning user to task:", { taskId, userId });

		try {
			const task = selectedProjectData.value?.tasks?.find((t: any) => t.id === taskId);
			const user = selectedProjectData.value?.assignedUsers?.find((u: any) => u.id === userId);

			if (!task || !user) {
				console.error("❌ Task or user not found");
				return;
			}

			// Get current description and remove existing assignment for this user
			let desc = task.description || "";
			desc = desc.replace(new RegExp(`\\[ASSIGNED:${userId}\\|[^\\]]+\\]`, "g"), "");

			// Add new assignment metadata
			const assignmentMetadata = `[ASSIGNED:${userId}|${user.name}]`;
			const newDescription = `${assignmentMetadata} ${desc}`.trim();

			// Update task via API
			await buttClient.updateTask(task.id, {
				description: newDescription
			});

			// Refresh project data
			await refreshProjectData();

			console.log("✅ User assigned to task successfully");
		} catch (error) {
			console.error("❌ Failed to assign user to task:", error);
		}
	};

	// Handle task user unassignment
	const handleTaskUserUnassigned = async (taskId: string, userId: string) => {
		console.log("👤 Unassigning user from task:", { taskId, userId });

		try {
			const task = selectedProjectData.value?.tasks?.find((t: any) => t.id === taskId);

			if (!task) {
				console.error("❌ Task not found");
				return;
			}

			// Remove assignment metadata
			let desc = task.description || "";
			desc = desc.replace(new RegExp(`\\[ASSIGNED:${userId}\\|[^\\]]+\\]`, "g"), "");
			desc = desc.replace(new RegExp(`\\[ASSIGNED:${userId}\\]`, "g"), "");

			// Update task via API
			await buttClient.updateTask(task.id, {
				description: desc.trim()
			});

			// Refresh project data
			await refreshProjectData();

			console.log("✅ User unassigned from task successfully");
		} catch (error) {
			console.error("❌ Failed to unassign user from task:", error);
		}
	};

	// Handle setup project
	const handleSetupProject = () => {
		console.log("⚙️ Setup project clicked");
		
		// Try to get primary IDE from canvas state first, then from node data
		let primaryIde = canvasState?.getPrimaryIde() || null;

		if (!primaryIde) {
			const connectedIDEs = props.customNodeProps.data?.connectedIDEs || [];
			primaryIde = connectedIDEs.length > 0 ? connectedIDEs[0] : null;
		}

		console.log("📤 Primary IDE for setup:", primaryIde);

		// Set project context in canvas state
		if (canvasState && selectedProjectData.value) {
			canvasState.setProjectContext(
				selectedProjectData.value.id,
				selectedProjectData.value.name,
				props.organisationId || ""
			);
		}

		const setupContext = {
			projectId: selectedProjectData.value?.id,
			projectName: selectedProjectData.value?.name,
			organisationId: props.organisationId,
			connectedIde: primaryIde,
			connectedIDEs: props.customNodeProps.data?.connectedIDEs || []
		};

		if (props.createChildProjectToolsNode) {
			props.createChildProjectToolsNode(props.customNodeProps.id, setupContext);
			return;
		}

		if (props.createChildSetupProjectNode) {
			props.createChildSetupProjectNode(props.customNodeProps.id, setupContext);
		} else {
			console.warn("⚠️ No createChildSetupProjectNode handler provided");
		}
	};

	// Handle install project (streamlined flow)
	const handleInstallProject = () => {
		console.log("═══════════════════════════════════════════");
		console.log("🚀 INSTALL PROJECT CLICKED (Streamlined Flow)");
		console.log("  Project ID:", selectedProjectData.value?.id);
		console.log("  Project Name:", selectedProjectData.value?.name);
		console.log("═══════════════════════════════════════════");

		if (!props.createChildProjectEnvironmentNode) {
			console.warn("⚠️ No createChildProjectEnvironmentNode handler provided");
			return;
		}

		// Get stored environment setup data
		const setupData = props.customNodeProps.data?.savedEnvironmentSetup;
		
		if (!setupData) {
			console.warn("⚠️ No saved environment setup found");
			return;
		}

		// Set project context in canvas state
		if (canvasState && selectedProjectData.value) {
			canvasState.setProjectContext(
				selectedProjectData.value.id,
				selectedProjectData.value.name,
				props.organisationId || ""
			);

			// Set IDE if available
			if (setupData.connectedIde) {
				canvasState.setPrimaryIde(setupData.connectedIde);
			}

			// Set repositories if available
			if (setupData.repositories) {
				setupData.repositories.forEach((repo: any) => canvasState.addRepository(repo));
			}
		}

		const environmentData = {
			projectId: selectedProjectData.value?.id,
			projectName: selectedProjectData.value?.name,
			connectedIde: setupData.connectedIde,
			repositories: setupData.repositories || [],
			autoInstall: true // Flag to auto-start installation
		};

		console.log("📤 Spawning ProjectEnvironmentNode with auto-install:", environmentData);
		props.createChildProjectEnvironmentNode(props.customNodeProps.id, environmentData);
	};

	// IDE handlers
	const handleOpenIde = async (ide: any) => {
		const ideCommand = ide.command || ide.ideCommand || ide.openCommand;
		if (!ideCommand) {
			console.error("❌ No command for IDE:", ide);
			console.error("  Checked properties: command, ideCommand, openCommand");
			return;
		}
		
		console.log(`✅ Found IDE command: ${ideCommand}`);

		try {
			console.log(`🚀 Opening ${ide.name} with command:`, ideCommand);
			
			// Try opener plugin first (more reliable for opening applications) - PROVEN METHOD
			try {
				const { openPath } = await import("@tauri-apps/plugin-opener");

				// For VS Code, try to open with the executable path
				if (ide.name === "VS Code") {
					const vscodePaths = [
						"C:/Users/%USERNAME%/AppData/Local/Programs/Microsoft VS Code/Code.exe",
						"C:/Program Files/Microsoft VS Code/Code.exe",
						"C:/Program Files (x86)/Microsoft VS Code/Code.exe"
					];

					for (const path of vscodePaths) {
						try {
							const usernameResult = await useTauriShellCommand.create("exec-pwsh", ["-Command", "$env:USERNAME"]).execute();
							const expandedPath = path.replace("%USERNAME%", usernameResult.stdout.trim());
							await openPath(expandedPath);
							console.log(`✅ ${ide.name} opened successfully`);
							return;
						} catch (pathError) {
							console.warn(`  Failed to open VS Code at ${path}:`, pathError);
							continue;
						}
					}
				}

				// For Cursor, try common paths
				if (ide.name === "Cursor") {
					const cursorPaths = [
						"C:/Users/%USERNAME%/AppData/Local/Programs/Cursor/Cursor.exe",
						"C:/Program Files/Cursor/Cursor.exe",
						"C:/Program Files (x86)/Cursor/Cursor.exe"
					];

					for (const path of cursorPaths) {
						try {
							const usernameResult = await useTauriShellCommand.create("exec-pwsh", ["-Command", "$env:USERNAME"]).execute();
							const expandedPath = path.replace("%USERNAME%", usernameResult.stdout.trim());
							await openPath(expandedPath);
							console.log(`✅ ${ide.name} opened successfully`);
							return;
						} catch (pathError) {
							console.warn(`  Failed to open Cursor at ${path}:`, pathError);
							continue;
						}
					}
				}

				// Fallback: try to open with the command
				await openPath(ideCommand);
				console.log(`✅ ${ide.name} opened successfully`);
			} catch (openerError) {
				console.warn("Opener plugin failed, trying shell command:", openerError);
				// Fallback to shell command
				await useTauriShellCommand.create("exec-pwsh", ["-Command", ideCommand]).execute();
				console.log(`✅ ${ide.name} opened successfully (via shell)`);
			}
		} catch (error) {
			console.error(`❌ Failed to open ${ide.name}:`, error);
		}
	};

	const handleOpenProjectInIde = async (ide: any) => {
		console.log("📂 Opening project in IDE:", ide);
		const projectPath = selectedProjectData.value?.path || selectedProjectData.value?.projectPath;
		
		if (!projectPath) {
			console.warn("⚠️ No project path available");
			return;
		}

		try {
			const command = `${ide.command || ide.ideCommand} "${projectPath}"`;
			const tauriCmd = await useTauriShellCommand.create("exec-pwsh", ["-Command", command]);
			await tauriCmd.execute();
			console.log("✅ Project opened in IDE");
		} catch (error) {
			console.error("❌ Failed to open project in IDE:", error);
		}
	};

	const handleIdeDisconnected = (ideId: string) => {
		console.log("🔗 Disconnecting IDE:", ideId);
		
		// Remove IDE from connected IDEs list
		const connectedIDEs = props.customNodeProps.data.connectedIDEs || [];
		const updatedIDEs = connectedIDEs.filter((ide: any) => ide.id !== ideId);
		
		props.updateNodeData(props.customNodeProps.id, "connectedIDEs", updatedIDEs);
		console.log("✅ IDE disconnected successfully");
	};

	const handleIdeConnected = (ideConnection: any) => {
		console.log("═══════════════════════════════════════════");
		console.log("🔗 CONNECTING IDE TO PROJECT");
		console.log("  IDE Name:", ideConnection.name);
		console.log("  IDE Command:", ideConnection.command);
		console.log("  Project Node ID:", props.customNodeProps.id);
		console.log("═══════════════════════════════════════════");
		
		// Get current connected IDEs
		const connectedIDEs = props.customNodeProps.data.connectedIDEs || [];
		
		// Check if already connected
		if (connectedIDEs.some((connected: any) => connected.name === ideConnection.name)) {
			console.warn("⚠️ IDE already connected:", ideConnection.name);
			return;
		}
		
		// Add to connected IDEs list
		const updatedIDEs = [...connectedIDEs, ideConnection];
		props.updateNodeData(props.customNodeProps.id, "connectedIDEs", updatedIDEs);
		
		// ALSO add to canvas state for global access
		if (canvasState) {
			canvasState.addConnectedIde(ideConnection);
			console.log("✅ IDE added to canvas state");
		}
		
		console.log("✅ IDE connected to project successfully");
		console.log("  Total connected IDEs:", updatedIDEs.length);
		console.log("═══════════════════════════════════════════");
	};

	// Watch for organisationId changes
	watch(() => props.organisationId, (newOrgId) => {
		if (newOrgId) {
			fetchOrganizationProjects();
		}
	});

	// Debug watch for button states (only when project is selected)
	watch([hasEnvironmentSetup, isInstallReady, selectedProjectData], ([setup, ready, project]) => {
		if (project) {
			console.log("═══════════════════════════════════════════");
			console.log("🔘 PROJECT NODE BUTTON STATE");
			console.log("  Node ID:", props.customNodeProps?.id);
			console.log("  Project:", project?.name);
			console.log("  environmentSetupSaved:", props.customNodeProps?.data?.environmentSetupSaved);
			console.log("  environmentSetupSavedToAPI:", props.customNodeProps?.data?.environmentSetupSavedToAPI);
			console.log("  hasEnvironmentSetup:", setup);
			console.log("  isInstallReady:", ready);
			console.log("  → Will pass showInstallButton:", setup);
			console.log("  → Will pass isInstallReady:", ready);
			console.log("═══════════════════════════════════════════");
		}
	}, { immediate: true });

	// Load projects on mount
	onMounted(() => {
		console.log("🎬 ProjectNode mounted with props:", {
			organisationId: props.organisationId,
			nodeId: props.customNodeProps?.id
		});
		if (props.organisationId) {
			fetchOrganizationProjects();
		}
	});
</script>

<style scoped>
/* Project node specific styles */
.project-node :deep(.base-node-template) {
	/* Project node specific styles */
}

.project-record-selector {
	margin-bottom: 1.5rem;
}

.create-project-button {
	width: 100%;
	margin-bottom: 1rem;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	border-radius: 0.75rem;
	background: linear-gradient(135deg, hsl(var(--primary) / 0.25) 0%, hsl(var(--primary) / 0.15) 100%);
	border: 1px solid hsl(var(--primary) / 0.35);
	color: hsl(var(--primary-foreground) / 0.92);
	font-weight: 600;
	font-size: 0.9rem;
	letter-spacing: 0.01em;
	transition: all 0.2s ease;
}

.create-project-button.active {
	background: linear-gradient(135deg, hsl(var(--card) / 0.65) 0%, hsl(var(--primary) / 0.4) 100%);
	border-color: hsl(var(--primary) / 0.6);
}

.create-project-button.active .size-4 {
	color: hsl(var(--primary-foreground) / 0.95);
}

.create-project-button:hover {
	background: linear-gradient(135deg, hsl(var(--primary) / 0.35) 0%, hsl(var(--primary) / 0.2) 100%);
	border-color: hsl(var(--primary) / 0.5);
	transform: translateY(-1px);
	box-shadow: 0 8px 20px hsl(var(--primary) / 0.25);
}

.create-project-button:active {
	transform: translateY(0);
	box-shadow: none;
}

.create-project-button .size-4 {
	color: hsl(var(--primary-foreground) / 0.9);
}

.create-project-section {
	padding: 1rem;
	border-radius: 0.75rem;
	background: linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.08) 100%);
	border: 1px solid hsl(var(--border) / 0.5);
	box-shadow: inset 0 1px 0 hsl(var(--foreground) / 0.05);
}

.create-project-header {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-bottom: 1rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: hsl(var(--foreground) / 0.85);
}

.create-project-header span {
	letter-spacing: 0.02em;
}


/* Project Record Item Styles */
.project-record-item {
	padding: 0.625rem 0.875rem;
	background: linear-gradient(135deg, hsl(var(--muted) / 0.1) 0%, hsl(var(--muted) / 0.05) 100%);
	border: 1px solid hsl(var(--border) / 0.4);
	border-left: 2px solid transparent;
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	text-align: left;
	width: 100%;
	position: relative;
	overflow: hidden;
}

.project-record-item::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.03), transparent);
	transition: left 0.5s ease;
}

.project-record-item:hover::before {
	left: 100%;
}

.project-record-item:hover {
	background: linear-gradient(135deg, hsl(var(--muted) / 0.15) 0%, hsl(var(--muted) / 0.1) 100%);
	border-color: hsl(var(--border) / 0.6);
	border-left-color: hsl(var(--primary) / 0.6);
	border-left-width: 2px;
	transform: translateX(2px);
}

.project-record-item:hover .project-icon {
	transform: scale(1.1) rotate(5deg);
	box-shadow: 0 0 12px hsl(var(--primary) / 0.3);
}

.project-record-item:hover .project-name {
	color: hsl(var(--foreground) / 0.95);
}

.project-record-item.selected {
	background: linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.04) 100%);
	border-color: hsl(var(--primary) / 0.3);
	border-left-color: hsl(var(--primary));
	border-left-width: 3px;
	box-shadow: inset 0 1px 0 hsl(var(--foreground) / 0.1);
}

.project-record-item.selected .project-icon {
	box-shadow: 0 0 16px hsl(var(--primary) / 0.4);
}

.project-record-header {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	position: relative;
}

.project-icon {
	width: 1.75rem;
	height: 1.75rem;
	min-width: 1.75rem;
	border-radius: 0.375rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1.5px solid;
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	margin-top: 0.125rem;
}

.project-info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.project-title-row {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	justify-content: space-between;
}

.project-name {
	font-size: 0.8125rem;
	font-weight: 600;
	color: hsl(var(--foreground) / 0.88);
	flex: 1;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	transition: color 0.2s ease;
	letter-spacing: 0.01em;
}

.project-description {
	font-size: 0.6875rem;
	color: hsl(var(--muted-foreground));
	line-height: 1.3;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
	margin-top: 0.125rem;
}

.project-status-badge {
	padding: 0.125rem 0.375rem;
	border-radius: 0.25rem;
	font-size: 0.5625rem;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	border: 1px solid;
	white-space: nowrap;
	flex-shrink: 0;
	backdrop-filter: blur(4px);
}

.project-check-icon {
	color: hsl(var(--success) / 0.9);
	flex-shrink: 0;
	margin-top: 0.125rem;
	filter: drop-shadow(0 0 4px hsl(var(--success) / 0.4));
}
</style>

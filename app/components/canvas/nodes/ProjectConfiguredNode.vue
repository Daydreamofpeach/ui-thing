<template>
	<BaseNodeTemplate
		:custom-node-props="customNodeProps"
		:update-node-data="updateNodeData"
		icon="i-lucide-folder-check"
		title="CONFIGURED PROJECT"
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
		:node-class="'project-configured-node'"
		@close="handleClose"
	>
		<!-- Project Status Display (Always Configured) -->
		<NodePanel
			panel-class="project-status-display"
			scrollbar-color="rgba(16, 185, 129, 0.4)"
		>
		<ProjectDetails
			ref="projectDetailsRef"
			:project="selectedProjectData"
			theme-color="#10b981"
			:show-install-button="true"
			:is-install-ready="true"
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
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import { buttClient } from "@utils/buttClient";
	import { computed, onMounted, ref } from "vue";
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

	// Theme color for configured project (green)
	const themeColor = "#10b981";
	const borderColor = "rgba(16, 185, 129, 0.5)";

	// Project data from node
	const availableProjects = ref<any[]>([]);
	const isLoadingProjects = ref(false);
	const projectDetailsRef = ref();

	const selectedProjectData = computed(() => {
		const data = props.customNodeProps?.data;
		if (!data?.selectedProjectId) return null;

		console.log("🔍 ProjectConfiguredNode: Computing selectedProjectData");
		console.log("  Custom node props data:", data);

		const baseProject = availableProjects.value.find((p) => p.id === data.selectedProjectId) || null;
		if (baseProject) {
			const projectData = {
				...baseProject,
				tasks: data.tasks || [],
				assignedUsers: data.assignedUsers || [],
				connectedIDEs: data.connectedIDEs || [],
				description: data.description || baseProject.description,
				status: "active" // Always active for configured nodes
			};
			console.log("✅ Returning configured project data with", projectData.tasks?.length || 0, "tasks");
			return projectData;
		}

		// Return from node data
		const projectData = {
			id: data.selectedProjectId,
			name: data.projectName,
			description: data.description,
			status: "active", // Always active
			tasks: data.tasks || [],
			assignedUsers: data.assignedUsers || [],
			connectedIDEs: data.connectedIDEs || []
		};
		console.log("✅ Returning configured node data with", projectData.tasks?.length || 0, "tasks");
		return projectData;
	});

	// Fetch organization projects
	const fetchOrganizationProjects = async () => {
		if (!props.organisationId) {
			console.warn("⚠️ ProjectConfiguredNode: No organisation ID provided");
			return;
		}

		isLoadingProjects.value = true;
		try {
			console.log("🔧 ProjectConfiguredNode: Fetching projects for organization:", props.organisationId);

			const allProjects = await buttClient.findAllProject();
			const filteredProjects = Array.isArray(allProjects)
				? allProjects.filter((project) => String(project.organisationId) === String(props.organisationId))
				: [];

			availableProjects.value = filteredProjects;

			console.log(`✅ ProjectConfiguredNode: Loaded ${availableProjects.value.length} projects`);
		} catch (err: any) {
			console.error("❌ ProjectConfiguredNode: Error fetching projects:", err);
		} finally {
			isLoadingProjects.value = false;
		}
	};

	// Handle close node
	const handleClose = () => {
		emit("closeNode", props.customNodeProps.id);
	};

	// Change project selection - transforms back to regular ProjectNode
	const changeProjectSelection = () => {
		console.log("🔄 Changing project selection - user wants to select a different project");
		props.updateNodeData(props.customNodeProps.id, "selectedProjectId", null);
		props.updateNodeData(props.customNodeProps.id, "configured", false);
		props.updateNodeData(props.customNodeProps.id, "projectName", null);
		props.updateNodeData(props.customNodeProps.id, "description", null);
		props.updateNodeData(props.customNodeProps.id, "status", "planning");
		props.updateNodeData(props.customNodeProps.id, "tasks", []);
		props.updateNodeData(props.customNodeProps.id, "assignedUsers", []);
		props.updateNodeData(props.customNodeProps.id, "connectedIDEs", []);

		if (props.projectSelected) {
			try {
				props.projectSelected(null, props.customNodeProps.id);
			} catch (error) {
				console.error("❌ Failed to notify project deselection handler:", error);
			}
		}
	};

	// Handle user click
	const handleUserClick = (user: any) => {
		console.log("👤 User clicked:", user);
		if (props.createChildUserNode) {
			props.createChildUserNode(props.customNodeProps.id, user);
		}
	};

	// Handle add task
	const handleAddTask = () => {
		console.log("➕ Add task clicked");
		if (props.createChildTaskNode) {
			const taskData = {
				projectId: selectedProjectData.value?.id,
				projectName: selectedProjectData.value?.name,
				organisationId: props.organisationId
			};
			props.createChildTaskNode(props.customNodeProps.id, taskData);
		}
	};

	// Handle task click
	const handleTaskClick = (task: any) => {
		console.log("📋 Task clicked:", task);
		if (props.createChildTaskNode) {
			props.createChildTaskNode(props.customNodeProps.id, task);
		}
	};

	// Handle integration click
	const handleIntegrationClick = (integration: any) => {
		console.log("🔌 Integration clicked:", integration);
		if (props.createChildIntegrationDetailNode) {
			props.createChildIntegrationDetailNode(props.customNodeProps.id, integration);
		}
	};

	// Handle integration created
	const handleIntegrationCreated = async (integration: any) => {
		console.log("🎉 Integration created:", integration);
		// Refresh project data if needed
	};

	// Handle open user orbit
	const handleOpenUserOrbit = (user: any) => {
		console.log("🌌 Open user orbit:", user);
		if (props.createChildOrbitNode) {
			const orbitData = {
				userId: user.id,
				userName: user.name || user.email,
				projectId: selectedProjectData.value?.id,
				organisationId: props.organisationId
			};
			props.createChildOrbitNode(props.customNodeProps.id, orbitData);
		}
	};

	// Handle task user assignment
	const handleTaskUserAssigned = async (taskId: string, userId: string) => {
		console.log("👤➕ User assigned to task:", { taskId, userId });
		// Update task in node data
		const tasks = props.customNodeProps.data?.tasks || [];
		const task = tasks.find((t: any) => t.id === taskId);
		if (task) {
			// Add assignment metadata
			const user = selectedProjectData.value?.assignedUsers?.find((u: any) => u.id === userId);
			if (user) {
				const assignmentTag = `[ASSIGNED:${user.id}|${user.name || user.email}]`;
				task.description = task.description ? `${task.description} ${assignmentTag}` : assignmentTag;
				props.updateNodeData(props.customNodeProps.id, "tasks", [...tasks]);
			}
		}
	};

	// Handle task user unassignment
	const handleTaskUserUnassigned = async (taskId: string, userId: string) => {
		console.log("👤➖ User unassigned from task:", { taskId, userId });
		// Update task in node data
		const tasks = props.customNodeProps.data?.tasks || [];
		const task = tasks.find((t: any) => t.id === taskId);
		if (task) {
			// Remove assignment metadata
			task.description = task.description?.replace(new RegExp(`\\[ASSIGNED:${userId}[^\\]]*\\]`, "g"), "").trim();
			props.updateNodeData(props.customNodeProps.id, "tasks", [...tasks]);
		}
	};

	// Handle setup project (shouldn't be needed for configured projects)
	const handleSetupProject = () => {
		console.log("⚙️ Setup project clicked - already configured!");

		// Try to get primary IDE from canvas state first, then from node data
		let primaryIde = canvasState?.getPrimaryIde() || null;

		if (!primaryIde) {
			const connectedIDEs = props.customNodeProps.data?.connectedIDEs || [];
			primaryIde = connectedIDEs.length > 0 ? connectedIDEs[0] : null;
		}

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
		}
	};

	// Handle install project
	const handleInstallProject = () => {
		console.log("═══════════════════════════════════════════");
		console.log("🚀 INSTALL PROJECT CLICKED");
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
			linkedTemplates: setupData.linkedTemplates || [],
			autoInstall: true // Auto-install mode
		};

		console.log("📤 Creating ProjectEnvironmentNode with data:", environmentData);
		props.createChildProjectEnvironmentNode(props.customNodeProps.id, environmentData);
	};

	// Handle IDE operations
	const handleOpenIde = async (ide: any) => {
		console.log("🚀 Opening IDE:", ide);
		const { useTauriShellCommand } = await import("#imports");
		
		try {
			if (ide.command || ide.openCommand) {
				const command = ide.command || ide.openCommand;
				console.log("  Executing command:", command);
				await useTauriShellCommand.create("exec-pwsh", ["-Command", command]).execute();
				console.log("✅ IDE opened successfully");
			}
		} catch (error) {
			console.error("❌ Failed to open IDE:", error);
		}
	};

	const handleOpenProjectInIde = async (ide: any) => {
		console.log("📂 Opening project in IDE:", ide);
		// Implementation for opening project in IDE
	};

	const handleIdeDisconnected = (ideId: string) => {
		console.log("🔗 IDE disconnected:", ideId);
		const connectedIDEs = props.customNodeProps.data?.connectedIDEs || [];
		const updatedIDEs = connectedIDEs.filter((i: any) => i.id !== ideId);
		props.updateNodeData(props.customNodeProps.id, "connectedIDEs", updatedIDEs);
	};

	const handleIdeConnected = (ide: any) => {
		console.log("🔗 IDE connected:", ide);
		const connectedIDEs = props.customNodeProps.data?.connectedIDEs || [];
		const updatedIDEs = [...connectedIDEs, ide];
		props.updateNodeData(props.customNodeProps.id, "connectedIDEs", updatedIDEs);
	};

	// Load projects on mount
	onMounted(() => {
		console.log("🎬 ProjectConfiguredNode mounted with props:", {
			organisationId: props.organisationId,
			nodeId: props.customNodeProps?.id,
			projectId: props.customNodeProps?.data?.selectedProjectId
		});
		if (props.organisationId) {
			fetchOrganizationProjects();
		}
	});
</script>

<style scoped>
/* Project Configured Node specific styles - GREEN theme */
.project-configured-node :deep(.base-node-template) {
	border-color: rgba(16, 185, 129, 0.5);
}
</style>



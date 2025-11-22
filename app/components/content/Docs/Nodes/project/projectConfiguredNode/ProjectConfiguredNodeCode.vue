<template>
  <div></div>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";

interface Props {
  node: {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    color?: string;
  };
}

const emit = defineEmits<{
  code: [code: string];
  documentation: [doc: string];
  files: [files: FileStructure[]];
}>();

interface FileStructure {
  title: string;
  icon?: string;
  openIcon?: string;
  path?: string;
  content?: string;
  children?: FileStructure[];
}

const props = defineProps<Props>();

onMounted(() => {
  const minimalDoc = "Configured project node displaying project details and management options after project setup is complete. Shows project status, integrations, tasks, and IDE connections.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
	<div class="project-configured-node-container node-container">
		<Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
		<Handle id="right" type="source" :position="Position.Right" class="connection-handle" />

		<div class="node-icon-wrapper" style="border-color: #10b981;">
			<UIcon name="i-lucide-folder-check" class="size-8" style="color: #10b981;" />
		</div>

		<NodeHeader
			title="CONFIGURED PROJECT"
			title-color="#10b981"
			theme-color="#10b981"
			:transparent-background="true"
			:show-edit-button="false"
			:show-close-button="true"
			close-button-label="Delete project node"
			@close="handleClose"
		/>

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
	</div>
</template>

<script setup lang="ts">
	import ProjectDetails from "@canvas/nodes/shared/ProjectDetails.vue";
	import NodeHeader from "@canvas/shared/NodeHeader.vue";
	import NodePanel from "@canvas/shared/NodePanel.vue";
	import { buttClient } from "@utils/buttClient";
	import { Handle, Position } from "@vue-flow/core";
	import { computed, onMounted, ref } from "vue";
	import { useInjectCanvasState } from "@canvas/composables/useCanvasState";

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

	const canvasState = useInjectCanvasState();
	const projectDetailsRef = ref();

	const selectedProjectId = computed(() => props.customNodeProps.data?.selectedProjectId);
	const selectedProjectData = computed(() => props.customNodeProps.data?.selectedProject);

	const handleClose = () => {
		emit("closeNode", props.customNodeProps.id);
	};

	// Project management handlers
	const changeProjectSelection = () => {
		// Handle project change
	};

	const handleUserClick = (user: any) => {
		if (props.createChildUserNode) {
			props.createChildUserNode(props.customNodeProps.id, user);
		}
	};

	const handleAddTask = () => {
		// Handle add task
	};

	const handleTaskClick = (task: any) => {
		if (props.createChildTaskNode) {
			props.createChildTaskNode(props.customNodeProps.id, task);
		}
	};

	const handleIntegrationClick = (integration: any) => {
		if (props.createChildIntegrationDetailNode) {
			props.createChildIntegrationDetailNode(props.customNodeProps.id, integration);
		}
	};

	const handleIntegrationCreated = (integration: any) => {
		// Handle integration created
	};

	const handleOpenUserOrbit = (user: any) => {
		if (props.createChildOrbitNode) {
			props.createChildOrbitNode(props.customNodeProps.id, { userId: user.id });
		}
	};

	const handleTaskUserAssigned = (task: any, user: any) => {
		// Handle task user assigned
	};

	const handleTaskUserUnassigned = (task: any, user: any) => {
		// Handle task user unassigned
	};

	const handleSetupProject = () => {
		if (props.createChildSetupProjectNode) {
			props.createChildSetupProjectNode(props.customNodeProps.id, {
				projectId: selectedProjectId.value
			});
		}
	};

	const handleInstallProject = () => {
		if (props.createChildProjectEnvironmentNode) {
			props.createChildProjectEnvironmentNode(props.customNodeProps.id, {
				projectId: selectedProjectId.value,
				autoInstall: true
			});
		}
	};

	const handleOpenIde = async (ide: any) => {
		// Handle open IDE
	};

	const handleOpenProjectInIde = async (ide: any) => {
		// Handle open project in IDE
	};

	const handleIdeDisconnected = (ideId: string) => {
		// Handle IDE disconnected
	};

	const handleIdeConnected = (ideConnection: any) => {
		// Handle IDE connected
	};

	onMounted(async () => {
		// Load project data if needed
	});
<\/script>

<style scoped>
.project-configured-node-container {
	/* Node container styles */
}
</style>`;

  const files: FileStructure[] = [
    {
      title: "ProjectConfiguredNode.vue",
      icon: "vscode-icons:file-type-vue",
      path: "components/canvas/nodes/ProjectConfiguredNode.vue",
      content: mainCode
    },
    {
      title: "ProjectDetails.vue",
      icon: "vscode-icons:file-type-vue",
      path: "components/canvas/nodes/shared/ProjectDetails.vue",
      content: "// See ProjectDetails component implementation"
    },
    {
      title: "NodeHeader.vue",
      icon: "vscode-icons:file-type-vue",
      path: "components/canvas/shared/NodeHeader.vue",
      content: "// See NodeHeader component implementation"
    },
    {
      title: "NodePanel.vue",
      icon: "vscode-icons:file-type-vue",
      path: "components/canvas/shared/NodePanel.vue",
      content: "// See NodePanel component implementation"
    }
  ];

  emit("code", mainCode);
  emit("files", files);
});
</script>


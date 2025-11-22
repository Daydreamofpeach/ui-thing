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
  const minimalDoc = "Project management node for selecting and managing projects in your organization.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div class="project-node-container node-container" :style="nodeContainerStyle">
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />

    <div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
      <UIcon name="i-lucide-folder-kanban" class="size-8" :style="{ color: themeColor }" />
    </div>

    <NodeHeader
      title="PROJECT MANAGEMENT"
      :title-color="themeColor"
      :theme-color="themeColor"
      :transparent-background="true"
      :show-edit-button="false"
      :show-close-button="true"
      close-button-label="Delete project node"
      @close="handleClose"
    />

    <NodePanel
      v-if="!customNodeProps.data?.selectedProjectId"
      panel-class="project-config-container"
      :scrollbar-color="scrollbarColor"
    >
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
        icon-class="text-blue-400"
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
            <ProjectForm
              mode="create"
              :project-data="{
                name: customNodeProps.data?.projectName,
                description: customNodeProps.data?.description
              }"
              :is-loading="isCreating"
              @update-field="(key: string, value: any) => updateNodeData(customNodeProps.id, \`project\${key.charAt(0).toUpperCase() + key.slice(1)}\`, value)"
              @submit="createProjectFromNode"
            />
          </div>
        </template>
      </RecordSelector>
    </NodePanel>

    <NodePanel
      v-else
      panel-class="project-status-display"
      :scrollbar-color="scrollbarColor"
    >
      <ProjectStatusDisplay
        :project="selectedProject"
        :theme-color="themeColor"
        @change-project="changeProjectSelection"
        @edit-project="editProjectFromNode"
      />
    </NodePanel>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import NodeHeader from "@canvas/shared/NodeHeader.vue";
import NodePanel from "@canvas/shared/NodePanel.vue";
import RecordSelector from "@canvas/shared/RecordSelector.vue";
import ProjectForm from "@canvas/forms/ProjectForm.vue";
import ProjectStatusDisplay from "@canvas/displays/ProjectStatusDisplay.vue";
import { computed, ref } from "vue";

interface Props {
  customNodeProps: any
  updateNodeData: (nodeId: string, key: string, value: any) => void
  organisationId: string
  availableProjects?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  availableProjects: () => []
});

const emit = defineEmits<{
  'close-node': [nodeId: string]
  'project-attached': [projectData: any, nodeId: string]
  'create-project': [projectData: any, nodeId: string]
}>();

const themeColor = "#3b82f6";
const scrollbarColor = "rgba(59, 130, 246, 0.4)";
const activeColorRGB = "59, 130, 246";

const selectedProjectId = ref<string | null>(props.customNodeProps?.data?.selectedProjectId || null);
const showCreateForm = ref(false);
const isLoadingProjects = computed(() => false);
const isCreating = ref(false);

const selectedProject = computed(() => {
  if (!selectedProjectId.value) return null;
  return props.availableProjects.find(p => p.id === selectedProjectId.value);
});

function selectProject(project: any) {
  selectedProjectId.value = project.id;
}

function attachSelectedProject() {
  if (selectedProjectId.value) {
    const project = props.availableProjects.find(p => p.id === selectedProjectId.value);
    if (project) {
      emit("project-attached", project, props.customNodeProps.id);
    }
  }
}

function createProjectFromNode(projectData: any) {
  emit("create-project", projectData, props.customNodeProps.id);
}

function changeProjectSelection() {
  selectedProjectId.value = null;
}

function editProjectFromNode(projectData: any) {
  // Handle project editing
}

function handleClose() {
  emit("close-node", props.customNodeProps.id);
}
<\/script>`;

  const files: FileStructure[] = [
    {
      title: "components",
      openIcon: "vscode-icons:default-folder-opened",
      icon: "vscode-icons:default-folder",
      children: [
        {
          title: "canvas",
          openIcon: "vscode-icons:default-folder-opened",
          icon: "vscode-icons:default-folder",
          children: [
            {
              title: "nodes",
              openIcon: "vscode-icons:default-folder-opened",
              icon: "vscode-icons:default-folder",
              children: [
                {
                  title: "ProjectNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/ProjectNode.vue",
                  content: mainCode
                },
                {
                  title: "shared",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "NodeHeader.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/NodeHeader.vue",
                      content: "<!-- NodeHeader component for node headers -->"
                    },
                    {
                      title: "NodePanel.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/NodePanel.vue",
                      content: "<!-- NodePanel component for node content panels -->"
                    },
                    {
                      title: "RecordSelector.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/RecordSelector.vue",
                      content: "<!-- RecordSelector component for selecting records -->"
                    }
                  ]
                },
                {
                  title: "forms",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "ProjectForm.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/forms/ProjectForm.vue",
                      content: "<!-- ProjectForm component for creating/editing projects -->"
                    }
                  ]
                },
                {
                  title: "displays",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "ProjectStatusDisplay.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/displays/ProjectStatusDisplay.vue",
                      content: "<!-- ProjectStatusDisplay component for showing project status -->"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];

  emit("code", mainCode);
  emit("files", files);
});
</script>


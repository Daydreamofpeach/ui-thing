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
  const minimalDoc = "Project structure explorer for browsing and navigating project files and folders.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div class="project-explorer-node-container node-container">
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />

    <div class="node-icon-wrapper" style="border-color: #22c55e;">
      <Icon name="lucide:folder-tree" class="w-6 h-6 text-green-400" />
    </div>

    <NodeHeader
      :title="customNodeProps.data?.label || 'PROJECT EXPLORER'"
      title-color="#22c55e"
      theme-color="#22c55e"
      :transparent-background="true"
      :show-edit-button="false"
      :show-close-button="false"
    >
      <template #actions>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full" :class="projectPath ? 'bg-green-500' : 'bg-gray-500'" />
          <span class="text-xs" :class="projectPath ? 'text-green-400' : 'text-gray-400'">
            {{ projectPath ? 'Loaded' : 'Waiting' }}
          </span>
        </div>
      </template>
    </NodeHeader>

    <NodePanel
      panel-class="explorer-content-panel"
      scrollbar-color="rgba(34, 197, 94, 0.4)"
    >
      <div v-if="projectPath" class="file-tree-wrapper">
        <FileTree
          :project-path="projectPath"
          @fileSelected="handleFileSelected"
          @fileOpened="handleFileOpened"
          @error="handleError"
          @watchToggled="handleWatchToggled"
        />
      </div>

      <div v-else class="no-path-message">
        <Icon name="lucide:folder-x" class="w-8 h-8 text-white/30 mb-2" />
        <p class="text-sm text-white/50">Waiting for folder selection...</p>
        <p class="text-xs text-white/30 mt-1">Select a folder in the previous node</p>
      </div>
    </NodePanel>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import NodeHeader from "@canvas/shared/NodeHeader.vue";
import NodePanel from "@canvas/shared/NodePanel.vue";
import FileTree from "~/components/Automate/shared/FileTree.vue";
import { ref, watch } from "vue";

interface Props {
  customNodeProps: any
  isOscarPreview?: boolean
  updateNodeData?: (nodeId: string, key: string, value: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  isOscarPreview: false
});

const emit = defineEmits<{
  fileSelected: [file: any]
  fileOpened: [file: any, content: string]
  error: [error: string]
  watchToggled: [watchId: string, isNowWatching: boolean]
}>();

const projectPath = ref<string | null>(null);

watch(() => props.customNodeProps?.data?.projectPath, (newPath) => {
  projectPath.value = newPath || null;
}, { immediate: true });

function handleFileSelected(file: any) {
  emit("fileSelected", file);
}

function handleFileOpened(file: any, content: string) {
  emit("fileOpened", file, content);
}

function handleError(error: string) {
  emit("error", error);
}

function handleWatchToggled(watchId: string, isNowWatching: boolean) {
  emit("watchToggled", watchId, isNowWatching);
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
                  title: "childNodes",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "ProjectExplorerNode.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/childNodes/ProjectExplorerNode.vue",
                      content: mainCode
                    }
                  ]
                },
                {
                  title: "Automate",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "shared",
                      openIcon: "vscode-icons:default-folder-opened",
                      icon: "vscode-icons:default-folder",
                      children: [
                        {
                          title: "FileTree.vue",
                          icon: "vscode-icons:file-type-vue",
                          path: "components/Automate/shared/FileTree.vue",
                          content: "<!-- FileTree component for displaying file structure -->"
                        }
                      ]
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


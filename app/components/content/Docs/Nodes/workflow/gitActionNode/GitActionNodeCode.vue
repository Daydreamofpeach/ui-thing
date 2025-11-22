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
  const minimalDoc = "Git operation node for executing Git commands and managing repositories in workflows.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div v-if="customNodeProps" class="enhanced-node git-action-node">
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />
    <Handle id="top" type="target" :position="Position.Top" />
    <Handle id="bottom" type="source" :position="Position.Bottom" />
    <NodeResizer v-if="customNodeProps.selected" :min-width="200" :min-height="120" />
    
    <div class="node-header">
      <div class="flex items-center gap-2">
        <Icon name="lucide:git-branch" class="w-4 h-4 text-purple-600" />
        <h3 class="text-sm font-semibold text-purple-600">
          {{ customNodeProps.data?.label || 'Git Action Node' }}
        </h3>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full" :class="customNodeProps.data?.action ? 'bg-purple-500' : 'bg-gray-500'" />
        <span class="text-xs" :class="customNodeProps.data?.action ? 'text-purple-500/70' : 'text-gray-500/70'">
          {{ customNodeProps.data?.action ? 'Configured' : 'Not Configured' }}
        </span>
      </div>
    </div>
    
    <div class="node-details">
      <div class="detail-row">
        <span class="detail-label">Action</span>
        <span class="detail-value">{{ customNodeProps.data?.action || 'No action selected' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value" :class="getStatusClass(customNodeProps.data?.status)">
          {{ customNodeProps.data?.status || 'Inactive' }}
        </span>
      </div>
    </div>
    
    <div class="node-actions">
      <button
        v-if="!customNodeProps.data?.action"
        class="configure-git-action-button"
        @click="openGitActionSelector(customNodeProps.id)"
      >
        <Icon name="lucide:settings" class="w-3 h-3" />
        Configure Action
      </button>
      <div v-else class="configured-indicator">
        <Icon name="lucide:check-circle" class="w-3 h-3" />
        Configured
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";

interface Props {
  customNodeProps: any
  updateNodeData: (nodeId: string, key: string, value: any) => void
  openGitActionSelector: (nodeId: string) => void
  getStatusClass: (status: string) => string
}

defineProps<Props>();
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
                  title: "GitActionNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/GitActionNode.vue",
                  content: mainCode
                },
                {
                  title: "modals",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "GitActionsModal.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/modals/GitActionsModal.vue",
                      content: "<!-- GitActionsModal component for selecting Git actions -->"
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


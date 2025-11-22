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
  const minimalDoc = "Webhook hook node for receiving and processing HTTP webhooks. Supports both creating new hooks and selecting existing ones.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div class="hook-node-container node-container">
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />

    <div class="node-icon-wrapper" style="border-color: #eab308;">
      <img src="/hookIcon.png" alt="Hook Node">
    </div>

    <NodeHeader
      title="HOOK"
      title-color="#eab308"
      theme-color="#eab308"
      :transparent-background="true"
      :show-edit-button="false"
      :show-close-button="true"
      close-button-label="Delete hook node"
      @close="handleClose"
    />

    <NodePanel
      v-if="!customNodeProps.data?.hookId"
      panel-class="hook-config-container"
      scrollbar-color="rgba(234, 179, 8, 0.4)"
    >
      <ModeSelector v-model="hookMode" active-color="6, 182, 212" />

      <RecordSelector
        v-if="hookMode === 'select'"
        :records="availableHooks"
        :is-loading="isLoadingHooks"
        :selected-id="selectedHookId"
        record-type-singular="hook"
        record-type-plural="hooks"
        header-title="Available Hooks"
        header-icon="i-lucide-database"
        item-icon="i-lucide-webhook"
        icon-class="text-cyan-400"
        theme-color="6, 182, 212"
        :show-meta="false"
        @select="selectHook"
        @attach="attachSelectedHook"
      />

      <HookForm
        v-else-if="hookMode === 'create'"
        mode="create"
        :hook-data="{
          name: customNodeProps.data?.hookName,
          description: customNodeProps.data?.hookDescription,
          listeners: customNodeProps.data?.listeners || []
        }"
        :is-loading="isCreating"
        @update-field="(key, value) => updateNodeData(customNodeProps.id, \`hook\${key.charAt(0).toUpperCase() + key.slice(1)}\`, value)"
        @add-listener="addListener"
        @remove-listener="removeListener"
        @update-listener="updateListener"
        @submit="createHookFromNode"
      />
    </NodePanel>

    <NodePanel
      v-else
      panel-class="hook-status-display"
      scrollbar-color="rgba(234, 179, 8, 0.4)"
    >
      <HookForm
        mode="edit"
        :hook-data="{
          name: customNodeProps.data?.hookName,
          type: customNodeProps.data?.hookType,
          token: customNodeProps.data?.hookToken,
          trigger: customNodeProps.data?.hookTriggers?.[0],
          listeners: customNodeProps.data?.listeners || []
        }"
        @add-listener="addListener"
        @remove-listener="removeListener"
        @update-listener="updateListener"
        @change-hook="changeHookSelection"
        @resubscribe="resubscribeAllListeners"
        @delete="deleteHookFromNode"
      />
    </NodePanel>
  </div>
</template>

<script lang="ts" setup>
import ModeSelector from "@canvas/shared/ModeSelector.vue";
import NodeHeader from "@canvas/shared/NodeHeader.vue";
import NodePanel from "@canvas/shared/NodePanel.vue";
import RecordSelector from "@canvas/shared/RecordSelector.vue";
import { Handle, Position } from "@vue-flow/core";
import { computed, ref, watch } from "vue";
import { useHookNodeManagement } from "../../composables/useHookNodeManagement";
import HookForm from "./HookForm.vue";

interface Props {
  customNodeProps: any
  updateNodeData: (nodeId: string, key: string, value: any) => void
  organisationId: string
  availableHooks?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  availableHooks: () => []
});

const emit = defineEmits<{
  closeNode: [nodeId: string]
  hookAttached: [hookData: any, nodeId: string]
  createTransportListener: [hookNodeId: string, listenerIndex: number]
  removeTransportListener: [hookNodeId: string, listenerIndex: number, transportNodeId: string]
}>();

const { isCreating, createHookFromNodeData } = useHookNodeManagement();

const hookMode = ref<"select" | "create">("select");
const selectedHookId = ref<string | null>(null);

const availableHooks = computed(() => props.availableHooks || []);
const isLoadingHooks = computed(() => false);

function selectHook(hookId: string) {
  selectedHookId.value = hookId;
}

function attachSelectedHook() {
  if (selectedHookId.value) {
    const hook = availableHooks.value.find(h => h.id === selectedHookId.value);
    if (hook) {
      // Attach hook logic
      emit("hookAttached", hook, props.customNodeProps.id);
    }
  }
}

function createHookFromNode(hookData: any) {
  createHookFromNodeData(hookData, props.customNodeProps.id);
}

function addListener(listener: any) {
  // Add listener logic
}

function removeListener(index: number) {
  // Remove listener logic
}

function updateListener(index: number, listener: any) {
  // Update listener logic
}

function changeHookSelection() {
  // Change hook selection logic
}

function resubscribeAllListeners() {
  // Resubscribe logic
}

function deleteHookFromNode() {
  // Delete hook logic
}

function handleClose() {
  emit("closeNode", props.customNodeProps.id);
}
<\/script>`;

  const composableCode = `export function useHookNodeManagement() {
  const isCreating = ref(false);

  const createHookFromNodeData = async (hookData: any, nodeId: string) => {
    isCreating.value = true;
    try {
      // Create hook logic
      console.log("Creating hook from node:", hookData);
    } finally {
      isCreating.value = false;
    }
  };

  return {
    isCreating,
    createHookFromNodeData
  };
}`;

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
                  title: "hooks",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "HookNode.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/hooks/HookNode.vue",
                      content: mainCode
                    },
                    {
                      title: "HookForm.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/hooks/HookForm.vue",
                      content: "<!-- HookForm component for creating/editing hooks -->"
                    }
                  ]
                },
                {
                  title: "shared",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "ModeSelector.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/ModeSelector.vue",
                      content: "<!-- ModeSelector component for select/create mode -->"
                    },
                    {
                      title: "NodeHeader.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/NodeHeader.vue",
                      content: "<!-- NodeHeader component for consistent headers -->"
                    },
                    {
                      title: "NodePanel.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/NodePanel.vue",
                      content: "<!-- NodePanel component for node content containers -->"
                    },
                    {
                      title: "RecordSelector.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/RecordSelector.vue",
                      content: "<!-- RecordSelector component for selecting records -->"
                    }
                  ]
                }
              ]
            },
            {
              title: "composables",
              openIcon: "vscode-icons:default-folder-opened",
              icon: "vscode-icons:default-folder",
              children: [
                {
                  title: "useHookNodeManagement.ts",
                  icon: "vscode-icons:file-type-typescript-official",
                  path: "components/canvas/composables/useHookNodeManagement.ts",
                  content: composableCode
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


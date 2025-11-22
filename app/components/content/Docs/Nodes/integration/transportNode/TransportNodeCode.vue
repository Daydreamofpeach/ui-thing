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
  const minimalDoc = "Transport delivery node for sending messages via email, Slack, Discord, or webhooks.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div class="transport-node-container">
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />
    <Handle id="top" type="target" :position="Position.Top" />
    <Handle id="bottom" type="source" :position="Position.Bottom" />

    <div class="node-header">
      <div class="flex items-center gap-2">
        <Icon name="lucide:truck" class="w-4 h-4 text-teal-500" />
        <h3 class="text-sm font-semibold text-teal-500">
          {{ customNodeProps.data?.label || 'Transport Node' }}
        </h3>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full bg-teal-500" />
          <span class="text-xs text-teal-500/70">Transport</span>
        </div>
        <button class="close-button" title="Close transport node" @click.stop="handleClose">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="!customNodeProps.data?.transportId" class="transport-config-container">
      <div class="mode-selection">
        <button
          class="mode-button"
          :class="{ active: transportMode === 'select' }"
          @click="transportMode = 'select'"
        >
          <Icon name="lucide:list" class="w-4 h-4" />
          <span>Select Existing</span>
        </button>
        <button
          class="mode-button"
          :class="{ active: transportMode === 'create' }"
          @click="transportMode = 'create'"
        >
          <Icon name="lucide:plus-circle" class="w-4 h-4" />
          <span>Create New</span>
        </button>
      </div>

      <!-- Select or Create Transport Form -->
      <div v-if="transportMode === 'select'" class="transport-selection-panel">
        <div class="section-header">
          <Icon name="lucide:database" class="w-4 h-4 text-teal-400" />
          <span class="text-sm font-medium text-white/80">Available Transports</span>
          <div class="transport-count-badge">{{ availableTransports.length }} transports</div>
        </div>

        <div v-if="isLoadingTransports" class="loading-state">
          <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin text-teal-400" />
          <span class="text-sm text-white/60">Loading transports...</span>
        </div>

        <div v-else-if="availableTransports.length === 0" class="empty-state">
          <Icon name="lucide:inbox" class="w-8 h-8 text-white/30" />
          <p class="text-sm text-white/50">No transports available</p>
          <p class="text-xs text-white/40">Switch to "Create New" to add a transport</p>
        </div>

        <div v-else class="transports-list">
          <button
            v-for="transport in availableTransports"
            :key="transport.id"
            class="transport-item"
            :class="{ selected: selectedTransportId === transport.id }"
            @click.stop="selectTransport(transport)"
          >
            <Icon name="lucide:truck" class="w-4 h-4 text-teal-400" />
            <div class="transport-item-info">
              <span class="transport-name">{{ transport.name }}</span>
              <span class="transport-type">{{ transport.type }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Create Transport Form -->
      <div v-else-if="transportMode === 'create'" class="transport-create-panel">
        <!-- Transport creation form -->
      </div>
    </div>

    <!-- Transport Status Display (Edit Mode) -->
    <div v-else class="transport-status-display">
      <!-- Transport details and configuration -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { ref, computed } from "vue";

interface Props {
  customNodeProps: any
  updateNodeData: (nodeId: string, key: string, value: any) => void
  organisationId: string
  availableTransports?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  availableTransports: () => []
});

const emit = defineEmits<{
  'close-transport-node': [nodeId: string]
  'transport-attached': [transportData: any, nodeId: string]
}>();

const transportMode = ref<"select" | "create">("select");
const selectedTransportId = ref<string | null>(null);
const isLoadingTransports = computed(() => false);

function selectTransport(transport: any) {
  selectedTransportId.value = transport.id;
}

function attachSelectedTransport() {
  if (selectedTransportId.value) {
    const transport = props.availableTransports.find(t => t.id === selectedTransportId.value);
    if (transport) {
      emit("transport-attached", transport, props.customNodeProps.id);
    }
  }
}

function handleClose() {
  emit("close-transport-node", props.customNodeProps.id);
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
                  title: "TransportNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/TransportNode.vue",
                  content: mainCode
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


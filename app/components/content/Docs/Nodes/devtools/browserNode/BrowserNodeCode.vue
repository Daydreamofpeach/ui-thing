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
  const minimalDoc = "Browser preview node with full browser capabilities, viewport connections, and automation pipeline support.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div class="enhanced-node browser-node">
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />
    <Handle id="top" type="target" :position="Position.Top" />
    <Handle id="bottom" type="source" :position="Position.Bottom" />

    <CustomNodeResizer
      :min-width="600"
      :min-height="500"
      :max-width="Infinity"
      :max-height="Infinity"
      :show-size-indicator="true"
      @resize="handleResize"
    />

    <div class="node-header">
      <div class="flex items-center gap-2">
        <Icon name="lucide:globe" class="w-4 h-4 text-green-600" />
        <h3 class="text-sm font-semibold text-green-600">
          {{ customNodeProps.data?.label || 'Browser Node' }}
        </h3>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 rounded-full" :class="getStatusColor(customNodeProps.data?.status)" />
          <span class="text-xs" :class="getStatusTextColor(customNodeProps.data?.status)">
            {{ getStatusText(customNodeProps.data?.status) }}
          </span>
        </div>
        <button class="close-node-btn" title="Close browser node" @click.stop="closeBrowserNode">
          <Icon name="lucide:x" class="w-3 h-3" />
        </button>
      </div>
    </div>

    <div class="browser-url-section">
      <div class="url-input-container">
        <Icon name="lucide:link" class="url-icon" />
        <input
          :value="customNodeProps.data?.url || ''"
          type="url"
          placeholder="Enter URL (https://example.com)"
          class="url-input"
          @input="handleUrlInput"
          @keyup.enter="loadUrl"
        >
        <button class="load-url-button" :disabled="!customNodeProps.data?.url" @click="loadUrl">
          <Icon name="lucide:arrow-right" class="w-4 h-4" />
        </button>
      </div>
      <div class="url-actions">
        <button class="action-button refresh-button" :disabled="!customNodeProps.data?.url" @click="refreshBrowser">
          <Icon name="lucide:refresh-cw" class="w-3 h-3" />
          Refresh
        </button>
        <button class="action-button open-external-button" :disabled="!customNodeProps.data?.url" @click="openInExternalBrowser">
          <Icon name="lucide:external-link" class="w-3 h-3" />
          Open External
        </button>
      </div>
    </div>

    <!-- Child Viewports Status -->
    <div v-if="childViewports.length > 0" class="child-viewports-status">
      <div class="status-content">
        <UIcon name="i-lucide-monitor-check" class="w-4 h-4 text-green-400" />
        <span class="status-text">
          {{ childViewports.length }} Connected Viewport{{ childViewports.length > 1 ? 's' : '' }}
        </span>
      </div>
    </div>

    <!-- Browser Content -->
    <div class="browser-content">
      <!-- Browser iframe or content here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import CustomNodeResizer from "@canvas/shared/CustomNodeResizer.vue";

interface Props {
  customNodeProps: any
  updateNodeData: (nodeId: string, key: string, value: any) => void
  childViewports?: any[]
  connectedHook?: any
  connectedTransport?: any
}

const props = withDefaults(defineProps<Props>(), {
  childViewports: () => [],
  connectedHook: null,
  connectedTransport: null
});

const emit = defineEmits<{
  'close-browser-node': [nodeId: string]
  'load-url': [nodeId: string, url: string]
  'refresh-browser': [nodeId: string]
  'open-in-external-browser': [url: string]
  'create-viewport': [browserNodeId: string]
  'connect-hook': [browserNodeId: string, hookNodeId: string]
  'connect-transport': [browserNodeId: string, transportNodeId: string]
  'disconnect-hook': [browserNodeId: string]
  'disconnect-transport': [browserNodeId: string]
}>();

function handleUrlInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  props.updateNodeData(props.customNodeProps.id, 'url', value);
}

function loadUrl() {
  if (props.customNodeProps.data?.url) {
    emit('load-url', props.customNodeProps.id, props.customNodeProps.data.url);
  }
}

function refreshBrowser() {
  emit('refresh-browser', props.customNodeProps.id);
}

function openInExternalBrowser() {
  if (props.customNodeProps.data?.url) {
    emit('open-in-external-browser', props.customNodeProps.data.url);
  }
}

function closeBrowserNode() {
  emit('close-browser-node', props.customNodeProps.id);
}

function handleResize(size: { width: number; height: number }) {
  props.updateNodeData(props.customNodeProps.id, 'width', size.width);
  props.updateNodeData(props.customNodeProps.id, 'height', size.height);
}

function getStatusColor(status?: string): string {
  switch (status) {
  case 'connected':
    return 'bg-green-500';
  case 'loading':
    return 'bg-yellow-500';
  case 'error':
    return 'bg-red-500';
  default:
    return 'bg-gray-500';
  }
}

function getStatusTextColor(status?: string): string {
  switch (status) {
  case 'connected':
    return 'text-green-500/70';
  case 'loading':
    return 'text-yellow-500/70';
  case 'error':
    return 'text-red-500/70';
  default:
    return 'text-gray-500/70';
  }
}

function getStatusText(status?: string): string {
  switch (status) {
  case 'connected':
    return 'Connected';
  case 'loading':
    return 'Loading';
  case 'error':
    return 'Error';
  default:
    return 'Disconnected';
  }
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
                  title: "BrowserNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/BrowserNode.vue",
                  content: mainCode
                },
                {
                  title: "shared",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "CustomNodeResizer.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/CustomNodeResizer.vue",
                      content: "<!-- CustomNodeResizer component for node resizing -->"
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


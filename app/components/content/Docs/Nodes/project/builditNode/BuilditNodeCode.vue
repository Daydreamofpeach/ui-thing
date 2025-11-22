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
  const minimalDoc = "BuildIt installation runner node for executing BuildIt installations and managing project builds.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <BaseNodeTemplate
    :custom-node-props="customNodeProps"
    :update-node-data="updateNodeData"
    icon="i-lucide-zap"
    title="BUILDIT"
    :title-color="themeColor"
    :theme-color="themeColor"
    :status-label="statusLabel"
    :status-color="statusColor"
    :show-edit-button="false"
    :show-close-button="true"
    :show-default-header="true"
    :background-color="undefined"
    :border-color="borderColor"
    :min-width="500"
    :min-height="400"
    :default-collapsed="false"
    node-class="buildit-node"
    @close="handleClose"
  >
    <div ref="builditContentWrapperRef" class="buildit-content-wrapper">
      <div class="buildit-content">
        <Tabs default-value="overview" class="buildit-tabs-wrapper">
          <TabsList class="buildit-tabs-list">
            <TabsTrigger value="overview" class="buildit-tab-trigger">
              <UIcon name="i-lucide-zap" class="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger v-if="orbitItems.length > 0" value="orbit" class="buildit-tab-trigger">
              <UIcon name="i-lucide-network" class="size-4" />
              Orbit
              <span class="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                {{ orbitItems.length }}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" class="buildit-tabs-content buildit-section">
            <div class="section-header">
              <UIcon name="i-lucide-zap" class="size-5" :style="{ color: themeColor }" />
              <div class="section-title">
                <span class="title-text">Ready to Build</span>
                <span class="subtitle-text">{{ projectName || "Unnamed Project" }}</span>
              </div>
            </div>

            <p class="status-message">{{ statusMessage }}</p>

            <button
              ref="builditButtonRef"
              class="buildit-button"
              :class="builditButtonStateClass"
              :disabled="builditButtonDisabled"
              @click="handleBuilditClick"
            >
              <UIcon
                :name="builditButtonStateIcon"
                class="size-5"
                :class="{ 'animate-spin': isLinking || isInstalling }"
              />
              <span>{{ builditButtonLabel }}</span>
            </button>

            <div v-if="environmentInfo" class="environment-info">
              <div class="info-row">
                <span class="info-label">Environment:</span>
                <span class="info-value">{{ environmentInfo.name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value" :class="{ 'text-warning': !isEnvironmentLinked }">
                  {{ isEnvironmentLinked ? 'Linked' : 'Not Linked' }}
                </span>
              </div>
            </div>

            <OrbitControlButton
              :active-orbit-node-id="activeOrbitNodeId"
              :is-expanded="orbitNodesExpanded"
              :has-orbit-items="orbitItems.length > 0"
              :node-count="orbitItems.length"
              @close="handleCloseOrbitNode"
              @toggle="handleToggleOrbitNodes"
              @add-template="handleAddTemplate"
            />
          </TabsContent>

          <TabsContent value="orbit" class="buildit-tabs-content buildit-orbit-list">
            <div class="orbit-nodes-list">
              <div v-if="orbitItems.length === 0" class="orbit-nodes-empty">
                <UIcon name="i-lucide-network" class="size-8 text-white/30" />
                <p class="text-white/60 text-sm">No connected nodes</p>
              </div>
              <div v-else class="orbit-items-grid">
                <button
                  v-for="item in orbitItems"
                  :key="item.id"
                  class="orbit-item-card"
                  @click="handleOrbitItemClick(item)"
                >
                  <UIcon :name="item.icon" class="size-5 text-primary" />
                  <div class="orbit-item-info">
                    <span class="orbit-item-name">{{ item.name }}</span>
                    <span class="orbit-item-type">{{ item.type }}</span>
                  </div>
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </BaseNodeTemplate>
</template>

<script setup lang="ts">
import BaseNodeTemplate from "../templates/BaseNodeTemplate.vue";
import OrbitControlButton from "@canvas/shared/OrbitControlButton.vue";
import { computed, ref } from "vue";

interface Props {
  customNodeProps: any
  updateNodeData?: (nodeId: string, key: string, value: any) => void
  createChildProjectEnvironmentNode?: (nodeId: string, environmentData: Record<string, any>) => void
  registerExistingNode?: (node: any) => void
  createEdge?: (sourceNodeId: string, targetNodeId: string) => void
  triggerTemplateNodeChain?: (templateNodeId: string) => void
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [nodeId: string]
  close: [nodeId: string]
  resize: [size: { width: number, height: number }]
  resizeEnd: [size: { width: number, height: number }]
}>();

const themeColor = "var(--color-primary)";
const borderColor = computed(() => themeColor);

const projectName = computed(() => props.customNodeProps?.data?.projectName || "Unnamed Project");
const statusMessage = computed(() => {
  if (props.customNodeProps?.data?.status === "installing") return "Installing dependencies...";
  if (props.customNodeProps?.data?.status === "linked") return "Environment linked and ready";
  return "Ready to build";
});

const statusLabel = computed(() => {
  const status = props.customNodeProps?.data?.status;
  if (status === "installing") return "Installing";
  if (status === "linked") return "Ready";
  return "Ready";
});

const statusColor = computed(() => {
  const status = props.customNodeProps?.data?.status;
  if (status === "installing") return "#f59e0b";
  if (status === "linked") return "#10b981";
  return "#3b82f6";
});

const orbitItems = computed(() => props.customNodeProps?.data?.orbitItems || []);
const activeOrbitNodeId = ref<string | null>(null);
const orbitNodesExpanded = ref(false);
const isLinking = ref(false);
const isInstalling = ref(false);
const isEnvironmentLinked = computed(() => props.customNodeProps?.data?.status === "linked");

const environmentInfo = computed(() => props.customNodeProps?.data?.environmentInfo || null);

const builditButtonDisabled = computed(() => isLinking.value || isInstalling.value || isEnvironmentLinked.value);
const builditButtonLabel = computed(() => {
  if (isLinking.value) return "Linking...";
  if (isInstalling.value) return "Installing...";
  if (isEnvironmentLinked.value) return "Already Linked";
  return "Link Environment";
});

const builditButtonStateIcon = computed(() => {
  if (isLinking.value || isInstalling.value) return "i-lucide-loader-2";
  if (isEnvironmentLinked.value) return "i-lucide-check-circle";
  return "i-lucide-zap";
});

const builditButtonStateClass = computed(() => {
  if (isEnvironmentLinked.value) return "success";
  if (isLinking.value || isInstalling.value) return "loading";
  return "primary";
});

function handleBuilditClick() {
  if (isEnvironmentLinked.value || builditButtonDisabled.value) return;
  
  isLinking.value = true;
  // Link logic here
  setTimeout(() => {
    isLinking.value = false;
    if (props.updateNodeData) {
      props.updateNodeData(props.customNodeProps.id, "status", "linked");
    }
  }, 2000);
}

function handleClose() {
  emit("close", props.customNodeProps.id);
}

function handleCloseOrbitNode() {
  activeOrbitNodeId.value = null;
}

function handleToggleOrbitNodes() {
  orbitNodesExpanded.value = !orbitNodesExpanded.value;
}

function handleAddTemplate() {
  // Add template logic
}

function handleOrbitItemClick(item: any) {
  activeOrbitNodeId.value = item.id;
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
                  title: "BuilditNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/BuilditNode.vue",
                  content: mainCode
                },
                {
                  title: "templates",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "BaseNodeTemplate.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/templates/BaseNodeTemplate.vue",
                      content: "<!-- BaseNodeTemplate component for node templates -->"
                    }
                  ]
                },
                {
                  title: "shared",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "OrbitControlButton.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/OrbitControlButton.vue",
                      content: "<!-- OrbitControlButton component for orbit controls -->"
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


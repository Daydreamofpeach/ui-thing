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
  const minimalDoc = "Integration setup node for linking repository integrations and connecting services to your project.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div class="setup-project-node-container node-container">
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />

    <div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
      <UIcon name="i-lucide-settings" class="size-8" :style="{ color: themeColor }" />
    </div>

    <NodeHeader
      title="INTEGRATION SETUP"
      :title-color="themeColor"
      :theme-color="themeColor"
      :transparent-background="true"
      :show-edit-button="false"
      :show-close-button="true"
      close-button-label="Delete setup node"
      @close="handleClose"
    />

    <NodePanel
      panel-class="setup-project-container"
      :scrollbar-color="scrollbarColor"
    >
      <StepNavigation
        :current-step="currentStepNumber"
        :total-steps="3"
        :theme-color="themeColor"
        :show-next-button="repositoryIntegrations.length > 0"
        :can-progress="repositoryIntegrations.length > 0"
        next-button-label="Continue to Environment"
        @next="createEnvironmentNode"
        @stepClick="handleStepClick"
      />

      <section class="oscar-hero">
        <div class="oscar-hero__figure">
          <img :src="oscarMini" alt="Oscar's avatar" class="oscar-hero__image" />
        </div>
        <div class="oscar-hero__content">
          <h4 class="oscar-hero__title">Oscar's Advice</h4>
          <p class="oscar-hero__body">
            Link the integrations that are important for this project. Once everything is connected, continue to environment setup to pull dependencies.
          </p>
        </div>
      </section>

      <IntegrationSetupCanvas
        :exclude-types="existingIntegrationTypes"
        @integrationCreated="handleIntegrationCreated"
      />

      <section v-if="linkedIntegrations.length > 0" class="integrations-section">
        <header class="section-header">
          <UIcon name="i-lucide-plug-2" class="size-5" :style="{ color: themeColor }" />
          <div class="section-header__text">
            <h4>Current Integrations</h4>
            <p>Linked services available for this project.</p>
          </div>
        </header>

        <div class="integrations-list">
          <button
            v-for="integration in linkedIntegrations"
            :key="integration.id"
            class="integration-item"
            @click="handleIntegrationClick(integration)"
          >
            <div class="integration-item-header">
              <div class="integration-icon">
                <Icon :name="getIntegrationIcon(integration.integration?.type)" class="size-5" />
              </div>
              <div class="integration-info">
                <span class="integration-name">{{ getIntegrationName(integration) }}</span>
                <span class="integration-type">{{ integration.integration?.type }}</span>
              </div>
            </div>
            <UBadge
              :color="integration.integration?.connected ? 'success' : 'warning'"
              :label="integration.integration?.connected ? 'Connected' : 'Setup Required'"
              size="xs"
            />
          </button>
        </div>
      </section>
    </NodePanel>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import NodeHeader from "@canvas/shared/NodeHeader.vue";
import NodePanel from "@canvas/shared/NodePanel.vue";
import StepNavigation from "@canvas/shared/StepNavigation.vue";
import IntegrationSetupCanvas from "@canvas/canvas/IntegrationSetupCanvas.vue";
import { computed, ref } from "vue";

interface Props {
  customNodeProps: any
  updateNodeData: (nodeId: string, key: string, value: any) => void
  organisationId: string
  existingIntegrationTypes?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  existingIntegrationTypes: () => []
});

const emit = defineEmits<{
  'close-node': [nodeId: string]
  'integration-created': [integrationData: any, nodeId: string]
  'create-environment-node': [nodeId: string]
}>();

const themeColor = "#10b981";
const scrollbarColor = "rgba(16, 185, 129, 0.4)";

const currentStepNumber = computed(() => props.customNodeProps?.data?.currentStepNumber || 1);
const repositoryIntegrations = computed(() => props.customNodeProps?.data?.repositoryIntegrations || []);
const linkedIntegrations = computed(() => repositoryIntegrations.value);

function handleIntegrationCreated(integrationData: any) {
  emit("integration-created", integrationData, props.customNodeProps.id);
}

function createEnvironmentNode() {
  emit("create-environment-node", props.customNodeProps.id);
}

function handleStepClick(step: number) {
  // Handle step navigation
}

function handleIntegrationClick(integration: any) {
  // Handle integration click
}

function getIntegrationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    github: "i-lucide-github",
    gitlab: "i-lucide-gitlab",
    bitbucket: "i-lucide-bitbucket"
  };
  return iconMap[type] || "i-lucide-plug";
}

function getIntegrationName(integration: any): string {
  return integration.integration?.name || integration.name || "Unknown";
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
                  title: "SetupProjectNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/SetupProjectNode.vue",
                  content: mainCode
                },
                {
                  title: "shared",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "StepNavigation.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/StepNavigation.vue",
                      content: "<!-- StepNavigation component for multi-step workflows -->"
                    }
                  ]
                },
                {
                  title: "canvas",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "IntegrationSetupCanvas.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/canvas/IntegrationSetupCanvas.vue",
                      content: "<!-- IntegrationSetupCanvas component for integration setup -->"
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


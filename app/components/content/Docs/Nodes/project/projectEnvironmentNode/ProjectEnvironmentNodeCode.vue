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
  const minimalDoc = "Project environment setup node for configuring development environments and dependencies.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <div class="project-environment-node node-container">
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />

    <div class="node-icon-wrapper" :style="{ borderColor: themeColor }">
      <UIcon name="i-lucide-git-branch" class="size-8" :style="{ color: themeColor }" />
    </div>

    <NodeHeader
      title="PROJECT ENVIRONMENT"
      :title-color="themeColor"
      :theme-color="themeColor"
      :transparent-background="true"
      :show-edit-button="false"
      :show-close-button="true"
      close-button-label="Delete environment node"
      @close="handleClose"
    />

    <NodePanel
      panel-class="project-env-container"
      :scrollbar-color="scrollbarColor"
    >
      <div class="step-navigation-block env-block">
        <StepNavigation
          :current-step="3"
          :total-steps="3"
          :theme-color="themeColor"
          :show-next-button="false"
          @step-click="handleStepClick"
        >
          <template #actions>
            <div v-if="linkedTemplates.length > 0" class="environment-step-actions">
              <button
                v-if="!isEnvironmentSetupSaved"
                class="primary-button environment-save-button"
                :style="savePrimaryButtonStyle"
                :disabled="isSaving"
                @click="handleSaveEnvironmentSetup"
              >
                <UIcon
                  :name="isSaving ? 'i-lucide-loader-2' : 'i-lucide-save'"
                  class="size-3.5"
                  :class="{ 'animate-spin': isSaving }"
                />
                <span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
              </button>
              <span v-else class="environment-save-status">Saved</span>
            </div>
          </template>
        </StepNavigation>
      </div>

      <section class="oscar-hero env-block">
        <div class="oscar-hero__figure">
          <img :src="oscarHero.image" alt="Oscar's avatar" class="oscar-hero__image" />
        </div>
        <div class="oscar-hero__content">
          <h4 class="oscar-hero__title">{{ oscarHero.title }}</h4>
          <p class="oscar-hero__body">{{ oscarHero.body }}</p>
        </div>
      </section>

      <div class="env-section env-block">
        <div class="section-header">
          <UIcon name="i-lucide-server" class="size-4" :style="{ color: themeColor }" />
          <span class="section-title" :style="{ color: themeColor }">Active Environment</span>
          <button
            v-if="!isLoadingEnvironment"
            class="refresh-button"
            :style="actionButtonStyle"
            @click="loadCurrentEnvironment"
          >
            <UIcon name="i-lucide-refresh-cw" class="size-3.5" />
          </button>
        </div>
        <EnvironmentDisplay
          :environment="activeEnvironment"
          :theme-color="themeColor"
          :show-link-button="!isEnvironmentLinked"
          :is-linking="isLinking"
          link-button-text="Link to Project"
          empty-message="No active environment"
          @link="handleLinkEnvironment"
        />
      </div>
    </NodePanel>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import NodeHeader from "@canvas/shared/NodeHeader.vue";
import NodePanel from "@canvas/shared/NodePanel.vue";
import StepNavigation from "@canvas/shared/StepNavigation.vue";
import EnvironmentDisplay from "@canvas/displays/EnvironmentDisplay.vue";
import { computed, ref } from "vue";

interface Props {
  customNodeProps: any
  updateNodeData: (nodeId: string, key: string, value: any) => void
  organisationId: string
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'close-node': [nodeId: string]
  'environment-saved': [environmentData: any, nodeId: string]
}>();

const themeColor = "#f87171";
const scrollbarColor = "rgba(248, 113, 113, 0.4)";

const linkedTemplates = computed(() => props.customNodeProps?.data?.linkedTemplates || []);
const activeEnvironment = ref<any>(null);
const isEnvironmentLinked = ref(false);
const isLinking = ref(false);
const isLoadingEnvironment = ref(false);
const isSaving = ref(false);
const isEnvironmentSetupSaved = ref(false);

function handleSaveEnvironmentSetup() {
  isSaving.value = true;
  // Save logic here
  setTimeout(() => {
    isSaving.value = false;
    isEnvironmentSetupSaved.value = true;
  }, 1000);
}

function loadCurrentEnvironment() {
  isLoadingEnvironment.value = true;
  // Load logic here
  setTimeout(() => {
    isLoadingEnvironment.value = false;
  }, 1000);
}

function handleLinkEnvironment(environmentId: string) {
  isLinking.value = true;
  // Link logic here
  setTimeout(() => {
    isLinking.value = false;
    isEnvironmentLinked.value = true;
  }, 1000);
}

function handleStepClick(step: number) {
  // Handle step navigation
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
                  title: "ProjectEnvironmentNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/ProjectEnvironmentNode.vue",
                  content: mainCode
                },
                {
                  title: "displays",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "EnvironmentDisplay.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/displays/EnvironmentDisplay.vue",
                      content: "<!-- EnvironmentDisplay component for showing environment details -->"
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


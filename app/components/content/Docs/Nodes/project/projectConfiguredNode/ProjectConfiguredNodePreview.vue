<template>
  <div class="flex flex-col items-center justify-center gap-4 w-full">
    <div class="relative flex items-center justify-center p-4 w-full overflow-auto">
      <div class="project-node-preview-wrapper" style="width: 100%; max-width: 700px; margin: 0 auto;">
        <VueFlow
          :nodes="[demoNode]"
          :edges="[]"
          :node-types="nodeTypes"
          :nodes-draggable="false"
          :zoom-on-scroll="false"
          :pan-on-scroll="false"
          :zoom-on-double-click="false"
          :zoom-on-pinch="false"
          :fit-view-on-init="false"
          class="docs-node-preview-flow project-node-flow"
        >
          <template #node-projectConfiguredNode="{ data: node }">
            <div style="transform: scale(0.7); transform-origin: top left; width: 100%;">
              <Suspense>
                <ProjectConfiguredNode
                  :custom-node-props="demoNode"
                  :update-node-data="() => {}"
                  :organisation-id="'demo-org-1'"
                  @close-node="() => {}"
                />
                <template #fallback>
                  <div class="flex items-center justify-center p-8 text-muted-foreground">
                    Loading preview...
                  </div>
                </template>
              </Suspense>
            </div>
          </template>
        </VueFlow>
      </div>
    </div>
    <p class="text-sm text-muted-foreground text-center max-w-md">
      Configured project node displaying project details and management options after project setup is complete.
    </p>
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref, onErrorCaptured } from "vue";
import { VueFlow } from "@vue-flow/core";
import "@vue-flow/core/dist/style.css";

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

defineProps<Props>();

const ProjectConfiguredNode = defineAsyncComponent(() => import("~/components/canvas/nodes/ProjectConfiguredNode.vue"));

const nodeTypes = {
  projectConfiguredNode: ProjectConfiguredNode
};

const demoNode = ref({
  id: "demo-project-configured-node",
  type: "projectConfiguredNode",
  position: { x: 0, y: 0 },
  selected: true,
  data: {
    label: "Configured Project",
    selectedProjectId: "demo-project-1",
    projectName: "E-Commerce Platform",
    name: "E-Commerce Platform", // Also provide as 'name' for compatibility
    description: "A modern e-commerce platform built with Vue.js, Node.js, and PostgreSQL. Features include user authentication, product catalog, shopping cart, and payment integration.",
    status: "active",
    id: "demo-project-1", // Ensure ID is present
    tasks: [
      {
        id: "task-1",
        title: "Implement user authentication",
        description: "Set up JWT-based authentication system with login and registration",
        status: "in-progress",
        priority: "high",
        assignedUsers: [
          {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            avatar: null
          }
        ]
      },
      {
        id: "task-2",
        title: "Design product catalog UI",
        description: "Create responsive product listing and detail pages",
        status: "todo",
        priority: "medium",
        assignedUsers: []
      },
      {
        id: "task-3",
        title: "Integrate payment gateway",
        description: "Connect Stripe payment API for checkout process",
        status: "todo",
        priority: "high",
        assignedUsers: []
      }
    ],
    assignedUsers: [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        role: "Lead Developer",
        avatar: null
      },
      {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "UI/UX Designer",
        avatar: null
      },
      {
        id: "user-3",
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "Backend Developer",
        avatar: null
      }
    ],
    connectedIDEs: [
      {
        id: "ide-1",
        name: "VS Code",
        type: "vscode",
        version: "1.85.0",
        connected: true,
        openCommand: "code"
      },
      {
        id: "ide-2",
        name: "Cursor",
        type: "cursor",
        version: "0.38.0",
        connected: true,
        openCommand: "cursor"
      }
    ],
    integrations: [
      {
        id: "integration-1",
        type: "GITHUB",
        name: "GitHub Repository",
        connected: true,
        repository: "example/ecommerce-platform",
        integration: {
          type: "GITHUB",
          name: "GitHub Repository",
          connected: true
        }
      },
      {
        id: "integration-2",
        type: "SLACK",
        name: "Slack Workspace",
        connected: true,
        channel: "#project-updates",
        integration: {
          type: "SLACK",
          name: "Slack Workspace",
          connected: true
        }
      }
    ]
  }
});
</script>

<style scoped>
.docs-node-preview-flow {
  width: 100% !important;
  height: auto !important;
  min-height: 500px !important;
  background: transparent !important;
}

.docs-node-preview-flow.project-node-flow {
  min-height: 750px !important;
}

.docs-node-preview-flow :deep(.vue-flow__background),
.docs-node-preview-flow :deep(.vue-flow__controls),
.docs-node-preview-flow :deep(.vue-flow__minimap),
.docs-node-preview-flow :deep(.vue-flow__attribution) {
  display: none !important;
}

.docs-node-preview-flow :deep(.vue-flow__pane) {
  cursor: default !important;
  pointer-events: none !important;
}

.docs-node-preview-flow :deep(.vue-flow__transformationpane) {
  pointer-events: none !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) {
  pointer-events: auto !important;
  position: static !important;
  transform: none !important;
  cursor: default !important;
  width: 100% !important;
  max-width: 700px !important;
}

.docs-node-preview-flow :deep(.vue-flow__node) * {
  pointer-events: auto !important;
}

.docs-node-preview-flow :deep(.connection-handle) {
  display: none !important;
}

.project-node-flow :deep(.project-configured-node-container) {
  width: 100% !important;
  max-width: 700px !important;
  overflow: visible !important;
}
</style>


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
  const minimalDoc = "Project tools setup node for configuring IDEs, editors, and developer tools before integration setup.";
  emit("documentation", minimalDoc);

  const mainCode = `// See ProjectToolsSetupNode.vue for full implementation
// Uses Handle, NodeHeader, NodePanel, StepNavigation, IdeDisplay, and tool detection`;

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
                  title: "ProjectToolsSetupNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/ProjectToolsSetupNode.vue",
                  content: "// Full implementation includes IDE detection, tool checking, and step navigation"
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
                      content: "// Step navigation component"
                    },
                    {
                      title: "IdeDisplay.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/IdeDisplay.vue",
                      content: "// IDE display component"
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


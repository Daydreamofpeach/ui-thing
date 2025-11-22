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
  const minimalDoc = "Comprehensive environment setup node for detecting OS, languages, package managers, and development tools using Tauri OS APIs.";
  emit("documentation", minimalDoc);

  const mainCode = `// See EnvironmentSetupNode.vue for full implementation
// This node uses NodeResizer and comprehensive environment detection`;

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
                  title: "EnvironmentSetupNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/EnvironmentSetupNode.vue",
                  content: "// Full implementation includes OS detection, package manager checks, IDE detection, and environment variables"
                },
                {
                  title: "composables",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "useSetupData.ts",
                      icon: "vscode-icons:file-type-typescript-official",
                      path: "components/canvas/composables/useSetupData.ts",
                      content: "// Composable for environment detection logic using Tauri OS APIs"
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


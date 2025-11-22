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
  const minimalDoc = "Intent selection node for choosing project creation method: existing, new, template, or git clone with folder browser integration.";
  emit("documentation", minimalDoc);

  const mainCode = `// See IntentSelectionNode.vue for full implementation
// Uses Handle, NodeHeader, NodePanel, project type selection, folder browser, git clone browser, and Tauri file system APIs`;

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
                  title: "childNodes",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "IntentSelectionNode.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/childNodes/IntentSelectionNode.vue",
                      content: "// Full implementation includes project type selection, folder browser, git clone browser, and Tauri file dialogs"
                    }
                  ]
                },
                {
                  title: "shared",
                  openIcon: "vscode-icons:default-folder-opened",
                  icon: "vscode-icons:default-folder",
                  children: [
                    {
                      title: "NodeHeader.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/NodeHeader.vue",
                      content: "// Node header component"
                    },
                    {
                      title: "NodePanel.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/shared/NodePanel.vue",
                      content: "// Node panel component with scrolling"
                    }
                  ]
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
              title: "tauri.ts",
              icon: "vscode-icons:file-type-typescript-official",
              path: "composables/tauri.ts",
              content: "// Tauri OS APIs for file system dialogs and OS detection"
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


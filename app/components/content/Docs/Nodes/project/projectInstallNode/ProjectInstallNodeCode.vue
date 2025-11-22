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
  const minimalDoc = "Project install node for executing BuildIt installations with confetti celebration, install status tracking, and environment linking.";
  emit("documentation", minimalDoc);

  const mainCode = `// See ProjectInstallNode.vue for full implementation
// Uses Handle, NodeHeader, NodePanel, Confetti component, install status, template list, and environment info`;

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
                  title: "ProjectInstallNode.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/canvas/nodes/ProjectInstallNode.vue",
                  content: "// Full implementation includes confetti animation, install status tracking, template management, and environment linking"
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


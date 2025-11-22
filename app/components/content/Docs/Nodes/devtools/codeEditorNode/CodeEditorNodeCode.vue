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
  const minimalDoc = "Inline code editor node with Monaco editor for editing files directly in the canvas.";
  emit("documentation", minimalDoc);

  const mainCode = `<template>
  <BaseNodeTemplate
    :custom-node-props="nodeProps"
    :update-node-data="updateNodeData"
    icon="i-lucide-code"
    :theme-color="themeColor"
    :title="headerTitle"
    :show-default-header="true"
    :show-edit-button="false"
    :show-close-button="false"
    :collapsible="true"
    :default-collapsed="false"
    :show-resizer="true"
    :min-width="600"
    :min-height="520"
    :content-style="{ padding: '0' }"
  >
    <template #header-actions>
      <div class="header-actions">
        <div class="header-status">
          <div class="status-dot" />
          <span class="status-text">{{ connectionStatusLabel }}</span>
        </div>
        <button class="header-button refresh" type="button" title="Refresh code" @click.stop="refreshCode">
          <Icon name="lucide:refresh-cw" class="w-4 h-4" />
        </button>
        <button class="header-button close" type="button" title="Close editor" @click.stop="closeEditor">
          <Icon name="lucide:x" class="w-4 h-4" />
        </button>
      </div>
    </template>

    <div class="code-editor-node">
      <div class="code-info">
        <div class="file-info">
          <Icon name="lucide:file-text" class="info-icon" />
          <span class="file-name">{{ fileInfo.name }}</span>
          <span class="file-size">({{ fileInfo.size }} bytes)</span>
        </div>
        <div class="language-info">
          <Icon name="lucide:code-2" class="info-icon" />
          <span class="language-name">{{ fileInfo.language }}</span>
        </div>
      </div>

      <div class="code-editor-container">
        <MonacoEditor
          :model-value="codeContent"
          :language="fileInfo.language"
          :height="500"
          :readonly="false"
          theme="vs-dark"
          :options="editorOptions"
          @change="onCodeChange"
        />
      </div>

      <div class="node-actions">
        <button class="action-button copy-button" type="button" title="Copy code" @click="copyCode">
          <Icon name="lucide:copy" class="action-icon" />
        </button>
        <button class="action-button download-button" type="button" title="Download file" @click="downloadCode">
          <Icon name="lucide:download" class="action-icon" />
        </button>
        <button class="action-button format-button" type="button" title="Format code" @click="formatCode">
          <Icon name="lucide:wand-2" class="action-icon" />
        </button>
      </div>
    </div>
  </BaseNodeTemplate>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import BaseNodeTemplate from "../templates/BaseNodeTemplate.vue";
import MonacoEditor from "#ui/MonacoEditor.vue";

interface Props {
  customNodeProps: any
  updateNodeData?: (nodeId: string, key: string, value: any) => void
  codeContent: string
  fileName: string
  fileType: string
}

const props = withDefaults(defineProps<Props>(), {
  customNodeProps: undefined,
  updateNodeData: undefined,
  codeContent: "",
  fileName: "untitled",
  fileType: "plaintext"
});

const emit = defineEmits<{
  "code-changed": [content: string]
  "file-downloaded": [fileName: string, content: string]
  "close-editor": [nodeId: string]
  "refresh-code": [nodeId: string]
}>();

const nodeProps = computed(() => props.customNodeProps ?? { id: "", data: {} });
const codeContent = ref(props.codeContent);
const themeColor = "var(--color-primary)";
const headerTitle = computed(() => nodeProps.value?.data?.label || props.fileName || "Code Editor");

const fileInfo = computed(() => {
  const language = getLanguageFromExtension(props.fileType);
  return {
    name: props.fileName,
    language,
    size: new Blob([props.codeContent || ""]).size
  };
});

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'on',
  wordWrap: 'on',
  scrollBeyondLastLine: false
};

function getLanguageFromExtension(ext: string): string {
  const langMap: Record<string, string> = {
    'vue': 'vue',
    'ts': 'typescript',
    'js': 'javascript',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'html': 'html'
  };
  return langMap[ext.toLowerCase()] || 'plaintext';
}

function onCodeChange(value: string) {
  codeContent.value = value;
  emit("code-changed", value);
}

function copyCode() {
  navigator.clipboard.writeText(codeContent.value);
}

function downloadCode() {
  const blob = new Blob([codeContent.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = props.fileName;
  a.click();
  URL.revokeObjectURL(url);
  emit("file-downloaded", props.fileName, codeContent.value);
}

function formatCode() {
  // Format code logic here
  console.log("Format code");
}

function refreshCode() {
  emit("refresh-code", nodeProps.value.id);
}

function closeEditor() {
  emit("close-editor", nodeProps.value.id);
}
<\/script>`;

  const templateCode = `<!-- BaseNodeTemplate provides consistent node structure -->`;

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
                      title: "CodeEditorNode.vue",
                      icon: "vscode-icons:file-type-vue",
                      path: "components/canvas/nodes/childNodes/CodeEditorNode.vue",
                      content: mainCode
                    }
                  ]
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
                      content: templateCode
                    }
                  ]
                }
              ]
            },
            {
              title: "Ui",
              openIcon: "vscode-icons:default-folder-opened",
              icon: "vscode-icons:default-folder",
              children: [
                {
                  title: "MonacoEditor.vue",
                  icon: "vscode-icons:file-type-vue",
                  path: "components/Ui/MonacoEditor.vue",
                  content: "<!-- Monaco Editor component wrapper -->"
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


<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold mb-1">Implementation Code</h3>
        <p v-if="documentation" class="text-sm text-muted-foreground">{{ documentation }}</p>
      </div>
      <UiButton variant="outline" size="sm" @click="copyCode">
        <Icon name="lucide:copy" class="size-4 mr-2" />
        Copy
      </UiButton>
    </div>

    <component :is="getCodeComponent(node.id)" :node="node" @code="handleCode" @documentation="handleDocumentation" @files="handleFiles" />

    <div v-if="files && files.length > 0" class="grid grid-cols-2 gap-4 mb-4">
      <div class="rounded-lg border">
        <UiScrollArea class="max-h-[500px] rounded-md bg-background">
          <UiTree
            v-slot="{ flattenItems }"
            :default-expanded="defaultExpanded"
            :items="fileTree"
            :get-key="(i) => i.title"
            class="p-2 pr-3"
          >
            <p class="mb-3 text-sm font-semibold">File Structure</p>
            <template v-for="item in flattenItems" :key="item._id">
              <TreeItem
                v-slot="{ isExpanded }"
                v-bind="item.bind"
                :style="{ 'padding-left': `${item.level - 0.5}rem` }"
                class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm font-medium focus-visible:ring-2 focus-visible:ring-border focus-visible:outline-none hover:bg-muted/50"
                @click="selectFile(item.value.path)"
              >
                <template v-if="item.hasChildren">
                  <Icon v-if="isExpanded" :name="item.value.openIcon" class="size-3.5" />
                  <Icon v-else :name="item.value.icon" class="size-3.5" />
                </template>
                <Icon v-else :name="item.value.icon || 'lucide:file'" class="size-3.5" />
                <div class="">{{ item.value.title }}</div>
              </TreeItem>
            </template>
          </UiTree>
        </UiScrollArea>
      </div>

      <div class="rounded-lg border overflow-hidden">
        <div v-if="selectedFileContent" class="h-full">
          <div class="p-2 border-b bg-muted/50 flex items-center justify-between">
            <span class="text-sm font-medium">{{ selectedFileName }}</span>
            <UiButton variant="ghost" size="sm" @click="copyFileContent">
              <Icon name="lucide:copy" class="size-3.5" />
            </UiButton>
          </div>
          <MonacoEditor
            :model-value="selectedFileContent"
            :language="getLanguage(selectedFileName)"
            :readonly="true"
            :height="500"
            theme="vs-dark"
          />
        </div>
        <div v-else class="flex items-center justify-center h-[500px] text-muted-foreground">
          <div class="text-center">
            <Icon name="lucide:file-code" class="size-12 mx-auto mb-4 opacity-50" />
            <p>Select a file to view</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="code && (!files || files.length === 0)" class="rounded-lg border overflow-hidden">
      <MonacoEditor
        :model-value="code"
        language="vue"
        :readonly="true"
        :height="Math.max(300, code.split('\n').length * 20 + 40)"
        theme="vs-dark"
      />
    </div>

    <div v-if="!code && (!files || files.length === 0)" class="text-center py-12 text-muted-foreground">
      <Icon name="lucide:code" class="size-12 mx-auto mb-4 opacity-50" />
      <p>Code component loading...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent, computed } from "vue";
import MonacoEditor from "~/components/Ui/MonacoEditor.vue";
import UiTree from "~/components/Ui/Tree/Tree.vue";
import TreeItem from "~/components/Ui/Tree/Item.vue";
import UiScrollArea from "~/components/Ui/ScrollArea/ScrollArea.vue";
import UiButton from "~/components/Ui/Button.vue";

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

interface FileStructure {
  title: string;
  icon?: string;
  openIcon?: string;
  path?: string;
  children?: FileStructure[];
}

const props = defineProps<Props>();

const code = ref<string>("");
const documentation = ref<string>("");
const files = ref<FileStructure[]>([]);
const selectedFile = ref<string | null>(null);
const selectedFileContent = ref<string>("");
const selectedFileName = ref<string>("");
const defaultExpanded = ref<string[]>([]);

// Convert files array to tree structure
const fileTree = computed(() => files.value);

// Get file icon based on extension
const getFileIcon = (path: string): string => {
  if (!path) return "lucide:file";
  const ext = path.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    'vue': 'vscode-icons:file-type-vue',
    'ts': 'vscode-icons:file-type-typescript-official',
    'js': 'vscode-icons:file-type-js-official',
    'css': 'vscode-icons:file-type-css',
    'scss': 'vscode-icons:file-type-scss',
    'json': 'vscode-icons:file-type-json',
    'md': 'vscode-icons:file-type-markdown',
  };
  return iconMap[ext || ''] || 'lucide:file';
};

// Get folder icons
const getFolderIcon = (): string => 'vscode-icons:default-folder';
const getFolderOpenIcon = (): string => 'vscode-icons:default-folder-opened';

// Build tree structure from files array
const buildTreeFromFiles = (filesList: FileStructure[]): FileStructure[] => {
  return filesList.map(file => ({
    ...file,
    icon: file.icon || (file.children ? getFolderIcon() : getFileIcon(file.path || '')),
    openIcon: file.openIcon || (file.children ? getFolderOpenIcon() : undefined),
  }));
};

// Select a file to view
const selectFile = (path: string | undefined) => {
  if (!path) return;
  
  // Find the file content from the files structure
  const findFileContent = (items: FileStructure[]): string | null => {
    for (const item of items) {
      if (item.path === path && !item.children) {
        return (item as any).content || null;
      }
      if (item.children) {
        const found = findFileContent(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const content = findFileContent(files.value);
  if (content) {
    selectedFile.value = path;
    selectedFileContent.value = content;
    selectedFileName.value = path.split('/').pop() || path;
  }
};

// Get language from filename
const getLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    'vue': 'vue',
    'ts': 'typescript',
    'js': 'javascript',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
  };
  return langMap[ext || ''] || 'text';
};

const handleFiles = (fileList: FileStructure[]) => {
  files.value = buildTreeFromFiles(fileList);
  // Set default expanded folders
  defaultExpanded.value = fileList
    .filter(f => f.children && f.children.length > 0)
    .map(f => f.title);
};

// Helper function to convert node ID to PascalCase (e.g., "arrowRight" -> "ArrowRight")
const toPascalCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, '$1');
};

// Dynamically import node code components using slug pattern
const getCodeComponent = (nodeId: string) => {
  const category = props.node.category;
  const slug = toPascalCase(nodeId);
  const fileName = `${slug}Code.vue`;
  
  // Map known node paths to avoid dynamic import issues
  const nodeMap: Record<string, any> = {
    'shapes/rectangle/RectangleCode.vue': () => import('./shapes/rectangle/RectangleCode.vue'),
    'shapes/circle/CircleCode.vue': () => import('./shapes/circle/CircleCode.vue'),
    'shapes/diamond/DiamondCode.vue': () => import('./shapes/diamond/DiamondCode.vue'),
    'shapes/triangle/TriangleCode.vue': () => import('./shapes/triangle/TriangleCode.vue'),
    'shapes/hexagon/HexagonCode.vue': () => import('./shapes/hexagon/HexagonCode.vue'),
    'workflow/eventNode/EventNodeCode.vue': () => import('./workflow/eventNode/EventNodeCode.vue'),
    'workflow/commandNode/CommandNodeCode.vue': () => import('./workflow/commandNode/CommandNodeCode.vue'),
    'workflow/viewNode/ViewNodeCode.vue': () => import('./workflow/viewNode/ViewNodeCode.vue'),
    'workflow/gitActionNode/GitActionNodeCode.vue': () => import('./workflow/gitActionNode/GitActionNodeCode.vue'),
    'devtools/codeEditorNode/CodeEditorNodeCode.vue': () => import('./devtools/codeEditorNode/CodeEditorNodeCode.vue'),
    'devtools/webviewNode/WebviewNodeCode.vue': () => import('./devtools/webviewNode/WebviewNodeCode.vue'),
    'devtools/browserNode/BrowserNodeCode.vue': () => import('./devtools/browserNode/BrowserNodeCode.vue'),
    'integration/hookNode/HookNodeCode.vue': () => import('./integration/hookNode/HookNodeCode.vue'),
    'integration/transportNode/TransportNodeCode.vue': () => import('./integration/transportNode/TransportNodeCode.vue'),
    'project/projectNode/ProjectNodeCode.vue': () => import('./project/projectNode/ProjectNodeCode.vue'),
    'project/setupProjectNode/SetupProjectNodeCode.vue': () => import('./project/setupProjectNode/SetupProjectNodeCode.vue'),
    'project/projectExplorer/ProjectExplorerCode.vue': () => import('./project/projectExplorer/ProjectExplorerCode.vue'),
    'project/projectEnvironmentNode/ProjectEnvironmentNodeCode.vue': () => import('./project/projectEnvironmentNode/ProjectEnvironmentNodeCode.vue'),
    'project/builditNode/BuilditNodeCode.vue': () => import('./project/builditNode/BuilditNodeCode.vue'),
    'environment/environmentNode/EnvironmentNodeCode.vue': () => import('./environment/environmentNode/EnvironmentNodeCode.vue'),
    'environment/builditCli/BuilditCliCode.vue': () => import('./environment/builditCli/BuilditCliCode.vue'),
    'checkers/nodeCheckNode/NodeCheckNodeCode.vue': () => import('./checkers/nodeCheckNode/NodeCheckNodeCode.vue'),
    'checkers/pythonCheckNode/PythonCheckNodeCode.vue': () => import('./checkers/pythonCheckNode/PythonCheckNodeCode.vue'),
    'checkers/phpCheckNode/PhpCheckNodeCode.vue': () => import('./checkers/phpCheckNode/PhpCheckNodeCode.vue'),
    'checkers/rustCheckNode/RustCheckNodeCode.vue': () => import('./checkers/rustCheckNode/RustCheckNodeCode.vue'),
    'checkers/dotnetCheckNode/DotnetCheckNodeCode.vue': () => import('./checkers/dotnetCheckNode/DotnetCheckNodeCode.vue'),
    'checkers/javaCheckNode/JavaCheckNodeCode.vue': () => import('./checkers/javaCheckNode/JavaCheckNodeCode.vue'),
    'checkers/vscodeCheckNode/VscodeCheckNodeCode.vue': () => import('./checkers/vscodeCheckNode/VscodeCheckNodeCode.vue'),
    'checkers/cursorCheckNode/CursorCheckNodeCode.vue': () => import('./checkers/cursorCheckNode/CursorCheckNodeCode.vue'),
    'checkers/visualstudioCheckNode/VisualstudioCheckNodeCode.vue': () => import('./checkers/visualstudioCheckNode/VisualstudioCheckNodeCode.vue'),
    'checkers/intellijCheckNode/IntellijCheckNodeCode.vue': () => import('./checkers/intellijCheckNode/IntellijCheckNodeCode.vue'),
    'checkers/pycharmCheckNode/PycharmCheckNodeCode.vue': () => import('./checkers/pycharmCheckNode/PycharmCheckNodeCode.vue'),
    'checkers/webstormCheckNode/WebstormCheckNodeCode.vue': () => import('./checkers/webstormCheckNode/WebstormCheckNodeCode.vue'),
    'checkers/sublimeCheckNode/SublimeCheckNodeCode.vue': () => import('./checkers/sublimeCheckNode/SublimeCheckNodeCode.vue'),
    'checkers/notepadppCheckNode/NotepadppCheckNodeCode.vue': () => import('./checkers/notepadppCheckNode/NotepadppCheckNodeCode.vue'),
    'checkers/dockerCheckNode/DockerCheckNodeCode.vue': () => import('./checkers/dockerCheckNode/DockerCheckNodeCode.vue'),
    'checkers/gitCheckNode/GitCheckNodeCode.vue': () => import('./checkers/gitCheckNode/GitCheckNodeCode.vue'),
    'project/intentSelection/IntentSelectionCode.vue': () => import('./project/intentSelection/IntentSelectionCode.vue'),
    'project/projectToolsSetupNode/ProjectToolsSetupNodeCode.vue': () => import('./project/projectToolsSetupNode/ProjectToolsSetupNodeCode.vue'),
        'project/projectInstallNode/ProjectInstallNodeCode.vue': () => import('./project/projectInstallNode/ProjectInstallNodeCode.vue'),
        'project/projectConfiguredNode/ProjectConfiguredNodeCode.vue': () => import('./project/projectConfiguredNode/ProjectConfiguredNodeCode.vue'),
        'devtools/folderBrowser/FolderBrowserCode.vue': () => import('./devtools/folderBrowser/FolderBrowserCode.vue'),
      };

  const fullPath = `${category}/${nodeId}/${fileName}`;
  const loader = nodeMap[fullPath];
  
  if (loader) {
    return defineAsyncComponent(loader);
  }
  
  // Fallback to default code component
  return defineAsyncComponent(() => import("./DefaultNodeCode.vue"));
};

const handleCode = (nodeCode: string) => {
  code.value = nodeCode;
};

const handleDocumentation = (doc: string) => {
  documentation.value = doc;
};

const copyCode = async () => {
  if (code.value) {
    await navigator.clipboard.writeText(code.value);
    // You could add a toast notification here
  }
};

const copyFileContent = async () => {
  if (selectedFileContent.value) {
    await navigator.clipboard.writeText(selectedFileContent.value);
  }
};
</script>


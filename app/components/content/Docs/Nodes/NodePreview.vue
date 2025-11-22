<template>
  <div class="flex items-center justify-center min-h-[400px] bg-muted/20 rounded-lg p-8">
    <component :is="getPreviewComponent(node.id)" :node="node" />
  </div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from "vue";

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

const props = defineProps<Props>();

// Helper function to convert node ID to PascalCase (e.g., "arrowRight" -> "ArrowRight")
const toPascalCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, '$1');
};

// Dynamically import node preview components using slug pattern
const getPreviewComponent = (nodeId: string) => {
  const category = props.node.category;
  const slug = toPascalCase(nodeId);
  const fileName = `${slug}Preview.vue`;
  
  // Map known node paths to avoid dynamic import issues
  const nodeMap: Record<string, any> = {
    'shapes/rectangle/RectanglePreview.vue': () => import('./shapes/rectangle/RectanglePreview.vue'),
    'shapes/circle/CirclePreview.vue': () => import('./shapes/circle/CirclePreview.vue'),
    'shapes/diamond/DiamondPreview.vue': () => import('./shapes/diamond/DiamondPreview.vue'),
    'shapes/triangle/TrianglePreview.vue': () => import('./shapes/triangle/TrianglePreview.vue'),
    'shapes/hexagon/HexagonPreview.vue': () => import('./shapes/hexagon/HexagonPreview.vue'),
    'workflow/eventNode/EventNodePreview.vue': () => import('./workflow/eventNode/EventNodePreview.vue'),
    'workflow/commandNode/CommandNodePreview.vue': () => import('./workflow/commandNode/CommandNodePreview.vue'),
    'workflow/viewNode/ViewNodePreview.vue': () => import('./workflow/viewNode/ViewNodePreview.vue'),
    'workflow/gitActionNode/GitActionNodePreview.vue': () => import('./workflow/gitActionNode/GitActionNodePreview.vue'),
    'devtools/codeEditorNode/CodeEditorNodePreview.vue': () => import('./devtools/codeEditorNode/CodeEditorNodePreview.vue'),
    'devtools/webviewNode/WebviewNodePreview.vue': () => import('./devtools/webviewNode/WebviewNodePreview.vue'),
    'devtools/browserNode/BrowserNodePreview.vue': () => import('./devtools/browserNode/BrowserNodePreview.vue'),
    'integration/hookNode/HookNodePreview.vue': () => import('./integration/hookNode/HookNodePreview.vue'),
    'integration/transportNode/TransportNodePreview.vue': () => import('./integration/transportNode/TransportNodePreview.vue'),
    'project/projectNode/ProjectNodePreview.vue': () => import('./project/projectNode/ProjectNodePreview.vue'),
    'project/setupProjectNode/SetupProjectNodePreview.vue': () => import('./project/setupProjectNode/SetupProjectNodePreview.vue'),
    'project/projectExplorer/ProjectExplorerPreview.vue': () => import('./project/projectExplorer/ProjectExplorerPreview.vue'),
    'project/projectEnvironmentNode/ProjectEnvironmentNodePreview.vue': () => import('./project/projectEnvironmentNode/ProjectEnvironmentNodePreview.vue'),
    'project/builditNode/BuilditNodePreview.vue': () => import('./project/builditNode/BuilditNodePreview.vue'),
    'environment/environmentNode/EnvironmentNodePreview.vue': () => import('./environment/environmentNode/EnvironmentNodePreview.vue'),
    'environment/builditCli/BuilditCliPreview.vue': () => import('./environment/builditCli/BuilditCliPreview.vue'),
    'checkers/nodeCheckNode/NodeCheckNodePreview.vue': () => import('./checkers/nodeCheckNode/NodeCheckNodePreview.vue'),
    'checkers/pythonCheckNode/PythonCheckNodePreview.vue': () => import('./checkers/pythonCheckNode/PythonCheckNodePreview.vue'),
    'checkers/phpCheckNode/PhpCheckNodePreview.vue': () => import('./checkers/phpCheckNode/PhpCheckNodePreview.vue'),
    'checkers/rustCheckNode/RustCheckNodePreview.vue': () => import('./checkers/rustCheckNode/RustCheckNodePreview.vue'),
    'checkers/dotnetCheckNode/DotnetCheckNodePreview.vue': () => import('./checkers/dotnetCheckNode/DotnetCheckNodePreview.vue'),
    'checkers/javaCheckNode/JavaCheckNodePreview.vue': () => import('./checkers/javaCheckNode/JavaCheckNodePreview.vue'),
    'checkers/vscodeCheckNode/VscodeCheckNodePreview.vue': () => import('./checkers/vscodeCheckNode/VscodeCheckNodePreview.vue'),
    'checkers/cursorCheckNode/CursorCheckNodePreview.vue': () => import('./checkers/cursorCheckNode/CursorCheckNodePreview.vue'),
    'checkers/visualstudioCheckNode/VisualstudioCheckNodePreview.vue': () => import('./checkers/visualstudioCheckNode/VisualstudioCheckNodePreview.vue'),
    'checkers/intellijCheckNode/IntellijCheckNodePreview.vue': () => import('./checkers/intellijCheckNode/IntellijCheckNodePreview.vue'),
    'checkers/pycharmCheckNode/PycharmCheckNodePreview.vue': () => import('./checkers/pycharmCheckNode/PycharmCheckNodePreview.vue'),
    'checkers/webstormCheckNode/WebstormCheckNodePreview.vue': () => import('./checkers/webstormCheckNode/WebstormCheckNodePreview.vue'),
    'checkers/sublimeCheckNode/SublimeCheckNodePreview.vue': () => import('./checkers/sublimeCheckNode/SublimeCheckNodePreview.vue'),
    'checkers/notepadppCheckNode/NotepadppCheckNodePreview.vue': () => import('./checkers/notepadppCheckNode/NotepadppCheckNodePreview.vue'),
    'checkers/dockerCheckNode/DockerCheckNodePreview.vue': () => import('./checkers/dockerCheckNode/DockerCheckNodePreview.vue'),
    'checkers/gitCheckNode/GitCheckNodePreview.vue': () => import('./checkers/gitCheckNode/GitCheckNodePreview.vue'),
    'project/intentSelection/IntentSelectionPreview.vue': () => import('./project/intentSelection/IntentSelectionPreview.vue'),
    'project/projectToolsSetupNode/ProjectToolsSetupNodePreview.vue': () => import('./project/projectToolsSetupNode/ProjectToolsSetupNodePreview.vue'),
        'project/projectInstallNode/ProjectInstallNodePreview.vue': () => import('./project/projectInstallNode/ProjectInstallNodePreview.vue'),
        'project/projectConfiguredNode/ProjectConfiguredNodePreview.vue': () => import('./project/projectConfiguredNode/ProjectConfiguredNodePreview.vue'),
        'devtools/folderBrowser/FolderBrowserPreview.vue': () => import('./devtools/folderBrowser/FolderBrowserPreview.vue'),
      };

  const fullPath = `${category}/${nodeId}/${fileName}`;
  const loader = nodeMap[fullPath];
  
  if (loader) {
    return defineAsyncComponent({
      loader: loader,
      onError: (error) => {
        console.error(`Failed to load preview component for ${nodeId}:`, error);
      }
    });
  }
  
  console.warn(`No preview component found for node: ${nodeId}, path: ${fullPath}`);
  // Fallback to default preview
  return defineAsyncComponent(() => import("./DefaultNodePreview.vue"));
};
</script>


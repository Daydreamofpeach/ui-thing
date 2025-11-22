import type { Component } from "vue";
// Child nodes
import CodeEditorNode from "@childNodes/CodeEditorNode.vue";

// Import all node components (standard imports using tsconfig path aliases)

import FolderBrowserNode from "@childNodes/FolderBrowserNode.vue";
import IntentSelectionNode from "@childNodes/IntentSelectionNode.vue";

import ProjectExplorerNode from "@childNodes/ProjectExplorerNode.vue";
import ViewportNode from "@childNodes/ViewportNode.vue";
// Basic renderer nodes
import BasicShapesRenderer from "@nodes/BasicShapesRenderer.vue";
// Functional nodes
import BFolderSetupNode from "@nodes/BFolderSetupNode.vue";
import BrowserNode from "@nodes/BrowserNode.vue";
import BuilditCLINode from "@nodes/BuilditCLINode.vue";
import CommandNodeInline from "@nodes/CommandNodeInline.vue";
import DotNetCheckNode from "@nodes/DotNetCheckNode.vue";
import EnvironmentSetupNode from "@nodes/EnvironmentSetupNode.vue";
import EventNodeInline from "@nodes/EventNodeInline.vue";
import FileCreatorNode from "@nodes/FileCreatorNode.vue";
import FormAutomationTemplateNode from "@nodes/FormAutomationTemplateNode.vue";
import FormsPanelNode from "@nodes/FormsPanelNode.vue";
import HookNode from "@nodes/hooks/HookNode.vue";
import JavaCheckNode from "@nodes/JavaCheckNode.vue";
import NodeCheckNode from "@nodes/NodeCheckNode.vue";
import PhpCheckNode from "@nodes/PhpCheckNode.vue";
import ProgrammingIconsRenderer from "@nodes/ProgrammingIconsRenderer.vue";
import ProjectScriptRunnerNode from "@nodes/ProjectScriptRunnerNode.vue";

import PythonCheckNode from "@nodes/PythonCheckNode.vue";
import RustCheckNode from "@nodes/RustCheckNode.vue";
import SaveTemplateNode from "@nodes/SaveTemplateNode.vue";
import SolutionNode from "@nodes/SolutionNode.vue";
import TemplateConfiguredNode from "@nodes/TemplateConfiguredNode.vue";
import TransportNode from "@nodes/TransportNode.vue";
import TransportTemplateNode from "@nodes/TransportTemplateNode.vue";
import { markRaw } from "vue";

/**
 * Composable for managing VueFlow node type registration
 * Centralizes all node type definitions
 */
export function useNodeTypes() {
	/**
	 * Get all registered node types for VueFlow
	 */
	const getNodeTypes = () => {
		return {
			// Basic shapes
			rectangle: markRaw(BasicShapesRenderer as any),
			circle: markRaw(BasicShapesRenderer as any),
			diamond: markRaw(BasicShapesRenderer as any),
			triangle: markRaw(BasicShapesRenderer as any),
			hexagon: markRaw(BasicShapesRenderer as any),

			// Programming icons
			database: markRaw(ProgrammingIconsRenderer as any),
			api: markRaw(ProgrammingIconsRenderer as any),
			server: markRaw(ProgrammingIconsRenderer as any),
			cloud: markRaw(ProgrammingIconsRenderer as any),

			// Functional nodes
			browserNode: markRaw(BrowserNode as any),
			viewportNode: markRaw(ViewportNode as any),
			fileCreatorNode: markRaw(FileCreatorNode as any),
			templateConfiguredNode: markRaw(TemplateConfiguredNode as any),
			formAutomationTemplateNode: markRaw(FormAutomationTemplateNode as any),
			solutionNode: markRaw(SolutionNode as any),
			hookNode: markRaw(HookNode as any),
			transportNode: markRaw(TransportNode as any),
			transportTemplateNode: markRaw(TransportTemplateNode as any),
			projectScriptRunnerNode: markRaw(ProjectScriptRunnerNode as any),
			bFolderSetupNode: markRaw(BFolderSetupNode as any),
			saveTemplateNode: markRaw(SaveTemplateNode as any),
			formsPanelNode: markRaw(FormsPanelNode as any),

			// Environment nodes
			environmentSetupNode: markRaw(EnvironmentSetupNode as any),
			nodeCheckNode: markRaw(NodeCheckNode as any),
			phpCheckNode: markRaw(PhpCheckNode as any),
			rustCheckNode: markRaw(RustCheckNode as any),
			dotnetCheckNode: markRaw(DotNetCheckNode as any),
			pythonCheckNode: markRaw(PythonCheckNode as any),
			javaCheckNode: markRaw(JavaCheckNode as any),
			builditCliNode: markRaw(BuilditCLINode as any),

			// Command and event nodes
			commandNodeInline: markRaw(CommandNodeInline as any),
			eventNodeInline: markRaw(EventNodeInline as any),

			// Additional nodes
			codeEditorNode: markRaw(CodeEditorNode as any),
			intentSelectionNode: markRaw(IntentSelectionNode as any),
			projectExplorerNode: markRaw(ProjectExplorerNode as any),
			folderBrowserNode: markRaw(FolderBrowserNode as any)
		};
	};

	/**
	 * Get node color for minimap based on type
	 */
	const getNodeColor = (nodeType: string): string => {
		const colorMap: Record<string, string> = {
			// Basic shapes - Blue tones
			rectangle: "#3b82f6",
			circle: "#60a5fa",
			diamond: "#93c5fd",
			triangle: "#2563eb",
			hexagon: "#1d4ed8",

			// Programming icons - Various
			database: "#14b8a6",
			api: "#f59e0b",
			server: "#ef4444",
			cloud: "#8b5cf6",

			// Functional nodes - Green/Teal tones
			browserNode: "#10b981",
			viewportNode: "#06b6d4",
			fileCreatorNode: "#84cc16",
			templateConfiguredNode: "#22c55e",
			formAutomationTemplateNode: "#a855f7",
			solutionNode: "#16a34a",
			hookNode: "#eab308",
			transportNode: "#14b8a6",
			transportTemplateNode: "#a855f7",
			projectScriptRunnerNode: "#6366f1",
			bFolderSetupNode: "#a855f7",
			saveTemplateNode: "#ec4899",
			formsPanelNode: "#8b5cf6",

			// Environment nodes - Orange/Yellow tones
			environmentSetupNode: "#f97316",
			nodeCheckNode: "#fb923c",
			phpCheckNode: "#fdba74",
			rustCheckNode: "#f59e0b",
			dotnetCheckNode: "#fbbf24",
			pythonCheckNode: "#fcd34d",
			javaCheckNode: "#fde047",
			builditCliNode: "#facc15",

			// Command and event - Pink/Rose tones
			commandNodeInline: "#ec4899",
			eventNodeInline: "#f43f5e",

			// Additional nodes
			codeEditorNode: "#6366f1",
			intentSelectionNode: "#a855f7",
			projectExplorerNode: "#22c55e",
			folderBrowserNode: "#06b6d4"
		};

		return colorMap[nodeType] || "#6366f1"; // Default to indigo
	};

	return {
		getNodeTypes,
		getNodeColor
	};
}

/**
 * Node Metadata System
 *
 * Provides categorization and metadata for all node types.
 * Works seamlessly with useNodeComponentRegistry for infinite expandability.
 *
 * To add a new node:
 * 1. Register it in useNodeComponentRegistry
 * 2. Add metadata here
 * 3. It automatically appears in the sidebar!
 */

export interface NodeMetadata {
	id: string
	name: string
	icon: string
	category: NodeCategory
	description?: string
	color?: string
}

export type NodeCategory =
	| "shapes"
	| "arrows"
	| "programming"
	| "workflow"
	| "integration"
	| "devtools"
	| "project"
	| "environment"
	| "checkers";

export interface CategoryMetadata {
	id: NodeCategory
	name: string
	icon: string
	description: string
}

// Category definitions
const CATEGORIES: CategoryMetadata[] = [
	{
		id: "shapes",
		name: "Basic Shapes",
		icon: "i-lucide-shapes",
		description: "Geometric shapes for visual design"
	},
	{
		id: "arrows",
		name: "Arrows",
		icon: "i-lucide-arrow-right",
		description: "Directional flow indicators"
	},
	{
		id: "programming",
		name: "Programming",
		icon: "i-lucide-code",
		description: "Database, API, and server nodes"
	},
	{
		id: "workflow",
		name: "Workflow",
		icon: "i-lucide-workflow",
		description: "Events, commands, and actions"
	},
	{
		id: "integration",
		name: "Integration",
		icon: "i-lucide-plug",
		description: "Hooks, transports, and external services"
	},
	{
		id: "devtools",
		name: "Dev Tools",
		icon: "i-lucide-code-2",
		description: "Browsers, editors, and development tools"
	},
	{
		id: "project",
		name: "Project",
		icon: "i-lucide-projector",
		description: "Project setup and configuration"
	},
	{
		id: "environment",
		name: "Environment",
		icon: "i-lucide-terminal",
		description: "Environment detection and CLI tools"
	},
	{
		id: "checkers",
		name: "Language Checkers",
		icon: "i-lucide-check-circle",
		description: "Language and runtime detection"
	}
];

// Node metadata registry
const NODE_METADATA: Record<string, NodeMetadata> = {
	// Programming
	database: {
		id: "database",
		name: "Database",
		icon: "i-lucide-database",
		category: "programming",
		description: "Database node",
		color: "rgba(249, 115, 22, 0.2)"
	},
	api: {
		id: "api",
		name: "API",
		icon: "i-lucide-globe",
		category: "programming",
		description: "API endpoint node",
		color: "rgba(249, 115, 22, 0.2)"
	},
	server: {
		id: "server",
		name: "Server",
		icon: "i-lucide-server",
		category: "programming",
		description: "Server node",
		color: "rgba(249, 115, 22, 0.2)"
	},
	cloud: {
		id: "cloud",
		name: "Cloud",
		icon: "i-lucide-cloud",
		category: "programming",
		description: "Cloud service node",
		color: "rgba(249, 115, 22, 0.2)"
	},

	// Workflow
	eventNode: {
		id: "eventNode",
		name: "Event",
		icon: "i-lucide-zap",
		category: "workflow",
		description: "Event trigger node",
		color: "rgba(249, 115, 22, 0.2)"
	},
	commandNode: {
		id: "commandNode",
		name: "Command",
		icon: "i-lucide-terminal",
		category: "workflow",
		description: "Command execution node",
		color: "rgba(59, 130, 246, 0.2)"
	},
	viewNode: {
		id: "viewNode",
		name: "View",
		icon: "i-lucide-layout-grid",
		category: "workflow",
		description: "View rendering node",
		color: "rgba(34, 197, 94, 0.2)"
	},
	gitActionNode: {
		id: "gitActionNode",
		name: "Git Action",
		icon: "i-lucide-git-branch",
		category: "workflow",
		description: "Git operation node",
		color: "rgba(168, 85, 247, 0.2)"
	},

	// Git Clone Chain nodes
	gitCloneRepositoryNode: {
		id: "gitCloneRepositoryNode",
		name: "Git Clone",
		icon: "i-lucide-git-branch",
		category: "integration",
		description: "Clone Git repositories and manage project setup",
		color: "rgba(249, 115, 22, 0.2)"
	},
	gitCloneRequirementsNode: {
		id: "gitCloneRequirementsNode",
		name: "Git Requirements",
		icon: "i-lucide-list-checks",
		category: "integration",
		description: "Analyze repository structure and dependencies",
		color: "rgba(59, 130, 246, 0.2)"
	},
	gitCloneDependenciesNode: {
		id: "gitCloneDependenciesNode",
		name: "Git Dependencies",
		icon: "i-lucide-package",
		category: "integration",
		description: "Install project dependencies and packages",
		color: "rgba(34, 197, 94, 0.2)"
	},

	// Integration
	hookNode: {
		id: "hookNode",
		name: "Hook",
		icon: "i-lucide-webhook",
		category: "integration",
		description: "Webhook hook node",
		color: "rgba(234, 179, 8, 0.2)"
	},
	transportNode: {
		id: "transportNode",
		name: "Transport",
		icon: "i-lucide-send",
		category: "integration",
		description: "Transport delivery node",
		color: "rgba(6, 182, 212, 0.2)"
	},
	templateNode: {
		id: "templateNode",
		name: "Template",
		icon: "i-lucide-layout-template",
		category: "integration",
		description: "Template node",
		color: "rgba(99, 102, 241, 0.2)"
	},
	solutionNode: {
		id: "solutionNode",
		name: "Solution",
		icon: "i-lucide-puzzle",
		category: "integration",
		description: "Solution node",
		color: "rgba(16, 185, 129, 0.2)"
	},
	githubNode: {
		id: "githubNode",
		name: "GitHub",
		icon: "i-lucide-github",
		category: "integration",
		description: "GitHub integration node",
		color: "rgba(99, 102, 241, 0.2)"
	},

	// Dev Tools
	webviewNode: {
		id: "webviewNode",
		name: "Webview",
		icon: "i-lucide-monitor",
		category: "devtools",
		description: "Web viewer node",
		color: "rgba(99, 102, 241, 0.2)"
	},
	browserNode: {
		id: "browserNode",
		name: "Browser",
		icon: "i-lucide-globe",
		category: "devtools",
		description: "Browser preview node",
		color: "rgba(34, 197, 94, 0.2)"
	},
	codeEditorNode: {
		id: "codeEditorNode",
		name: "Code Editor",
		icon: "i-lucide-code",
		category: "devtools",
		description: "Inline code editor",
		color: "rgba(99, 102, 241, 0.2)"
	},
	folderBrowser: {
		id: "folderBrowser",
		name: "Folder Browser",
		icon: "i-lucide-folder-open",
		category: "devtools",
		description: "File system browser",
		color: "rgba(99, 102, 241, 0.2)"
	},
	projectExplorer: {
		id: "projectExplorer",
		name: "Project Explorer",
		icon: "i-lucide-folder-tree",
		category: "devtools",
		description: "Project structure explorer",
		color: "rgba(99, 102, 241, 0.2)"
	},
	fileCreatorNode: {
		id: "fileCreatorNode",
		name: "File Creator",
		icon: "i-lucide-file-plus",
		category: "devtools",
		description: "Create new files",
		color: "rgba(99, 102, 241, 0.2)"
	},
	formsPanelNode: {
		id: "formsPanelNode",
		name: "Automated Form Generator",
		icon: "i-lucide-file-text",
		category: "devtools",
		description: "Automated form generation and automation panel",
		color: "rgba(139, 92, 246, 0.2)"
	},
	formBuilderNode: {
		id: "formBuilderNode",
		name: "Form Builder",
		icon: "i-lucide-file-edit",
		category: "devtools",
		description: "Visual form builder for creating custom forms",
		color: "rgba(139, 92, 246, 0.2)"
	},
	formAutomationNode: {
		id: "formAutomationNode",
		name: "Form Automation",
		icon: "i-lucide-play-circle",
		category: "devtools",
		description: "Automated form creation demonstration and guidance",
		color: "rgba(34, 197, 94, 0.2)"
	},

	// Project
	projectNode: {
		id: "projectNode",
		name: "Project",
		icon: "i-lucide-folder-kanban",
		category: "project",
		description: "Project management node",
		color: "rgba(59, 130, 246, 0.2)"
	},
	projectConfiguredNode: {
		id: "projectConfiguredNode",
		name: "Project (Configured)",
		icon: "i-lucide-folder-check",
		category: "project",
		description: "Configured project node",
		color: "rgba(59, 130, 246, 0.2)"
	},
	setupProjectNode: {
		id: "setupProjectNode",
		name: "Setup Project",
		icon: "i-lucide-settings",
		category: "project",
		description: "Project setup node",
		color: "rgba(16, 185, 129, 0.2)"
	},
	projectEnvironmentNode: {
		id: "projectEnvironmentNode",
		name: "Project Environment",
		icon: "i-lucide-git-branch",
		category: "project",
		description: "Project environment setup",
		color: "rgba(248, 113, 113, 0.2)"
	},
	projectToolsSetupNode: {
		id: "projectToolsSetupNode",
		name: "Project Tools",
		icon: "i-lucide-wrench",
		category: "project",
		description: "Setup development tools",
		color: "rgba(56, 189, 248, 0.2)"
	},
	projectInstallNode: {
		id: "projectInstallNode",
		name: "Project Install",
		icon: "i-lucide-rocket",
		category: "project",
		description: "Installation configuration",
		color: "rgba(16, 185, 129, 0.2)"
	},
	builditNode: {
		id: "builditNode",
		name: "BuildIt",
		icon: "i-lucide-zap",
		category: "project",
		description: "BuildIt installation runner",
		color: "rgba(249, 115, 22, 0.2)"
	},
	intentSelection: {
		id: "intentSelection",
		name: "Intent Selection",
		icon: "i-lucide-target",
		category: "project",
		description: "Select project intent",
		color: "rgba(168, 85, 247, 0.2)"
	},
	// Environment
	environmentNode: {
		id: "environmentNode",
		name: "Environment",
		icon: "i-lucide-settings",
		category: "environment",
		description: "Environment detector",
		color: "rgba(99, 102, 241, 0.2)"
	},
	"buildit-cli": {
		id: "buildit-cli",
		name: "Buildit CLI",
		icon: "i-lucide-terminal-square",
		category: "environment",
		description: "Buildit CLI node",
		color: "rgba(99, 102, 241, 0.2)"
	},

	// Language Checkers
	rustCheckNode: {
		id: "rustCheckNode",
		name: "Rust Check",
		icon: "i-lucide-wrench",
		category: "checkers",
		description: "Check for Rust",
		color: "rgba(249, 115, 22, 0.2)"
	},
	nodeCheckNode: {
		id: "nodeCheckNode",
		name: "Node Check",
		icon: "i-lucide-hexagon",
		category: "checkers",
		description: "Check for Node.js",
		color: "rgba(34, 197, 94, 0.2)"
	},
	phpCheckNode: {
		id: "phpCheckNode",
		name: "PHP Check",
		icon: "i-lucide-code",
		category: "checkers",
		description: "Check for PHP",
		color: "rgba(168, 85, 247, 0.2)"
	},
	dotnetCheckNode: {
		id: "dotnetCheckNode",
		name: ".NET Check",
		icon: "i-lucide-box",
		category: "checkers",
		description: "Check for .NET",
		color: "rgba(59, 130, 246, 0.2)"
	},
	pythonCheckNode: {
		id: "pythonCheckNode",
		name: "Python Check",
		icon: "i-lucide-braces",
		category: "checkers",
		description: "Check for Python",
		color: "rgba(234, 179, 8, 0.2)"
	},
	javaCheckNode: {
		id: "javaCheckNode",
		name: "Java Check",
		icon: "i-lucide-cup-soda",
		category: "checkers",
		description: "Check for Java",
		color: "rgba(239, 68, 68, 0.2)"
	},
	// App/IDE Checkers
	vscodeCheckNode: {
		id: "vscodeCheckNode",
		name: "VS Code Check",
		icon: "i-lucide-code-2",
		category: "checkers",
		description: "Check for Visual Studio Code",
		color: "rgba(0, 122, 204, 0.2)"
	},
	cursorCheckNode: {
		id: "cursorCheckNode",
		name: "Cursor Check",
		icon: "i-lucide-code-2",
		category: "checkers",
		description: "Check for Cursor",
		color: "rgba(0, 0, 0, 0.2)"
	},
	visualstudioCheckNode: {
		id: "visualstudioCheckNode",
		name: "Visual Studio Check",
		icon: "i-lucide-code-2",
		category: "checkers",
		description: "Check for Visual Studio",
		color: "rgba(92, 45, 145, 0.2)"
	},
	intellijCheckNode: {
		id: "intellijCheckNode",
		name: "IntelliJ Check",
		icon: "i-lucide-code-2",
		category: "checkers",
		description: "Check for IntelliJ IDEA",
		color: "rgba(169, 123, 255, 0.2)"
	},
	pycharmCheckNode: {
		id: "pycharmCheckNode",
		name: "PyCharm Check",
		icon: "i-lucide-code-2",
		category: "checkers",
		description: "Check for PyCharm",
		color: "rgba(33, 215, 137, 0.2)"
	},
	webstormCheckNode: {
		id: "webstormCheckNode",
		name: "WebStorm Check",
		icon: "i-lucide-code-2",
		category: "checkers",
		description: "Check for WebStorm",
		color: "rgba(0, 188, 212, 0.2)"
	},
	sublimeCheckNode: {
		id: "sublimeCheckNode",
		name: "Sublime Check",
		icon: "i-lucide-code-2",
		category: "checkers",
		description: "Check for Sublime Text",
		color: "rgba(255, 152, 0, 0.2)"
	},
	notepadppCheckNode: {
		id: "notepadppCheckNode",
		name: "Notepad++ Check",
		icon: "i-lucide-code-2",
		category: "checkers",
		description: "Check for Notepad++",
		color: "rgba(144, 229, 154, 0.2)"
	},
	dockerCheckNode: {
		id: "dockerCheckNode",
		name: "Docker Check",
		icon: "i-lucide-box",
		category: "checkers",
		description: "Check for Docker",
		color: "rgba(36, 150, 237, 0.2)"
	},
	gitCheckNode: {
		id: "gitCheckNode",
		name: "Git Check",
		icon: "i-lucide-git-branch",
		category: "checkers",
		description: "Check for Git",
		color: "rgba(240, 80, 50, 0.2)"
	},

	// Additional Management Nodes
	userManagementNode: {
		id: "userManagementNode",
		name: "User Management",
		icon: "i-lucide-users",
		category: "workflow",
		description: "Manage users and permissions",
		color: "rgba(192, 132, 252, 0.2)"
	},
	taskNode: {
		id: "taskNode",
		name: "Task",
		icon: "i-lucide-check-square",
		category: "workflow",
		description: "Task management node",
		color: "rgba(251, 191, 36, 0.2)"
	},
	orbitCardNode: {
		id: "orbitCardNode",
		name: "Orbit",
		icon: "i-lucide-orbit",
		category: "workflow",
		description: "Orbit visualization node",
		color: "rgba(251, 191, 36, 0.2)"
	},
	integrationConnectionNode: {
		id: "integrationConnectionNode",
		name: "Integration Connection",
		icon: "i-lucide-plug-zap",
		category: "integration",
		description: "Connect external integrations",
		color: "rgba(99, 102, 241, 0.2)"
	},
	integrationDetailNode: {
		id: "integrationDetailNode",
		name: "Integration Details",
		icon: "i-lucide-info",
		category: "integration",
		description: "Integration configuration details",
		color: "rgba(99, 102, 241, 0.2)"
	},
	ideStatusNode: {
		id: "ideStatusNode",
		name: "IDE Status",
		icon: "i-lucide-code-2",
		category: "devtools",
		description: "IDE connection status",
		color: "rgba(139, 92, 246, 0.2)"
	}
};

export function useNodeMetadata() {
	/**
	 * Get metadata for a specific node type
	 */
	const getNodeMetadata = (nodeType: string): NodeMetadata | null => {
		return NODE_METADATA[nodeType] || null;
	};

	/**
	 * Get all node metadata
	 */
	const getAllNodeMetadata = (): NodeMetadata[] => {
		return Object.values(NODE_METADATA);
	};

	/**
	 * Get nodes by category
	 */
	const getNodesByCategory = (category: NodeCategory): NodeMetadata[] => {
		return Object.values(NODE_METADATA).filter((node) => node.category === category);
	};

	/**
	 * Get all categories
	 */
	const getCategories = (): CategoryMetadata[] => {
		return CATEGORIES;
	};

	/**
	 * Get category metadata
	 */
	const getCategoryMetadata = (categoryId: NodeCategory): CategoryMetadata | null => {
		return CATEGORIES.find((cat) => cat.id === categoryId) || null;
	};

	/**
	 * Register new node metadata dynamically
	 * Useful for plugins or runtime node registration
	 */
	const registerNodeMetadata = (metadata: NodeMetadata) => {
		NODE_METADATA[metadata.id] = metadata;
		console.log(`✅ Registered node metadata: ${metadata.id}`);
	};

	/**
	 * Check if node metadata exists
	 */
	const hasNodeMetadata = (nodeType: string): boolean => {
		return nodeType in NODE_METADATA;
	};

	return {
		getNodeMetadata,
		getAllNodeMetadata,
		getNodesByCategory,
		getCategories,
		getCategoryMetadata,
		registerNodeMetadata,
		hasNodeMetadata
	};
}

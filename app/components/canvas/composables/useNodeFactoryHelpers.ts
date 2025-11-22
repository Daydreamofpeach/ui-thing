/**
 * Composable providing helper functions for creating specific node types
 * These are wrapper functions around the main createNode function from useCanvasNodes
 */
export function useNodeFactoryHelpers(
	createNode: (nodeType: string, data: any) => any,
	addNodes: (nodes: any[]) => void
) {
	const addGitHubNode = () => {
		const nodeData = {
			id: `github-${Date.now()}`,
			label: "GitHub Repository",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("githubNode", nodeData);
		addNodes([newNode]);
	};

	const addCodeEditorNode = () => {
		const nodeData = {
			id: `code-editor-${Date.now()}`,
			label: "Code Editor Node",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("codeEditorNode", nodeData);
		addNodes([newNode]);
	};

	const addFolderBrowserNode = () => {
		const nodeData = {
			id: `folder-browser-${Date.now()}`,
			label: "Folder Browser",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("folderBrowser", nodeData);
		addNodes([newNode]);
	};

	const addIntentSelectionNode = () => {
		const nodeData = {
			id: `intent-selection-${Date.now()}`,
			label: "Intent Selection",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("intentSelection", nodeData);
		addNodes([newNode]);
	};

	const addProjectExplorerNode = () => {
		const nodeData = {
			id: `project-explorer-${Date.now()}`,
			label: "Project Explorer",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("projectExplorer", nodeData);
		addNodes([newNode]);
	};

	const addEnvironmentNode = () => {
		const nodeData = {
			id: `environment-${Date.now()}`,
			label: "Environment Node",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("environmentNode", nodeData);
		addNodes([newNode]);
	};

	const addBuilditCliNode = () => {
		const nodeData = {
			id: `buildit-cli-${Date.now()}`,
			label: "Buildit CLI",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("buildit-cli", nodeData);
		addNodes([newNode]);
	};

	const addRustCheckNode = () => {
		const nodeData = {
			id: `rust-check-${Date.now()}`,
			label: "Rust Check",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("rustCheckNode", nodeData);
		addNodes([newNode]);
	};

	const addNodeCheckNode = () => {
		const nodeData = {
			id: `node-check-${Date.now()}`,
			label: "Node Check",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("nodeCheckNode", nodeData);
		addNodes([newNode]);
	};

	const addPhpCheckNode = () => {
		const nodeData = {
			id: `php-check-${Date.now()}`,
			label: "PHP Check",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("phpCheckNode", nodeData);
		addNodes([newNode]);
	};

	const addDotnetCheckNode = () => {
		const nodeData = {
			id: `dotnet-check-${Date.now()}`,
			label: ".NET Check",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("dotnetCheckNode", nodeData);
		addNodes([newNode]);
	};

	const addPythonCheckNode = () => {
		const nodeData = {
			id: `python-check-${Date.now()}`,
			label: "Python Check",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("pythonCheckNode", nodeData);
		addNodes([newNode]);
	};

	const addJavaCheckNode = () => {
		const nodeData = {
			id: `java-check-${Date.now()}`,
			label: "Java Check",
			position: { x: Math.random() * 400, y: Math.random() * 400 }
		};
		const newNode = createNode("javaCheckNode", nodeData);
		addNodes([newNode]);
	};

	/**
	 * Centralized node creator map
	 */
	const getNodeCreators = () => {
		return {
			githubNode: addGitHubNode,
			codeEditorNode: addCodeEditorNode,
			folderBrowser: addFolderBrowserNode,
			intentSelection: addIntentSelectionNode,
			projectExplorer: addProjectExplorerNode,
			environmentNode: addEnvironmentNode,
			"buildit-cli": addBuilditCliNode,
			rustCheckNode: addRustCheckNode,
			nodeCheckNode: addNodeCheckNode,
			phpCheckNode: addPhpCheckNode,
			dotnetCheckNode: addDotnetCheckNode,
			pythonCheckNode: addPythonCheckNode,
			javaCheckNode: addJavaCheckNode
			// Note: projectNode, userManagementNode, orbitCardNode, and solutionNode are in useCanvasNodes
		};
	};

	return {
		addGitHubNode,
		addCodeEditorNode,
		addFolderBrowserNode,
		addIntentSelectionNode,
		addProjectExplorerNode,
		addEnvironmentNode,
		addBuilditCliNode,
		addRustCheckNode,
		addNodeCheckNode,
		addPhpCheckNode,
		addDotnetCheckNode,
		addPythonCheckNode,
		addJavaCheckNode,
		getNodeCreators
	};
}


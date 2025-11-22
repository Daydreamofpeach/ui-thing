import { useNodePositioning } from "./useNodePositioning";

interface NodeData {
	label?: string
	position?: { x: number, y: number }
	id?: string
	[key: string]: any
}

interface NodeStyle {
	width?: string
	height?: string
}

// Create a singleton instance for positioning
const positioningInstance = useNodePositioning();

export const useNodeFactory = () => {
	const createNode = (type: string, data: NodeData = {}, existingNodes: any[] = []) => {
		// Use provided id or generate a new one
		const nodeId = data.id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Use provided position or get smart position
		let position;
		if (data.position) {
			// Use exact position if provided (e.g., when loading from saved canvas)
			position = data.position;
		} else {
			// Get non-overlapping position for new nodes
			position = positioningInstance.getNonOverlappingPosition(existingNodes);
		}

		return {
			id: nodeId,
			type,
			position,
			data: {
				label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
				...data
			},
			draggable: true,
			selectable: true,
			resizable: true,
			style: {} as any
		};
	};

	// Node templates with default data and styles
	const nodeTemplates: Record<string, { data: NodeData, style: NodeStyle }> = {
		arrowRight: {
			data: { text: "Right Arrow", direction: "right" },
			style: { width: "120px", height: "60px" }
		},
		arrowLeft: {
			data: { text: "Left Arrow", direction: "left" },
			style: { width: "120px", height: "60px" }
		},
		arrowUp: {
			data: { text: "Up Arrow", direction: "up" },
			style: { width: "60px", height: "120px" }
		},
		arrowDown: {
			data: { text: "Down Arrow", direction: "down" },
			style: { width: "60px", height: "120px" }
		},
		database: {
			data: { text: "Database", icon: "🗄️" },
			style: { width: "100px", height: "120px" }
		},
		api: {
			data: { text: "API", icon: "🔌" },
			style: { width: "100px", height: "80px" }
		},
		server: {
			data: { text: "Server", icon: "🖥️" },
			style: { width: "100px", height: "80px" }
		},
		cloud: {
			data: { text: "Cloud", icon: "☁️" },
			style: { width: "120px", height: "80px" }
		},
		eventNode: {
			data: { label: "Event Node", eventName: null, trigger: "Manual", status: "inactive" },
			style: { width: "200px", height: "120px" }
		},
		commandNode: {
			data: { label: "Command Node", commandName: null, commandType: "PowerShell", status: "inactive" },
			style: { width: "200px", height: "120px" }
		},
		viewNode: {
			data: { label: "View Node", viewType: null, format: "Output", status: "inactive" },
			style: { width: "200px", height: "120px" }
		},
		gitActionNode: {
			data: { label: "Git Action Node", gitCommand: null, repository: "Current", status: "inactive" },
			style: { width: "200px", height: "120px" }
		},
		hookNode: {
			data: {
				label: "Hook Node",
				hookType: "BUTT",
				hookPriority: "normal",
				hookEnabled: true,
				hookId: null,
				hookName: null,
				hookToken: null,
				hookTrigger: null,
				hookDescription: null
			},
			style: { width: "600px", height: "650px" }
		},
		transportNode: {
			data: { label: "Transport Node", transportType: "http", endpoint: "/api/transport" },
			style: { width: "600px", height: "650px" }
		},
		transportTemplateNode: {
			data: { label: "Transport Template", templateType: "Email", templateName: "Email Template" },
			style: { width: "500px", height: "600px" }
		},
		templateNode: {
			data: { label: "Template Node", templateType: "component", templateName: "MyTemplate" },
			style: {}
		},
		solutionNode: {
			data: { label: "Solution Node", solutionType: "feature", solutionName: "MySolution", status: "inactive" },
			style: {}
		},
		webviewNode: {
			data: {
				label: "Web Preview",
				htmlContent: "<!DOCTYPE html>\n<html>\n<head>\n    <title>Web Preview</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n    <p>This is a web preview node.</p>\n</body>\n</html>",
				fileName: "preview.html",
				url: "https://buildit.builders/",
				status: "loading"
			},
			style: { width: "400px", height: "300px" }
		},
		browserNode: {
			data: {
				label: "Browser Node",
				url: "https://buildit.builders/",
				status: "loading"
			},
			style: { width: "700px", height: "600px" }
		},
		fileCreatorNode: {
			data: {
				label: "File Creator",
				fileType: "text",
				fileName: "",
				fileContent: "Hello, World!",
				baseDirectory: "document",
				status: "idle"
			},
			style: { width: "300px", height: "400px" }
		},
		formsPanelNode: {
			data: {
				label: "Forms Panel",
				generatedForms: [],
				selectedForm: null,
				lastAction: null,
				status: "active"
			},
			style: { width: "900px", height: "800px" }
		},
		formBuilderNode: {
			data: {
				label: "Form Builder",
				status: "active"
			},
			style: { width: "900px", height: "800px" }
		},
		projectScriptRunnerNode: {
			data: {
				label: "Project Script Runner",
				projectPath: "",
				status: "idle"
			},
			style: { width: "600px", height: "700px" }
		},
		bFolderSetupNode: {
			data: {
				label: "B Folder Setup",
				projectPath: "",
				status: "idle",
				detectedEnvironment: {},
				bFolderPath: ""
			},
			style: { width: "600px", height: "1100px" }
		},
		saveTemplateNode: {
			data: {
				label: "Save Template",
				templateId: "",
				templateName: "",
				status: "idle",
				hasBJson: false,
				hasBlJson: false,
				hasNodeChain: false
			},
			style: { width: "500px", height: "400px" }
		},
		templateConfiguredNode: {
			data: {
				label: "Configured Template",
				templateId: "",
				templateName: "",
				chainNodeCount: 0,
				edgeCount: 0,
				scriptCount: 0,
				toolCount: 0,
				status: "configured"
			},
			style: { width: "650px", height: "600px" }
		},
		viewportNode: {
			data: {
				label: "Viewport",
				url: "",
				viewportType: "desktop",
				status: "ready"
			},
			style: { width: "1920px", height: "1180px" }
		},
		userNode: {
			data: {
				label: "User",
				id: "",
				name: "User",
				email: "",
				role: "",
				status: "idle",
				nodeType: "userNode",
				userData: null,
				fields: [],
				lastResult: null,
				lastError: null
			},
			style: { width: "300px", height: "400px" }
		},
		orbitCardNode: {
			data: {
				label: "Task",
				id: "",
				name: "Task",
				description: "",
				status: "pending",
				priority: "medium",
				nodeType: "orbitCardNode",
				taskData: null,
				orbitTimelineData: [],
				fields: [],
				lastResult: null,
				lastError: null
			},
			style: { width: "400px", height: "500px" }
		},
		projectNode: {
			data: {
				label: "New Project",
				id: "",
				projectName: "",
				description: "",
				status: "planning",
				nodeType: "projectNode",
				assignedUsers: [],
				tasks: [],
				projectId: null
			},
			style: { width: "350px", height: "280px" }
		},
		setupProjectNode: {
			data: {
			label: "Integration Setup",
				id: "",
				projectId: "",
				projectName: "",
				nodeType: "setupProjectNode",
				currentStep: "step1",
				selectedRepository: null
			},
			style: { width: "600px", height: "700px" }
		},
		projectEnvironmentNode: {
			data: {
				label: "Project Environment",
				id: "",
				projectName: "",
				nodeType: "projectEnvironmentNode",
				connectedIde: null,
				repositories: [],
				createdAt: new Date().toISOString()
			},
			style: { width: "550px", height: "500px" }
		},
	projectInstallNode: {
		data: {
			label: "Project Install",
			id: "",
			projectId: null,
			projectName: "",
			nodeType: "projectInstallNode",
			savedEnvironmentSetup: null
		},
		style: { width: "580px", height: "460px" }
	},
	builditNode: {
		data: {
			label: "Buildit",
			id: "",
			projectId: null,
			projectName: "",
			nodeType: "builditNode",
			savedEnvironmentSetup: null
		},
		style: { width: "420px", height: "280px" }
	},
		userManagementNode: {
			data: {
				label: "New User",
				id: "",
				userName: "",
				email: "",
				role: "member",
				nodeType: "userManagementNode",
				assignedProjects: [],
				assignedTasks: [],
				userId: null
			},
			style: { width: "320px", height: "260px" }
		},
		ideStatusNode: {
			data: {
				label: "IDE Status Check",
				id: "",
				nodeType: "ideStatusNode",
				status: "checking",
				ideList: []
			},
			style: { width: "700px", height: "600px" }
		}
	};

	const createNodeFromTemplate = (type: string, additionalData: NodeData = {}, existingNodes: any[] = []) => {
		const template = nodeTemplates[type];
		if (!template) {
			console.warn(`No template found for node type: ${type}`);
			return createNode(type, additionalData, existingNodes);
		}

		const node = createNode(type, { ...template.data, ...additionalData }, existingNodes);
		node.style = template.style;
		return node;
	};

	const resetPositioning = () => {
		positioningInstance.resetPositioning();
	};

	const syncWithExistingNodes = (nodes: any[]) => {
		positioningInstance.syncWithExistingNodes(nodes);
	};

	return {
		createNode,
		createNodeFromTemplate,
		nodeTemplates,
		resetPositioning,
		syncWithExistingNodes
	};
};

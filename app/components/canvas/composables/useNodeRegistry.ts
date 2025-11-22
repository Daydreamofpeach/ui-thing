import { computed, ref } from "vue";

export interface NodeCategory {
	id: string
	name: string
	icon: string
	description: string
	collapsed?: boolean
}

export interface NodeType {
	id: string
	name: string
	description: string
	icon: string
	category: string
	component: any
	defaultData: any
	color: string
}

export const NODE_CATEGORIES: NodeCategory[] = [
	{
		id: "shapes",
		name: "Basic Shapes",
		icon: "lucide:shapes",
		description: "Basic geometric shapes and containers",
		collapsed: false
	},
	{
		id: "connections",
		name: "Connections",
		icon: "lucide:link",
		description: "Arrows, lines, and connection elements",
		collapsed: false
	},
	{
		id: "text",
		name: "Text & Labels",
		icon: "lucide:type",
		description: "Text elements and annotations",
		collapsed: false
	},
	{
		id: "flowchart",
		name: "Flowchart",
		icon: "lucide:git-branch",
		description: "Flowchart and process diagram elements",
		collapsed: false
	},
	{
		id: "uml",
		name: "UML",
		icon: "lucide:layers",
		description: "UML diagram elements",
		collapsed: true
	},
	{
		id: "org-chart",
		name: "Org Chart",
		icon: "lucide:users",
		description: "Organizational chart elements",
		collapsed: true
	},
	{
		id: "specialized",
		name: "Specialized",
		icon: "lucide:zap",
		description: "Hook, transport, and template nodes",
		collapsed: false
	}
];

export const NODE_TYPES: NodeType[] = [
	// Connections
	{
		id: "arrow",
		name: "Arrow",
		description: "Directional arrow",
		icon: "lucide:arrow-right",
		category: "connections",
		component: null,
		defaultData: {
			text: "Arrow",
			width: 100,
			height: 20,
			strokeColor: "#000000",
			strokeWidth: 2,
			opacity: 1,
			arrowType: "simple"
		},
		color: "#3b82f6"
	},
	{
		id: "curve",
		name: "Curve",
		description: "Curved line",
		icon: "lucide:curve",
		category: "connections",
		component: null,
		defaultData: {
			text: "Curve",
			width: 100,
			height: 40,
			strokeColor: "#000000",
			strokeWidth: 2,
			opacity: 1,
			curveType: "bezier"
		},
		color: "#3b82f6"
	},

	// Text
	{
		id: "text",
		name: "Text",
		description: "Text label",
		icon: "lucide:type",
		category: "text",
		component: null,
		defaultData: {
			text: "Text",
			width: 120,
			height: 40,
			fontSize: 14,
			fontFamily: "Arial, sans-serif",
			fontWeight: "normal",
			fontStyle: "normal",
			textAlign: "center",
			color: "#000000",
			backgroundColor: "transparent",
			opacity: 1
		},
		color: "#10b981"
	},
	{
		id: "heading",
		name: "Heading",
		description: "Large text heading",
		icon: "lucide:heading",
		category: "text",
		component: null,
		defaultData: {
			text: "Heading",
			width: 150,
			height: 50,
			fontSize: 18,
			fontFamily: "Arial, sans-serif",
			fontWeight: "bold",
			fontStyle: "normal",
			textAlign: "center",
			color: "#000000",
			backgroundColor: "transparent",
			opacity: 1
		},
		color: "#10b981"
	},

	// Flowchart
	{
		id: "process",
		name: "Process",
		description: "Process step",
		icon: "lucide:square",
		category: "flowchart",
		component: null,
		defaultData: {
			text: "Process",
			width: 120,
			height: 60,
			fillColor: "#e3f2fd",
			strokeColor: "#1976d2",
			strokeWidth: 2,
			opacity: 1
		},
		color: "#1976d2"
	},
	{
		id: "decision",
		name: "Decision",
		description: "Decision point",
		icon: "lucide:git-branch",
		category: "flowchart",
		component: null,
		defaultData: {
			text: "Decision",
			width: 100,
			height: 100,
			fillColor: "#fff3e0",
			strokeColor: "#f57c00",
			strokeWidth: 2,
			opacity: 1
		},
		color: "#f57c00"
	},
	{
		id: "start-end",
		name: "Start/End",
		description: "Start or end point",
		icon: "lucide:circle",
		category: "flowchart",
		component: null,
		defaultData: {
			text: "Start",
			width: 80,
			height: 80,
			fillColor: "#e8f5e8",
			strokeColor: "#4caf50",
			strokeWidth: 2,
			opacity: 1
		},
		color: "#4caf50"
	},

	// Specialized
	{
		id: "hook",
		name: "Hook Node",
		description: "Event hook node",
		icon: "lucide:hook",
		category: "specialized",
		component: null,
		defaultData: {
			text: "Hook",
			width: 200,
			height: 100,
			fillColor: "#f0f9ff",
			strokeColor: "#10b981",
			strokeWidth: 2,
			opacity: 1,
			hookType: "before",
			eventName: "example-event"
		},
		color: "#10b981"
	},
	{
		id: "transport",
		name: "Transport Node",
		description: "Data transport node",
		icon: "lucide:truck",
		category: "specialized",
		component: null,
		defaultData: {
			text: "Transport",
			width: 200,
			height: 100,
			fillColor: "#fef3f2",
			strokeColor: "#3b82f6",
			strokeWidth: 2,
			opacity: 1,
			transportType: "http",
			endpoint: "https://api.example.com"
		},
		color: "#3b82f6"
	},
	{
		id: "template",
		name: "Template Node",
		description: "Template processing node",
		icon: "lucide:layout-template",
		category: "specialized",
		component: null,
		defaultData: {
			text: "Template",
			width: 200,
			height: 100,
			fillColor: "#faf5ff",
			strokeColor: "#8b5cf6",
			strokeWidth: 2,
			opacity: 1,
			templateType: "handlebars",
			template: "Hello {{name}}!"
		},
		color: "#8b5cf6"
	},
	{
		id: "connection-link",
		name: "Connection Link",
		description: "Connection management node",
		icon: "lucide:link",
		category: "specialized",
		component: null,
		defaultData: {
			text: "Connection",
			width: 200,
			height: 100,
			fillColor: "#fffbeb",
			strokeColor: "#f59e0b",
			strokeWidth: 2,
			opacity: 1,
			connectionType: "data-flow",
			maxConnections: 10
		},
		color: "#f59e0b"
	},
	{
		id: "buildit-cli",
		name: "Buildit CLI",
		description: "Buildit CLI installation and management node",
		icon: "lucide:terminal",
		category: "specialized",
		component: null,
		defaultData: {
			text: "Buildit CLI",
			width: 400,
			height: 300,
			fillColor: "rgba(17, 24, 39, 0.95)",
			strokeColor: "rgba(59, 130, 246, 0.5)",
			strokeWidth: 2,
			opacity: 1,
			cliInstalled: false,
			cliVersion: null
		},
		color: "#3b82f6"
	}
];

export function useNodeRegistry() {
	const categories = ref<NodeCategory[]>([...NODE_CATEGORIES]);
	const nodeTypes = ref<NodeType[]>([...NODE_TYPES]);
	const selectedCategory = ref<string>("shapes");

	const getNodeType = (id: string) => {
		return nodeTypes.value.find((type) => type.id === id);
	};

	const getNodeTypesByCategory = (categoryId: string) => {
		return nodeTypes.value.filter((type) => type.category === categoryId);
	};

	const getCategory = (id: string) => {
		return categories.value.find((category) => category.id === id);
	};

	const toggleCategory = (categoryId: string) => {
		const category = getCategory(categoryId);
		if (category) {
			category.collapsed = !category.collapsed;
		}
	};

	const addNodeType = (nodeType: Omit<NodeType, "id">) => {
		const newType: NodeType = {
			...nodeType,
			id: `custom_${Date.now()}`
		};
		nodeTypes.value.push(newType);
		return newType;
	};

	const removeNodeType = (id: string) => {
		const index = nodeTypes.value.findIndex((type) => type.id === id);
		if (index > -1) {
			nodeTypes.value.splice(index, 1);
		}
	};

	const updateNodeType = (id: string, updates: Partial<NodeType>) => {
		const index = nodeTypes.value.findIndex((type) => type.id === id);
		if (index > -1 && nodeTypes.value[index]) {
			Object.assign(nodeTypes.value[index], updates);
		}
	};

	const createNode = (typeId: string, position: { x: number, y: number }, customData?: any) => {
		const nodeType = getNodeType(typeId);
		if (!nodeType) return null;

		const nodeId = `${typeId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		return {
			id: nodeId,
			type: typeId,
			position,
			data: {
				...nodeType.defaultData,
				...customData,
				id: nodeId,
				type: typeId
			},
			draggable: true,
			selectable: true
		};
	};

	const getNodeComponent = (typeId: string) => {
		const nodeType = getNodeType(typeId);
		return nodeType?.component || null;
	};

	const setNodeComponent = (typeId: string, component: any) => {
		const nodeType = getNodeType(typeId);
		if (nodeType) {
			nodeType.component = component;
		}
	};

	const getNodeTypesForCanvas = (canvasType: "main" | "hook") => {
		if (canvasType === "hook") {
			return nodeTypes.value.filter((type) =>
				type.category === "specialized"
				|| type.category === "shapes"
				|| type.category === "connections"
				|| type.category === "text"
			);
		}
		return nodeTypes.value;
	};

	return {
		categories,
		nodeTypes,
		selectedCategory,
		getNodeType,
		getNodeTypesByCategory,
		getCategory,
		toggleCategory,
		addNodeType,
		removeNodeType,
		updateNodeType,
		createNode,
		getNodeComponent,
		setNodeComponent,
		getNodeTypesForCanvas
	};
}

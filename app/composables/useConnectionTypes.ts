import { ref, computed } from "vue";

export interface ConnectionType {
	id: string;
	name: string;
	description: string;
	color: string;
	icon: string;
	style: {
		strokeWidth: number;
		strokeDasharray?: string;
		markerEnd?: string;
		markerStart?: string;
	};
	allowedFrom: string[];
	allowedTo: string[];
	validation?: (source: any, target: any) => boolean;
}

export const CONNECTION_TYPES: ConnectionType[] = [
	{
		id: "data-flow",
		name: "Data Flow",
		description: "Standard data flow connection",
		color: "#3b82f6",
		icon: "lucide:arrow-right",
		style: {
			strokeWidth: 2,
			markerEnd: "url(#arrowhead)"
		},
		allowedFrom: ["hook", "transport", "template"],
		allowedTo: ["transport", "template", "connectionLink"]
	},
	{
		id: "event-trigger",
		name: "Event Trigger",
		description: "Event-based trigger connection",
		color: "#10b981",
		icon: "lucide:zap",
		style: {
			strokeWidth: 2,
			strokeDasharray: "5,5",
			markerEnd: "url(#arrowhead)"
		},
		allowedFrom: ["hook"],
		allowedTo: ["transport", "template"]
	},
	{
		id: "error-handling",
		name: "Error Handling",
		description: "Error handling and fallback connection",
		color: "#ef4444",
		icon: "lucide:alert-triangle",
		style: {
			strokeWidth: 2,
			strokeDasharray: "10,5",
			markerEnd: "url(#arrowhead)"
		},
		allowedFrom: ["transport", "template"],
		allowedTo: ["transport", "template", "connectionLink"]
	},
	{
		id: "conditional",
		name: "Conditional",
		description: "Conditional logic connection",
		color: "#f59e0b",
		icon: "lucide:git-branch",
		style: {
			strokeWidth: 2,
			strokeDasharray: "3,3",
			markerEnd: "url(#arrowhead)"
		},
		allowedFrom: ["hook", "transport"],
		allowedTo: ["transport", "template"]
	},
	{
		id: "bidirectional",
		name: "Bidirectional",
		description: "Two-way data exchange",
		color: "#8b5cf6",
		icon: "lucide:arrow-left-right",
		style: {
			strokeWidth: 2,
			markerEnd: "url(#arrowhead)",
			markerStart: "url(#arrowhead-reverse)"
		},
		allowedFrom: ["transport", "template"],
		allowedTo: ["transport", "template"]
	},
	{
		id: "async",
		name: "Async",
		description: "Asynchronous processing connection",
		color: "#06b6d4",
		icon: "lucide:clock",
		style: {
			strokeWidth: 2,
			strokeDasharray: "15,5",
			markerEnd: "url(#arrowhead)"
		},
		allowedFrom: ["hook", "transport"],
		allowedTo: ["transport", "template"]
	},
	{
		id: "sync",
		name: "Synchronous",
		description: "Synchronous processing connection",
		color: "#84cc16",
		icon: "lucide:check-circle",
		style: {
			strokeWidth: 3,
			markerEnd: "url(#arrowhead)"
		},
		allowedFrom: ["hook", "transport"],
		allowedTo: ["transport", "template"]
	},
	{
		id: "broadcast",
		name: "Broadcast",
		description: "One-to-many broadcast connection",
		color: "#f97316",
		icon: "lucide:radio",
		style: {
			strokeWidth: 2,
			strokeDasharray: "20,10",
			markerEnd: "url(#arrowhead)"
		},
		allowedFrom: ["hook", "transport"],
		allowedTo: ["transport", "template", "connectionLink"]
	}
];

export function useConnectionTypes() {
	const selectedConnectionType = ref<ConnectionType>(CONNECTION_TYPES[0]);
	const availableTypes = ref<ConnectionType[]>(CONNECTION_TYPES);

	const getConnectionType = (id: string) => {
		return availableTypes.value.find(type => type.id === id) || CONNECTION_TYPES[0];
	};

	const getConnectionTypesForNode = (nodeType: string, direction: 'from' | 'to') => {
		if (direction === 'from') {
			return availableTypes.value.filter(type => 
				type.allowedFrom.includes(nodeType)
			);
		} else {
			return availableTypes.value.filter(type => 
				type.allowedTo.includes(nodeType)
			);
		}
	};

	const validateConnection = (sourceType: string, targetType: string, connectionTypeId: string) => {
		const connectionType = getConnectionType(connectionTypeId);
		
		// Check if connection type allows this source-target combination
		const isAllowed = connectionType.allowedFrom.includes(sourceType) && 
						  connectionType.allowedTo.includes(targetType);
		
		if (!isAllowed) return false;
		
		// Run custom validation if provided
		if (connectionType.validation) {
			return connectionType.validation(sourceType, targetType);
		}
		
		return true;
	};

	const createConnectionStyle = (connectionTypeId: string) => {
		const connectionType = getConnectionType(connectionTypeId);
		return {
			stroke: connectionType.color,
			...connectionType.style
		};
	};

	const addCustomConnectionType = (connectionType: Omit<ConnectionType, 'id'>) => {
		const newType: ConnectionType = {
			...connectionType,
			id: `custom_${Date.now()}`
		};
		availableTypes.value.push(newType);
		return newType;
	};

	const removeConnectionType = (id: string) => {
		const index = availableTypes.value.findIndex(type => type.id === id);
		if (index > -1 && !CONNECTION_TYPES.find(type => type.id === id)) {
			availableTypes.value.splice(index, 1);
		}
	};

	const updateConnectionType = (id: string, updates: Partial<ConnectionType>) => {
		const index = availableTypes.value.findIndex(type => type.id === id);
		if (index > -1) {
			availableTypes.value[index] = { ...availableTypes.value[index], ...updates };
		}
	};

	return {
		selectedConnectionType,
		availableTypes,
		getConnectionType,
		getConnectionTypesForNode,
		validateConnection,
		createConnectionStyle,
		addCustomConnectionType,
		removeConnectionType,
		updateConnectionType
	};
}

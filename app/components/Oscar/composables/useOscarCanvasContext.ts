import { computed, ref } from "vue";

/**
 * Composable for managing Oscar's canvas context
 * Provides canvas data to Oscar for intelligent automation
 */
export function useOscarCanvasContext() {
	// Canvas context state
	const canvasNodes = ref<any[]>([]);
	const canvasEdges = ref<any[]>([]);
	const canvasViewport = ref<any>(null);
	const canvasName = ref<string>("");
	const canvasId = ref<string>("");

	// Available resources
	const availableTemplates = ref<any[]>([]);
	const availableHooks = ref<any[]>([]);
	const availableTransports = ref<any[]>([]);
	const availableSolutions = ref<any[]>([]);

	// Computed summaries for Oscar
	const canvasSummary = computed(() => {
		const nodeTypes = new Map<string, number>();
		canvasNodes.value.forEach((node: any) => {
			const type = node.type || "unknown";
			nodeTypes.set(type, (nodeTypes.get(type) || 0) + 1);
		});

		const nodeTypeSummary = Array.from(nodeTypes.entries())
			.map(([type, count]) => `• ${count}x ${formatNodeType(type)}`)
			.join("\n");

		return {
			name: canvasName.value || "Untitled Canvas",
			id: canvasId.value,
			totalNodes: canvasNodes.value.length,
			totalConnections: canvasEdges.value.length,
			nodeTypes: Object.fromEntries(nodeTypes),
			nodeTypeSummary,
			viewport: canvasViewport.value
		};
	});

	const resourcesSummary = computed(() => {
		return {
			templates: availableTemplates.value.length,
			hooks: availableHooks.value.length,
			transports: availableTransports.value.length,
			solutions: availableSolutions.value.length,
			total: availableTemplates.value.length + availableHooks.value.length + 
			       availableTransports.value.length + availableSolutions.value.length
		};
	});

	const nodesList = computed(() => {
		return canvasNodes.value.map((node: any) => ({
			id: node.id,
			type: node.type,
			label: node.data?.label || node.data?.name || node.id,
			position: node.position,
			data: {
				// Only include relevant data, not internal refs
				label: node.data?.label,
				name: node.data?.name,
				description: node.data?.description,
				status: node.data?.status
			}
		}));
	});

	const connectionsList = computed(() => {
		return canvasEdges.value.map((edge: any) => {
			const sourceNode = canvasNodes.value.find((n: any) => n.id === edge.source);
			const targetNode = canvasNodes.value.find((n: any) => n.id === edge.target);
			
			return {
				id: edge.id,
				from: {
					id: edge.source,
					label: sourceNode?.data?.label || edge.source
				},
				to: {
					id: edge.target,
					label: targetNode?.data?.label || edge.target
				},
				label: edge.label || "",
				animated: edge.animated,
				animationType: edge.animationType
			};
		});
	});

	// Helper function to format node type names
	const formatNodeType = (type: string): string => {
		// Convert camelCase/PascalCase to readable format
		const formatted = type
			.replace(/Node$/, "") // Remove "Node" suffix
			.replace(/([A-Z])/g, " $1") // Add space before capitals
			.trim();
		
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	};

	// Methods to update context
	const setCanvasContext = (nodes: any[], edges: any[], viewport: any, name: string, id: string) => {
		canvasNodes.value = nodes;
		canvasEdges.value = edges;
		canvasViewport.value = viewport;
		canvasName.value = name;
		canvasId.value = id;
		
		console.log("🎨 Oscar Canvas Context Updated:", {
			nodes: nodes.length,
			edges: edges.length,
			name,
			id
		});
	};

	const setAvailableResources = (templates: any[], hooks: any[], transports: any[], solutions: any[]) => {
		availableTemplates.value = templates;
		availableHooks.value = hooks;
		availableTransports.value = transports;
		availableSolutions.value = solutions;
		
		console.log("📦 Oscar Resources Updated:", {
			templates: templates.length,
			hooks: hooks.length,
			transports: transports.length,
			solutions: solutions.length
		});
	};

	const clearContext = () => {
		canvasNodes.value = [];
		canvasEdges.value = [];
		canvasViewport.value = null;
		canvasName.value = "";
		canvasId.value = "";
		availableTemplates.value = [];
		availableHooks.value = [];
		availableTransports.value = [];
		availableSolutions.value = [];
	};

	// Generate formatted message for Oscar about current canvas
	const getCanvasContextMessage = (): string => {
		const summary = canvasSummary.value;
		const resources = resourcesSummary.value;

		return `📊 **Current Canvas: ${summary.name}**

**Canvas Overview:**
• Total Nodes: ${summary.totalNodes}
• Total Connections: ${summary.totalConnections}

**Node Types:**
${summary.nodeTypeSummary || "No nodes on canvas"}

**Available Resources:**
• Templates: ${resources.templates}
• Hooks: ${resources.hooks}
• Transports: ${resources.transports}
• Solutions: ${resources.solutions}

**What can I help you with?**`;
	};

	return {
		// State
		canvasNodes: computed(() => canvasNodes.value),
		canvasEdges: computed(() => canvasEdges.value),
		canvasViewport: computed(() => canvasViewport.value),
		canvasName: computed(() => canvasName.value),
		canvasId: computed(() => canvasId.value),
		availableTemplates: computed(() => availableTemplates.value),
		availableHooks: computed(() => availableHooks.value),
		availableTransports: computed(() => availableTransports.value),
		availableSolutions: computed(() => availableSolutions.value),

		// Computed summaries
		canvasSummary,
		resourcesSummary,
		nodesList,
		connectionsList,

		// Methods
		setCanvasContext,
		setAvailableResources,
		clearContext,
		getCanvasContextMessage
	};
}

// Singleton instance for shared context
let __canvasContext: ReturnType<typeof useOscarCanvasContext> | null = null;

export function useSharedOscarCanvasContext() {
	if (!__canvasContext) {
		__canvasContext = useOscarCanvasContext();
	}
	return __canvasContext;
}


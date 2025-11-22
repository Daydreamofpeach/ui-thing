import { ref, computed } from "vue";

export interface NodeConfigurationState {
	isOpen: boolean;
	nodeType: string | null;
	nodeData: any | null;
	nodeId: string | null; // For editing existing nodes
	mode: "create" | "edit";
	sourcePanel: "sidebar" | "rightPanel" | "canvas" | null;
}

// SINGLETON: Shared state across all components using this composable
const configurationState = ref<NodeConfigurationState>({
	isOpen: false,
	nodeType: null,
	nodeData: null,
	nodeId: null,
	mode: "create",
	sourcePanel: null
});

export function useNodeConfigurationPanel() {
	// Use the shared singleton state

	/**
	 * Open configuration panel for creating a new node
	 */
	const openNodeConfiguration = (
		nodeType: string,
		sourcePanel: "sidebar" | "rightPanel" = "sidebar",
		initialData?: any
	) => {
		console.log("🎨 Opening node configuration panel:", nodeType);
		console.log("  Initial data:", initialData);
		
		configurationState.value = {
			isOpen: true,
			nodeType,
			nodeData: initialData ? JSON.parse(JSON.stringify(initialData)) : {},
			nodeId: null,
			mode: "create",
			sourcePanel
		};
	};

	/**
	 * Open configuration panel for editing an existing node
	 */
	const openNodeEdit = (
		nodeId: string,
		nodeType: string,
		nodeData: any,
		sourcePanel: "canvas" = "canvas"
	) => {
		console.log("✏️ Opening node edit panel:", nodeId, nodeType);
		console.log("  Existing data:", nodeData);
		
		configurationState.value = {
			isOpen: true,
			nodeType,
			nodeData: JSON.parse(JSON.stringify(nodeData)), // Deep clone to avoid reactivity issues
			nodeId,
			mode: "edit",
			sourcePanel
		};
	};

	/**
	 * Close configuration panel
	 */
	const closeNodeConfiguration = () => {
		console.log("❌ Closing node configuration panel");
		configurationState.value = {
			isOpen: false,
			nodeType: null,
			nodeData: null,
			nodeId: null,
			mode: "create",
			sourcePanel: null
		};
	};

	/**
	 * Update configuration data
	 */
	const updateConfigurationData = (key: string, value: any) => {
		if (configurationState.value.nodeData) {
			configurationState.value.nodeData[key] = value;
		} else {
			configurationState.value.nodeData = { [key]: value };
		}
	};

	/**
	 * Check if panel is open
	 */
	const isConfigurationOpen = computed(() => configurationState.value.isOpen);

	/**
	 * Get current configuration
	 */
	const currentConfiguration = computed(() => configurationState.value);

	/**
	 * Check if in edit mode
	 */
	const isEditMode = computed(() => configurationState.value.mode === "edit");

	/**
	 * Get panel title
	 */
	const panelTitle = computed(() => {
		const mode = configurationState.value.mode === "edit" ? "Edit" : "Configure";
		const nodeType = configurationState.value.nodeType || "Node";
		return `${mode} ${nodeType}`;
	});

	return {
		configurationState,
		isConfigurationOpen,
		currentConfiguration,
		isEditMode,
		panelTitle,
		openNodeConfiguration,
		openNodeEdit,
		closeNodeConfiguration,
		updateConfigurationData
	};
}


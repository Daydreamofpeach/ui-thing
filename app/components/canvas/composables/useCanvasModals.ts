import type { Ref } from "vue";
import type { Hook } from "~/composables/useHooks";
import type { Transport } from "~/composables/useTransports";
import { computed, reactive, ref } from "vue";

export const useCanvasModals = (
	updateNodeData: (nodeId: string, key: string, value: any) => void,
	allNodes: Ref<any[]>,
	onTemplateCreated?: (templateNodeId: string, template: any) => void
) => {
	// Transport Modal State
	const showTransportModal = ref(false);
	const selectedTransport = ref<Transport | null>(null);
	const selectedNodeForTransport = ref<string | null>(null);
	const availableTransportTypes = ref<Array<{ label: string, value: string }>>([]);

	// Hook Modal State
	const showHookModal = ref(false);
	const selectedNodeForHook = ref<string | null>(null);
	const availableHookTypes = ref<Array<{ label: string, value: string }>>([]);

	// Template Modal State
	const showTemplateCreationModal = ref(false);
	const selectedNodeForTemplate = ref<string | null>(null);
	const isCreatingTemplate = ref(false);

	const newTemplate = reactive({
		name: "",
		description: "",
		type: "TEMPLATE"
	});

	// Template Form Validation
	const isTemplateFormValid = computed(() => {
		return (
			newTemplate.name.trim() !== ""
			&& newTemplate.description.trim() !== ""
			&& newTemplate.type.trim() !== ""
		);
	});

	// Transport Modal Functions
	const openTransportCreationModal = (nodeId: string) => {
		selectedNodeForTransport.value = nodeId;
		selectedTransport.value = null;
		showTransportModal.value = true;
	};

	const openTransportEditModal = (nodeId: string) => {
		const node = allNodes.value.find((n) => n.id === nodeId);
		if (node?.data?.transportId) {
			selectedTransport.value = {
				id: node.data.transportId,
				name: node.data.transportName || node.data.label || "Transport",
				description: node.data.transportDescription || "",
				type: node.data.transportType || "WEBHOOK",
				target: node.data.target || "",
				hook: node.data.hook || "",
				meta: node.data.transportMeta || {}
			};
		}
		selectedNodeForTransport.value = nodeId;
		showTransportModal.value = true;
	};

	const closeTransportModal = () => {
		showTransportModal.value = false;
		selectedTransport.value = null;
		selectedNodeForTransport.value = null;
	};

	const handleTransportCreated = (transport: Transport) => {
		if (selectedNodeForTransport.value) {
			updateNodeData(selectedNodeForTransport.value, "transportId", transport.id);
			updateNodeData(selectedNodeForTransport.value, "transportName", transport.name);
			updateNodeData(selectedNodeForTransport.value, "transportType", transport.type);
			updateNodeData(selectedNodeForTransport.value, "target", transport.target);
			updateNodeData(selectedNodeForTransport.value, "hook", transport.hook);
			updateNodeData(selectedNodeForTransport.value, "transportDescription", transport.description);
			updateNodeData(selectedNodeForTransport.value, "transportMeta", transport.meta);
		}
	};

	const handleTransportUpdated = (transport: Transport) => {
		if (selectedNodeForTransport.value) {
			updateNodeData(selectedNodeForTransport.value, "transportName", transport.name);
			updateNodeData(selectedNodeForTransport.value, "transportType", transport.type);
			updateNodeData(selectedNodeForTransport.value, "target", transport.target);
			updateNodeData(selectedNodeForTransport.value, "hook", transport.hook);
			updateNodeData(selectedNodeForTransport.value, "transportDescription", transport.description);
			updateNodeData(selectedNodeForTransport.value, "transportMeta", transport.meta);
		}
	};

	const deleteTransportFromNode = async (nodeId: string, deleteTransport: (id: string) => Promise<void>) => {
		const node = allNodes.value.find((n) => n.id === nodeId);
		if (!node?.data?.transportId) {
			console.warn("No transport ID found for node:", nodeId);
			return;
		}

		try {
			await deleteTransport(node.data.transportId);
			updateNodeData(nodeId, "transportId", null);
			updateNodeData(nodeId, "transportName", null);
			updateNodeData(nodeId, "transportType", "WEBHOOK");
			updateNodeData(nodeId, "target", null);
			updateNodeData(nodeId, "hook", null);
			updateNodeData(nodeId, "transportDescription", null);
			updateNodeData(nodeId, "transportMeta", null);
		} catch (error) {
			console.error("❌ Error deleting transport:", error);
		}
	};

	// Hook Modal Functions
	const openHookCreationModal = (nodeId: string) => {
		selectedNodeForHook.value = nodeId;
		showHookModal.value = true;
	};

	const closeHookModal = () => {
		showHookModal.value = false;
		selectedNodeForHook.value = null;
	};

	const handleHookCreated = (hook: Hook) => {
		if (selectedNodeForHook.value) {
			updateNodeData(selectedNodeForHook.value, "hookId", hook.id);
			updateNodeData(selectedNodeForHook.value, "hookName", hook.name);
			updateNodeData(selectedNodeForHook.value, "hookType", hook.type);
			updateNodeData(selectedNodeForHook.value, "hookToken", hook.token);
			updateNodeData(selectedNodeForHook.value, "hookEnabled", hook.enabled);
			updateNodeData(selectedNodeForHook.value, "hookPriority", hook.priority);
			updateNodeData(selectedNodeForHook.value, "hookTrigger", hook.trigger);
			updateNodeData(selectedNodeForHook.value, "hookDescription", hook.description);
		}
	};

	// Template Functions
	const openTemplateCreationModal = (nodeId: string) => {
		console.log("═══════════════════════════════════════");
		console.log("🎭 useCanvasModals: openTemplateCreationModal");
		console.log("  Node ID:", nodeId);
		console.log("  Before - showTemplateCreationModal:", showTemplateCreationModal.value);
		console.log("═══════════════════════════════════════");
		
		selectedNodeForTemplate.value = nodeId;
		showTemplateCreationModal.value = true;
		resetTemplateForm();
		
		console.log("✅ Modal state updated:");
		console.log("  After - showTemplateCreationModal:", showTemplateCreationModal.value);
		console.log("  selectedNodeForTemplate:", selectedNodeForTemplate.value);
	};

	const closeTemplateCreationModal = () => {
		showTemplateCreationModal.value = false;
		selectedNodeForTemplate.value = null;
		resetTemplateForm();
	};

	const resetTemplateForm = () => {
		newTemplate.name = "";
		newTemplate.description = "";
		newTemplate.type = "TEMPLATE";
	};

	const createTemplate = async (projectId: string | undefined, allNodes: any[], allEdges: any[]) => {
		if (!isTemplateFormValid.value || !selectedNodeForTemplate.value)
			return;

		isCreatingTemplate.value = true;

		try {
			const buttId = `TEMPLATE.${newTemplate.name.replace(/\s+/g, "")}.${Date.now()}`;
			const canvasData = {
				nodes: allNodes,
				edges: allEdges,
				nodeId: selectedNodeForTemplate.value
			};

			const templateData = {
				name: newTemplate.name,
				description: newTemplate.description,
				template: {
					actions: [],
					type: newTemplate.type,
					projectId,
					canvasData
				},
				author: "CUSTOM",
				public: false,
				elevated: false,
				meta: {
					projectId,
					butt: buttId,
					nodeId: selectedNodeForTemplate.value
				}
			};

			const { buttClient } = await import("~/utils/buttClient");
			const createdTemplate = await buttClient.createTemplate(templateData);

			const templateNodeId = selectedNodeForTemplate.value;

			updateNodeData(templateNodeId, "templateId", createdTemplate.id);
			updateNodeData(templateNodeId, "templateName", createdTemplate.name);
			updateNodeData(templateNodeId, "templateType", createdTemplate.template?.type || newTemplate.type);
			updateNodeData(templateNodeId, "_chainParent", templateNodeId);
			updateNodeData(templateNodeId, "_chainOrder", 0);

			const templateNode = allNodes.value.find((n: any) => n.id === templateNodeId);
			const intentNodeId = templateNode?.data?.intentSelectionNodeId;
			const parentNodeId = templateNode?.data?.parentNodeId;

			if (intentNodeId) {
				updateNodeData(intentNodeId, "templateId", createdTemplate.id);
				updateNodeData(intentNodeId, "templateName", createdTemplate.name);
				updateNodeData(intentNodeId, "templateType", createdTemplate.template?.type || newTemplate.type);
				updateNodeData(intentNodeId, "_chainParent", templateNodeId);
				updateNodeData(intentNodeId, "_chainOrder", 1);
			}

			if (parentNodeId && intentNodeId) {
				updateNodeData(parentNodeId, "openOrbitNodeId", intentNodeId);
			}

			onTemplateCreated?.(templateNodeId, createdTemplate);
			closeTemplateCreationModal();
		} catch (error) {
			console.error("❌ Error creating template:", error);
		} finally {
			isCreatingTemplate.value = false;
		}
	};

	return {
		// Transport
		showTransportModal,
		selectedTransport,
		selectedNodeForTransport,
		availableTransportTypes,
		openTransportCreationModal,
		openTransportEditModal,
		closeTransportModal,
		handleTransportCreated,
		handleTransportUpdated,
		deleteTransportFromNode,

		// Hook
		showHookModal,
		selectedNodeForHook,
		availableHookTypes,
		openHookCreationModal,
		closeHookModal,
		handleHookCreated,

		// Template
		showTemplateCreationModal,
		selectedNodeForTemplate,
		isCreatingTemplate,
		newTemplate,
		isTemplateFormValid,
		openTemplateCreationModal,
		closeTemplateCreationModal,
		resetTemplateForm,
		createTemplate
	};
};

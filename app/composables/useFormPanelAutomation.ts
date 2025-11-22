import type { Edge, Node } from "@vue-flow/core";
import type { Ref } from "vue";

/**
 * Composable for managing form panel automation chain
 * Handles creation and connection of Forms Panel → Hook → Transport nodes
 */
export function useFormPanelAutomation(
	formsPanelNodes: Ref<Node[]>,
	hookNodes: Ref<Node[]>,
	transportNodes: Ref<Node[]>,
	edges: Ref<Edge[]>,
	addNode: (type: string, data: any, position: any, style?: any) => string,
	createEdge: (source: string, target: string, style?: any, animated?: boolean) => void,
	removeNode: (nodeId: string) => void,
	removeEdges: (edgeIds: string[]) => void,
	updateNodeData: (nodeId: string, key: string, value: any) => void
) {
	/**
	 * Open or focus existing forms panel for a template
	 */
	const handleOpenFormGenerator = (sourceNodeId: string, projectPath: string, templateId: string) => {
		console.log("🎨 Opening form generator:", { sourceNodeId, projectPath, templateId });

		try {
			// Check if forms panel already exists for this template
			const existingFormsPanel = formsPanelNodes.value.find(
				(node) => node.data?.sourceTemplateId === sourceNodeId
			);

			if (existingFormsPanel) {
				console.log("✅ Forms panel already exists, reusing:", existingFormsPanel.id);
				updateNodeData(sourceNodeId, "formsPanelOpened", true);
				return existingFormsPanel.id;
			}

			// Create new forms panel
			const formsPanelPosition = {
				x: 750,
				y: 100
			};

			const formsPanelId = addNode("formsPanelNode", {
				label: "Automated Form Generator",
				projectPath,
				templateId,
				sourceTemplateId: sourceNodeId,
				generatedForms: [],
				status: "ready"
			}, formsPanelPosition, {
				width: "900px",
				height: "800px"
			});

			// Create animated edge
			createEdge(sourceNodeId, formsPanelId, {
				stroke: "#a855f7",
				strokeWidth: 2
			}, true);

			// Mark template as having forms panel opened
			updateNodeData(sourceNodeId, "formsPanelOpened", true);

			console.log("✅ Forms panel created:", formsPanelId);
			return formsPanelId;
		} catch (error) {
			console.error("❌ Error opening form generator:", error);
			return null;
		}
	};

	/**
	 * Create hook node for a form
	 */
	const handleCreateHookNodeForForm = (formData: any, formsPanelId: string) => {
		console.log("🪝 Creating hook node for form:", formData);

		try {
			// Check if hook node already exists for this forms panel
			const existingHook = hookNodes.value.find(
				(node) => node.data?.parentFormsPanelId === formsPanelId
			);

			if (existingHook) {
				console.log("✅ Hook node already exists:", existingHook.id);
				updateNodeData(formsPanelId, "selectedFormForHook", formData);
				return existingHook.id;
			}

			// Get forms panel position
			const formsPanel = formsPanelNodes.value.find((n) => n.id === formsPanelId);
			if (!formsPanel) {
				console.error("❌ Forms panel not found");
				return null;
			}

			// Position hook below forms panel
			const hookPosition = {
				x: formsPanel.position.x + 150,
				y: formsPanel.position.y + 650
			};

			// Create hook node
			const hookNodeId = addNode("hookNode", {
				label: "Hook Configuration",
				parentFormsPanelId: formsPanelId,
				formData,
				status: "unconfigured"
			}, hookPosition, {
				width: "600px",
				height: "650px"
			});

			// Create animated edge
			createEdge(formsPanelId, hookNodeId, {
				stroke: "#06b6d4",
				strokeWidth: 2
			}, true);

			// Update forms panel with selected form
			updateNodeData(formsPanelId, "selectedFormForHook", formData);
			updateNodeData(formsPanelId, "lastAction", "form_selected");

			console.log("✅ Hook node created:", hookNodeId);
			return hookNodeId;
		} catch (error) {
			console.error("❌ Error creating hook node:", error);
			return null;
		}
	};

	/**
	 * Close/remove hook node and its edges
	 */
	const handleCloseHookNode = (hookNodeId: string) => {
		console.log("🗑️ Closing hook node:", hookNodeId);

		try {
			// Find and remove connected edges
			const connectedEdges = edges.value.filter(
				(e) => e.source === hookNodeId || e.target === hookNodeId
			);
			const edgeIds = connectedEdges.map((e) => e.id);

			if (edgeIds.length > 0) {
				removeEdges(edgeIds);
			}

			// Remove the node
			removeNode(hookNodeId);
			console.log("✅ Hook node closed");
		} catch (error) {
			console.error("❌ Error closing hook node:", error);
		}
	};

	/**
	 * Create transport node when hook is attached
	 */
	const handleHookAttached = (hookData: any, hookNodeId: string) => {
		console.log("🔗 Hook attached, creating transport node:", hookData);

		try {
			// Check if transport already exists for this hook
			const existingTransport = transportNodes.value.find(
				(node) => node.data?.parentHookId === hookNodeId
			);

			if (existingTransport) {
				console.log("✅ Transport node already exists:", existingTransport.id);
				return existingTransport.id;
			}

			// Get hook node position
			const hookNode = hookNodes.value.find((n) => n.id === hookNodeId);
			if (!hookNode) {
				console.error("❌ Hook node not found");
				return null;
			}

			// Position transport to the right of hook
			const transportPosition = {
				x: hookNode.position.x + 650,
				y: hookNode.position.y
			};

			// Create transport node
			const transportNodeId = addNode("transportNode", {
				label: "Transport Configuration",
				parentHookId: hookNodeId,
				hookData,
				status: "unconfigured"
			}, transportPosition, {
				width: "600px",
				height: "650px"
			});

			// Create animated edge
			createEdge(hookNodeId, transportNodeId, {
				stroke: "#14b8a6",
				strokeWidth: 2
			}, true);

			console.log("✅ Transport node created:", transportNodeId);
			return transportNodeId;
		} catch (error) {
			console.error("❌ Error creating transport node:", error);
			return null;
		}
	};

	/**
	 * Close/remove transport node and its edges
	 */
	const handleCloseTransportNode = (transportNodeId: string) => {
		console.log("🗑️ Closing transport node:", transportNodeId);

		try {
			// Find and remove connected edges
			const connectedEdges = edges.value.filter(
				(e) => e.source === transportNodeId || e.target === transportNodeId
			);
			const edgeIds = connectedEdges.map((e) => e.id);

			if (edgeIds.length > 0) {
				removeEdges(edgeIds);
			}

			// Remove the node
			removeNode(transportNodeId);
			console.log("✅ Transport node closed");
		} catch (error) {
			console.error("❌ Error closing transport node:", error);
		}
	};

	/**
	 * Create browser node for form preview
	 */
	const handleCreateFormPreviewBrowserNode = (form: any, formsPanelId: string) => {
		console.log("🌐 Creating form preview browser:", form);

		try {
			// Get forms panel position
			const formsPanel = formsPanelNodes.value.find((n) => n.id === formsPanelId);
			if (!formsPanel) {
				console.error("❌ Forms panel not found");
				return null;
			}

			// Position browser below forms panel
			const browserPosition = {
				x: formsPanel.position.x - 200,
				y: formsPanel.position.y + 650
			};

			// Create preview URL (data URL with HTML)
			const previewHtml = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${form.title || "Form Preview"}</title>
	<style>${form.css || ""}</style>
</head>
<body>
	${form.html || ""}
</body>
</html>
			`;

			const dataUrl = `data:text/html;base64,${btoa(unescape(encodeURIComponent(previewHtml)))}`;

			// Create browser node with parent reference
			const browserNodeId = addNode("browserNode", {
				label: `Preview: ${form.title}`,
				url: dataUrl,
				htmlContent: previewHtml, // CRITICAL: Store raw HTML for template saving/loading
				formHtml: form.html, // Store just the form HTML (no wrapper)
				formCss: form.css, // Store CSS separately
				formTitle: form.title, // Store form title
				status: "loaded",
				isFormPreview: true,
				formId: form.id,
				parentFormsPanelId: formsPanelId // CRITICAL: Store parent reference
			}, browserPosition, {
				width: "900px",
				height: "700px"
			});

			// Create edge from forms panel to browser
			createEdge(formsPanelId, browserNodeId, {
				stroke: "#8b5cf6",
				strokeWidth: 2
			}, true);

			console.log("✅ Form preview browser created:", browserNodeId);
			console.log("   Parent forms panel ID:", formsPanelId);
			return browserNodeId;
		} catch (error) {
			console.error("❌ Error creating form preview browser:", error);
			return null;
		}
	};

	return {
		handleOpenFormGenerator,
		handleCreateHookNodeForForm,
		handleCloseHookNode,
		handleHookAttached,
		handleCloseTransportNode,
		handleCreateFormPreviewBrowserNode
	};
}
